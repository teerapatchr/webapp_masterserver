# Master Server Inventory System

Internal web application for managing server inventory, lifecycle, ownership, and operational data with role-based access control.

## Overview

The Master Server Inventory System is a full-stack web application designed to manage server information, track lifecycle status, and allow controlled access via user roles (Admin / Viewer).

The system supports:

* Server inventory management
* Filtering, search, and pagination
* CSV export
* Server detail modal with editing
* User authentication (JWT)
* Role-based access control (RBAC)
* Admin user management
* Full stack deployment

---

# System Architecture

```
Frontend (Next.js)
        ↓
Backend API (Node.js Express)
        ↓
PostgreSQL Database
```

## Deployment Architecture

```
Frontend → Vercel
Backend → Render
Database → Neon PostgreSQL
```

## Local Development

```
Frontend → http://localhost:3000
Backend  → http://localhost:4000
Database → localhost:5432
```

---

# Tech Stack

## Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Virtual (virtualized table)
* Fetch API
* Lucide React (icons)

## Backend

* Node.js
* Express.js
* PostgreSQL (pg)
* JWT Authentication
* bcrypt password hashing
* CORS
* dotenv

## Database

* PostgreSQL
* Neon (cloud database)
* Local PostgreSQL (development)
* Managed with DBeaver

---

# Prerequisites (Required Software)

Install these before running the project:

| Software   | Recommended Version |
| ---------- | ------------------- |
| Node.js    | 20.x or 22.x        |
| npm        | 10+                 |
| PostgreSQL | 14+                 |
| Git        | Latest              |
| DBeaver    | Latest (optional)   |
| Docker     | Optional            |

Check installed versions:

```bash
node -v
npm -v
psql --version
git --version
```

---

# Project Structure

```
App
 ├── Frontend
 │    ├── src
 │    ├── package.json
 │    └── ...
 │
 ├── Backend
 │    ├── src
 │    ├── package.json
 │    └── ...
 │
 └── README.md
```

---

# Environment Variables

## Backend `.env`

Create file:

```
Backend/.env
```

## Frontend `.env.local`

Create file:

```
Frontend/.env.local
```

Example:

```
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

If backend is deployed, change API base to deployed URL.

---

# Database Setup

## Create Database

```sql
CREATE DATABASE server_inventory;
```

## Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Server Inventory Table

Use your exported schema from DBeaver for the `server_inventory` table.

---

# Install Dependencies

## Frontend

```bash
cd Frontend
npm install
```

## Backend

```bash
cd Backend
npm install
```

---

# Running the Application (Local Development)

## Start Backend

```bash
cd Backend
npm run dev
```

Backend runs on:

```
http://localhost:4000
```

## Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# Authentication & Roles

The system uses JWT authentication.

## Roles

| Role   | Permissions          |
| ------ | -------------------- |
| Admin  | Full CRUD, Add Users |
| Viewer | Read Only            |

## Login Flow

```
Login → Backend verifies → JWT returned → Stored in localStorage → Used for API requests
```

---

# Main Features

## Server Management

* Add server
* Edit server
* Delete server
* View server details
* Decommission tracking
* Ownership information
* Operational fields

## Table Features

* Pagination
* Page size selector
* Sorting
* Search
* Filters
* Column visibility
* Virtualized table (large datasets)
* CSV export

## User Management

* Admin can create users
* Roles: admin / viewer
* Password hashed using bcrypt
* RBAC enforced on backend

## Server Details Modal

* Full server information
* Edit mode
* Delete

---

# API Endpoints

## Auth

```
POST /api/auth/login
```

## Servers

```
GET    /api/servers
GET    /api/servers/:id
POST   /api/servers
PUT    /api/servers/:id
DELETE /api/servers/:id
```

## Export

```
GET /api/servers/export
GET /api/servers/export-columns
```

## Users

```
POST /api/users
```

(Admin only)

---

# Deployment

| Component | Platform        |
| --------- | --------------- |
| Frontend  | Vercel          |
| Backend   | Render          |
| Database  | Neon PostgreSQL |

Environment variables must be configured on:

* Vercel
* Render

---

# Development Workflow

Recommended startup order:

```
1. Start PostgreSQL
2. Start Backend
3. Start Frontend
4. Login
5. Use application
```

System dependency order:

```
Database → Backend → Frontend
```

---

# Setup on New Machine (Quick Guide)

```
git clone <repository>
cd App

# Backend
cd Backend
npm install
create .env
npm run dev

# Frontend
cd ../Frontend
npm install
create .env.local
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Future Improvements

Planned or recommended future features:

* User management page
* Reset password
* Change user role
* Audit log (who edited server)
* Activity history
* Docker deployment

---

# Author
Teerapat Charoensangsuwan
Master Server Inventory System
Internal Full-Stack Project
Built with Next.js + Node.js + PostgreSQL

---

