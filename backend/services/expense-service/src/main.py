from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from config import settings
from database import health_check
from router import router

app = FastAPI(title="Flatmate – Expense Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    db_ok = health_check()
    return {
        "status": "ok" if db_ok else "degraded",
        "service": settings.service_name,
        "db": db_ok,
    }


handler = Mangum(app)