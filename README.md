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




