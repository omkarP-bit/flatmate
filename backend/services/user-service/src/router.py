from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user_id, verify_cognito_token
from database import get_db
from schemas import AvatarUploadResponse, UserCreate, UserOut, UserUpdate
from service import (
    create_or_get_user,
    enrich_with_avatar_url,
    get_avatar_upload_url,
    get_user,
    get_users_by_ids,
    update_user,
)

router = APIRouter(prefix="/users")


@router.post("", response_model=UserOut)
def create_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
):
    """
    Public endpoint. If Authorization header is present, extracts
    the Cognito sub as user_id. Otherwise raises 401 — every user
    must authenticate through Cognito before creating a profile.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization header required to create a user profile.",
        )
    token = authorization.removeprefix("Bearer ").strip()
    claims = verify_cognito_token(token)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing sub claim.")

    user = create_or_get_user(user_id, body.name, body.email, db)
    return enrich_with_avatar_url(user)


@router.get("/me", response_model=UserOut)
def get_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = get_user(user_id, db)
    return enrich_with_avatar_url(user)


@router.patch("/me", response_model=UserOut)
def update_me(
    body: UserUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = update_user(user_id, body, db)
    return enrich_with_avatar_url(user)


@router.get("/me/avatar-upload-url", response_model=AvatarUploadResponse)
def avatar_upload_url(
    user_id: str = Depends(get_current_user_id),
):
    return get_avatar_upload_url(user_id)


@router.get("", response_model=list[UserOut])
def list_users_by_ids(
    ids: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    users = get_users_by_ids(id_list, db)
    return [enrich_with_avatar_url(u) for u in users]


@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: str,
    _: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = get_user(user_id, db)
    return enrich_with_avatar_url(user)