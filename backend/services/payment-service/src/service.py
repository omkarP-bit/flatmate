import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from cache import cache_delete, cache_delete_pattern, cache_get, cache_set
from models import Payment
from schemas import PaymentCreate, PaymentSummary


def create_payment(data: PaymentCreate, from_user: str, db: Session) -> Payment:
    if from_user == data.to_user:
        raise HTTPException(
            status_code=400, detail="Cannot create a payment to yourself."
        )

    payment = Payment(
        room_id=data.room_id,
        from_user=from_user,
        to_user=data.to_user,
        amount=data.amount,
        status="pending",
        upi_ref=data.upi_ref,
        note=data.note,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(cache_delete(f"payments:user:{from_user}"))
    loop.run_until_complete(cache_delete(f"payments:user:{data.to_user}"))
    loop.run_until_complete(
        cache_delete_pattern(f"payments:room:{data.room_id}:*")
    )

    return payment


def settle_payment(
    payment_id: int, confirmer_id: str, upi_ref: Optional[str], db: Session
) -> Payment:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found.")
    if str(payment.to_user) != confirmer_id:
        raise HTTPException(
            status_code=403,
            detail="Only the payment recipient can confirm settlement.",
        )
    if payment.status == "settled":
        raise HTTPException(status_code=409, detail="Payment is already settled.")

    payment.status = "settled"
    payment.settled_at = datetime.now(tz=timezone.utc)
    if upi_ref:
        payment.upi_ref = upi_ref

    db.commit()
    db.refresh(payment)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(cache_delete(f"payments:user:{str(payment.from_user)}"))
    loop.run_until_complete(cache_delete(f"payments:user:{confirmer_id}"))
    loop.run_until_complete(
        cache_delete_pattern(f"payments:room:{payment.room_id}:*")
    )

    return payment


def get_payment_by_id(payment_id: int, db: Session) -> Payment:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found.")
    return payment


def get_my_payments(user_id: str, db: Session) -> list[Payment]:
    cache_key = f"payments:user:{user_id}"
    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        return (
            db.query(Payment)
            .filter(
                (Payment.from_user == user_id) | (Payment.to_user == user_id)
            )
            .order_by(Payment.created_at.desc())
            .all()
        )

    payments = (
        db.query(Payment)
        .filter(
            (Payment.from_user == user_id) | (Payment.to_user == user_id)
        )
        .order_by(Payment.created_at.desc())
        .all()
    )
    asyncio.get_event_loop().run_until_complete(
        cache_set(cache_key, [{"id": p.id} for p in payments], ttl=120)
    )
    return payments


def get_room_payments(
    room_id: int, status: Optional[str], db: Session
) -> list[Payment]:
    status_key = status or "all"
    cache_key = f"payments:room:{room_id}:{status_key}"
    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        query = db.query(Payment).filter(Payment.room_id == room_id)
        if status:
            query = query.filter(Payment.status == status)
        return query.order_by(Payment.created_at.desc()).all()

    query = db.query(Payment).filter(Payment.room_id == room_id)
    if status:
        query = query.filter(Payment.status == status)
    payments = query.order_by(Payment.created_at.desc()).all()

    asyncio.get_event_loop().run_until_complete(
        cache_set(cache_key, [{"id": p.id} for p in payments], ttl=60)
    )
    return payments


def get_my_summary(user_id: str, db: Session) -> PaymentSummary:
    payments = get_my_payments(user_id, db)

    total_paid = sum(
        float(p.amount)
        for p in payments
        if str(p.from_user) == user_id and p.status == "settled"
    )
    total_received = sum(
        float(p.amount)
        for p in payments
        if str(p.to_user) == user_id and p.status == "settled"
    )
    pending_out = sum(
        float(p.amount)
        for p in payments
        if str(p.from_user) == user_id and p.status == "pending"
    )
    pending_in = sum(
        float(p.amount)
        for p in payments
        if str(p.to_user) == user_id and p.status == "pending"
    )

    return PaymentSummary(
        total_paid=round(total_paid, 2),
        total_received=round(total_received, 2),
        pending_out=round(pending_out, 2),
        pending_in=round(pending_in, 2),
        transaction_count=len(payments),
    )