import { validateEmail, validatePassword, validateAmount, validatePhone, validateOTP } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for passwords with 6+ characters', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for passwords with less than 6 characters', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('6 characters');
    });
  });

  describe('validateAmount', () => {
    it('should return valid for positive numbers', () => {
      expect(validateAmount(100).valid).toBe(true);
      expect(validateAmount(0.01).valid).toBe(true);
      expect(validateAmount('100').valid).toBe(true);
    });

    it('should return invalid for zero or negative amounts', () => {
      expect(validateAmount(0).valid).toBe(false);
      expect(validateAmount(-10).valid).toBe(false);
      expect(validateAmount('0').valid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(validatePhone('+2348012345678')).toBe(true);
      expect(validatePhone('+1 234 567 8900')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
    });
  });

  describe('validateOTP', () => {
    it('should return true for valid OTP codes', () => {
      expect(validateOTP('1234')).toBe(true);
      expect(validateOTP('123456')).toBe(true);
    });

    it('should return false for invalid OTP codes', () => {
      expect(validateOTP('123')).toBe(false);
      expect(validateOTP('abc')).toBe(false);
      expect(validateOTP('12345')).toBe(false);
    });
  });
});
