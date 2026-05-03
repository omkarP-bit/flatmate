import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException

from config import settings

_s3 = boto3.client("s3", region_name=settings.cognito_region)


def generate_upload_url(
    key: str,
    content_type: str = "image/jpeg",
    expires_in: int = 300,
) -> dict:
    try:
        upload_url = _s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.s3_bucket,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_in,
        )
        return {"upload_url": upload_url, "key": key, "expires_in": expires_in}
    except ClientError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate upload URL: {exc.response['Error']['Message']}",
        )


def generate_download_url(key: str, expires_in: int = 3600) -> str:
    try:
        return _s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": key},
            ExpiresIn=expires_in,
        )
    except ClientError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate download URL: {exc.response['Error']['Message']}",
        )


def delete_object(key: str) -> None:
    try:
        _s3.delete_object(Bucket=settings.s3_bucket, Key=key)
    except ClientError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete S3 object: {exc.response['Error']['Message']}",
        )


# ── Key builders ──────────────────────────────────────────────

def avatar_key(user_id: str) -> str:
    return f"avatars/{user_id}.jpg"


def receipt_key(expense_id: int, filename: str) -> str:
    return f"receipts/{expense_id}/{filename}"


def export_key(room_id: int, period: str) -> str:
    return f"exports/room-{room_id}/{period}.csv"