from decimal import ROUND_HALF_UP, Decimal
from typing import List

from fastapi import HTTPException

from schemas import ExpenseCreate


def _quantize(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_splits(data: ExpenseCreate) -> List[dict]:
    total = data.amount
    members = data.members

    if not members:
        raise HTTPException(status_code=400, detail="Members list must not be empty.")

    if data.split_type == "equal":
        n = len(members)
        share = _quantize(total / Decimal(n))
        result = []
        running = Decimal("0.00")
        for i, uid in enumerate(members):
            if i == n - 1:
                # Last person gets the remainder to fix rounding drift
                amount = _quantize(total - running)
            else:
                amount = share
                running += amount
            result.append({"user_id": uid, "amount": float(amount)})
        return result

    elif data.split_type == "custom":
        if not data.splits:
            raise HTTPException(
                status_code=400,
                detail="Custom split requires 'splits' to be provided.",
            )
        split_ids = {s.user_id for s in data.splits}
        member_ids = set(members)
        if split_ids != member_ids:
            raise HTTPException(
                status_code=400,
                detail="User IDs in splits must exactly match the members list.",
            )
        total_split = sum(Decimal(str(s.amount)) for s in data.splits)
        if abs(total_split - total) > Decimal("0.02"):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Sum of custom split amounts ({total_split}) does not match "
                    f"expense total ({total}). Allowed tolerance: 0.02."
                ),
            )
        return [
            {"user_id": s.user_id, "amount": float(_quantize(Decimal(str(s.amount))))}
            for s in data.splits
        ]

    elif data.split_type == "percentage":
        if not data.splits:
            raise HTTPException(
                status_code=400,
                detail="Percentage split requires 'splits' to be provided.",
            )
        split_ids = {s.user_id for s in data.splits}
        member_ids = set(members)
        if split_ids != member_ids:
            raise HTTPException(
                status_code=400,
                detail="User IDs in splits must exactly match the members list.",
            )
        total_pct = sum(Decimal(str(s.amount)) for s in data.splits)
        if abs(total_pct - Decimal("100")) > Decimal("0.01"):
            raise HTTPException(
                status_code=400,
                detail=f"Percentages must sum to 100. Got {total_pct}.",
            )
        result = []
        running = Decimal("0.00")
        splits_list = list(data.splits)
        for i, s in enumerate(splits_list):
            if i == len(splits_list) - 1:
                amount = _quantize(total - running)
            else:
                amount = _quantize((Decimal(str(s.amount)) / Decimal("100")) * total)
                running += amount
            result.append({"user_id": s.user_id, "amount": float(amount)})
        return result

    else:
        raise HTTPException(status_code=400, detail=f"Unknown split type: {data.split_type}")