# Beam Affiliate Platform

Fast, responsive affiliate dashboard and customer flow built with React, TypeScript, and Vite. Resellers log in to view products, generate links, track transactions and payouts; customers browse and checkout with attribution preserved end‑to‑end.

## Tech Stack
- React + TypeScript + Vite
- Axios for API requests
- LocalStorage for auth and attribution persistence
- Recharts for dashboard charts

## Quick Start
- Prerequisites: Node `>=18`, npm `>=9`
- Install dependencies: `npm install`
- Start development server: `npm run dev`
  - Opens on `http://localhost:5173/` (or the next free port)
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Environment Variables
- `VITE_API_URL` — Base URL for backend API (default `http://localhost:4000`).

Create a `.env` file in the project root if you need to override defaults:

```
VITE_API_URL=http://localhost:4000
```

## Project Structure
- `src/App.tsx` — Route definitions and app wrapper
- `src/layouts/AppLayout.tsx` — Header, navigation (mobile + desktop), footer, and layout container
- `src/context/AuthContext.tsx` — Authentication state and actions, token management
- `src/lib/api.ts` — Axios instance with auth and attribution headers
- `src/lib/storage.ts` — Safe localStorage helpers and key constants
- `src/hooks/useAttribution.ts` — Persists `resellerId` from URL query (`ref` or `reseller`)
- `src/pages/*` — Page components (dashboard, products, profile, etc.)
- `src/index.css` — Global, brand‑aligned styles and responsive utilities

## Routing
Defined in `src/App.tsx` using React Router:
- Public: `/`, `/login`, `/signup`
- Private (requires auth): `/dashboard`, `/products`, `/transactions`, `/payouts`, `/profile`
- Customer flow: `/customer/products/:id`, `/customer/checkout`, `/customer/payment/success`, `/customer/payment/failure`

Private routes are enforced via `PrivateRoute` and `AuthContext`. Unauthenticated users are redirected to `/login`.

## Authentication & Attribution
- Auth tokens are stored under `storage.STORAGE_KEYS.token` (`beam_token`).
- On login/signup, token is saved and subsequent requests include `Authorization: Bearer <token>`.
- Attribution: `useAttribution` reads `ref` or `reseller` from the URL and saves it under `storage.STORAGE_KEYS.resellerId` (`beam_reseller_id`).
- The Axios instance adds `X-Reseller-Id` automatically when present.

## API Endpoints
The frontend expects the following endpoints (relative to `VITE_API_URL`):
- `POST /auth/login` — Returns `{ token, user }`
- `POST /auth/signup` — Returns `{ token, user }`
- `GET /auth/me` — Current user
- `GET /catalog/products` — List of products
- `GET /reseller/dashboard` — Totals, trends, recent activity
- `GET /reseller/transactions` — Transactions list
- `GET /reseller/payouts` — Payouts list
- `GET /reseller/me` — Profile data
- `PUT /reseller/me` — Update profile (name)
- `GET /reseller/settings` — Reseller settings
- `PUT /reseller/settings` — Update settings
- `POST /checkout/start` — Initiate payment for a product; returns `redirectUrl` or status

Customer product links include attribution automatically, e.g.:
```
https://your-domain/customer/products/123?ref=<resellerId>
```

## Responsive Design
Mobile‑first styles are in `src/index.css` and the header layout in `src/layouts/AppLayout.tsx`:
- Breakpoints and grids
  - `.grid-2` — 1→2 columns at `640px`
  - `.grid-3` — 1→2→3 columns at `640px` and `1024px`
  - `.gap-16`, `.gap-24` — spacing utilities
- Header and navigation
  - `.mobile-nav-toggle` — burger button visible below `768px`
  - `.mobile-nav` — slide‑in panel for small screens
  - `.nav` — desktop navigation visible from `768px`
- Media helpers
  - `img { max-width: 100%; height: auto; }`
  - `.header-inner` wraps on narrow viewports

Pages use flexible containers (`.container`, `.section`, `flex`/`grid`) and avoid fixed widths to ensure proper scaling.

## Development Workflow
- Lint (if configured): `npm run lint`
- TypeScript config: `tsconfig.json`, `tsconfig.app.json`
- Vite config: `vite.config.ts`

## Deployment
The frontend builds to static assets in `dist/` with `npm run build`. Serve `dist/` behind a CDN or static hosting. Point `VITE_API_URL` to the live backend.

## Troubleshooting
- Vite dev port in use: the dev server auto‑selects the next free port (shown in terminal).
- API/CORS errors: verify `VITE_API_URL` and server CORS settings.
- Missing auth: ensure `Authorization` header is present; re‑login to refresh `beam_token`.
- Attribution not set: confirm the URL contains `?ref=<id>` or `?reseller=<id>` and that localStorage is writeable.
- Asset import paths: keep assets under `src/assets/` and import with a relative path from components.

## Contributing
- Fork the repo and create a feature branch.
- Keep changes focused and consistent with existing style.
- Run the app locally and validate responsiveness before opening a PR.

## License
Internal project documentation for the Beam Affiliate Platform.
