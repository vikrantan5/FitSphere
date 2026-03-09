import httpx
import os
from fastapi import HTTPException, UploadFile
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# =====================================================
# BUNNY STREAM CONFIG (FOR VIDEOS)
# =====================================================
BUNNY_STREAM_LIBRARY_ID = os.getenv("BUNNY_STREAM_LIBRARY_ID")
BUNNY_STREAM_API_KEY = os.getenv("BUNNY_STREAM_API_KEY")

# =====================================================
# BUNNY STORAGE CONFIG (FOR IMAGES / FILES)
# =====================================================
BUNNY_STORAGE_ZONE = os.getenv("BUNNY_STORAGE_ZONE")
BUNNY_STORAGE_PASSWORD = os.getenv("BUNNY_STORAGE_PASSWORD")
BUNNY_STORAGE_REGION = os.getenv("BUNNY_STORAGE_REGION")
BUNNY_PULL_ZONE_URL = os.getenv("BUNNY_PULL_ZONE_URL")

# Log configuration on startup (without sensitive data)
logger.info(f"Bunny CDN Configuration:")
logger.info(f"  Storage Zone: {BUNNY_STORAGE_ZONE}")
logger.info(f"  Storage Region: {BUNNY_STORAGE_REGION}")
logger.info(f"  Pull Zone URL: {BUNNY_PULL_ZONE_URL}")
logger.info(f"  Stream Library ID: {BUNNY_STREAM_LIBRARY_ID}")
logger.info(f"  Storage Password Set: {bool(BUNNY_STORAGE_PASSWORD)}")
logger.info(f"  Stream API Key Set: {bool(BUNNY_STREAM_API_KEY)}")


# =====================================================
# 1️⃣ CREATE VIDEO ENTRY IN BUNNY STREAM
# =====================================================
async def create_bunny_video(title: str):
    url = f"https://video.bunnycdn.com/library/{BUNNY_STREAM_LIBRARY_ID}/videos"

    headers = {
        "AccessKey": BUNNY_STREAM_API_KEY,
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json={"title": title})

    if res.status_code != 201:
        raise HTTPException(500, f"Failed to create video: {res.text}")

    return res.json()


# =====================================================
# 2️⃣ UPLOAD VIDEO TO BUNNY STREAM
# =====================================================
async def upload_video_to_bunny_stream(file: UploadFile, title: str):
    if not BUNNY_STREAM_API_KEY:
        logger.error("Bunny Stream API key is missing in environment variables")
        raise HTTPException(500, "Bunny Stream API key missing")
    
    if not BUNNY_STREAM_LIBRARY_ID:
        logger.error("Bunny Stream Library ID is missing in environment variables")
        raise HTTPException(500, "Bunny Stream Library ID missing")

    try:
        # create video container
        logger.info(f"Creating video entry in Bunny Stream: {title}")
        video_data = await create_bunny_video(title)
        video_id = video_data["guid"]
        logger.info(f"Video entry created with ID: {video_id}")

        upload_url = f"https://video.bunnycdn.com/library/{BUNNY_STREAM_LIBRARY_ID}/videos/{video_id}"

        headers = {
            "AccessKey": BUNNY_STREAM_API_KEY,
            "Content-Type": "application/octet-stream"
        }

        file_content = await file.read()
        file_size_mb = len(file_content) / (1024 * 1024)
        logger.info(f"Uploading video file: {file.filename} ({file_size_mb:.2f} MB)")

        async with httpx.AsyncClient(timeout=600.0) as client:
            res = await client.put(upload_url, headers=headers, content=file_content)

        if res.status_code not in [200, 201]:
            logger.error(f"Video upload failed. Status: {res.status_code}, Response: {res.text}")
            raise HTTPException(500, f"Upload failed: {res.text}")

        # important URLs for frontend
        embed_url = f"https://iframe.mediadelivery.net/embed/{BUNNY_STREAM_LIBRARY_ID}/{video_id}"
        playback_url = f"https://vz-{BUNNY_STREAM_LIBRARY_ID}.b-cdn.net/{video_id}/playlist.m3u8"
        
        logger.info(f"Video uploaded successfully to Bunny Stream. Video ID: {video_id}")
        logger.info(f"Embed URL: {embed_url}")
        logger.info(f"Playback URL: {playback_url}")

        return {
            "video_id": video_id,
            "embed_url": embed_url,
            "playback_url": playback_url,
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
    url = f"https://video.bunnycdn.com/library/{BUNNY_STREAM_LIBRARY_ID}/videos/{video_id}"

    headers = {
        "AccessKey": BUNNY_STREAM_API_KEY
    }

    async with httpx.AsyncClient() as client:
        res = await client.delete(url, headers=headers)

    return res.status_code in [200, 204]


# =====================================================
# 4️⃣ UPLOAD IMAGE / FILE TO STORAGE (OPTIONAL)
# =====================================================
async def upload_to_bunny_storage(file: UploadFile, destination_path: str):
    if not BUNNY_STORAGE_PASSWORD:
        logger.error("Bunny Storage password is missing in environment variables")
        raise HTTPException(500, "Storage password missing")
    
    if not BUNNY_STORAGE_ZONE:
        logger.error("Bunny Storage Zone is missing in environment variables")
        raise HTTPException(500, "Storage Zone missing")
    
    if not BUNNY_STORAGE_REGION:
        logger.error("Bunny Storage Region is missing in environment variables")
        raise HTTPException(500, "Storage Region missing")
    
    if not BUNNY_PULL_ZONE_URL:
        logger.error("Bunny Pull Zone URL is missing in environment variables")
        raise HTTPException(500, "Pull Zone URL missing")

    try:
        upload_url = f"https://{BUNNY_STORAGE_REGION}/{BUNNY_STORAGE_ZONE}/{destination_path}"
        logger.info(f"Uploading to Bunny Storage: {destination_path}")
        logger.info(f"Upload URL: {upload_url}")

        headers = {
            "AccessKey": BUNNY_STORAGE_PASSWORD,
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

        cdn_url = f"{BUNNY_PULL_ZONE_URL}/{destination_path}"
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
    if not BUNNY_STORAGE_PASSWORD:
        raise HTTPException(500, "Storage password missing")

    delete_url = f"https://{BUNNY_STORAGE_REGION}/{BUNNY_STORAGE_ZONE}/{file_path}"

    headers = {
        "AccessKey": BUNNY_STORAGE_PASSWORD
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.delete(delete_url, headers=headers)

    if res.status_code not in [200, 204]:
        logger.warning(f"Failed to delete file from Bunny CDN: {file_path}, Status: {res.status_code}")
        return False

    return True