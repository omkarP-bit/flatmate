from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import NullPool
from config import settings


engine = create_engine(
    settings.db_url,
    poolclass=NullPool,
    echo=(settings.environment == "development"),
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require",
        "options": "-c statement_timeout=25000",
    },
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def health_check() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False