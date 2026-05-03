from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class RoomCreate(BaseModel):
    name: str
    address: Optional[str] = None


class RoomJoin(BaseModel):
    room_code: str

    @field_validator("room_code")
    @classmethod
    def uppercase_code(cls, v: str) -> str:
        return v.upper()


class RoomOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    address: Optional[str] = None
    room_code: str
    created_by: str
    created_at: datetime


class MemberOut(BaseModel):
    model_config = {"from_attributes": True}

    user_id: str
    role: str
    joined_at: datetime
    name: Optional[str] = None
    email: Optional[str] = None
    upi_id: Optional[str] = None