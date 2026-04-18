# Helplytics API

Express.js REST API with MongoDB (Atlas or local) for the Helplytics AI community support platform.

## Setup

1. Copy `.env.example` to `.env` and set:

   - `MONGODB_URI` — connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (or `mongodb://127.0.0.1:27017/helplytics` for local MongoDB).
   - `JWT_SECRET` — long random string for signing tokens.
   - `CORS_ORIGIN` — your Next.js origin (default `http://localhost:3000`).

2. Install and run:

```bash
cd backend
npm install
npm run dev
```

API base URL: `http://localhost:4000` (or `PORT` from `.env`).

Health check: `GET /health`

## Optional seed

```bash
npm run seed
```

Creates demo users; use password `DemoSeed123!` for those emails if you log in via the API.

## Endpoints (summary)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Bearer JWT |
| GET | `/api/users` | No |
| GET | `/api/users/:id` | No |
| PUT | `/api/users/update` | Bearer JWT |
| GET | `/api/requests` | No |
| POST | `/api/requests/create` | Bearer JWT |
| GET | `/api/requests/:id` | No |
| PUT | `/api/requests/update` | Bearer JWT |
| DELETE | `/api/requests/:id` | Bearer JWT |
| POST | `/api/requests/help` | Bearer JWT |
| POST | `/api/requests/solve` | Bearer JWT |
| POST | `/api/messages/send` | Bearer JWT |
| GET | `/api/messages/:requestId` | No |
| POST | `/api/ai/analyze` | No |
| GET | `/api/analytics/overview` | Bearer JWT |

Trust scores: **+10** on help, **+20** on solve (enforced in request handlers).

## Frontend integration

In the Next.js app root `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If this variable is unset, the UI keeps using the existing offline `localStorage` store only. With it set, the client syncs public data on load and uses JWT + API for authenticated actions, with automatic fallback to offline logic if a request fails.
