# AfriKAD

**Pay globally from Africa in one tap.**

AfriKAD is a cross-currency payment platform for Africa that allows users to store Naira (NGN), instantly convert to USD using on-demand FX, and pay globally using USD virtual cards.

## Architecture

The system consists of three fully separated parts:

1. **Mobile App** (Expo React Native) - User-facing mobile application
2. **Backend API** (Node.js + Express) - Core business logic and API
3. **Admin Dashboard** (Next.js) - Operational control and visibility

All communication happens through secure HTTP APIs. **How Mobile and Admin read the backend:** both send HTTP requests to the same backend base URL (see [DEPLOYMENT.md](./DEPLOYMENT.md) for config and production setup).

## Tech Stack

- **Mobile Frontend**: Expo React Native
- **Backend API**: Node.js + Express.js
- **Admin Dashboard**: Vite + React (Web)
- **Payment & FX Provider**: Kora API
- **Database**: MongoDB

## Project Structure

```
Afrikad/
├── mobile/          # Expo React Native mobile app
├── backend/         # Node.js + Express API
└── admin/           # Next.js admin dashboard
```

## Getting Started

### Backend API

1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start MongoDB (if running locally)
5. Run: `npm run dev`

See `backend/README.md` for detailed setup instructions.

### Mobile App

1. Navigate to `mobile/` directory
2. Install dependencies: `npm install`
3. (Optional) Set `EXPO_PUBLIC_API_HOST` in `.env` for physical devices; production URL is in `src/config.ts` (see `DEPLOYMENT.md`).
4. Run: `npm start` or `expo start`

See `mobile/README.md` for detailed setup instructions.

### Admin Dashboard

1. Navigate to `admin/` directory
2. Install dependencies: `npm install`
3. Create `.env.local` file with:
   ```
   VITE_API_BASE_URL=http://localhost:5001/api
   ```
   (Use your Render backend URL + `/api` for production; see `DEPLOYMENT.md`.)
4. Run: `npm run dev`

The admin dashboard will be available at `http://localhost:5173` (or the port shown in terminal).

**Note**: You'll need to log in with an admin user account. Admin users must have `role: 'admin'` in the database.

### Running All Services Together

From the root directory, you can install all dependencies and run all services:

```bash
# Install all dependencies
npm run install:all

# Run all services concurrently
npm run dev
```

This will start:
- Backend API on `http://localhost:5001`
- Admin Dashboard on `http://localhost:5173`
- Mobile App (Expo) - Scan QR code with Expo Go

Or run services individually:
```bash
npm run dev:backend   # Backend only
npm run dev:admin     # Admin dashboard only
npm run dev:mobile    # Mobile app only
```

## Integration & API Connection

### Backend API Endpoints

The backend provides the following main endpoints:

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

**Wallet:**
- `GET /api/wallet/balance` - Get wallet balance (protected)
- `POST /api/wallet/deposit` - Deposit NGN (protected)

**Payments:**
- `POST /api/pay` - Make a payment (protected)

**Transactions:**
- `GET /api/transactions` - Get transaction history (protected)

**Admin (requires admin role):**
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/transactions` - List transactions
- `GET /api/admin/charts/volume` - Transaction volume charts
- `GET /api/admin/charts/status` - Transaction status breakdown

### Mobile App Configuration

The mobile app is configured to connect to the backend API. You can switch between mock and real API in `mobile/src/services/api.ts`:

```typescript
const USE_MOCK_API = false; // Set to true for mock data, false for real API
```

Default API URL is `http://localhost:5001/api` in development. For production, set `EXPO_PUBLIC_API_URL` or update `mobile/src/config.ts`; see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Admin Dashboard Configuration

The admin dashboard connects to the backend API via environment variable. Set `VITE_API_BASE_URL` in `admin/.env.local`.

**Creating an Admin User:**

Admin users must have `role: 'admin'` in the MongoDB database. You can either:
1. Manually update the user document in MongoDB: `{ role: 'admin' }`
2. Or create an admin user through the backend API by modifying the registration route

## Key Features

### Mobile App
- Wallet management (NGN & USD balances)
- Instant payments with water-fill animation
- Transaction history
- Profile management
- Beautiful premium UX

### Backend API
- JWT authentication
- Wallet ledger management
- On-demand FX conversion (NGN → USD)
- Virtual card payment authorization
- Transaction recording
- Admin data access

### Admin Dashboard
- Dashboard overview with real-time stats
- Transaction volume charts (NGN & USD over time)
- User management
- Transaction management with filters
- Success/failure rate visualization

## Branding

- **Colors**: Red (#DC143C), Black (#000000), Neon Green (#39FF14)
- **Style**: Modern African fintech
- **Philosophy**: Simple, fast, secure, premium feel

## Core Philosophy

- No prefunded USD required
- FX happens on demand
- UX hides latency
- Simple, fast, secure, premium feel

## License

ISC

# Afrikad
