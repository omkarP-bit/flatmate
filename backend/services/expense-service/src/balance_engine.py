from sqlalchemy.orm import Session

from models import Expense, ExpenseSplit
from schemas import BalanceEntry, UserBalanceOut


def compute_room_balances(room_id: int, db: Session) -> list[BalanceEntry]:
    # Step 1: Load all expenses for room
    expenses = db.query(Expense).filter(Expense.room_id == room_id).all()
    if not expenses:
        return []

    expense_ids = [e.id for e in expenses]
    paid_by_map: dict[int, str] = {e.id: str(e.paid_by) for e in expenses}

    # Step 2: Load all unsettled splits for those expenses
    splits = (
        db.query(ExpenseSplit)
        .filter(
            ExpenseSplit.expense_id.in_(expense_ids),
            ExpenseSplit.is_settled == False,
        )
        .all()
    )

    # Step 3: Build net dict net[debtor][creditor] += amount
    # A debtor is someone who has a split but is NOT the payer
    net: dict[str, dict[str, float]] = {}

    for split in splits:
        debtor = str(split.user_id)
        creditor = paid_by_map[split.expense_id]

        # Payer's own share is not a debt
        if debtor == creditor:
            continue

        if debtor not in net:
            net[debtor] = {}
        net[debtor][creditor] = net[debtor].get(creditor, 0.0) + float(split.amount)

    # Step 4: Simplify — net off bidirectional debts
    result: list[BalanceEntry] = []
    seen_pairs: set[tuple[str, str]] = set()

    debtors = list(net.keys())
    for debtor in debtors:
        for creditor in list(net[debtor].keys()):
            pair = tuple(sorted([debtor, creditor]))
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)

            a_owes_b = net.get(debtor, {}).get(creditor, 0.0)
            b_owes_a = net.get(creditor, {}).get(debtor, 0.0)
            net_amount = a_owes_b - b_owes_a

            if net_amount > 0.005:
                result.append(
                    BalanceEntry(
                        from_user=debtor,
                        to_user=creditor,
                        amount=round(net_amount, 2),
                    )
                )
            elif net_amount < -0.005:
                result.append(
                    BalanceEntry(
                        from_user=creditor,
                        to_user=debtor,
                        amount=round(abs(net_amount), 2),
                    )
                )
            # If net_amount ≈ 0, skip (they cancel out)

    return result


def get_user_balance(user_id: str, room_id: int, db: Session) -> UserBalanceOut:
    all_balances = compute_room_balances(room_id, db)

    owed_to_me = sum(e.amount for e in all_balances if e.to_user == user_id)
    i_owe = sum(e.amount for e in all_balances if e.from_user == user_id)
    net = owed_to_me - i_owe

    return UserBalanceOut(
        user_id=user_id,
        room_id=room_id,
        owed_to_me=round(owed_to_me, 2),
        i_owe=round(i_owe, 2),
        net=round(net, 2),
        details=all_balances,
    )