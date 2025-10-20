# Demo Credit - Banking Application

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

A secure and scalable banking application that provides credit services, user management, and transaction processing.

A secure and scalable banking application that provides credit services, user management, and transaction processing.

##  Database Schema (ER Diagram)

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : has
    USERS ||--o{ WALLETS : has
    bankS ||--o{ ACCOUNTS : contains
    WALLETS ||--o{ TRANSACTIONS : has
    
    USERS {
        int id PK
        string email "UK"
        string first_name
        string last_name
        string user_bvn "UK, nullable"
        string phone_number "UK, nullable"
        boolean is_verified
        boolean is_blacklisted
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }
    
    bankS {
        int id PK
        string bank_name
        string bank_code "UK"
        timestamp created_at
        timestamp updated_at
    }
    
    ACCOUNTS {
        int id PK
        int user_id FK
        int bank_id FK
        string account_number "UK"
        string account_name
        string bank_code "UK"
        string bank_name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }
    
    WALLETS {
        int id PK
        int user_id FK
        string account_number "UK"
        string bank_name
        string bank_code
        string currency
        string flutterwave_account_ref "UK"
        decimal(15,2) balance
        enum status "active|inactive|suspended"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }
    
    TRANSACTIONS {
        int id PK
        int wallet_id FK
        enum type "fund|withdraw|transfer|reversal"
        string reference "UK"
        decimal(15,2) amount
        string currency
        enum direction "credit|debit"
        enum status "pending|completed|failed"
        string description "nullable"
        json metadata "nullable"
        string external_reference "nullable"
        timestamp created_at
        timestamp updated_at
    }
```

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
  "password": "securePassword123"
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
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Winston
- **Email**: Nodemailer
- **Caching**: Redis

## 📦 Prerequisites

- Node.js (v16+)
- MySQL (v8.0+)
- Redis (v6+)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd demo-credit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   ```bash
   npx knex migrate:latest
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

6. Testing:
   ```bash
   npm run test
   ```

test coverage:
   ```bash
   npm run test:coverage
   ```

   Project structure:
   src/
├── __tests__/         # Test files
├── config/           # Configuration files
├── db/               # Database migrations and seeds
├── deliverymen/      # API route handlers
├── handlers/         # Request handlers
├── managers/         # Business logic
├── middleware/       # Express middleware
├── models/           # Database models
├── providers/        # Third-party service integrations
├── repositories/     # Data access layer
├── services/         # Business services
├── usecases/         # Application use cases
└── validation/       # Request validation schemas

graph TD
    A[Client] -->|HTTP Request| B[API Gateway]
    B --> C[Authentication Middleware]
    C --> D[Request Validation]
    D --> E[Handler]
    E --> F[Service Layer]
    F --> G[Repository Layer]
    G --> H[Database]
    H -->|Response| G
    G --> F
    F --> E
    E --> D
    D --> B
    B -->|HTTP Response| A