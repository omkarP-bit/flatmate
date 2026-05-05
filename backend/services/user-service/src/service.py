import asyncio
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from cache import cache_delete, cache_get, cache_set
from models import User
from s3_utils import avatar_key as build_avatar_key
from s3_utils import generate_download_url, generate_upload_url
from schemas import UserUpdate


def create_or_get_user(user_id: str, name: str, email: str, db: Session) -> User:
    """Idempotent upsert — safe to call on every Cognito login."""
    db.execute(
        text(
            """
            INSERT INTO users (id, name, email)
            VALUES (:id, :name, :email)
            ON CONFLICT (id) DO NOTHING
            """
        ),
        {"id": user_id, "name": name, "email": email},
    )
    db.commit()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create or fetch user.")
    return user


def get_user(user_id: str, db: Session) -> User:
    cache_key = f"user:{user_id}"

    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        # Reconstruct ORM object from cached dict
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    asyncio.get_event_loop().run_until_complete(
        cache_set(cache_key, {"id": str(user.id), "name": user.name}, ttl=600)
    )
    return user


def get_users_by_ids(ids: list[str], db: Session) -> list[User]:
    if not ids:
        return []
    return db.query(User).filter(User.id.in_(ids)).all()


def update_user(user_id: str, data: UserUpdate, db: Session) -> User:
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")

    result = db.query(User).filter(User.id == user_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="User not found.")

    for field, value in update_data.items():
        setattr(result, field, value)

    db.commit()
    db.refresh(result)

    asyncio.get_event_loop().run_until_complete(cache_delete(f"user:{user_id}"))
    return result


def get_avatar_upload_url(user_id: str) -> dict:
    key = build_avatar_key(user_id)
    return generate_upload_url(key, content_type="image/jpeg", expires_in=300)


def enrich_with_avatar_url(user: User) -> dict:
    data = {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "upi_id": user.upi_id,
        "phone": user.phone,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "avatar_url": None,
    }
    if user.avatar_key:
        data["avatar_url"] = generate_download_url(user.avatar_key)
    return data