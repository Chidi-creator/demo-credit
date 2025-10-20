# Demo Credit - Wallet Application

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

A secure and scalable banking/wallet application that provides credit services, user management, and transaction processing. This repository contains the backend services (TypeScript + Node.js) and tests.


## 🗺 ER Diagram

![ER Diagram](./docs/er-diagram.png)

[📄 View ER Diagram (PDF)](https://github.com/Chidi-creator/demo-credit/blob/main/docs/er-diagram.pdf)




##  API Documentation

## API Base URL

```http
http://localhost:3078
```

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "******"
}
```

### Users


```http
GET /users/all
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Updated",
  "last_name": "Name",
  "email": "updated@example.com"
}
```

### Accounts

#### Create Bank Account
```http
POST /accounts/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "account_number": "0123456789",
  "bank_code": "057"
}
```

### Wallet

#### Transfer Funds
```http
POST /wallet/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000.00,
  "recipient_account": "0987654321",
  "bank_code": "057",
  "narration": "Transfer to savings"
}
```

#### Withdraw Funds
```http
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00,
  "account_number": "0123456789",
  "bank_code": "057"
}
```

### Transactions

#### Flutterwave Deposit Webhook
```http
POST /transactions/webhook/flutterwave/deposit
Content-Type: application/json

{
  // Flutterwave webhook payload

}
```

## 🛠 Tech Stack

- **Backend**: Node.js with TypeScript
- **Database**: MySQL with Knex.js ORM
- **Authentication**: JWT, Passport.js
- **Testing**: Jest
- **Logging**: Winston
- **Email**: Nodemailer
- **Caching**: Redis

## 📦 Prerequisites

- Node.js (v16+)
- MySQL (v8.0+)
- Redis (v6+)
- npm or yarn


## How to run

### Prerequisites
- Node.js (v16+)
- MySQL
- Redis
- npm

### 1) Install dependencies
```bash
npm install
```

### 2) Create env file
Copy `.env.example` (if present) or create `.env` in project root with at least the following variables:

```env
# filepath: .env (example)
PORT=3078
NODE_ENV=development

# App
APP_NAME=demo-credit



# Database (MySQL)
DB_CLIENT=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_DATABASE=demo_credit

# Knex / migrations
KNEX_MIGRATIONS_DIR=src/db/migrations
KNEX_SEEDS_DIR=src/db/seeds

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_secret

# Email (nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=no-reply@example.com

# Flutterwave / Payments
FLW_SECRET=your_flutterwave_secret
FLW_PUBLIC_KEY=your_flutterwave_public_key
FLW_BASE_URL=https://api.flutterwave.com

# Other
LOG_LEVEL=debug
```

### 3) Database migrations & seeds
Run migrations:
```bash
npm run migrate:latest
```
Rollback:
```bash
npm run migrate:rollback
```
Seed (example banks seed):
```bash
npm run seed:banks
```

### 4) Run in development
The project uses `nodemon` for local dev (script `start`).
```bash
# start dev server (auto-reloads)
npm run start
```
If you prefer to run TypeScript directly:
```bash
npx ts-node -r tsconfig-paths/register src/index.ts
```



## Tests
Run tests:
```bash
npm run test
```
Watch mode:
```bash
npm run test:watch
```
Coverage:
```bash
npm run test:coverage
```
If you need console logs during tests (Jest suppresses in some setups):
```bash
npm run test -- --silent=false
```
Unit tests are in `src/__tests__`. Mocks are used for external dependencies (DB, providers).


## API reference (selected endpoints)

Base URL (local): `http://localhost:3078`

Authentication
- POST /auth/login — login with email + OTP
  - Request: { email, otp }

Users
- GET /users/all — list users (auth required)
- GET /users/:id — get user
- PUT /users/:id — update user

Wallets
- POST /wallet/transfer — internal transfer
  - Body: { amount, account_number (recipient), currency, description? }
- POST /wallet/withdraw — withdraw to bank account
  - Body: { amount, account_number, account_bank, currency, narration? }

Transactions
- POST /transactions/webhook/flutterwave/deposit — Flutterwave deposit webhook

Example curl: Login (replace with actual route if different)
```bash
curl -X POST http://localhost:3078/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

Example curl: Transfer
```bash
curl -X POST http://localhost:3078/wallet/transfer \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "account_number": "0987654321",
    "currency": "NGN",
    "description": "transfer"
  }'
```

Example webhook (simulate Flutterwave)
```bash
curl -X POST http://localhost:3078/transactions/webhook/flutterwave/deposit \
  -H "Content-Type: application/json" \
  -d '{ "event":"charge.completed","data":{"customer":{"email":"user@example.com"},"amount":1000,"status":"successful"} }'
```


## Logging & Observability
- Winston logger writes to `logs/combined.log` and `logs/error.log`. Console level is `debug` in non-production.
- Use `logger.info`, `logger.error` with metadata in services.
- For tracing in production consider adding request IDs and centralized logging (ELK / Loki).


## Folder structure (high level)
```
src/
├── __tests__/
├── config/
├── db/
│   ├── migrations/
│   └── seeds/
├── delivery/ (or routes/controllers)
├── handlers/
├── managers/
├── middleware/
├── models/
├── providers/
├── repositories/
├── services/
├── usecases/
├── validation/
└── index.ts (or app bootstrap)
```


## Common issues & troubleshooting
- DB connection refused: verify DB env vars + MySQL running and user has privileges.
- Migrations failing: confirm knexfile points to the right env and DB exists.
- Missing logs during tests: run jest with `--silent=false` or adjust logger to log to console during test env.
- CI: ensure migrations run before tests and that a test DB is available.


## Security & best practices
- Never commit `.env` or secrets. Use CI secret storage or environment config.
- Rotate JWT and provider keys regularly.
- Validate/sanitize all external input (already using Joi for validation).
- Use database transactions for multi-step financial ops (already used in internal transfer flow).


## Contributing & CI
- Create feature branch, add tests, run `npm run test`, open PR.
- Recommended CI steps: install, migrate, run unit tests, run lint (if enabled), run coverage thresholds.


## Final notes
- This README provides operational and developer guidance; keep it updated as project evolves.
- For further details consult inline docs and source code in `src/`.




