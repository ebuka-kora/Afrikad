require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const paymentRoutes = require('./routes/payment');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhooks');
const cardsRoutes = require('./routes/cards');
const supportRoutes = require('./routes/support');

const app = express();
// Default 5001: macOS AirPlay often uses 5000. Set PORT in .env to override.
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/pay', paymentRoutes);
app.use('/api/payment', paymentRoutes); // alias for mobile (getFxQuote, makePayment)
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/support', supportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints index (optional)
app.get('/api', (req, res) => {
  res.json({
    name: 'AfriKAD API',
    version: '1.0',
    base: '/api',
    endpoints: {
      auth: {
        'POST /auth/register': 'Register user',
        'POST /auth/login': 'Login',
        'GET /auth/me': 'Current user (auth)',
        'POST /auth/forgot-password': 'Request password reset (email)',
        'POST /auth/verify-reset-token': 'Verify reset token',
        'POST /auth/reset-password': 'Reset password with token',
        'POST /auth/forgot-password/otp': 'Request OTP for reset',
        'POST /auth/reset-password/otp': 'Reset password with OTP',
      },
      wallet: {
        'GET /wallet/balance': 'Wallet balance (auth)',
        'POST /wallet/deposit': 'Deposit NGN (auth)',
        'POST /wallet/withdraw': 'Withdraw NGN (auth)',
      },
      payment: {
        'GET /payment/quote?amountUsd': 'FX quote (auth)',
        'POST /payment': 'Make USD payment (auth)',
      },
      cards: {
        'POST /cards/kyc': 'Submit KYC, create card (auth)',
        'GET /cards/me': 'Get my card details (auth)',
        'POST /cards/:id/suspend': 'Freeze card (auth)',
        'POST /cards/:id/activate': 'Unfreeze card (auth)',
      },
      transactions: {
        'GET /transactions': 'List transactions (auth)',
        'GET /transactions/:id': 'Get transaction (auth)',
      },
      webhooks: {
        'POST /webhooks/korapay': 'KoraPay webhook (no auth)',
        'POST /webhooks/notify': 'Admin notify (no auth)',
      },
      support: {
        'GET /support/chat': 'Chat history (auth)',
        'POST /support/chat': 'Send message (auth)',
      },
      admin: {
        'GET /admin/dashboard': 'Dashboard (admin)',
        'GET /admin/users': 'Users (admin)',
        'GET /admin/transactions': 'Transactions (admin)',
        'GET /admin/health': 'Health (admin)',
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Connect to MongoDB first, then start the server (you always see when DB is ready)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/afrikad')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 AfriKAD Backend running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
