/**
 * Format currency amounts
 */
export const formatCurrency = (
  amount: number,
  currency: 'NGN' | 'USD' = 'NGN',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options || {};
  
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits,
      maximumFractionDigits,
    })}`;
  }
  
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
};
