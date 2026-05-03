from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    room_id: int
    to_user: str
    amount: Decimal = Field(..., gt=0)
    upi_ref: Optional[str] = None
    note: Optional[str] = None


class PaymentSettle(BaseModel):
    upi_ref: Optional[str] = None


class PaymentOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    room_id: int
    from_user: str
    to_user: str
    amount: Decimal
    status: str
    upi_ref: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
    settled_at: Optional[datetime] = None


class PaymentSummary(BaseModel):
    total_paid: float
    total_received: float
    pending_out: float
    pending_in: float
    transaction_count: int