from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Category = Literal["rent", "electricity", "groceries", "utilities", "other"]
SplitType = Literal["equal", "custom", "percentage"]


class CustomSplitEntry(BaseModel):
    user_id: str
    amount: Decimal


class ExpenseCreate(BaseModel):
    room_id: int
    title: str
    amount: Decimal = Field(..., gt=0)
    category: Category = "other"
    split_type: SplitType = "equal"
    members: List[str]
    splits: Optional[List[CustomSplitEntry]] = None
    notes: Optional[str] = None


class SplitOut(BaseModel):
    model_config = {"from_attributes": True}

    expense_id: int
    user_id: str
    amount: Decimal
    is_settled: bool
    settled_at: Optional[datetime] = None


class ExpenseOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    room_id: int
    title: str
    amount: Decimal
    category: str
    paid_by: str
    split_type: str
    notes: Optional[str] = None
    created_at: datetime
    splits: List[SplitOut] = []


class BalanceEntry(BaseModel):
    from_user: str
    to_user: str
    amount: float


class UserBalanceOut(BaseModel):
    user_id: str
    room_id: int
    owed_to_me: float
    i_owe: float
    net: float
    details: List[BalanceEntry]


class CategorySuggestion(BaseModel):
    category: str
    confidence: str
    source: str


class RecurringSuggestion(BaseModel):
    category: str
    title: str
    avg_amount: float
    last_added: str
    days_since: int
    message: str