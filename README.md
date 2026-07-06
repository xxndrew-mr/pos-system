# Maelika Butik POS System

Maelika Butik POS System is a production-ready point-of-sale application built for boutique retail operations.

The system helps manage daily cashier workflows, product inventory, transaction processing, payment tracking, expense recording, barcode/QR support, and printable receipt generation through a centralized web-based application.

## Live Production

Production site:

https://kasir-maelikabutik.vercel.app/

> Note: This application is intended for authorized business users. Some features may require login access.

## Overview

This project was developed to support retail business operations by replacing manual transaction recording with a structured digital POS system.

The application focuses on practical business workflows such as product management, stock tracking, sales transactions, payment handling, invoice generation, and operational expense monitoring.

A single Next.js (App Router) application serves both:

- **Cashier interface** at `/pos` — barcode scanning, cart, checkout, and receipt printing.
- **Admin dashboard** at `/dashboard` — products, reports, expenses, debts, and settings.

## Key Features

- User authentication
- Role-based access for Admin and Cashier
- Product management
- Inventory and stock tracking
- Barcode support (with auto-generated barcodes)
- QR code support
- Transaction processing with automatic stock deduction
- Invoice number generation
- Multiple payment methods (Cash, QRIS, Transfer, DP / down payment)
- Cash received and change calculation
- Customer name recording
- Payment proof upload
- Debt / partial payment (DP) tracking and repayment
- Transaction item-level history
- Expense management by category
- Profit & loss reports by date range
- Printable receipt / invoice and barcode labels
- Responsive web interface (Indonesian UI)

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React

### Backend

- Next.js Route Handlers (server-side API)
- NextAuth (Credentials provider, JWT sessions)
- Prisma ORM
- bcryptjs

### Database

- PostgreSQL
- Prisma Client

### Features & Libraries

- react-barcode
- react-qr-code
- react-to-print

### Deployment & Tooling

- Vercel
- Docker Compose (local PostgreSQL)
- ESLint
- npm

## Core Modules

### Authentication & Authorization

Login-based authentication with role-based access control for **Admin** and **Cashier** users. Route protection is enforced in `middleware.ts`: `/dashboard/*` is Admin-only, while `/pos/*` is available to any authenticated user.

### Product & Inventory Management

Products are managed with barcode, product name, selling price, cost price, and stock quantity. Barcodes can be auto-generated when left blank, and printable barcode labels are supported. Stock is automatically decremented on each sale.

### Transaction Management

Transactions include invoice number, total amount, payment method, cash received, change amount, payment proof, platform, customer name, payment status, and debt amount. Partial payments (DP) and insufficient cash are recorded as debt and can be repaid later.

### Transaction Items

Each transaction stores detailed item-level records, including product reference, quantity, and a snapshot of the selling price and cost price at the time of transaction — so historical reports remain accurate even if product prices change later.

### Expense Management

Operational expense recording with amount, category, description, and transaction date.

### Reports

Date-range reports summarizing revenue (omset), cost of goods (modal), gross profit, expenses, and net profit, with a per-day breakdown.

### Receipt & Print Support

Printable transaction receipts and barcode labels for cashier and business operation needs.

## Database Design

The database is designed around the following core entities:

- `User`
- `Product`
- `Transaction`
- `TransactionItem`
- `Expense`

The schema supports product inventory, transaction history, item-level transaction records, user roles, payment tracking, and expense management. All monetary values are stored as **integer Rupiah** (no decimals). See [`prisma/schema.prisma`](prisma/schema.prisma) for the full definition.

## Architecture Highlights

- Full-stack POS application using Next.js App Router
- PostgreSQL relational database with Prisma ORM
- Authentication using NextAuth (JWT strategy)
- Secure password hashing using bcryptjs
- Role-based access for Admin and Cashier users
- Barcode and QR code support for retail operations
- Printable receipt and invoice workflow
- Production deployment on Vercel
- Docker Compose support for local development

## Project Structure

```
app/
  page.tsx                 # Login page ("/")
  pos/                     # Cashier POS + receipt printing
  dashboard/               # Admin: products, reports, expenses, debts, settings
  api/                     # Route handlers (products, transactions, expenses, reports, upload, auth)
lib/
  auth.ts                  # NextAuth configuration
  prisma.ts                # Prisma client singleton
middleware.ts              # Route protection / role-based redirects
prisma/
  schema.prisma            # Data models
  seed.ts                  # Seeds default admin + cashier accounts
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (18+ recommended)
- npm
- PostgreSQL (or Docker, to use the provided `docker-compose.yml`)

### Installation

Clone the repository:

```bash
git clone https://github.com/xxndrew-mr/pos-system.git
cd pos-system
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
NEXTAUTH_SECRET="replace-with-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

> Generate a secret with, e.g., `openssl rand -base64 32`. Never commit `.env.local` — it is git-ignored.

### Database Setup

Start a local PostgreSQL instance (optional, using Docker):

```bash
docker compose up -d
```

Apply the schema and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Seed the default accounts:

```bash
npx prisma db seed
```

This creates:

| Role    | Username | Password   |
| ------- | -------- | ---------- |
| Admin   | `admin`  | `admin123` |
| Cashier | `kasir`  | `kasir123` |

> Change these credentials before deploying to production.

### Run the App

```bash
npm run dev
```

The app runs at http://localhost:3000. Log in, then:

- Admins land on the dashboard (`/dashboard`).
- Cashiers use the POS screen (`/pos`).

### Build for Production

```bash
npm run build
npm run start
```

`npm run build` runs `prisma generate` before building.

## Scripts

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the development server                 |
| `npm run build` | Generate Prisma client and build for prod    |
| `npm run start` | Start the production server                  |
| `npm run lint`  | Run ESLint                                   |

## Author

**Andre Marshandito**
Software Engineer

- GitHub: [@xxndrew-mr](https://github.com/xxndrew-mr)
- LinkedIn: [andre-marshandito](https://www.linkedin.com/in/andre-marshandito)
