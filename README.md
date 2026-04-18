# 🏠 Flatmate App – Microservices Backend

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Database](https://img.shields.io/badge/Database-Supabase%20\(PostgreSQL\)-orange)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Auth](https://img.shields.io/badge/Auth-OAuth%20\(Supabase\)-purple)

---

## 📌 Overview

Flatmate is a **roommate management application** that helps users manage:

* 💰 Shared expenses
* 💳 Payments & settlements
* 🏠 Room-based groups
* 📊 Personal & group dashboards

The system is designed using a **microservices architecture** with clean separation of concerns and scalable database design.

---

## 🚀 Core Features

* 🔐 OAuth-based authentication
* 🏠 Create / Join rooms
* 💰 Add & split expenses
* 📊 Track balances & dues
* 💳 Payment tracking system
* 📈 Individual & roommate dashboards

---

## 🏗 Architecture

```text
Client (React)
      │
      ▼
API Gateway
      │
 ┌───────────────┬───────────────┬───────────────┬───────────────┐
 ▼               ▼               ▼               ▼
User Service   Room Service   Expense Service   Payment Service
      │               │               │               │
      ▼               ▼               ▼               ▼
            Supabase (PostgreSQL + Auth + Storage)
```

---

## 🔁 Application Flow

```text
1. User logs in via OAuth
2. User creates or joins a room
3. Users add expenses in a room
4. System splits expenses among members
5. Users track and settle payments
```

---

## 🧩 Microservices Breakdown

### 👤 User Service

* Manage user profile
* Stores UPI, phone, etc.

### 🏠 Room Service

* Create rooms
* Manage members

### 💰 Expense Service

* Add expenses
* Split logic
* Track balances

### 💳 Payment Service

* Record payments
* Track settlements

---

## 🗄 Database Design

> ✅ Single DB + Multiple Schemas (Microservice-style isolation)

```text
Supabase DB
│
├── user_service
├── room_service
├── expense_service
└── payment_service
```

---

## 📊 Key Tables

| Table          | Description         |
| -------------- | ------------------- |
| users          | User profile (UUID) |
| rooms          | Room info           |
| room_members   | User-room mapping   |
| expenses       | Expense records     |
| expense_splits | Split logic         |
| payments       | Payment tracking    |

---

## 🧱 Example Schema

```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    paid_by UUID NOT NULL,
    title VARCHAR(200),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Gateway Routing

```text
/auth/*       → User Service
/users/*      → User Service
/rooms/*      → Room Service
/expenses/*   → Expense Service
/payments/*   → Payment Service
```

---

## 📡 Sample API Endpoints

### 👤 User Service

```http
GET /users/{id}
PUT /users/{id}
```

### 🏠 Room Service

```http
POST /rooms
POST /rooms/join
GET /rooms/{id}/members
```

### 💰 Expense Service

```http
POST /expenses
GET /expenses/{room_id}
```

### 💳 Payment Service

```http
POST /payments
GET /payments/user/{id}
```

---

## 🔗 Service-to-Service Communication

```text
Room Service → User Service (fetch user details)
Expense Service → Room Service (validate members)
Payment Service → User Service (payer/receiver info)
```

---

## 🧠 Design Principles

* ✅ Minimal UUID usage (only users)
* ⚡ Use SERIAL (INT) for performance
* 🚫 No cross-schema joins
* 🔗 API-based service communication
* 📌 Optimized indexing (only required fields)
* 🧩 Loose coupling between services

---

## ⚠️ Important Decisions

### ❌ No Cross-Service Foreign Keys

```text
We rely on service APIs, not DB joins
```

### ✅ Context-Based Modeling

```text
room_id → defines group context
paid_by → defines actor
```

---

## 🚀 Future Scope

* ⚡ Redis caching
* 📩 Event-driven architecture (Kafka)
* 💬 Real-time chat (WebSockets)
* 📍 Location sharing
* 📊 Advanced analytics dashboard

---

## 📈 Why This Project?

This project demonstrates:

* 🔥 Real-world microservices design
* 🧠 Strong database modeling
* ⚙️ API gateway architecture
* 📊 Scalable backend system

---

## 🛠 Tech Stack

* Backend: FastAPI
* Database: Supabase (PostgreSQL)
* Frontend: React
* Auth: Supabase OAuth
* Architecture: Microservices + API Gateway

---

## 👨‍💻 Author

**Omkar Patil**

---

## ⭐ Contribution

Feel free to fork, improve, and contribute!

---

## 📜 License

This project is open-source and available under the MIT License.
