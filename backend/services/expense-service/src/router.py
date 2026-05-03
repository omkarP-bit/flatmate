import asyncio
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth import get_current_user_id
from balance_engine import compute_room_balances, get_user_balance
from cache import cache_get, cache_set
from database import get_db
from schemas import (
    BalanceEntry,
    CategorySuggestion,
    ExpenseCreate,
    ExpenseOut,
    RecurringSuggestion,
    SplitOut,
    UserBalanceOut,
)
from service import (
    create_expense,
    delete_expense,
    get_expense_by_id,
    get_room_expenses,
    settle_my_split,
)
from smart_suggest import get_category_suggestion, get_recurring_suggestions

router = APIRouter(prefix="/expenses")


def _serialize_expense(expense) -> ExpenseOut:
    return ExpenseOut(
        id=expense.id,
        room_id=expense.room_id,
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        paid_by=str(expense.paid_by),
        split_type=expense.split_type,
        notes=expense.notes,
        created_at=expense.created_at,
        splits=[
            SplitOut(
                expense_id=s.expense_id,
                user_id=str(s.user_id),
                amount=s.amount,
                is_settled=s.is_settled,
                settled_at=s.settled_at,
            )
            for s in expense.splits
        ],
    )


# ── Fixed paths FIRST ──────────────────────────────────────────

@router.post("", response_model=ExpenseOut)
def create_expense_route(
    body: ExpenseCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    expense = create_expense(body, user_id, db)
    return _serialize_expense(expense)


@router.get("/suggest/category", response_model=CategorySuggestion)
def suggest_category(
    title: str = Query(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return get_category_suggestion(title, user_id, db)


@router.get("/suggest/recurring/{room_id}", response_model=list[RecurringSuggestion])
def suggest_recurring(
    room_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return get_recurring_suggestions(user_id, room_id, db)


@router.get("/balance/room/{room_id}", response_model=list[BalanceEntry])
def room_balances(
    room_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    cache_key = f"balance:room:{room_id}"
    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        return [BalanceEntry(**entry) for entry in cached]

    balances = compute_room_balances(room_id, db)
    asyncio.get_event_loop().run_until_complete(
        cache_set(cache_key, [b.model_dump() for b in balances], ttl=60)
    )
    return balances


@router.get("/balance/me/room/{room_id}", response_model=UserBalanceOut)
def my_balance(
    room_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return get_user_balance(user_id, room_id, db)


@router.get("/room/{room_id}", response_model=list[ExpenseOut])
def list_room_expenses(
    room_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    expenses = get_room_expenses(room_id, db)
    return [_serialize_expense(e) for e in expenses]


# ── Parameterised paths LAST ───────────────────────────────────

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    expense = get_expense_by_id(expense_id, db)
    return _serialize_expense(expense)


@router.delete("/{expense_id}")
def delete_expense_route(
    expense_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return delete_expense(expense_id, user_id, db)


@router.patch("/{expense_id}/settle")
def settle_split(
    expense_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return settle_my_split(expense_id, user_id, db)