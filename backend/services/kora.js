const axios = require('axios');

const KORA_BASE_URL = process.env.KORA_BASE_URL || 'https://api.korapay.com';
const KORA_API_KEY = process.env.KORA_API_KEY;
const KORA_SECRET_KEY = process.env.KORA_SECRET_KEY;

class KoraService {
  constructor() {
    this.client = axios.create({
      baseURL: KORA_BASE_URL,
      headers: {
        'Authorization': `Bearer ${KORA_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AfriKAD-Backend/1.0',
      },
    });
  }

  /**
   * Create a customer in Kora (legacy)
   */
  async createCustomer(userData) {
    try {
      const response = await this.client.post('/customers', {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
      });
      return response.data;
    } catch (error) {
      console.error('Kora createCustomer error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create Kora customer');
    }
  }

  /**
   * Create a virtual card for a customer (legacy)
   */
  async createVirtualCard(customerId) {
    try {
      const response = await this.client.post(`/customers/${customerId}/cards`, {
        type: 'virtual',
        currency: 'USD',
      });
      return response.data;
    } catch (error) {
      console.error('Kora createVirtualCard error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create virtual card');
    }
  }

  /**
   * Create card holder (KoraPay Card Issuing)
   * POST /api/v1/cardholders
   */
  async createCardholder(data) {
    try {
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        date_of_birth: data.dateOfBirth,
        address: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
          zip_code: data.address.zipCode,
        },
        country_identity: {
          type: data.countryIdentity.type,
          number: data.countryIdentity.number,
          country: data.countryIdentity.country,
        },
        identity: {
          type: data.identity.type,
          number: data.identity.number,
          image: data.identity.image,
          country: data.identity.country,
        },
      };
      const response = await this.client.post('/api/v1/cardholders', payload);
      return response.data;
    } catch (error) {
      console.error('Kora createCardholder error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create card holder');
    }
  }

  /**
   * Create virtual card (KoraPay Card Issuing)
   * POST /api/v1/cards
   */
  async createCard(data) {
    try {
      const payload = {
        currency: 'USD',
        amount: data.amount ?? 0,
        card_holder_reference: data.cardHolderReference,
        reference: data.reference,
        type: 'virtual',
        brand: data.brand || 'visa',
      };
      const response = await this.client.post('/api/v1/cards', payload);
      return response.data;
    } catch (error) {
      console.error('Kora createCard error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create virtual card');
    }
  }

  /**
   * Get card details
   * GET /api/v1/cards/:reference
   */
  async getCard(reference) {
    try {
      const response = await this.client.get(`/api/v1/cards/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Kora getCard error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch card details');
    }
  }

  /**
   * Activate or suspend card
   * PATCH /api/i/cards/:card_reference/status
   */
  async updateCardStatus(cardReference, action, reason) {
    try {
      const response = await this.client.patch(`/api/i/cards/${cardReference}/status`, {
        action,
        reason: reason || (action === 'activate' ? 'User requested' : 'User requested freeze'),
      });
      return response.data;
    } catch (error) {
      console.error('Kora updateCardStatus error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `Failed to ${action} card`);
    }
  }

  /**
   * Terminate card
   * PATCH /api/i/cards/:card_reference/terminate
   */
  async terminateCard(cardReference, reason, initiator) {
    try {
      const response = await this.client.patch(`/api/i/cards/${cardReference}/terminate`, {
        reason: reason || 'User requested',
        initiator,
      });
      return response.data;
    } catch (error) {
      console.error('Kora terminateCard error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to terminate card');
    }
  }

  /**
   * Perform instant FX swap (NGN to USD)
   */
  async instantSwap(amountNgn) {
    try {
      // Kora API endpoint for instant swap
      const response = await this.client.post('/swaps/instant', {
        from_currency: 'NGN',
        to_currency: 'USD',
        amount: amountNgn,
      });
      return response.data;
    } catch (error) {
      console.error('Kora instantSwap error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'FX swap failed');
    }
  }

  /**
   * Authorize a payment on a virtual card
   */
  async authorizeCardPayment(cardId, amountUsd, merchantData) {
    try {
      const response = await this.client.post(`/cards/${cardId}/authorize`, {
        amount: amountUsd,
        currency: 'USD',
        merchant_name: merchantData.name || 'Unknown Merchant',
        merchant_category: merchantData.category || 'general',
      });
      return response.data;
    } catch (error) {
      console.error('Kora authorizeCardPayment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Card authorization failed');
    }
  }

  /**
   * Get FX rate (optional, for display purposes)
   */
  async getFxRate(fromCurrency = 'NGN', toCurrency = 'USD') {
    try {
      const response = await this.client.get(`/rates/${fromCurrency}/${toCurrency}`);
      return response.data;
    } catch (error) {
      console.error('Kora getFxRate error:', error.response?.data || error.message);
      // Return a mock rate if API fails (for development)
      return {
        rate: 1500, // 1 USD = 1500 NGN (mock)
        from_currency: fromCurrency,
        to_currency: toCurrency,
      };
    }
  }

  /**
   * Get FX quote for USD amount (calculates NGN needed including fees)
   * Returns: amountUsd, rate, baseAmountNgn, fee, totalAmountNgn
   */
  async getFxQuote(amountUsd) {
    try {
      // Get current FX rate
      const rateData = await this.getFxRate('NGN', 'USD');
      const rate = rateData.rate || 1500; // Fallback to 1500 if API fails
      
      // Calculate base NGN amount
      const baseAmountNgn = amountUsd * rate;
      
      // Calculate fee (0.2% of base amount, minimum ₦300)
      const feePercent = 0.002;
      const calculatedFee = baseAmountNgn * feePercent;
      const fee = Math.max(calculatedFee, 300);
      
      // Total NGN required
      const totalAmountNgn = baseAmountNgn + fee;
      
      return {
        amountUsd,
        rate,
        baseAmountNgn,
        fee,
        totalAmountNgn,
      };
    } catch (error) {
      console.error('Kora getFxQuote error:', error);
      // Fallback calculation
      const rate = 1500;
      const baseAmountNgn = amountUsd * rate;
      const fee = Math.max(baseAmountNgn * 0.002, 300);
      return {
        amountUsd,
        rate,
        baseAmountNgn,
        fee,
        totalAmountNgn: baseAmountNgn + fee,
      };
    }
  }

  /**
   * Initiate an NGN bank-transfer payment (dynamic virtual account)
   * POST /merchant/api/v1/charge/bank-transfer
   *
   * Used for NGN wallet deposits via bank transfer.
   * Note: This feature must be enabled on your KoraPay account.
   */
  async initiateBankTransferDeposit({ reference, amount, customer, notificationUrl, metadata = {} }) {
    try {
      const payload = {
        reference,
        amount,
        currency: 'NGN',
        notification_url: notificationUrl,
        customer: {
          email: customer.email,
          name: customer.name || undefined,
        },
        // Tag so we can recognise this as a wallet deposit in webhooks
        metadata: {
          ...metadata,
          purpose: 'wallet_deposit',
        },
      };

      // Try with /merchant prefix (similar to payout endpoint)
      const response = await this.client.post('/merchant/api/v1/charge/bank-transfer', payload);
      return response.data;
    } catch (error) {
      // Better error logging
      if (error.response) {
        console.error('Kora API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
        
        // Check if it's a Cloudflare block
        if (error.response.status === 403 && error.response.data?.includes?.('Cloudflare')) {
          throw new Error('KoraPay API access blocked. Please ensure: 1) Bank Transfer API is enabled on your account, 2) You are using the correct secret key, 3) Your IP is not blocked. Contact KoraPay support if issue persists.');
        }
        
        throw new Error(error.response.data?.message || error.response.data?.error || 'Failed to initiate bank transfer deposit');
      } else if (error.request) {
        console.error('Kora API Request Error:', error.request);
        throw new Error('Network error: Could not reach KoraPay API. Please check your internet connection.');
      } else {
        console.error('Kora API Error:', error.message);
        throw new Error(error.message || 'Failed to initiate bank transfer deposit');
      }
    }
  }

  /**
   * Payout to NGN bank account (used for wallet withdrawals)
   * POST /merchant/api/v1/transactions/disburse
   */
  async payoutToBank({ reference, amount, bankCode, accountNumber, narration, customer, metadata = {} }) {
    try {
      const payload = {
        reference,
        destination: {
          type: 'bank_account',
          amount,
          currency: 'NGN',
          narration: narration || 'Wallet withdrawal',
          bank_account: {
            bank: bankCode,
            account: accountNumber,
          },
          customer: {
            name: customer.name || undefined,
            email: customer.email,
          },
        },
        metadata,
      };

      const response = await this.client.post('/merchant/api/v1/transactions/disburse', payload);
      return response.data;
    } catch (error) {
      console.error('Kora payoutToBank error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate payout');
    }
  }

  /**
   * Get list of Nigerian banks
   * GET /api/v1/banks (Kora returns 404 for /merchant/api/v1/banks with "resource not found").
   */
  async getBanks() {
    try {
      const response = await this.client.get('/api/v1/banks');
      return response.data;
    } catch (error) {
      console.error('Kora getBanks error:', error.response?.data || error.message);
      // Return a fallback list of common Nigerian banks if API fails
      return {
        data: [
          { code: '044', name: 'Access Bank' },
          { code: '050', name: 'Ecobank Nigeria' },
          { code: '070', name: 'Fidelity Bank' },
          { code: '011', name: 'First Bank of Nigeria' },
          { code: '214', name: 'First City Monument Bank' },
          { code: '058', name: 'Guaranty Trust Bank' },
          { code: '030', name: 'Heritage Bank' },
          { code: '301', name: 'Jaiz Bank' },
          { code: '082', name: 'Keystone Bank' },
          { code: '526', name: 'Parallex Bank' },
          { code: '076', name: 'Polaris Bank' },
          { code: '101', name: 'Providus Bank' },
          { code: '221', name: 'Stanbic IBTC Bank' },
          { code: '068', name: 'Standard Chartered Bank' },
          { code: '232', name: 'Sterling Bank' },
          { code: '100', name: 'Suntrust Bank' },
          { code: '032', name: 'Union Bank of Nigeria' },
          { code: '033', name: 'United Bank For Africa' },
          { code: '215', name: 'Unity Bank' },
          { code: '035', name: 'Wema Bank' },
          { code: '057', name: 'Zenith Bank' },
        ],
      };
    }
  }
}

module.exports = new KoraService();
