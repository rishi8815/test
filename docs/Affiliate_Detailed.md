# Beam Affiliate Platform - System Documentation

This document provides a comprehensive overview of the Beam Affiliate Platform, covering functional workflows, system architecture, and detailed code flows.

---

## 1. How Things Work (Functional Overview)

This section describes the platform's high-level functionality from the perspective of different users (Resellers, Admins, Customers).

### 1.1 The Reseller Journey (Affiliate)
The primary user of the platform is the Reseller (Affiliate).
1.  **Sign Up**: A user registers an account. By default, they are assigned the `reseller` role.
2.  **Dashboard Access**: Upon login, they see a personalized dashboard with earnings, click stats, and recent activity.
3.  **Promotion**:
    *   Resellers navigate to the **Products** page.
    *   They copy a unique referral link (e.g., `https://beam.platform/product/1?ref=RESELLER_ID`).
    *   They share this link via social media, email, or direct messaging.
4.  **Tracking & Earnings**:
    *   When someone clicks their link, the system logs a "Click".
    *   If that click leads to a purchase, a "Transaction" is recorded.
    *   The reseller earns a commission (default 10%) on the sale amount.
5.  **Payouts**: Resellers can view their approved commissions and request payouts via the **Payouts** section.

### 1.2 The Admin Journey
Platform administrators manage the ecosystem.
1.  **Oversight**: Admins have a global view of all resellers and transactions.
2.  **Transaction Approval**:
    *   Commissions often start in a `pending` state to allow for refunds/fraud checks.
    *   Admins review and `approve` transactions, making them eligible for payout.
3.  **User Management**: Admins can disable suspicious accounts or manage reseller tiers.

### 1.3 The Customer Journey (Tracking Logic)
The end-customer who buys the product.
1.  **Arrival**: Customer clicks a shared link and lands on the product page.
2.  **Attribution**: The system detects the `?ref=...` parameter and stores it in the browser's LocalStorage. This ensures that even if they navigate away and come back (without the link), the reseller still gets credit.
3.  **Purchase**: When the customer completes the checkout process, the stored `resellerId` is sent to the backend to attribute the sale.

---

## 2. Architecture Overview

### Tech Stack

#### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)
- **Routing**: React Router DOM v6
- **Styling**: CSS Modules, Global CSS variables for theming
- **HTTP Client**: Axios (configured in `lib/api.ts`)
- **Build Tool**: Vite

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, BCrypt for password hashing
- **Testing**: In-memory MongoDB for development

### Project Structure

```
beam-affiliate-platform/
├── backend/                  # Node.js API Server
│   ├── src/
│   │   ├── config/          # DB and environment config
│   │   ├── controllers/     # Request handlers (Auth, Dashboard, Tracking)
│   │   ├── middleware/      # Express middleware (Auth, Error handling)
│   │   ├── models/          # Mongoose schemas (User, Product, Transaction)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (Fraud, Scheduler)
│   │   └── utils/           # Helpers (Token generation, Logger)
│   └── package.json
│
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/      # Navbar, Footer
│   │   │   └── ui/          # Buttons, Inputs, Cards
│   │   ├── contexts/        # Global state (Auth, Theme)
│   │   ├── hooks/           # Custom hooks (useAttribution)
│   │   ├── lib/             # Utilities (API, Storage)
│   │   ├── pages/           # Route views (Home, Dashboard, Admin)
│   │   ├── services/        # API service modules
│   │   └── App.tsx          # Main application component
│   └── package.json
│
└── docs/                     # Documentation
```

### Core Modules

1.  **Authentication & Users**: Handles registration, login, and role management (Admin vs. Reseller).
2.  **Affiliate Tracking**: Tracks clicks via `ref` parameters and attributes conversions to resellers.
3.  **Dashboard & Analytics**: Provides real-time stats on clicks, earnings, and payout history.
4.  **Marketing Tools**: Allows resellers to create email campaigns and access marketing assets.
5.  **Admin Panel**: Enables platform administrators to manage users, transactions, and payouts.

### Database Schema Overview

- **User**: Stores user credentials, roles (`reseller`, `admin`), and profile info.
- **Product**: Catalog of items available for promotion.
- **Click**: Records tracking events (IP, User Agent, Reseller ID).
- **Transaction**: Records conversions/sales and calculated commissions.
- **Campaign**: Stores email marketing campaign configurations.
- **Payout**: Tracks payment records to resellers.

---

## 3. Code Flow & Logic

This section details the internal logic and data flow for key platform features.

### 3.1 Authentication Flow

#### Registration (`/signup`)
1.  **Frontend**: User submits form on `Register.tsx`.
2.  **Service**: `authService.signup()` calls `POST /auth/signup`.
3.  **Backend Route**: `routes/auth.js` -> `authController.registerUser`.
4.  **Controller Logic**:
    *   Validates input (name, email, password).
    *   Checks if user already exists in MongoDB (`User.findOne`).
    *   Creates new `User` document with hashed password (bcrypt).
    *   Generates JWT token (`utils/generateToken.js`).
5.  **Response**: Returns User object and JWT.
6.  **Frontend**: Stores token in `localStorage`, updates `AuthContext`, redirects to Dashboard.

#### Login (`/login`)
1.  **Frontend**: User submits credentials on `Login.tsx`.
2.  **Service**: `authService.login()` calls `POST /auth/login`.
3.  **Backend Route**: `routes/auth.js` -> `authController.loginUser`.
4.  **Controller Logic**:
    *   Finds user by email.
    *   Compares password hash (`user.matchPassword`).
    *   Updates `lastLoginIp`.
5.  **Response**: Returns User object and JWT.

### 3.2 Affiliate Tracking Flow

#### Click Tracking
1.  **Trigger**: User visits a product page with a ref link (e.g., `?ref=RESELLER123`).
2.  **Frontend Hook**: `useAttribution` hook runs on app load.
    *   Parses URL search params.
    *   Stores `resellerId` in `localStorage` (persistent attribution).
3.  **API Call**: Frontend optionally calls `POST /api/tracking/click` (if implemented on landing).
4.  **Backend Logic** (`trackingController.trackClick`):
    *   Validates `resellerId`.
    *   Logs click in `Click` collection with IP and User Agent.
    *   Used for "Click" stats on dashboard.

#### Conversion / Sale Recording
1.  **Trigger**: Customer completes a purchase (`PaymentPage.tsx`).
2.  **Frontend**: Calls payment API (simulated or real).
3.  **Backend Logic** (`trackingController.recordConversion`):
    *   Receives `resellerId`, `amount`, `productId`.
    *   Calculates commission (default 10%).
    *   Creates `Transaction` document with status `pending`.
    *   Links to `User` (Reseller).
4.  **Post-Process**: Admin verifies transaction -> status updates to `approved`.

### 3.3 Dashboard Data Flow

#### Reseller Dashboard (`/dashboard`)
1.  **Frontend**: `Dashboard.tsx` mounts.
2.  **API Call**: `GET /api/dashboard/stats` (protected route).
3.  **Middleware**: `authMiddleware` verifies JWT in header.
    *   Decodes token, attaches `req.user`.
4.  **Controller Logic** (`dashboardController.getDashboardStats`):
    *   Queries `Click` count for `req.user.resellerId`.
    *   Queries `Transaction` sum for total earnings.
    *   Aggregates recent activity.
5.  **Frontend**: Renders charts and stats cards using returned JSON data.

### 3.4 Admin Management Flow

#### Admin Access
1.  **Route Protection**: `PrivateRoute` checks if `user.role === 'admin'`.
2.  **Pages**: `AdminResellers`, `AdminTransactions`.
3.  **API Operations**:
    *   `GET /api/admin/resellers`: Lists all users.
    *   `PATCH /api/admin/transactions/:id`: Updates transaction status (e.g., Approve/Reject).

### 3.5 Frontend Context Architecture

#### AuthContext (`contexts/AuthContext.tsx`)
*   **Purpose**: Manages global user session.
*   **Initialization**: Checks `localStorage` for token on load.
*   **Methods**: `login`, `logout`, `register`.
*   **State**: `user` (User object), `token` (string), `isLoading` (boolean).

#### ThemeContext (`contexts/ThemeContext.tsx`)
*   **Purpose**: Manages UI theme (User/Partner/Merchant).
*   **Logic**: `AppLayout` watches `user.role` and updates theme automatically.
    *   `reseller` -> Teal theme.
    *   `admin` -> Purple theme.
    *   `customer` -> Pink/User theme.

---

## 4. Professional UI & Design System

The Beam Affiliate Platform features a fast, responsive, and modern user interface designed to provide an optimal experience across devices. The design system is strictly aligned with Beam's brand identity.

### 4.1 Typography
*   **Primary Font**: `Nunito` (Google Fonts).
*   **Characteristics**: Rounded sans-serif that appears friendly, modern, and highly readable.
*   **Usage**: Applied globally via `index.css` to all headings, body text, and interactive elements.

### 4.2 Color Palette (Brand-Aligned)
The UI utilizes a CSS variable-based color system (`:root` scope) for consistency and theme switching.
*   **Primary Pink** (`#FF2069`): Used for primary calls-to-action (CTAs), user actions, and highlights.
*   **Charcoal** (`#06303A`): Used for primary text, headers, and structural elements to provide high contrast.
*   **Teal** (`#54D9C9`): Specific to **Partner/Reseller** views.
*   **Purple** (`#5030E2`): Specific to **Merchant/Admin** views.
*   **Yellow** (`#F6C838`): Used for accents, warnings, and achievement badges.

### 4.3 Responsive Layouts
*   **Container-based**: Content is centered and constrained (`max-width: 1200px`) for readability on large screens.
*   **Mobile-First**: Navigation collapses into a hamburger menu on smaller screens (`< 768px`).
*   **Grid & Flexbox**: Dashboard widgets and product lists use flexible grids that adapt columns based on viewport width.

### 4.4 Component Design
*   **Cards**: Used extensively for stats, products, and forms. Features subtle shadows (`0 1px 2px rgba...`) and rounded corners (`12px` radius) for a modern "lifted" look.
*   **Buttons**: Pill-shaped or rounded-rectangle buttons with hover states that slightly lighten/darken the background.
*   **Feedback**: Loading states (`<Loader />`) and error messages (`<ErrorState />`) provide immediate visual feedback during data fetching or form submission.
