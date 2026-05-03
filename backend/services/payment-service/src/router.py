from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth import get_current_user_id
from database import get_db
from schemas import PaymentCreate, PaymentOut, PaymentSettle, PaymentSummary
from service import (
    create_payment,
    get_my_payments,
    get_my_summary,
    get_payment_by_id,
    get_room_payments,
    settle_payment,
)

router = APIRouter(prefix="/payments")


def _serialize(p) -> PaymentOut:
    return PaymentOut(
        id=p.id,
        room_id=p.room_id,
        from_user=str(p.from_user),
        to_user=str(p.to_user),
        amount=p.amount,
        status=p.status,
        upi_ref=p.upi_ref,
        note=p.note,
        created_at=p.created_at,
        settled_at=p.settled_at,
    )


# ── Fixed paths FIRST ──────────────────────────────────────────

@router.post("", response_model=PaymentOut)
def create_payment_route(
    body: PaymentCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    payment = create_payment(body, user_id, db)
    return _serialize(payment)


@router.get("/me", response_model=list[PaymentOut])
def my_payments(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    payments = get_my_payments(user_id, db)
    return [_serialize(p) for p in payments]


@router.get("/me/summary", response_model=PaymentSummary)
def my_summary(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return get_my_summary(user_id, db)


@router.get("/room/{room_id}", response_model=list[PaymentOut])
def room_payments(
    room_id: int,
    status: Optional[str] = Query(default=None, pattern="^(pending|settled)$"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    payments = get_room_payments(room_id, status, db)
    return [_serialize(p) for p in payments]


# ── Parameterised paths LAST ───────────────────────────────────

@router.patch("/{payment_id}/settle", response_model=PaymentOut)
def settle_payment_route(
    payment_id: int,
    body: PaymentSettle,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    payment = settle_payment(payment_id, user_id, body.upi_ref, db)
    return _serialize(payment)


@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(
    payment_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    payment = get_payment_by_id(payment_id, db)
    return _serialize(payment)