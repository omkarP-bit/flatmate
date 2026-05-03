# Flatmate 🏠

Tired of the awkward "who paid for what?" conversations with your flatmates? Flatmate makes it simple to track shared expenses, split bills, and settle up — so you can focus on living together, not accounting together.

---

## What is Flatmate?

Flatmate is an app for people living together. Whether it's the monthly electricity bill, a grocery run, or the WiFi subscription — just log it, split it, and move on. Everyone in the flat can see what they owe and to whom, in real time.

---

## Core Features

- **Rooms** — Create a flat, share an invite code, and your flatmates join in seconds.
- **Expense Tracking** — Log any shared expense with a title, amount, and category.
- **Smart Splits** — Split equally, set custom amounts, or split by percentage — your choice.
- **Balance Summary** — Always know exactly who owes whom and how much, with debts automatically simplified.
- **Payments** — Record a payment when you transfer money, and let the recipient confirm it.
- **Smart Suggestions** — The app learns your patterns and reminds you when a recurring bill (like rent or electricity) is probably due again.
- **Avatar & UPI** — Set a profile photo and your UPI ID so flatmates know how to pay you.

---

## How It Works

1. One person creates a flat and shares the invite code.
2. Flatmates join using the code.
3. Whenever someone pays a shared expense, they log it in the app.
4. Everyone can see the running balances — no spreadsheets, no WhatsApp debates.
5. When someone transfers money, they mark it as a payment. The recipient confirms, and the balance clears.

---

## Project Structure

```
flatmate-backend/
├── shared/               # Common utilities used by all services
│   ├── config.py         # Environment configuration
│   ├── database.py       # Database connection
│   ├── auth.py           # JWT authentication
│   ├── cache.py          # Redis caching
│   └── s3_client.py      # File storage helpers
│
├── services/
│   ├── user-service/     # User profiles and avatars
│   ├── room-service/     # Flat management and invites
│   ├── expense-service/  # Expenses, splits, and balances
    └── payment-service/  # Payment recording and settlement

```

Each service is completely independent — its own codebase, its own deployment, its own responsibilities. They all share one database and one Redis cache.

---

## Services at a Glance

| Service | What it owns |
|---|---|
| `user-service` | Profile creation, avatar uploads, user lookup |
| `room-service` | Creating flats, invite codes, adding/removing members |
| `expense-service` | Logging expenses, calculating splits, showing balances, smart suggestions |
| `payment-service` | Recording payments, confirming settlements, payment history |

---

## Getting Started (for contributors)

### Prerequisites

- Python 3.12
- AWS CLI configured
- A running PostgreSQL instance
- A running Redis instance

### Local Setup

```bash
# Clone the repo
git clone https://github.com/your-org/flatmate-backend.git
cd flatmate-backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies for the service you're working on
pip install -r services/expense-service/requirements.txt

# Copy shared layer into the service for local running
cp shared/* services/expense-service/src/

# Set up environment variables
cp .env.example .env
# Fill in your local DB, Redis, and Cognito values

# Run the service
cd services/expense-service/src
uvicorn main:app --reload --port 8003
```

Each service runs on its own port locally:

| Service | Port |
|---|---|
| user-service | 8080 |
| room-service | 8002 |
| expense-service | 3000 |
| payment-service | 8080 |

### Apply the Database Schema

```bash
psql -h localhost -U flatmate -d flatmate -f schema.sql
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values. Every variable has a comment explaining what it does.

Key variables to set up locally:

```env
DB_HOST=localhost
DB_NAME=flatmate
DB_USER=flatmate
DB_PASSWORD=yourpassword

REDIS_URL=redis://localhost:6379

COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id

ENVIRONMENT=development
SERVICE_NAME=expense-service   # change per service you're running
```

---

## How to Contribute

We welcome contributions of all kinds — bug fixes, new features, documentation improvements, or tests.

### Workflow

1. **Fork** the repo and create a branch from `main`.
```bash
   git checkout -b feature/your-feature-name
```

2. **Make your changes.** Keep each PR focused on one thing.

3. **Test locally** by running the affected service with `uvicorn` and hitting the endpoints via Postman or `curl`.

4. **Commit** with a clear message:
```bash
   git commit -m "feat(expense-service): add receipt upload support"
```

5. **Open a Pull Request** against `main`. Describe what you changed and why.

### Commit Message Format

We follow a simple convention:

```
feat(service-name): short description       # new feature
fix(service-name): short description        # bug fix
refactor(service-name): short description   # refactor, no behaviour change
docs: short description                     # documentation only
chore: short description                    # build scripts, config, etc.
```

### Where to Start

Good first issues for new contributors:

- Adding input validation to an existing endpoint
- Improving error messages to be more descriptive
- Writing a helper function in the shared layer
- Adding a new keyword rule in `smart_suggest.py` for a category
- Improving the recurring suggestions logic

If you're unsure where to begin, open an issue and ask — we're happy to help you find a good starting point.

---

## Codebase Conventions

**Imports** — All shared modules use flat imports because they are copied to the root of each Lambda package at build time:
```python
# Correct
from config import settings
from database import get_db

# Wrong — will break in Lambda
from shared.config import settings
```

**Money** — Always use `decimal.Decimal` for monetary values. Never use `float` for calculations. Only convert to `float` at the final JSON response boundary.

**Cache** — Every cache read/write must be wrapped in `try/except`. A Redis failure should never surface as a 500 error to the user.

**Route ordering** — In every router, fixed paths (`/me`, `/mine`, `/suggest/category`) must be registered before parameterised paths (`/{id}`). FastAPI matches in registration order.

---

## Built For Indian Flatmates

- Supports UPI reference IDs for payment tracking.
- Category suggestions understand Indian context — Blinkit, Zepto, MSEDCL, Jio, and more.
- Recurring reminders for rent, electricity, gas cylinders, and other monthly staples.
- Deployed in `ap-south-1` (Mumbai) for low latency.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Compute | AWS Lambda |
| API Framework | FastAPI + Mangum |
| Auth | AWS Cognito (Google OAuth) |
| Database | RDS PostgreSQL via RDS Proxy |
| Cache | ElastiCache Serverless Redis |
| Storage | Amazon S3 |

---

## License

MIT — free to use, fork, and build on.