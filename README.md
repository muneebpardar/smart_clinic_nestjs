# SmartClinic Monorepo

SmartClinic is a comprehensive healthcare platform featuring advanced AI-driven tools, real-time synchronization, a Smart Booking Wizard, a SOAP Note Editor for clinical documentation, and a floating AI Intake Chatbot. This project uses a modern tech stack with a React/Vite frontend and a NestJS/TypeORM backend with PostgreSQL.

## 🚀 Getting Started on a New Device

Follow these instructions to get the project up and running after cloning it onto a new device.

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for the local PostgreSQL database)
- [Git](https://git-scm.com/)

---

### 1. Database Setup (Docker)

This project uses PostgreSQL. A `docker-compose.yml` file is provided at the root for easy local database setup.

1. Open a terminal at the root of the project.
2. Start the database by running:
   ```bash
   docker-compose up -d
   ```
   *(This will start a PostgreSQL container named `smartclinic_postgres` on port `5432` with the database `smartclinic_dev`, user `clinic_admin`, and password `StrongSecurePassword2026!`)*

---

### 2. Backend Setup (NestJS)

1. Open a new terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `backend` directory (if it doesn't exist) and ensure it has the necessary environment configurations:
   ```env
   # Database connection (matching docker-compose)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=clinic_admin
   DB_PASSWORD=StrongSecurePassword2026!
   DB_NAME=smartclinic_dev
   
   # JWT & Authentication
   JWT_SECRET=your_jwt_secret_here

   # Gemini API Key (for AI Modules)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run migrations/seed the database (if applicable in your workflow).
5. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   *The backend should now be running on its configured port (typically `http://localhost:3000`).*

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `frontend` directory with your necessary client-side variables (for example):
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be accessible in your browser (typically `http://localhost:5173`).*

---

## 🔗 Connecting to a GitHub Repository

If you want to push this project to a new GitHub repository, follow these steps:

1. **Create a new repository on GitHub** (do NOT initialize it with a README, .gitignore, or license, as you already have those locally).
2. **Open a terminal in the root** of this project (`smartclinic-monorepo`).
3. **Initialize Git (if not already done)**:
   ```bash
   git init
   ```
4. **Stage all files**:
   ```bash
   git add .
   ```
5. **Commit the files**:
   ```bash
   git commit -m "Initial commit: SmartClinic monorepo setup"
   ```
6. **Link your local repository to GitHub** (replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual info):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
7. **Rename the default branch to `main` (if necessary)**:
   ```bash
   git branch -M main
   ```
8. **Push the code to GitHub**:
   ```bash
   git push -u origin main
   ```

## 📂 Project Structure

- `/backend`: NestJS backend, TypeORM, PostgreSQL connection, WebSockets (Socket.io).
- `/frontend`: React frontend built with Vite, TailwindCSS, Zustand for state management.
- `docker-compose.yml`: Database configuration.
