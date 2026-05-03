import asyncio
import secrets
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from cache import cache_delete, cache_delete_pattern, cache_get, cache_set
from models import Room, RoomMember
from schemas import RoomCreate


def _generate_room_code() -> str:
    return secrets.token_urlsafe(6).upper()[:8]


def create_room(data: RoomCreate, user_id: str, db: Session) -> Room:
    code = _generate_room_code()

    room = Room(
        name=data.name,
        address=data.address,
        room_code=code,
        created_by=user_id,
    )
    db.add(room)
    db.flush()  # get room.id before commit

    member = RoomMember(room_id=room.id, user_id=user_id, role="admin")
    db.add(member)
    db.commit()
    db.refresh(room)

    asyncio.get_event_loop().run_until_complete(
        cache_delete(f"rooms:user:{user_id}")
    )
    return room


def join_room(room_code: str, user_id: str, db: Session) -> dict:
    room = (
        db.query(Room)
        .filter(Room.room_code == room_code.upper())
        .first()
    )
    if not room:
        raise HTTPException(status_code=404, detail="Room not found for that code.")

    existing = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room.id, RoomMember.user_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You are already a member of this room.")

    member = RoomMember(room_id=room.id, user_id=user_id, role="member")
    db.add(member)
    db.commit()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(cache_delete(f"room:{room.id}:members"))
    loop.run_until_complete(cache_delete(f"rooms:user:{user_id}"))

    return {"message": "Successfully joined room.", "room_id": room.id}


def get_my_rooms(user_id: str, db: Session) -> list:
    cache_key = f"rooms:user:{user_id}"
    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        return cached

    rows = (
        db.query(Room)
        .join(RoomMember, RoomMember.room_id == Room.id)
        .filter(RoomMember.user_id == user_id)
        .all()
    )
    result = [
        {
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "room_code": r.room_code,
            "created_by": str(r.created_by),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
    asyncio.get_event_loop().run_until_complete(cache_set(cache_key, result, ttl=300))
    return result


def get_room(room_id: int, db: Session) -> Room:
    cache_key = f"room:{room_id}"
    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        room = db.query(Room).filter(Room.id == room_id).first()
        if room:
            return room

    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    asyncio.get_event_loop().run_until_complete(
        cache_set(
            cache_key,
            {"id": room.id, "name": room.name},
            ttl=300,
        )
    )
    return room


def get_members(room_id: int, db: Session) -> list[RoomMember]:
    cache_key = f"room:{room_id}:members"
    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        # Return actual ORM objects for consistent handling
        return db.query(RoomMember).filter(RoomMember.room_id == room_id).all()

    members = db.query(RoomMember).filter(RoomMember.room_id == room_id).all()
    serialized = [
        {
            "user_id": str(m.user_id),
            "role": m.role,
            "joined_at": m.joined_at.isoformat() if m.joined_at else None,
        }
        for m in members
    ]
    asyncio.get_event_loop().run_until_complete(
        cache_set(cache_key, serialized, ttl=120)
    )
    return members


def remove_member(
    room_id: int, target_user_id: str, requester_id: str, db: Session
) -> dict:
    requester_membership = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room_id, RoomMember.user_id == requester_id)
        .first()
    )
    if not requester_membership:
        raise HTTPException(status_code=403, detail="You are not a member of this room.")

    if requester_id != target_user_id:
        if requester_membership.role != "admin":
            raise HTTPException(
                status_code=403, detail="Only admins can remove other members."
            )

    target = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room_id, RoomMember.user_id == target_user_id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Target user is not a member of this room.")

    db.delete(target)
    db.commit()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(cache_delete(f"room:{room_id}:members"))
    loop.run_until_complete(cache_delete(f"rooms:user:{target_user_id}"))
    loop.run_until_complete(cache_delete(f"rooms:user:{requester_id}"))

    return {"message": "Member removed."}