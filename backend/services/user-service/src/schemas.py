from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, model_config


class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserUpdate(BaseModel):
    model_config = model_config = {"populate_by_name": True}

    name: Optional[str] = None
    upi_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_key: Optional[str] = None


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    email: str
    upi_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AvatarUploadResponse(BaseModel):
    upload_url: str
    key: str
    expires_in: int