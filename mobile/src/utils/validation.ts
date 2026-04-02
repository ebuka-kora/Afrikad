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

/** Letters, numbers, underscores; 3–30 chars (trimmed). */
export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  const t = username.trim();
  if (t.length < 3 || t.length > 30) {
    return { valid: false, message: 'Username must be 3–30 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(t)) {
    return { valid: false, message: 'Username can only use letters, numbers, and underscores' };
  }
  return { valid: true };
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
