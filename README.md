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

## Key Features

- User authentication
- Role-based access for Admin and Cashier
- Product management
- Inventory and stock tracking
- Barcode support
- QR code support
- Transaction processing
- Invoice number generation
- Multiple payment methods
- Cash received and change calculation
- Customer name recording
- Payment proof support
- Debt / unpaid amount tracking
- Transaction item history
- Expense management
- Printable receipt / invoice support
- Responsive web interface

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- Next.js server-side logic
- NextAuth
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
- Docker Compose
- ESLint
- npm

## Core Modules

### Authentication & Authorization

The system includes login-based authentication and role-based access control for Admin and Cashier users.

### Product & Inventory Management

Products can be managed with barcode, product name, selling price, cost price, and stock quantity. Inventory data is used to support transaction workflows and business visibility.

### Transaction Management

Transactions include invoice number, total amount, payment method, cash received, change amount, payment proof, platform, customer name, payment status, and debt amount.

### Transaction Items

Each transaction stores detailed item-level records, including product reference, quantity, selling price at the time of transaction, and cost price at the time of transaction.

### Expense Management

The system supports operational expense recording with amount, category, description, and transaction date.

### Receipt & Print Support

The application supports printable transaction output for cashier and business operation needs.

## Database Design

The database is designed around the following core entities:

- `User`
- `Product`
- `Transaction`
- `TransactionItem`
- `Expense`

The schema supports product inventory, transaction history, item-level transaction records, user roles, payment tracking, and expense management.

## Architecture Highlights

- Full-stack POS application using Next.js
- PostgreSQL relational database with Prisma ORM
- Authentication using NextAuth
- Secure password hashing using bcryptjs
- Role-based access for Admin and Cashier users
- Barcode and QR code support for retail operations
- Printable receipt and invoice workflow
- Production deployment on Vercel
- Docker Compose support for local development

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL

## Author

**Andre Marshandito**  
Software Engineer  

GitHub: [@xxndrew-mr](https://github.com/xxndrew-mr)  
LinkedIn: [andre-marshandito](https://www.linkedin.com/in/andre-marshandito)

### Installation

Clone the repository:

```bash
git clone https://github.com/xxndrew-mr/pos-system.git
cd pos-system

