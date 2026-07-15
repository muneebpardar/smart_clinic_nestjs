# SmartClinic Healthcare Platform (Monorepo)

SmartClinic is an enterprise-grade, real-time clinical management and patient intake platform. It features AI-driven pre-consultation triaging, clinical SOAP dictation notes, dynamic booking recommendations, and receptionist calendars built on a unified monorepo architecture.

---

## 🚀 Key Features

* **AI Pre-Consultation Intake Chatbot**: Conducts interactive patient chats to compile Chief Complaint, Duration, Severity, and Medical History directly into database triage cards.
* **Clinical dictation SOAP Note Formatter**: Formats unstructured dictations into structured Subjective, Objective, Assessment, and Plan notes, while recommending ICD-10 medical diagnostic codes.
* **Smart Booking Recommender**: Recommends medical specialties and doctors based on patient-described symptoms.
* **AI No-Show Risk Predictor**: Calculates missed-appointment risk scores for scheduled bookings to highlight high-risk cases for receptionists.
* **Real-time WebSockets Sync**: Synchronizes bookings, checks-ins, and completed intake charts across dashboards in real-time.
* **Role-Based Access Control (RBAC)**: Enforces access constraints for **Patients**, **Doctors**, **Receptionists**, and **Admins**.

---

## 🏗️ Architectural Layout

The codebase is organized as a clean-architecture monorepo separating client dashboards and server instances:

```
smartclinic-monorepo/
├── backend/                  # NestJS TypeScript Backend Application
│   ├── src/
│   │   ├── auth/            # JWT authentication & custom RBAC guards
│   │   ├── entities/        # TypeORM database schemas & relations
│   │   ├── appointments/    # Booking workflows & WebSockets gateway
│   │   ├── ai-proxy/        # Secured Groq & Gemini LLM completion controllers
│   │   └── migrations/      # TypeORM database migration scripts
│   └── test/                # E2E integration test suites (Supertest)
├── frontend/                 # React 18 TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── components/      # Responsive React views (SOAP, Booking, Chat)
│   │   └── context/         # Auth contexts & Axios API layer
└── docker-compose.yml        # PostgreSQL container orchestrator
```

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later
* **npm**: v9.0.0 or later
* **Database**: Running PostgreSQL instance (e.g., Neon.tech serverless DB or local PostgreSQL)

---

### Step 1: Database Infrastructure Setup

If running a local PostgreSQL instance, a Docker Compose file is provided:
1. Start the PostgreSQL instance:
   ```bash
   docker-compose up -d
   ```
   *This launches a PostgreSQL container bound to port `5432`.*

---

### Step 2: Backend Setup (NestJS)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environmental variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Configure `.env` variables:
   ```env
   # Database connection (TypeORM)
   DATABASE_URL=postgresql://clinic_admin:StrongSecurePassword2026!@localhost:5432/smartclinic_dev
   
   # JWT Configuration
   JWT_SECRET=your-secure-jwt-passphrase-here

   # Primary AI Engine (Groq Llama 3.3)
   GROQ_API_KEY=gsk_PsfyKY0l3zdIGQiNiCJsWGdy...

   # Fallback AI Engine (Gemini SDK - supports legacy 'AIza' and unified 'AQ.' keys)
   GEMINI_API_KEY=AQ.Ab8RN6K76bCMEQ1mUJKygh...
   ```
5. Apply database migrations & seed schemas:
   ```bash
   npm run migration:run
   ```
6. Start the server in watch mode:
   ```bash
   npm run start:dev
   ```
   *The backend server will run on `http://localhost:3000`.*

---

### Step 3: Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` variables:
   Create a `.env` file containing:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_WS_URL=http://localhost:3000
   ```
4. Start the frontend developer client:
   ```bash
   npm run dev
   ```
   *The client interface will run on `http://localhost:5173`.*

---

## 🧪 Testing Guide

We write integration and controller tests using **Jest** and **Supertest** to validate endpoints, authentication, and database actions.

To run the backend E2E integration tests:
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Run the test suite:
   ```bash
   npm run test:e2e
   ```
   *Note: E2E tests use provider overrides to mock the database repositories, ensuring your database remains clean and unpolluted during testing.*

---

## 🔒 Security Implementations

* **Environment Separation**: Sensitive credentials (such as API keys and connection URLs) are stored in server `.env` files and never exposed to the client.
* **Role-Based Guards**: NestJS route endpoints are guarded using `JwtAuthGuard` and a custom metadata-driven `RolesGuard` checking roles against JSON Web Tokens.
* **SSL Transit Encryption**: Connections to serverless cloud databases (e.g. Neon) are configured with SSL options (`rejectUnauthorized: false`) for secure data transit.
