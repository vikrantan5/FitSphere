import httpx
import os
import aiofiles
from pathlib import Path
from fastapi import HTTPException, UploadFile
import logging
from dotenv import load_dotenv
load_dotenv()


logger = logging.getLogger(__name__)

# ==============================
# Bunny CDN CONFIG
# ==============================
BUNNY_STORAGE_ZONE = os.getenv("BUNNY_STORAGE_ZONE", "fit-sphere")
BUNNY_STORAGE_PASSWORD = os.getenv("BUNNY_STORAGE_PASSWORD")
BUNNY_STORAGE_REGION = os.getenv("BUNNY_STORAGE_REGION", "sg.storage.bunnycdn.com")
BUNNY_PULL_ZONE_URL = os.getenv("BUNNY_PULL_ZONE_URL", "https://fit-sphere.b-cdn.net")

# ==============================
# TEMP DIRECTORY (Windows safe)
# ==============================
TEMP_UPLOAD_DIR = Path("temp_uploads")
TEMP_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ==============================
# UPLOAD FILE TO BUNNY
# ==============================
async def upload_to_bunny_cdn(
    file: UploadFile,
    destination_path: str,
    file_type: str = "video"
) -> dict:

    if not BUNNY_STORAGE_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Bunny CDN credentials not configured"
        )

    upload_url = f"https://{BUNNY_STORAGE_REGION}/{BUNNY_STORAGE_ZONE}/{destination_path}"

    headers = {
        "AccessKey": BUNNY_STORAGE_PASSWORD,
        "Content-Type": "application/octet-stream"
    }

    try:
        file_content = await file.read()

        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.put(
                upload_url,
                content=file_content,
                headers=headers
            )

        if response.status_code not in [200, 201]:
            logger.error(f"Bunny CDN upload failed: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=502,
                detail=f"Failed to upload to Bunny CDN: {response.text}"
            )

        storage_url = f"https://{BUNNY_STORAGE_REGION}/{BUNNY_STORAGE_ZONE}/{destination_path}"
        cdn_url = f"{BUNNY_PULL_ZONE_URL}/{destination_path}"

        logger.info(f"Uploaded {destination_path} successfully")

        return {
            "file_url": storage_url,
            "cdn_url": cdn_url,
            "success": True
        }

    except httpx.RequestError as e:
        logger.error(f"Network error: {str(e)}")
        raise HTTPException(status_code=502, detail="Network error during file upload")

    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# ==============================
# DELETE FILE FROM BUNNY
# ==============================
async def delete_from_bunny_cdn(file_path: str) -> bool:

    if not BUNNY_STORAGE_PASSWORD:
        return False

    delete_url = f"https://{BUNNY_STORAGE_REGION}/{BUNNY_STORAGE_ZONE}/{file_path}"

    headers = {
        "AccessKey": BUNNY_STORAGE_PASSWORD
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(delete_url, headers=headers)

        return response.status_code in [200, 204]

    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        return False
