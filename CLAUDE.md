# CLAUDE.md

Guidance for AI coding agents (and humans) working in this repository.

## What this is

**Maelika Butik POS System** (a.k.a. *Kasir Maelika Butik*) — a web-based point-of-sale app for a boutique / hijab store. Single Next.js App Router application that serves both the cashier UI (`/pos`) and the admin dashboard (`/dashboard`), backed by PostgreSQL via Prisma.

Live: https://kasir-maelikabutik.vercel.app/ (deployed on Vercel).

The codebase, UI copy, and code comments are primarily in **Indonesian**. Keep new user-facing strings and comments in Indonesian to match.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # runs `prisma generate` then `next build`
npm run start    # start production server (after build)
npm run lint     # eslint

npx prisma migrate dev       # apply/create migrations in dev
npx prisma generate          # regenerate Prisma client
npx prisma db seed           # seed admin + kasir users (prisma/seed.ts)
npx prisma studio            # inspect the database
```

There is no test suite. Verify changes by running `npm run dev` and exercising the flow, plus `npm run lint`.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`, config in `postcss.config.mjs`; no `tailwind.config` file)
- **NextAuth v4** — Credentials provider, JWT session strategy
- **Prisma 5** ORM + **PostgreSQL**
- **bcryptjs** for password hashing
- Icons: **lucide-react**; barcodes/QR: **react-barcode**, **react-qr-code**; printing: **react-to-print**
- Class utils: **clsx**, **tailwind-merge**

## Project layout

```
app/
  page.tsx                 # Login page (route "/") — the app's sign-in screen
  layout.tsx               # Root layout, wraps children in NextAuthProvider
  providers.tsx            # SessionProvider client wrapper
  pos/
    page.tsx               # Cashier POS screen (scan, cart, checkout)
    print/[id]/page.tsx    # Printable receipt for a transaction
  dashboard/
    layout.tsx             # Admin sidebar shell (ADMIN only)
    page.tsx               # Dashboard home
    products/page.tsx      # Product & inventory CRUD
    products/print-label/[id]/page.tsx  # Printable barcode label
    reports/page.tsx       # Profit/loss reports by date range
    expenses/page.tsx      # Operational expense management
    debts/page.tsx         # Outstanding debt / DP (down payment) tracking
    settings/page.tsx      # Change password, etc.
  api/                     # Route handlers (see "API" below)
lib/
  auth.ts                  # NextAuth authOptions
  prisma.ts                # PrismaClient singleton
middleware.ts              # Route protection / RBAC redirects
prisma/
  schema.prisma            # Data models
  seed.ts                  # Seeds admin + kasir accounts
types/next-auth.d.ts       # Augments Session/User with `role` and `id`
```

Path alias: `@/*` maps to the project root (see `tsconfig.json`), e.g. `import { prisma } from "@/lib/prisma"`.

## Auth & access control

- **Roles:** `ADMIN` and `CASHIER` (Prisma `Role` enum).
- **Login:** credentials (username + password) at `/`. On success the login page redirects to `/dashboard/products`.
- **Session:** JWT strategy. `role` and `id` are copied onto the token in the `jwt` callback and onto `session.user` in the `session` callback (`lib/auth.ts`). The extra fields are typed in `types/next-auth.d.ts`.
- **Middleware** (`middleware.ts`, matches `/dashboard/:path*` and `/pos/:path*`):
  - `/dashboard/*` → **ADMIN only**; non-admins are redirected to `/pos`.
  - `/pos/*` → any authenticated user.
  - Unauthenticated users are redirected to `/`.
- **Server routes are mostly NOT authorization-guarded.** Only `api/users/change-password` checks the session. Product/transaction/expense/report/upload endpoints rely on middleware for page access but do not re-check role server-side — keep this in mind before assuming an endpoint is protected, and add `getServerSession(authOptions)` checks when adding sensitive endpoints.

## Data model (prisma/schema.prisma)

- **User** — `username` (unique), `password` (bcrypt hash), `role`.
- **Product** — `barcode` (unique), `name`, `price` (sell), `costPrice`, `stock`.
- **Transaction** — `invoiceNo` (unique), `totalAmount`, `paymentMethod`, `cashReceived?`, `changeAmount?`, `paymentProof?`, `platform` (default `"TOKO"`), `customerName?`, `paymentStatus` (default `"PAID"`), `debtAmount` (default 0), `items[]`.
- **TransactionItem** — links a `Transaction` to a `Product`; snapshots `quantity`, `priceAtTime`, `costAtTime` (so historical reports stay correct if a product's price changes later).
- **Expense** — `name`, `amount`, `category` (default `"Umum"`), `description?`, `date`.

## API endpoints (app/api)

- `auth/[...nextauth]` — NextAuth handler.
- `products` — `GET` (all, or one via `?barcode=`), `POST` (create; auto-generates a barcode when blank).
- `products/[id]` — `PUT` (edit), `DELETE`.
- `transactions` — `POST` (create transaction, snapshot items, decrement stock, compute PAID/PARTIAL + debt).
- `transactions/[id]` — `GET` one (with items + product).
- `transactions/[id]/repay` — `POST` (pay down debt on a PARTIAL/DP transaction).
- `expenses` — `GET` (with `?search=`), `POST`, `DELETE` (via `?id=`).
- `expenses/[id]` — per-item expense operations.
- `reports` — `GET` (`?start=&end=`) revenue/COGS/gross+net profit summary and daily breakdown.
- `upload` — `POST` multipart file → saved under `public/uploads`.
- `users/change-password` — `POST` (session-guarded).

## Conventions & gotchas

- **Money is stored as integer Rupiah** (no decimals) throughout — `price`, `costPrice`, `totalAmount`, `amount`, etc. Do the same for new money fields.
- **`paymentMethod` is a plain `String` column**, not the enum. A `PaymentMethod` enum exists in the schema but is intentionally unused so values like `"DP"`, `"GOPAY"`, `"TRANSFER"` can be stored freely. Don't switch the column to the enum without accounting for this.
- **Payment status logic** lives in `api/transactions/route.ts`: `DP`, or `CASH` with insufficient `cashReceived`, → `paymentStatus = "PARTIAL"` and `debtAmount = total - received`. Debt is paid down through the `repay` endpoint.
- **Next.js 15+ dynamic route params are async.** In route handlers and pages the type is `{ params: Promise<{ id: string }> }` and you must `await params`. Existing routes already do this — follow the pattern.
- **Invoice numbers**: `INV-${Date.now()}-${count+1}` (see transactions POST).
- **Auto barcode**: when a product is created without a barcode, one is generated as `"899" + last4(timestamp) + random5` (EAN-13-ish).
- **POS cart uses `item.quantity`**, not `qty` — a past bug. Keep the field name `quantity` consistent between the POS page and the transactions API.
- **Prisma client is a singleton** in `lib/prisma.ts` to avoid exhausting connections during dev hot-reload. Always import `prisma` from there; never `new PrismaClient()` in app code (seed script is the exception).
- **`export const dynamic = "force-dynamic"`** is set on the POS page to avoid a Vercel prerender error from `useSession`. Add it to any new page that reads the session at the top level and fails to build.
- **File uploads write to the local `public/uploads` directory.** This works locally but is **ephemeral on Vercel's serverless filesystem** — uploaded payment proofs will not persist across deployments/instances in production. If reworking uploads, move to object storage (e.g. Vercel Blob / S3).
- Reports/date formatting use the `id-ID` locale.

## Environment

Required variables (put in `.env.local`, which is git-ignored):

```
DATABASE_URL=postgresql://user:password@host:5432/db
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=http://localhost:3000     # your deployed URL in production
```

`docker-compose.yml` provides a local Postgres 15 (`user`/`password`/`pos_db` on port 5432) for development.

**Never commit real secrets.** `.env.local` currently holds live credentials locally; keep it out of git and use placeholders in any docs/examples.

## Default seed accounts

`npx prisma db seed` creates:

- **admin** / `admin123` — role `ADMIN`
- **kasir** / `kasir123` — role `CASHIER`

Change these before any real deployment.
