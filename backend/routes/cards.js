const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const koraService = require('../services/kora');

const router = express.Router();

router.use(authenticate);

/**
 * POST /api/cards/kyc
 * Submit KYC, create cardholder, create virtual card.
 */
router.post('/kyc', [
  body('dateOfBirth').isISO8601().toDate(),
  body('address.street').notEmpty().trim(),
  body('address.city').notEmpty().trim(),
  body('address.state').notEmpty().trim(),
  body('address.country').notEmpty().trim(),
  body('address.zipCode').notEmpty().trim(),
  body('countryIdentity.type').notEmpty().trim(),
  body('countryIdentity.number').notEmpty().trim(),
  body('countryIdentity.country').notEmpty().trim(),
  body('identity.type').notEmpty().trim(),
  body('identity.number').notEmpty().trim(),
  body('identity.image').notEmpty(),
  body('identity.country').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.koraVirtualCardId) {
      return res.status(400).json({
        success: false,
        message: 'You already have a virtual card.',
      });
    }

    const { dateOfBirth, address, countryIdentity, identity } = req.body;
    const dob = typeof dateOfBirth === 'string' ? dateOfBirth.split('T')[0] : dateOfBirth.toISOString().split('T')[0];

    const cardholderData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: dob,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zipCode,
      },
      countryIdentity: {
        type: countryIdentity.type,
        number: countryIdentity.number,
        country: countryIdentity.country,
      },
      identity: {
        type: identity.type,
        number: identity.number,
        image: identity.image,
        country: identity.country,
      },
    };

    let cardholderRes;
    try {
      cardholderRes = await koraService.createCardholder(cardholderData);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message || 'Failed to create card holder.',
      });
    }

    const cardholderRef = cardholderRes.data?.reference || cardholderRes.reference;
    if (!cardholderRef) {
      return res.status(500).json({
        success: false,
        message: 'Card holder created but no reference returned.',
      });
    }

    user.koraCardholderReference = cardholderRef;
    user.dateOfBirth = new Date(dob);
    user.address = address;
    user.countryIdentity = countryIdentity;
    user.identity = { type: identity.type, number: identity.number, country: identity.country };
    await user.save();

    const cardRef = `afrikad-${userId}-${Date.now()}`;
    let cardRes;
    try {
      cardRes = await koraService.createCard({
        cardHolderReference: cardholderRef,
        reference: cardRef,
        amount: 0,
        brand: 'visa',
      });
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message || 'Failed to create virtual card.',
      });
    }

    const cardReference = cardRes.data?.reference || cardRes.reference;
    if (!cardReference) {
      return res.status(500).json({
        success: false,
        message: 'Card creation initiated but no reference returned. Check Kora dashboard.',
      });
    }

    user.koraVirtualCardId = cardReference;
    await user.save();

    return res.json({
      success: true,
      message: 'KYC submitted and virtual card created.',
      card: {
        reference: cardReference,
        status: cardRes.data?.status || 'pending',
      },
    });
  } catch (error) {
    console.error('Cards KYC error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'KYC submission failed.',
    });
  }
});

/**
 * GET /api/cards/me
 * Get current user's virtual card details.
 */
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.koraVirtualCardId) {
      return res.json({
        success: true,
        card: null,
        message: 'No virtual card yet. Complete KYC to get one.',
      });
    }

    try {
      const cardRes = await koraService.getCard(user.koraVirtualCardId);
      const d = cardRes.data || cardRes;
      return res.json({
        success: true,
        card: {
          reference: d.reference,
          firstSix: d.first_six,
          lastFour: d.last_four,
          pan: d.pan,
          cvv: d.cvv,
          expiryMonth: d.expiry_month,
          expiryYear: d.expiry_year,
          brand: d.brand,
          balance: d.balance,
          status: d.status,
          holderName: d.holder_name || d.card_holder?.first_name
            ? `${d.card_holder?.first_name || ''} ${d.card_holder?.last_name || ''}`.trim()
            : `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        },
      });
    } catch (e) {
      return res.status(502).json({
        success: false,
        message: e.message || 'Failed to fetch card details.',
      });
    }
  } catch (error) {
    console.error('Cards me error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch card.',
    });
  }
});

/**
 * POST /api/cards/:id/suspend
 * Freeze (suspend) virtual card.
 */
router.post('/:id/suspend', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user || user.koraVirtualCardId !== req.params.id) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    const reason = (req.body && req.body.reason) ? String(req.body.reason).trim() : 'User requested freeze';
    await koraService.updateCardStatus(user.koraVirtualCardId, 'suspend', reason);

    return res.json({
      success: true,
      message: 'Card suspended.',
      card: { reference: user.koraVirtualCardId, status: 'suspended' },
    });
  } catch (error) {
    console.error('Cards suspend error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to suspend card.',
    });
  }
});

/**
 * POST /api/cards/:id/activate
 * Unfreeze (activate) virtual card.
 */
router.post('/:id/activate', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user || user.koraVirtualCardId !== req.params.id) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    const reason = (req.body && req.body.reason) ? String(req.body.reason).trim() : 'User requested';
    await koraService.updateCardStatus(user.koraVirtualCardId, 'activate', reason);

    return res.json({
      success: true,
      message: 'Card activated.',
      card: { reference: user.koraVirtualCardId, status: 'active' },
    });
  } catch (error) {
    console.error('Cards activate error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to activate card.',
    });
  }
});

module.exports = router;
