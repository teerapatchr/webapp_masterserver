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




