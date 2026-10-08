# 🏦 PayPulse Lite: Cloud-Native FinTech & DevOps Platform

> **M.Tech Capstone Project** — Full coverage of the 5-Unit Agile DevOps & Full Stack curriculum.

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Minikube-326CE5?logo=kubernetes)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions)
![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C?logo=prometheus)

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript + TailwindCSS + Vite              │   │
│  │  ├── AuthContext (JWT State Management)                   │   │
│  │  ├── LoginPage / RegisterPage                             │   │
│  │  ├── Dashboard (WalletCard + TransferForm)                │   │
│  │  ├── TransactionTable (SQL Ledger View)                   │   │
│  │  ├── AuditLogStream (MongoDB Telemetry View)              │   │
│  │  └── Axios Interceptors (Auto JWT + Auto Logout)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │ REST API (HTTP/JSON)               │
├────────────────────────────┼────────────────────────────────────┤
│                        SERVER LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express 4 + TypeScript + Node.js 20                      │   │
│  │  ├── Helmet (Security Headers)                            │   │
│  │  ├── CORS (Cross-Origin Resource Sharing)                 │   │
│  │  ├── Rate Limiter (3-Tier: Auth/Transfer/General)         │   │
│  │  ├── Zod Validation (Schema-based Input Validation)       │   │
│  │  ├── JWT Authentication (Bearer Token + Role-Based)       │   │
│  │  ├── Global Error Handler (Never Leaks Stack Traces)      │   │
│  │  └── Prometheus Metrics Middleware (Counter + Histogram)   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  CONTROLLERS → SERVICES → MODELS (Clean Architecture)     │   │
│  │  ├── AuthController (Register, Login)                     │   │
│  │  ├── WalletController (Balance, Transactions)             │   │
│  │  ├── TransferService (ACID, Integer Cents, Lock Ordering) │   │
│  │  └── AuditController (Paginated MongoDB Logs)             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                 │                    │
├──────────────────────────┼─────────────────┼────────────────────┤
│                        DATA LAYER                               │
│  ┌────────────────────┐   ┌─────────────────────────────────┐   │
│  │  PostgreSQL 16      │   │  MongoDB 7.0                    │   │
│  │  (Sequelize ORM)    │   │  (Mongoose ODM)                 │   │
│  │  ┌────────────────┐ │   │  ┌───────────────────────────┐  │   │
│  │  │ Users          │ │   │  │ AuditLogs                 │  │   │
│  │  │ Wallets        │ │   │  │ (TTL: 30-day auto-expire) │  │   │
│  │  │ Transactions   │ │   │  │ (Fire-and-Forget Writes)  │  │   │
│  │  │ (ACID Locked)  │ │   │  │ (Graceful Offline Mode)   │  │   │
│  │  └────────────────┘ │   │  └───────────────────────────┘  │   │
│  └────────────────────┘   └─────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     DEVOPS & INFRASTRUCTURE                      │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Docker   │ │ Kubernetes│ │Terraform │ │ GitHub Actions   │   │
│  │  Multi-   │ │ Minikube  │ │ IaC      │ │ CI/CD Pipeline   │   │
│  │  Stage    │ │ Deploy +  │ │ Namespace│ │ Lint → Test →    │   │
│  │  Builds   │ │ Service + │ │ Deploy + │ │ Build → Docker   │   │
│  │  (Alpine) │ │ HPA       │ │ Service  │ │ Image            │   │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Prometheus Metrics: /api/v1/metrics                      │   │
│  │  Health Probes: /health (Liveness + Readiness)            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Syllabus Coverage (Units I – V)

| Unit | Topic | Features Implemented |
|:-----|:------|:--------------------|
| **Unit I** | Agile & Clean Code | Git branching strategy, Clean Architecture (Controllers → Services → Models), SOLID Principles, Custom Error Hierarchy, Jest Unit & API Tests (30+ test cases) |
| **Unit II** | REST API & Security | Express REST API, JWT Authentication (Register/Login), Role-Based Access Control (Admin/Customer), Zod Schema Validation, Helmet Security Headers, 3-Tier Rate Limiting, Global Error Handler |
| **Unit III** | Databases & Frontend | PostgreSQL ACID Transfers with `SELECT FOR UPDATE` locking, Integer-Cents arithmetic (no floating-point errors), MongoDB Audit Stream with 30-day TTL, React 18 SPA with TypeScript, Axios Interceptors (Auto JWT + Auto Logout), Component-based architecture with AuthContext |
| **Unit IV** | DevOps & IaC | Docker Multi-stage builds (Alpine), Docker Compose (4 services), Kubernetes Deployment + Service + HPA, Terraform IaC (Namespace + ConfigMap + Secret + Deployment + Service), GitHub Actions CI/CD (Lint → Test → Build → Docker) |
| **Unit V** | Observability | Prometheus Metrics Endpoint (`/api/v1/metrics`), Custom Counter + Histogram with label normalization, Health Probes (Liveness + Readiness), Structured JSON Logger, MongoDB Telemetry Stream |

---

## 🗂️ Project Structure

```
PayPulse-Lite/
├── backend/                          # Node.js Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── postgres.ts           # Sequelize (PostgreSQL/SQLite) connection
│   │   │   └── mongo.ts              # Mongoose (MongoDB) connection
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Register & Login (bcrypt + JWT)
│   │   │   ├── walletController.ts   # Wallet & Transaction endpoints
│   │   │   └── auditController.ts    # Paginated MongoDB audit logs
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification + requireAdmin
│   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   ├── metrics.ts            # Prometheus instrumentation
│   │   │   ├── rateLimiter.ts        # 3-tier rate limiting
│   │   │   └── validate.ts           # Zod schema validation
│   │   ├── models/
│   │   │   ├── User.ts               # User model (Sequelize)
│   │   │   ├── Wallet.ts             # Wallet model (DECIMAL 12,2)
│   │   │   ├── Transaction.ts        # Transaction ledger
│   │   │   ├── AuditLog.ts           # MongoDB audit schema (TTL)
│   │   │   └── index.ts              # Model associations
│   │   ├── routes/
│   │   │   └── api.ts                # All API route definitions
│   │   ├── services/
│   │   │   └── transferService.ts    # ACID transfer (cents + lock ordering)
│   │   ├── utils/
│   │   │   ├── errors.ts             # Custom error class hierarchy
│   │   │   └── logger.ts             # Structured JSON logger
│   │   └── app.ts                    # Express application entry point
│   ├── tests/
│   │   ├── transfer.test.ts          # Core API integration tests
│   │   ├── auth.test.ts              # Authentication validation tests
│   │   ├── validation.test.ts        # Security & middleware tests
│   │   └── transferService.test.ts   # Transfer arithmetic unit tests
│   ├── Dockerfile                    # Multi-stage Docker build
│   ├── .env.example                  # Environment variable template
│   ├── jest.config.js                # Jest test configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── package.json                  # Dependencies & scripts
│
├── frontend/                         # React 18 Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx     # Login & Register form
│   │   │   └── dashboard/
│   │   │       ├── Dashboard.tsx     # Main dashboard layout
│   │   │       ├── WalletCard.tsx    # Wallet balance display
│   │   │       ├── TransferForm.tsx  # ACID-safe money transfer
│   │   │       ├── TransactionTable.tsx  # SQL ledger view
│   │   │       └── AuditLogStream.tsx    # MongoDB telemetry view
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # JWT auth state management
│   │   ├── services/
│   │   │   └── api.ts                # Axios + interceptors
│   │   ├── types.ts                  # Shared TypeScript interfaces
│   │   ├── App.tsx                   # Root component (auth routing)
│   │   ├── main.tsx                  # React DOM entry point
│   │   └── index.css                 # TailwindCSS directives
│   ├── Dockerfile                    # Multi-stage build (Nginx)
│   ├── tailwind.config.js            # TailwindCSS configuration
│   ├── postcss.config.js             # PostCSS pipeline
│   ├── vite.config.ts                # Vite dev server + proxy
│   ├── tsconfig.json                 # TypeScript configuration
│   └── package.json                  # Dependencies & scripts
│
├── devops/                           # Infrastructure & Deployment
│   ├── docker-compose.yml            # 4-service orchestration
│   ├── k8s/
│   │   └── deployment.yaml           # Secret + ConfigMap + Deploy + Service + HPA
│   └── terraform/
│       └── main.tf                   # Full IaC (Namespace → Deployment → Service)
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions (Lint → Test → Build → Docker)
│
├── .gitignore                        # Comprehensive ignore rules
└── README.md                         # This file
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 20+ & npm
- Docker & Docker Compose
- (Optional) Minikube & kubectl for Kubernetes
- (Optional) Terraform CLI for IaC

### 1. Local Development (Without Docker)
```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev          # Starts on http://localhost:5000

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev          # Starts on http://localhost:3000
```

### 2. Docker Compose (Full Stack)
```bash
cd devops
docker-compose up --build
```
| Service | URL |
|:--------|:----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Prometheus Metrics | http://localhost:5000/api/v1/metrics |
| Health Check | http://localhost:5000/health |

### 3. Kubernetes Deployment (Minikube)
```bash
# Start Minikube
minikube start

# Build image inside Minikube's Docker
eval $(minikube docker-env)
docker build -t paypulse-backend:latest ./backend

# Deploy all resources
kubectl apply -f devops/k8s/deployment.yaml

# Verify
kubectl get pods,svc,hpa
```

### 4. Terraform Deployment
```bash
cd devops/terraform
terraform init
terraform plan
terraform apply -auto-approve
```

### 5. Run Tests
```bash
cd backend
npm test
```

---

## 🔒 API Endpoints

| Method | Endpoint | Auth | Description |
|:-------|:---------|:----:|:------------|
| `POST` | `/api/v1/auth/register` | ❌ | Register new user (\$1,000 bonus) |
| `POST` | `/api/v1/auth/login` | ❌ | Login with email & password |
| `GET` | `/api/v1/wallet` | 🔐 JWT | Get wallet balance & details |
| `POST` | `/api/v1/wallet/transfer` | 🔐 JWT | ACID-safe money transfer |
| `GET` | `/api/v1/wallet/transactions` | 🔐 JWT | Paginated transaction history |
| `GET` | `/api/v1/audit-logs` | 🔐 Admin | Paginated MongoDB audit logs |
| `GET` | `/api/v1/metrics` | ❌ | Prometheus metrics (scraping) |
| `GET` | `/health` | ❌ | Health check probe |

---

## 🛡️ Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** token authentication with 1-hour expiry
- **Helmet** security headers (XSS, CSRF, clickjacking protection)
- **3-Tier Rate Limiting**: Auth (5/15min), Transfer (10/min), General (100/min)
- **Zod Schema Validation** on all request bodies
- **Global Error Handler** that never leaks internal stack traces
- **Kubernetes Secrets** for sensitive credentials (not hardcoded)
- **Role-Based Access Control** (Admin vs Customer)

---

## 💡 Key Technical Highlights

### 1. Integer-Cents Arithmetic (No Floating-Point Errors)
```typescript
// $10.50 → 1050 cents (avoids 0.1 + 0.2 = 0.30000000000000004)
const toCents = (amount: number): number => Math.round(amount * 100);
```

### 2. Deterministic Lock Ordering (Deadlock Prevention)
```typescript
// Always lock the wallet with the smaller ID first
const [firstId, secondId] = [senderWallet.id, receiverWallet.id].sort();
```

### 3. Graceful MongoDB Degradation
```typescript
// Audit logging silently fails if MongoDB is offline
if (mongoose.connection.readyState === 1) {
  AuditLog.create({ ... }).catch(() => {});
}
```

---

## 📊 Technology Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite | Single Page Application |
| Backend | Node.js 20, Express 4, TypeScript | REST API Server |
| Auth | JWT, bcryptjs, Helmet | Authentication & Security |
| Validation | Zod | Schema-based input validation |
| SQL Database | PostgreSQL 16 / SQLite (Sequelize ORM) | ACID Financial Ledger |
| NoSQL Database | MongoDB 7.0 (Mongoose ODM) | Audit Log Telemetry |
| Containerization | Docker (Multi-stage Alpine builds) | Application Packaging |
| Orchestration | Docker Compose, Kubernetes (Minikube) | Service Management |
| IaC | Terraform (Kubernetes Provider) | Infrastructure Provisioning |
| CI/CD | GitHub Actions | Automated Pipeline |
| Observability | Prometheus (prom-client) | Metrics & Monitoring |
| Testing | Jest, Supertest | Unit & API Testing |

---

## 👨‍💻 Author

M.Tech Capstone Project — Agile DevOps & Full Stack Development
