# AfriKAD Deployment Guide

## How Mobile and Admin Read the Backend

**In one sentence:** Mobile and Admin both “read” the backend by sending **HTTP requests** to the **same backend base URL** (e.g. `https://your-api.onrender.com/api`). They do not talk to each other—only to the backend.

### Code paths

| Client   | Config / env                         | Where it’s used                    | Example production value                    |
|----------|--------------------------------------|------------------------------------|--------------------------------------------|
| **Mobile** | `EXPO_PUBLIC_API_URL` or fallback in code | `mobile/src/config.ts` → `API_BASE_URL` | `https://afrikad-api.onrender.com/api`     |
|          |                                      | `mobile/src/services/api.ts` uses `API_BASE_URL` for all requests | Same URL for login, wallet, payments, etc. |
| **Admin**  | `VITE_API_BASE_URL` (Vercel env)     | `admin/src/lib/api.ts` → axios `baseURL` | `https://afrikad-api.onrender.com/api`     |
|          |                                      | All dashboard API calls use this base URL | Same URL for auth, dashboard, users, etc.   |

### Request flow

1. **Mobile:** User opens app → app reads `API_BASE_URL` from `config.ts` → every `apiService.*` call (e.g. `apiService.getTransactions()`) goes to `API_BASE_URL/...` (e.g. `GET https://your-api.onrender.com/api/transactions`).
2. **Admin:** User opens dashboard in browser → Vite injects `VITE_API_BASE_URL` at build time → every `api.get(...)` / `api.post(...)` goes to that base URL (e.g. `GET https://your-api.onrender.com/api/admin/dashboard`).
3. **Backend:** Receives those requests, talks to MongoDB and KoraPay, returns JSON. No difference whether the request came from Mobile or Admin.

### What you need to set

- **Backend (Render):** `BASE_URL` = your Render URL without `/api` (e.g. `https://afrikad-api.onrender.com`). Used for webhooks and any server-side links.
- **Admin (Vercel):** `VITE_API_BASE_URL` = Render URL **with** `/api` (e.g. `https://afrikad-api.onrender.com/api`).
- **Mobile (build):** Either set `EXPO_PUBLIC_API_URL` to the same URL with `/api`, or hardcode the production URL in `mobile/src/config.ts`.

Once those point to the same backend, both Mobile and Admin are “reading” that backend correctly.

---

## How Mobile, Admin, and Backend Connect (diagram)

When you deploy the **backend on Render** and the **admin on Vercel**, they all talk to **one backend API** over the internet. The mobile app (built and installed on devices) and the admin (a website on Vercel) both send HTTP requests to your backend URL. There is no direct link between admin and mobile—they only interact through the backend and shared database.

```
┌─────────────────┐         ┌─────────────────────────────────────┐         ┌──────────────┐
│   Mobile App    │  HTTP   │           Backend (Render)           │  Webhook │   KoraPay     │
│  (user devices) │ ──────► │  https://your-api.onrender.com       │ ◄─────── │   servers    │
└─────────────────┘         │  - Auth, wallet, payments, etc.     │         └──────────────┘
                            │  - MongoDB (e.g. Atlas)              │
┌─────────────────┐  HTTP   │  - KoraPay webhooks                  │
│  Admin Dashboard│ ──────►  └─────────────────────────────────────┘
│    (Vercel)     │
└─────────────────┘
```

- **Backend (Render)**  
  - Runs your Node/Express API.  
  - Has a public URL like `https://afrikad-api.onrender.com`.  
  - This is the **single source of truth** for auth, wallet, transactions, KoraPay, etc.  
  - KoraPay sends webhooks to this URL (e.g. `https://afrikad-api.onrender.com/api/webhooks/korapay`).

- **Admin (Vercel)**  
  - Static frontend. Every API call (login, dashboard, users, transactions) goes **from the user’s browser** to the **backend URL**.  
  - You configure that URL with **one env variable** at build time: `VITE_API_BASE_URL`.

- **Mobile app**  
  - Runs on the user’s phone. Every API call goes **from the app** to the **same backend URL**.  
  - That URL is set in your app config (e.g. `mobile/src/config.ts`). In production you use your real backend URL (or an env like `EXPO_PUBLIC_API_URL`).

So: **both admin and mobile “read” the backend by calling its HTTP API**; they don’t read each other.

---

## 1. Backend on Render

1. Create a **Web Service** and connect your repo (e.g. root or `backend` folder).
2. Set **Environment Variables** in Render (same names as in `backend/.env`):

   - `PORT` – Render sets this; you can leave as is.
   - `NODE_ENV=production`
   - `MONGODB_URI` – your MongoDB Atlas connection string.
   - `JWT_SECRET` – strong random secret for production.
   - `KORA_API_KEY`, `KORA_SECRET_KEY`, `KORA_BASE_URL` – from KoraPay.
   - **`BASE_URL`** – **must be your Render backend URL**, e.g. `https://afrikad-api.onrender.com`  
     (no `/api` at the end). This is used for webhooks and any links back to the API.

3. After deploy, note the backend URL, e.g. `https://afrikad-api.onrender.com`.

---

## 2. Admin on Vercel

1. Create a new project and connect the repo (e.g. `admin` folder).
2. In **Settings → Environment Variables**, add:

   | Name                | Value                                      |
   |---------------------|--------------------------------------------|
   | `VITE_API_BASE_URL` | `https://afrikad-api.onrender.com/api`     |

   Use your real Render URL; the `/api` is required because your routes are under `/api`.

3. Redeploy so the new env is picked up.  
   The admin app reads the backend by sending all requests to `VITE_API_BASE_URL` (see `admin/src/lib/api.ts`: `import.meta.env.VITE_API_BASE_URL`).

So: **admin “reads” the backend by using this one variable.**

---

## 3. Mobile App

The app uses `API_BASE_URL` from `mobile/src/config.ts`:

- **Development:** uses your dev host (e.g. `http://192.168.3.8:5001/api`).
- **Production:** currently set to `https://api.afrikad.com/api`. For your Render backend, this should be your real backend URL.

**Option A – Hardcode production URL (simple)**  
In `mobile/src/config.ts`, set the production URL to your Render backend:

```ts
export const API_BASE_URL = __DEV__
  ? `http://${getDevHost()}:5001/api`
  : 'https://afrikad-api.onrender.com/api';  // Your Render URL + /api
```

**Option B – Use env (better for multiple environments)**  
Use something like `EXPO_PUBLIC_API_URL` and in production builds set it to `https://afrikad-api.onrender.com/api`. Then in `config.ts`:

```ts
const prodUrl = typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL
  : 'https://api.afrikad.com/api';
export const API_BASE_URL = __DEV__ ? `http://${getDevHost()}:5001/api` : prodUrl;
```

After building (e.g. EAS or local build), the app will “read” the backend by calling this URL for all API requests.

---

## 4. Summary: Who Reads What

| Client        | Where it runs        | How it reads the backend                          |
|---------------|----------------------|----------------------------------------------------|
| **Backend**   | Render               | N/A (it is the backend). Uses `BASE_URL` for webhooks. |
| **Admin**     | Vercel (browser)     | All requests go to `VITE_API_BASE_URL` (Render URL + `/api`). |
| **Mobile**    | User’s device        | All requests go to `API_BASE_URL` in `config.ts` (Render URL + `/api`). |

So: **mobile and admin both “read” the backend by sending HTTP requests to the same backend base URL.**  
You only need to:

1. Deploy the backend on Render and set `BASE_URL` to that Render URL.
2. Set `VITE_API_BASE_URL` on Vercel to `https://your-backend.onrender.com/api`.
3. Set the production URL in `mobile/src/config.ts` (or `EXPO_PUBLIC_API_URL`) to `https://your-backend.onrender.com/api`.

After that, both admin and mobile will interact with the same backend on Render.
