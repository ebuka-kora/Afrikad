const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, username } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.',
      });
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken.',
        });
      }
    }

    // Create user (virtual card is created via POST /api/cards/kyc after KYC)
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      username,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        username: user.username,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message,
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        username: user.username,
        wallet: user.wallet,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        username: user.username,
        wallet: user.wallet,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user.',
    });
  }
});

// Update profile
router.put('/profile', authenticate, [
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, phone, username } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use.',
        });
      }
      user.email = email;
    }

    // Check if username is being changed and if it's already taken
    if (username !== undefined && username !== user.username) {
      if (username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: 'Username already taken.',
          });
        }
      }
      user.username = username || undefined;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone || undefined;

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        username: user.username,
        wallet: user.wallet,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message,
    });
  }
});

// Change password
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password.',
      error: error.message,
    });
  }
});

// Forgot password - request reset (sends token; in production you would email it)
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires +resetOtp +resetOtpExpires');

    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.updatedAt = new Date();
    await user.save({ validateBeforeSave: false });

    // In production: send email with link containing resetToken (e.g. https://app.example.com/reset-password?token=resetToken)
    // For now we return the token for development; remove in production and use email only
    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive reset instructions.',
      ...(isDev && { resetToken, expiresIn: '1 hour' }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request.',
      error: error.message,
    });
  }
});

// Verify reset token (optional - for UI to validate token before showing new password form)
router.post('/verify-reset-token', [
  body('token').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('_id email');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid.',
      email: user.email,
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify token.',
      error: error.message,
    });
  }
});

// Reset password (with token from forgot-password)
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message,
    });
  }
});

// Request OTP for password reset (alternative flow - e.g. for mobile)
router.post('/forgot-password/otp', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpires');

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive an OTP.',
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    user.updatedAt = new Date();
    await user.save({ validateBeforeSave: false });

    // In production: send OTP via SMS or email
    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive an OTP.',
      ...(isDev && { otp, expiresIn: '15 minutes' }),
    });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request.',
      error: error.message,
    });
  }
});

// Reset password with OTP
router.post('/reset-password/otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').notEmpty().isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+password +resetOtp +resetOtpExpires');

    if (!user || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message,
    });
  }
});

module.exports = router;
