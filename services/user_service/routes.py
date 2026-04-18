from fastapi import APIRouter, Request, HTTPException
from .schemas import UserCreate
from .service import create_user, get_user_by_id, get_user_by_ids
from shared.auth import get_current_user

router = APIRouter()

@router.post("/")
def create_or_update_user(data: UserCreate, request: Request):
    user_id = get_user_by_id(request)
    user = create_user(user_id, data)
    return {
        "status": "success",
        "data": {
            "id": user[0],
            "name": user[1],
            "phone": user[2],
            "email": user[3],
            "upi_id": user[4]
        }
    }

@router.get("/me")
def get_me(request: Request):
    user_id = get_current_user(request)
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "status": "success",
        "data": {
            "id": user[0],
            "name": user[1],
            "phone": user[2],
            "email": user[3],
            "upi_id": user[4]
        }
    }
