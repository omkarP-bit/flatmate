import asyncio
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import func, text
from sqlalchemy.orm import Session, joinedload

from balance_engine import compute_room_balances, get_user_balance
from cache import cache_delete, cache_delete_pattern, cache_get, cache_set
from models import Expense, ExpenseSplit
from schemas import ExpenseCreate
from split_calculator import calculate_splits


def create_expense(data: ExpenseCreate, paid_by: str, db: Session) -> Expense:
    expense = Expense(
        room_id=data.room_id,
        title=data.title,
        amount=data.amount,
        category=data.category,
        paid_by=paid_by,
        split_type=data.split_type,
        notes=data.notes,
    )
    db.add(expense)
    db.flush()  # get expense.id

    split_data = calculate_splits(data)
    for item in split_data:
        split = ExpenseSplit(
            expense_id=expense.id,
            user_id=item["user_id"],
            amount=Decimal(str(item["amount"])),
        )
        db.add(split)

    db.commit()
    db.refresh(expense)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(cache_delete(f"expenses:room:{data.room_id}"))
    loop.run_until_complete(cache_delete(f"balance:room:{data.room_id}"))

    # Reload with splits
    return (
        db.query(Expense)
        .options(joinedload(Expense.splits))
        .filter(Expense.id == expense.id)
        .first()
    )


def get_room_expenses(room_id: int, db: Session) -> list[Expense]:
    cache_key = f"expenses:room:{room_id}"
    cached = asyncio.get_event_loop().run_until_complete(cache_get(cache_key))
    if cached:
        # Return fresh from DB for type consistency
        return (
            db.query(Expense)
            .options(joinedload(Expense.splits))
            .filter(Expense.room_id == room_id)
            .order_by(Expense.created_at.desc())
            .all()
        )

    expenses = (
        db.query(Expense)
        .options(joinedload(Expense.splits))
        .filter(Expense.room_id == room_id)
        .order_by(Expense.created_at.desc())
        .all()
    )
    asyncio.get_event_loop().run_until_complete(
        cache_set(cache_key, [{"id": e.id} for e in expenses], ttl=120)
    )
    return expenses


def get_expense_by_id(expense_id: int, db: Session) -> Expense:
    expense = (
        db.query(Expense)
        .options(joinedload(Expense.splits))
        .filter(Expense.id == expense_id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return expense


def delete_expense(expense_id: int, user_id: str, db: Session) -> dict:
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found.")
    if str(expense.paid_by) != user_id:
        raise HTTPException(
            status_code=403, detail="Only the expense creator can delete it."
        )

    room_id = expense.room_id
    db.delete(expense)
    db.commit()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(cache_delete(f"expenses:room:{room_id}"))
    loop.run_until_complete(cache_delete(f"balance:room:{room_id}"))

    return {"message": "Expense deleted."}


def settle_my_split(expense_id: int, user_id: str, db: Session) -> dict:
    split = (
        db.query(ExpenseSplit)
        .filter(
            ExpenseSplit.expense_id == expense_id,
            ExpenseSplit.user_id == user_id,
            ExpenseSplit.is_settled == False,
        )
        .first()
    )
    if not split:
        raise HTTPException(
            status_code=404,
            detail="No unsettled split found for this expense and user.",
        )

    # Find room_id through expense
    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    split.is_settled = True
    split.settled_at = func.now()
    db.commit()

    if expense:
        asyncio.get_event_loop().run_until_complete(
            cache_delete(f"balance:room:{expense.room_id}")
        )

    return {"message": "Split settled."}