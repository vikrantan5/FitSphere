import httpx
import os
from fastapi import HTTPException, UploadFile
import logging
from dotenv import load_dotenv

from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')
logger = logging.getLogger(__name__)

def _get_bunny_config() -> dict:
    return {
        "stream_library_id": os.getenv("BUNNY_STREAM_LIBRARY_ID"),
        "stream_api_key": os.getenv("BUNNY_STREAM_API_KEY"),
        "storage_zone": os.getenv("BUNNY_STORAGE_ZONE"),
        "storage_password": os.getenv("BUNNY_STORAGE_PASSWORD"),
        "storage_region": os.getenv("BUNNY_STORAGE_REGION"),
        "pull_zone_url": os.getenv("BUNNY_PULL_ZONE_URL"),
    }


cfg = _get_bunny_config()

# Log configuration on startup (without sensitive data)
logger.info(f"Bunny CDN Configuration:")
logger.info(f"  Storage Zone: {cfg['storage_zone']}")
logger.info(f"  Storage Region: {cfg['storage_region']}")
logger.info(f"  Pull Zone URL: {cfg['pull_zone_url']}")
logger.info(f"  Stream Library ID: {cfg['stream_library_id']}")
logger.info(f"  Storage Password Set: {bool(cfg['storage_password'])}")
logger.info(f"  Stream API Key Set: {bool(cfg['stream_api_key'])}")


# =====================================================
# 1️⃣ CREATE VIDEO ENTRY IN BUNNY STREAM
# =====================================================
async def create_bunny_video(title: str):
    config = _get_bunny_config()
    if not config["stream_library_id"] or not config["stream_api_key"]:
        raise HTTPException(500, "Bunny Stream credentials are missing")

    url = f"https://video.bunnycdn.com/library/{config['stream_library_id']}/videos"

    headers = {
        "AccessKey": config["stream_api_key"],
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json={"title": title})

    if res.status_code in [200, 201, 202]:
        video_data = res.json()
        if not video_data.get("guid"):
            error_msg = "Bunny Stream response missing video guid"
            logger.error(f"{error_msg}. Response: {res.text}")
            raise HTTPException(500, error_msg)

        logger.info(f"Successfully created video entry: {video_data.get('guid')}")
        return video_data

    error_msg = f"Failed to create video entry. Status: {res.status_code}"
    logger.error(f"{error_msg}. Response: {res.text}")
    raise HTTPException(500, error_msg)
# =====================================================
# 2️⃣ UPLOAD VIDEO TO BUNNY STREAM
# =====================================================
async def upload_video_to_bunny_stream(file: UploadFile, title: str):
    config = _get_bunny_config()

    if not config["stream_api_key"]:
        logger.error("Bunny Stream API key is missing in environment variables")
        raise HTTPException(500, "Bunny Stream API key missing")
    
    if not config["stream_library_id"]:
        logger.error("Bunny Stream Library ID is missing in environment variables")
        raise HTTPException(500, "Bunny Stream Library ID missing")

    try:
        # create video container
        logger.info(f"Creating video entry in Bunny Stream: {title}")
        video_data = await create_bunny_video(title)
        video_id = video_data["guid"]
        logger.info(f"Video entry created with ID: {video_id}")

        upload_url = f"https://video.bunnycdn.com/library/{config['stream_library_id']}/videos/{video_id}"

        headers = {
            "AccessKey": config["stream_api_key"],
            "Content-Type": "application/octet-stream"
        }

        file_content = await file.read()
        file_size_mb = len(file_content) / (1024 * 1024)
        logger.info(f"Uploading video file: {file.filename} ({file_size_mb:.2f} MB)")

        async with httpx.AsyncClient(timeout=600.0) as client:
            res = await client.put(upload_url, headers=headers, content=file_content)

        logger.info(f"Video file upload response - Status: {res.status_code}, Body: {res.text[:500]}")
        
        # Bunny Stream API returns 200 OK or 202 Accepted for successful uploads
        if res.status_code not in [200, 201, 202]:
            logger.error(f"Video upload failed. Status: {res.status_code}, Response: {res.text}")
            raise HTTPException(500, f"Upload failed: {res.text}")

        # important URLs for frontend
        embed_url = f"https://iframe.mediadelivery.net/embed/{config['stream_library_id']}/{video_id}"
        playback_url = f"https://vz-{config['stream_library_id']}.b-cdn.net/{video_id}/playlist.m3u8"
        thumbnail_url = f"https://vz-{config['stream_library_id']}.b-cdn.net/{video_id}/thumbnail.jpg"
        
        logger.info(f"Video uploaded successfully to Bunny Stream. Video ID: {video_id}")
        logger.info(f"Embed URL: {embed_url}")
        logger.info(f"Playback URL: {playback_url}")

        return {
            "video_id": video_id,
            "embed_url": embed_url,
            "playback_url": playback_url,
            "thumbnail_url": thumbnail_url,
            "success": True
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during video upload: {str(e)}")
        raise HTTPException(500, f"Video upload error: {str(e)}")

# =====================================================
# 3️⃣ DELETE VIDEO FROM BUNNY STREAM
# =====================================================
async def delete_bunny_stream_video(video_id: str):
    config = _get_bunny_config()
    if not config["stream_library_id"] or not config["stream_api_key"]:
        raise HTTPException(500, "Bunny Stream credentials are missing")

    url = f"https://video.bunnycdn.com/library/{config['stream_library_id']}/videos/{video_id}"

    headers = {
        "AccessKey": config["stream_api_key"]
    }

    async with httpx.AsyncClient() as client:
        res = await client.delete(url, headers=headers)

    return res.status_code in [200, 204]


# =====================================================
# 4️⃣ UPLOAD IMAGE / FILE TO STORAGE (OPTIONAL)
# =====================================================
async def upload_to_bunny_storage(file: UploadFile, destination_path: str):
    config = _get_bunny_config()

    if not config["storage_password"]:
        logger.error("Bunny Storage password is missing in environment variables")
        raise HTTPException(500, "Storage password missing")
    
    if not config["storage_zone"]:
        logger.error("Bunny Storage Zone is missing in environment variables")
        raise HTTPException(500, "Storage Zone missing")
    
    if not config["storage_region"]:
        logger.error("Bunny Storage Region is missing in environment variables")
        raise HTTPException(500, "Storage Region missing")
    
    if not config["pull_zone_url"]:
        logger.error("Bunny Pull Zone URL is missing in environment variables")
        raise HTTPException(500, "Pull Zone URL missing")

    try:
        upload_url = f"https://{config['storage_region']}/{config['storage_zone']}/{destination_path}"
        logger.info(f"Uploading to Bunny Storage: {destination_path}")
        logger.info(f"Upload URL: {upload_url}")

        headers = {
            "AccessKey": config["storage_password"],
            "Content-Type": "application/octet-stream"
        }

        file_content = await file.read()
        file_size_kb = len(file_content) / 1024
        logger.info(f"Uploading file: {file.filename} ({file_size_kb:.2f} KB)")

        async with httpx.AsyncClient(timeout=300.0) as client:
            res = await client.put(upload_url, headers=headers, content=file_content)

        if res.status_code not in [200, 201]:
            logger.error(f"Storage upload failed. Status: {res.status_code}, Response: {res.text}")
            raise HTTPException(500, f"Storage upload failed: {res.text}")

        cdn_url = f"{config['pull_zone_url']}/{destination_path}"
        logger.info(f"File uploaded successfully to Bunny Storage")
        logger.info(f"CDN URL: {cdn_url}")

        return {
            "cdn_url": cdn_url,
            "success": True
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during storage upload: {str(e)}")
        raise HTTPException(500, f"Storage upload error: {str(e)}")


    # =====================================================
# 5️⃣ DELETE FILE FROM BUNNY STORAGE
# =====================================================
async def delete_from_bunny_cdn(file_path: str):
    """Delete a file from Bunny Storage"""
    config = _get_bunny_config()

    if not config["storage_password"]:
        raise HTTPException(500, "Storage password missing")

    delete_url = f"https://{config['storage_region']}/{config['storage_zone']}/{file_path}"

    headers = {
        "AccessKey": config["storage_password"]
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.delete(delete_url, headers=headers)

    if res.status_code not in [200, 204]:
        logger.warning(f"Failed to delete file from Bunny CDN: {file_path}, Status: {res.status_code}")
        return False

    return True