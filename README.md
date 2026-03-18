# Master Server Inventory System

An enterprise-style **Server Inventory Dashboard** designed to manage and monitor server infrastructure across environments.

This system allows IT teams to:

- View server inventory
- Search and filter servers
- Track lifecycle status
- Export filtered datasets
- View detailed server information
- Manage server metadata

The application is designed to behave similarly to internal enterprise tools such as:

- ServiceNow asset inventory
- VMware infrastructure dashboards
- Internal IT asset management systems

---

# System Architecture
Frontend (Next.js)
↓
Backend API (Node.js / Express)
↓
PostgreSQL Database


---

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- TanStack Virtual (table virtualization)

## Backend

- Node.js
- Express.js
- REST API

## Database

- PostgreSQL

---

# Core Features

### Server Dashboard

- server list table
- pagination
- virtualization for large datasets
- column customization
- colored environment badges
- colored lifecycle status
- power state indicator

### Search

Global search across:

- server_name
- ip_address
- application_name
- server_owner

---

### Filtering

Supported filters:

- location
- environment
- status
- power state
- critical application

Search filters:

- Server Name
- IP address
- Application Name
- Owner

Date filters:

- create date
- decommission date
- terminated date

---

### Export

The system supports:

- exporting filtered data
- selecting export columns
- exporting CSV format

---

### Server Detail

Each server row can open a modal showing:

- full server metadata
- lifecycle information
- calculated metrics

---

# Data Size

The system is tested with: 2000+ servers records

Table performance remains stable due to virtualization.

---

# Future Improvements

Potential upgrades include:

- authentication system
- role-based access control
- database index optimization
- advanced filter builder
- audit logging

---

# Author

Developer: Teerapat Charoensangsuwan
Server Inventory System Project

# Deployment Guide

This guide explains how to deploy and run the Master Server Inventory System.

---

# 1. Prerequisites

Install the following:

- Node.js 18+
- npm
- PostgreSQL
- Git

Optional tools:

- DBeaver (database GUI to help adjusting Database)

---

# 2. Clone the Repository
git clone <repo-url>
cd <project-folder>


---

# 3. Database Setup

Create a PostgreSQL database.

Example:

CREATE DATABASE server_inventory_db;


Create table:

CREATE TABLE server_inventory (
    id SERIAL PRIMARY KEY,

    server_name TEXT,
    ip_address TEXT,
    dns_name TEXT,
    power_state TEXT,
    create_date TEXT,
    location TEXT,
    zone_lv TEXT,
    application_name TEXT,
    system_environment TEXT,
    function TEXT,
    status TEXT,
    decommission_date TEXT,
    decom_duration_days TEXT,
    need_terminate_process TEXT,
    terminated_date TEXT,
    os TEXT,
    os_version TEXT,
    service_pack TEXT,
    cpu TEXT,
    memory TEXT,
    disk TEXT,
    update_patch_project TEXT,
    veritas_backup TEXT,
    test_dr TEXT,
    critical_app TEXT,
    pttep_server_owner TEXT,
    pttep_application_owner TEXT,
    application_support_department TEXT,
    application_support_name TEXT,
    application_support_email TEXT,
    server_focal_point TEXT,
    request_channel_for_pttep TEXT,
    ticket_id_request_for_ptt_digital TEXT,
    remark TEXT,
    application_support_email_1 TEXT
);


Additional columns can be added depending on the dataset.

---

# 4. Import CSV Data

Using DBeaver:

1. Right click `server_inventory`
2. Import Data
3. Choose CSV
4. Map fields
5. Run import

---

# 5. Backend Setup

Navigate to backend folder.

cd backend
npm install


Create `.env` file:

.env Example 
--------------------------
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/server_inventory_db
--------------------------


Start server: npm run dev


Backend will run at: http://localhost:4000


---

# 6. Frontend Setup

Navigate to frontend folder.
--------------------------
cd frontend
npm install
--------------------------

Create `.env.local`
--------------------------
NEXT_PUBLIC_API_BASE=http://localhost:4000
--------------------------


Start frontend: npm run dev

Frontend runs at: http://localhost:3000


---

# 7. Running the System

Start services in this order:

1. PostgreSQL
2. Backend API
3. Frontend

Then open: http://localhost:3000







