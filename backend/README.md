# Affiliate Backend

## Setup
1. `cd backend`
2. `npm install`
3. `npm run dev`

## Environment Variables
- `MONGO_URI`: MongoDB Connection URI.
- `JWT_SECRET`: Secret for JWT signing.
- `USE_IN_MEMORY_DB`: Set to `true` to use in-memory MongoDB (good for dev/test without local Mongo installed).

## Modules
- **Auth**: Register, Login, Me (JWT based).
- **Tracking**: Click tracking, Conversions.
- **Reseller**: Dashboard, Transactions, Payouts.
- **Privacy**: Data deletion requests (GDPR/Compliance).

## API Documentation
The API runs on port 4000 by default.

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Reseller
- `GET /reseller/dashboard`
- `GET /reseller/transactions`
- `GET /reseller/payouts`
- `POST /reseller/payouts`

### Tracking
- `POST /tracking/click`
- `POST /tracking/conversion` (Admin/Webhook only)

### Privacy
- `POST /privacy/deletion-request`
- `POST /privacy/confirm-deletion`
