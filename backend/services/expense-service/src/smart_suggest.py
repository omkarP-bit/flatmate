from collections import Counter
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models import Expense
from schemas import CategorySuggestion, RecurringSuggestion

KEYWORD_RULES: list[tuple[list[str], str]] = [
    (["rent", "landlord", "housing", "pg", "hostel", "deposit"], "rent"),
    (
        ["electric", "electricity", "msedcl", "bescom", "tata power", "power bill"],
        "electricity",
    ),
    (
        [
            "bigbasket", "blinkit", "zepto", "grofers", "grocery", "groceries",
            "vegetables", "dmart", "reliance fresh", "swiggy instamart",
        ],
        "groceries",
    ),
    (
        [
            "wifi", "broadband", "internet", "airtel", "jio", "bsnl",
            "water bill", "gas", "lpg", "cylinder", "indane", "mahanagar gas",
        ],
        "utilities",
    ),
]


def predict_category(title: str) -> str:
    lower = title.lower()
    for keywords, category in KEYWORD_RULES:
        for kw in keywords:
            if kw in lower:
                return category
    return "other"


def get_category_suggestion(
    title: str, user_id: str, db: Session
) -> CategorySuggestion:
    # Step 1: Try keyword match
    category = predict_category(title)
    if category != "other":
        return CategorySuggestion(category=category, confidence="high", source="keyword")

    # Step 2: Check user's history
    recent = (
        db.query(Expense)
        .filter(Expense.paid_by == user_id)
        .order_by(Expense.created_at.desc())
        .limit(50)
        .all()
    )
    if recent:
        counts = Counter(e.category for e in recent)
        most_common_category, _ = counts.most_common(1)[0]
        return CategorySuggestion(
            category=most_common_category,
            confidence="medium",
            source="history",
        )

    # Step 3: Default
    return CategorySuggestion(category="other", confidence="low", source="default")


def get_recurring_suggestions(
    user_id: str, room_id: int, db: Session
) -> list[RecurringSuggestion]:
    expenses = (
        db.query(Expense)
        .filter(Expense.paid_by == user_id, Expense.room_id == room_id)
        .order_by(Expense.created_at.desc())
        .limit(100)
        .all()
    )

    # Group by category
    by_category: dict[str, list[Expense]] = {}
    for e in expenses:
        cat = str(e.category)
        by_category.setdefault(cat, []).append(e)

    suggestions: list[RecurringSuggestion] = []
    now = datetime.now(tz=timezone.utc)

    for category, exps in by_category.items():
        if len(exps) < 2:
            continue

        # Most recent entry (list already sorted DESC)
        last_expense = exps[0]
        last_date = last_expense.created_at
        if last_date.tzinfo is None:
            last_date = last_date.replace(tzinfo=timezone.utc)

        days_since = (now - last_date).days

        if 25 <= days_since <= 35:
            recent_three = exps[:3]
            avg_amount = float(
                sum(float(e.amount) for e in recent_three) / len(recent_three)
            )
            suggestions.append(
                RecurringSuggestion(
                    category=category,
                    title=last_expense.title,
                    avg_amount=round(avg_amount, 2),
                    last_added=last_date.strftime("%Y-%m-%d"),
                    days_since=days_since,
                    message=(
                        f"It's been {days_since} days since your last "
                        f"{category} expense. Add one?"
                    ),
                )
            )

    return suggestions