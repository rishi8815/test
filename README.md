# Beam Affiliate Platform

A complete Affiliate Marketing Platform featuring a React + TypeScript frontend and a Node.js + Express + MongoDB backend. It provides an affiliate/reseller dashboard, product catalog, customer checkout, profile management, email marketing, and advanced reporting.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** CSS Modules + PostCSS + Tailwind (via index.css variables)
- **State:** Context API
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (with Mongoose ODM)
- **Auth:** JWT (JSON Web Tokens)
- **Background Jobs:** Node-Cron
- **Validation:** Joi / Manual checks

## 📂 Project Structure

```
/
├── backend/               # Node.js API
│   ├── src/
│   │   ├── config/        # Environment & DB config
│   │   ├── controllers/   # Route logic
│   │   ├── middleware/    # Auth, Error handling
│   │   ├── models/        # Mongoose Schemas
│   │   ├── routes/        # API Routes
│   │   ├── services/      # Business logic (Fraud, Email, Scheduler)
│   │   └── utils/         # Helpers
│   └── server.js          # Entry point
│
├── frontend/              # React App
│   ├── src/
│   │   ├── components/    # Reusable UI
│   │   ├── context/       # Auth & Theme Context
│   │   ├── pages/         # Views (Dashboard, Marketing, etc.)
│   │   └── lib/           # API Client
│   └── vite.config.ts
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (Local or Atlas) - *Optional for dev (uses In-Memory DB)*

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
- Runs on `http://localhost:4000`
- **Default:** Uses In-Memory MongoDB (no install needed)
- **Config:** Edit `.env` or `src/config/index.js`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Runs on `http://localhost:5173`
- Proxies API requests to backend

## ✨ Key Features

### Core Modules
- **Authentication:** JWT-based login/signup with Role-Based Access Control (Reseller vs Admin).
- **Affiliate Tracking:** Unique Reseller IDs, Click tracking, Conversion attribution.
- **Payments:** Transaction logging, Commission calculation (10%), Payout management.

### Advanced Modules (New)
- **Email Marketing:** Campaign creation, Template management, Scheduling, Open/Click tracking.
- **Gamification:** Reseller levels (Beginner, Active, Ambassador) with progress tracking.
- **Advanced Reports:** Interactive charts for earnings, engagement, and traffic sources.
- **Fraud Prevention:** Risk scoring engine (Heuristic + ML simulation).
- **Compliance:** Audit logs, GDPR data deletion requests.

## 📡 API Documentation

### Marketing
- `GET /api/marketing/campaigns` - List campaigns
- `POST /api/marketing/campaigns` - Create & schedule campaign
- `GET /api/marketing/templates` - Get email templates

### Analytics
- `POST /api/analytics/events` - Ingest clickstream events
- `GET /api/analytics/stats` - Get aggregated performance data

## 🧪 Testing
- **Frontend:** `npm run dev` (Manual testing via UI)
- **Backend:** `npm test` (if tests configured)
- **CI/CD:** GitHub Actions configured in `.github/workflows/ci.yml`

## 📦 Deployment
- **Frontend:** Build with `npm run build`, deploy to S3/Vercel/Netlify.
- **Backend:** Deploy to EC2/ECS/Heroku. Ensure `MONGO_URI` is set in production.
