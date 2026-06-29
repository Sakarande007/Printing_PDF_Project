# Printy5 — Industrial Label Generator

> **Production-ready web app for generating print-accurate shipping and compliance labels** — built for manufacturing and logistics teams who need consistent, barcode-ready PDFs in seconds.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-printy5.in-2563eb?style=for-the-badge)](https://www.printy5.in/login)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20MySQL-0f172a?style=for-the-badge)](.)
[![Client](https://img.shields.io/badge/Delivered%20to-US%20Client-16a34a?style=for-the-badge)](.)

---

## Overview

**Printy5** is a full-stack label generation platform delivered to a **US-based client** for warehouse and shipping operations. Operators log in, pick a label template, fill in order details (or select from a managed vendor/part catalog), and download a **print-ready PDF** — complete with barcodes, country-of-origin fields, and multi-label pagination.

**Live application:** [https://www.printy5.in/login](https://www.printy5.in/login)

---

## Label types

| Template | Use case | Sample output |
|----------|----------|---------------|
| **PACCAR label** | Part-level shipping labels with barcodes, PO, supplier code, serial, and country of origin | [`label.pdf`](label.pdf) |
| **Ship-to label** | Destination address blocks for pallets and cartons | [`label (1).pdf`](label%20(1).pdf) |
| **Packing slip enclosed** | Simple “packing slip enclosed” notice | — |
| **Mixed load label** | Mixed-load shipment identification | — |
| **Individual label** | Per-unit labels with multilingual descriptions (EN / FR / ES) and date codes | — |

### PACCAR label (excerpt)

```
PART NO (P)     MT-445566          QTY (Q)     5100
DESCRIPTION     Drive Shaft Assembly    PO (K)  DKJNE293
SUPPLIER (V)    98765ZX            SERIAL (S)  10001
1 OF 2          COUNTRY OF ORIGIN    MADE IN Canada
```

### Ship-to label (excerpt)

```
SHIP TO:
Digital Barcode
Raviwar Peth
Pune 413322
India
Pallet 1 of 1
```

---

## Features

- **5 label templates** — PACCAR, ship-to, packing slip, mixed load, and individual unit labels
- **Barcode generation** — Code 128 barcodes rendered server-side with `bwip-js`
- **Vendor & part catalog** — Admin-managed database with autocomplete for ship-to addresses
- **Country of origin** — Per-part origin stored in admin; auto-formatted on PACCAR labels
- **Multi-label PDFs** — Automatic pagination (e.g. `1 OF 2`, `2 OF 2`) based on quantity and box capacity
- **Multilingual individual labels** — English, French, and Spanish descriptions with date-code formatting (`SDDMMYYYY`)
- **Role-based access** — JWT authentication with `admin` and `user` roles
- **Admin dashboard** — Manage vendors, parts, and users without touching the database
- **Dark / light theme** — Built-in theme toggle for comfortable warehouse use

---

## Tech stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 7, React Router, Axios |
| **Backend** | Node.js, Express 5, PDFKit, bwip-js |
| **Database** | MySQL 8 |
| **Auth** | JWT + bcrypt |
| **PDF** | Server-side generation (no client-side print libs) |

---

## Application flows

### End-to-end user journey

```mermaid
flowchart TD
  A([Open Printy5]) --> B{Logged in?}
  B -->|No| C[Login page]
  C --> D[POST /auth/login]
  D --> E{Valid credentials?}
  E -->|No| C
  E -->|Yes| F[Store JWT]
  B -->|Yes| F
  F --> G[Label Generator]
  G --> H[Select template]
  H --> I[Fill fields / pick vendor & part]
  I --> J[Generate PDF]
  J --> K[POST /generate]
  K --> L{Success?}
  L -->|No| M[Show error message]
  M --> I
  L -->|Yes| N[Download label.pdf]
  N --> O([Print label])
```

### Label generation by template

```mermaid
flowchart TD
  START([User clicks Generate PDF]) --> T{Template?}

  T -->|PACCAR| P1[Select vendor & part]
  P1 --> P2[Enter total items, per-box qty, PO]
  P2 --> P3[Load country of origin from DB]
  P3 --> GEN

  T -->|Ship-to| S1[Type company name]
  S1 --> S2[Autocomplete vendor address]
  S2 --> S3[Enter pallet count]
  S3 --> GEN

  T -->|Individual| I1[Select vendor & part]
  I1 --> I2[Pick date code & quantity]
  I2 --> I3[One label per unit]
  I3 --> GEN

  T -->|Packing slip / Mixed load| GEN[Server picks template module]

  GEN --> PDF[PDFKit draws layout]
  PDF --> BC[bwip-js renders barcodes]
  BC --> OUT([PDF blob → browser download])
```

### Authentication & roles

```mermaid
flowchart LR
  subgraph Public
    LOGIN[Login]
  end

  subgraph Authenticated
  USER[User role]
  ADMIN[Admin role]
  end

  LOGIN -->|JWT issued| USER
  LOGIN -->|JWT issued| ADMIN

  USER --> LG[Label Generator]
  USER --> GEN[Generate PDFs]

  ADMIN --> LG
  ADMIN --> GEN
  ADMIN --> ADM[Admin Dashboard]
  ADM --> V[Manage vendors]
  ADM --> PT[Manage parts]
  ADM --> U[Manage users]
```

### Admin data flow

```mermaid
flowchart TD
  ADM([Admin Dashboard]) --> VEND[Vendor CRUD]
  ADM --> PART[Part CRUD]
  ADM --> USER[User CRUD]

  VEND --> DB1[(vendors table)]
  PART --> DB2[(parts table)]
  USER --> DB3[(users table)]

  DB1 --> SHIP[Ship-to autocomplete]
  DB1 --> PACC[PACCAR / Individual vendor lists]
  DB2 --> PACC
  DB2 --> ORIGIN[Country of origin on labels]

  SHIP --> GEN[Label Generator]
  PACC --> GEN
  ORIGIN --> GEN
```

---

## Architecture

```mermaid
flowchart LR
  subgraph Client
    UI[React SPA]
  end
  subgraph Server
    API[Express API]
    PDF[PDF Templates]
    BC[Barcode Engine]
  end
  DB[(MySQL)]

  UI -->|JWT| API
  API --> DB
  API --> PDF
  PDF --> BC
  API -->|PDF blob| UI
```

### Request lifecycle (PDF generation)

```mermaid
sequenceDiagram
  actor User
  participant UI as React Frontend
  participant API as Express API
  participant DB as MySQL
  participant PDF as PDF Template

  User->>UI: Fill form & click Generate
  UI->>API: POST /generate + JWT
  API->>API: Verify token
  alt PACCAR or Individual
    API->>DB: Fetch part & vendor
    DB-->>API: Part metadata
  end
  API->>PDF: Render template
  PDF->>PDF: Draw text, barcodes, pagination
  PDF-->>API: PDF stream
  API-->>UI: application/pdf blob
  UI-->>User: Auto-download label.pdf
```

```
printing-project/
├── label-generator-frontend/   # React + Vite SPA
│   └── src/
│       ├── pages/              # Login, LabelGenerator, AdminDashboard
│       ├── context/            # Auth state
│       └── api/                # Axios client
├── label-generator-backend/    # Express API + PDF engine
│   ├── routes/                 # auth, admin, vendors, parts, generate
│   ├── templates/              # One module per label type
│   └── sql/                    # Schema & seed data
├── label.pdf                   # Sample PACCAR output
└── label (1).pdf               # Sample ship-to output
```

---

## Getting started

### Prerequisites

- **Node.js** 18+
- **MySQL** 8+

### 1. Database

Create a MySQL database and import the schema (optional — the server also bootstraps tables on startup):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS label_generator;"
mysql -u root -p label_generator < label-generator-backend/sql/label_generator.sql
```

### 2. Backend

```bash
cd label-generator-backend
npm install
```

Create `label-generator-backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=label_generator
JWT_SECRET=your_long_random_secret

# Optional — default users are seeded on first run if the users table is empty
ADMIN_INITIAL_PASSWORD=change_me
USER_INITIAL_PASSWORD=change_me
```

```bash
npm start
```

The API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd label-generator-frontend
npm install
```

Create `label-generator-frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open `http://localhost:5173` and sign in. On first startup, default `admin` and `user` accounts are created if no users exist — set passwords via `.env` before the first run in production.

### 4. Production build

```bash
cd label-generator-frontend
npm run build
```

Serve the `dist/` folder behind your web server and point `VITE_API_URL` at your deployed API.

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Obtain JWT |
| `GET` | `/vendors` | List vendors |
| `GET` | `/vendors/search?q=` | Ship-to autocomplete |
| `GET` | `/parts/:vendorId` | Parts for a vendor |
| `POST` | `/generate` | Generate label PDF (body includes `template` and fields) |
| `GET/POST/PUT/DELETE` | `/admin/*` | Vendors, parts, users (admin only) |

---

## Deployment

This project is **live in production** for a US-based logistics client:

| | |
|---|---|
| **URL** | [https://www.printy5.in/login](https://www.printy5.in/login) |
| **Frontend** | Static React build (Vite) |
| **Backend** | Node.js Express API |
| **Database** | MySQL |

---

## Author

**Sanket Karande**  
[sakarande007@gmail.com](mailto:sakarande007@gmail.com)

---

## License

This repository is provided as a portfolio / reference implementation. Contact the author for licensing or commercial use.
