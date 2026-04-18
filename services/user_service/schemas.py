from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    name:str
    phone: Optional[str]
    email:Optional[str]
    upi_id: Optional[str]

class UserResponse(BaseModel):
    id: str
    name: str
    phone: Optional[str]
    email: Optional[str]
    upi_id: Optional[str]