from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base

expense_category_enum = Enum(
    "rent", "electricity", "groceries", "utilities", "other",
    name="expense_category",
)

split_type_enum = Enum(
    "equal", "custom", "percentage",
    name="split_type",
)


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(expense_category_enum, nullable=False, default="other")
    paid_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    split_type = Column(split_type_enum, nullable=False, default="equal")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    splits = relationship("ExpenseSplit", back_populates="expense", lazy="select")


class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    expense_id = Column(
        Integer, ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    is_settled = Column(Boolean, nullable=False, default=False)
    settled_at = Column(DateTime(timezone=True), nullable=True)

    expense = relationship("Expense", back_populates="splits")