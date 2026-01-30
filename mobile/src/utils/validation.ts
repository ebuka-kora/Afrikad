/**
 * Validation helpers
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation (can be customized)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

export const validateOTP = (otp: string): boolean => {
  return /^\d{4,6}$/.test(otp);
};

export const validateAmount = (amount: number | string): { valid: boolean; message?: string } => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, message: 'Please enter a valid amount' };
  }
  return { valid: true };
};
