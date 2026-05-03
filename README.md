# 🏠 Flatmate — Smart Roommate Management System

A production-ready microservices app to track shared expenses, split bills, and manage payments between flatmates.

---

## 🧰 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, TypeScript, Vite, Zustand |
| Backend     | FastAPI (Python 3.12), async      |
| Database    | Supabase (PostgreSQL + Auth)      |
| Cache       | Redis 7                           |
| Gateway     | FastAPI reverse proxy + JWT auth  |
| Containers  | Docker + Docker Compose           |

---

## 📁 Project Structure

```
flatmate/
├── docker-compose.yml
├── .env.example
├── database/
│   └── migrations/001_all_schemas.sql   ← Run this in Supabase first
├── gateway/                             ← API Gateway (port 8000)
├── services/
│   ├── user-service/    (port 8001)
│   ├── room-service/    (port 8002)
│   ├── expense-service/ (port 8003)     ← Core service
│   └── payment-service/ (port 8004)
└── frontend/                            ← React app (port 3000)
```

---

## 🚀 Quick Start

### Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a new project
2. In your project dashboard → **SQL Editor**
3. Paste the contents of `database/migrations/001_all_schemas.sql` and run it
4. Go to **Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`
5. Go to **Settings → JWT** and copy the JWT Secret → `JWT_SECRET`

### Step 2 — Environment

```bash
cp .env.example .env
# Fill in your values from Supabase
```

### Step 3 — Run Everything

```bash
docker compose up --build
```

That's it! Services start in order:

| Service          | URL                          |
|------------------|------------------------------|
| Frontend         | http://localhost:3000         |
| API Gateway      | http://localhost:8000         |
| User Service     | http://localhost:8001/docs    |
| Room Service     | http://localhost:8002/docs    |
| Expense Service  | http://localhost:8003/docs    |
| Payment Service  | http://localhost:8004/docs    |

---

## 🧑‍💻 Local Development (without Docker)

Run each service individually for hot reload.

### Backend services

```bash
# In each service folder:
cd services/user-service
pip install -r requirements.txt
python main.py          # starts on the port in config.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:3000
```

### Redis (local)

```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt install redis-server && sudo systemctl start redis
```

---

## 📡 API Reference

All requests go through the **gateway on port 8000**.
Protected routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint       | Body                          | Auth? |
|--------|----------------|-------------------------------|-------|
| POST   | /users         | `{name, email, password}`     | No    |
| POST   | /users/login   | `{email, password}`           | No    |
| GET    | /users/{id}    | —                             | Yes   |
| PATCH  | /users/{id}    | `{name?, upi_id?, phone?}`    | Yes   |

### Rooms
| Method | Endpoint                         | Body / Notes           |
|--------|----------------------------------|------------------------|
| POST   | /rooms                           | `{name, address?}`     |
| POST   | /rooms/join                      | `{room_code}`          |
| GET    | /rooms/mine                      | Your rooms             |
| GET    | /rooms/{id}/members              | —                      |
| DELETE | /rooms/{id}/members/{user_id}    | Leave or remove        |

### Expenses
| Method | Endpoint                              | Notes                          |
|--------|---------------------------------------|--------------------------------|
| POST   | /expenses                             | Creates expense + splits       |
| GET    | /expenses/room/{room_id}              | All room expenses              |
| GET    | /expenses/balance/room/{room_id}      | Who owes whom (room-level)     |
| GET    | /expenses/balance/{user_id}/room/{id} | User's net balance             |
| PATCH  | /expenses/{id}/settle                 | Mark your share settled        |
| DELETE | /expenses/{id}                        | Only payer can delete          |
| GET    | /expenses/suggest/category?title=...  | Smart category prediction      |
| GET    | /expenses/suggest/recurring/{room_id} | Monthly recurring suggestions  |

### Payments
| Method | Endpoint                       | Notes                          |
|--------|--------------------------------|--------------------------------|
| POST   | /payments                      | Record a payment               |
| PATCH  | /payments/{id}/settle          | Recipient confirms settlement  |
| GET    | /payments/user/{user_id}       | User's payment history         |
| GET    | /payments/user/{user_id}/summary | Aggregated stats              |
| GET    | /payments/room/{room_id}       | Room payment history           |

---

## 🤖 Smart Features

### Category Auto-Detection
When adding an expense, the frontend calls:
```
GET /expenses/suggest/category?title=electricity+bill
→ { category: "electricity", confidence: "high", source: "keyword" }
```
The keyword engine maps merchant names (BigBasket → groceries, Airtel → utilities, etc.) with zero latency. Falls back to your historical spending pattern.

### Recurring Suggestions
```
GET /expenses/suggest/recurring/{room_id}
→ [{ title: "Electricity Bill", avg_amount: 2400, days_since: 28, message: "..." }]
```
Detects monthly patterns and prompts you to add recurring expenses before you forget.

---

## 💡 Adding a New Microservice

1. Copy any existing service folder as a template
2. Update `config.py` (port, service_name)
3. Write your models, services, routers
4. Add to `docker-compose.yml`
5. Add the route prefix → URL mapping in `gateway/main.py`

---

## 🔒 Security Notes

- All protected routes require a valid Supabase JWT
- The gateway validates the token and injects `X-User-Id` — microservices trust this header
- Service-role Supabase key is **only used server-side** (never sent to frontend)
- Redis caches are invalidated on every write to avoid stale data
- Row-Level Security (RLS) is enabled on all Supabase tables as a second layer

---

## 🚧 Future Scope

- [ ] Real-time balance updates via Supabase Realtime
- [ ] Push notifications (FCM) for new expenses
- [ ] Export expenses to PDF/CSV
- [ ] Multi-room support per user (currently assumes room_id = 1)
- [ ] AI expense categorization via Claude API
- [ ] Recurring expense auto-creation via cron
