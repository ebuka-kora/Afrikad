/**
 * Format number with commas (e.g., 1000 -> "1,000", 1000000 -> "1,000,000")
 */
export const formatNumberWithCommas = (value: string | number): string => {
  // Remove all non-numeric characters except decimal point
  const numericString = String(value).replace(/[^\d.]/g, '');
  
  // Split by decimal point
  const parts = numericString.split('.');
  const integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Combine with decimal part if exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Parse formatted number string back to number (removes commas)
 */
export const parseFormattedNumber = (value: string): number => {
  // Remove all non-numeric characters except decimal point
  const numericString = value.replace(/[^\d.]/g, '');
  return parseFloat(numericString) || 0;
};

/**
 * Format number for display in input field (with commas, handles decimals)
 */
export const formatAmountInput = (value: string): string => {
  // If empty, return empty string
  if (!value) return '';
  
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Prevent multiple decimal points
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return formatNumberWithCommas(parts[0] + '.' + parts.slice(1).join(''));
  }
  
  return formatNumberWithCommas(cleaned);
};
