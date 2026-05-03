from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user_id
from database import get_db
from schemas import MemberOut, RoomCreate, RoomJoin, RoomOut
from service import (
    create_room,
    get_members,
    get_my_rooms,
    get_room,
    join_room,
    remove_member,
)

router = APIRouter(prefix="/rooms")


@router.post("", response_model=RoomOut)
def create_room_route(
    body: RoomCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    room = create_room(body, user_id, db)
    return RoomOut(
        id=room.id,
        name=room.name,
        address=room.address,
        room_code=room.room_code,
        created_by=str(room.created_by),
        created_at=room.created_at,
    )


@router.post("/join")
def join_room_route(
    body: RoomJoin,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return join_room(body.room_code, user_id, db)


@router.get("/mine")
def get_my_rooms_route(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return get_my_rooms(user_id, db)


@router.get("/{room_id}", response_model=RoomOut)
def get_room_route(
    room_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    room = get_room(room_id, db)
    return RoomOut(
        id=room.id,
        name=room.name,
        address=room.address,
        room_code=room.room_code,
        created_by=str(room.created_by),
        created_at=room.created_at,
    )


@router.get("/{room_id}/members", response_model=list[MemberOut])
def get_members_route(
    room_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    members = get_members(room_id, db)
    return [
        MemberOut(
            user_id=str(m.user_id),
            role=m.role,
            joined_at=m.joined_at,
        )
        for m in members
    ]


@router.delete("/{room_id}/members/{uid}")
def remove_member_route(
    room_id: int,
    uid: str,
    requester_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return remove_member(room_id, uid, requester_id, db)