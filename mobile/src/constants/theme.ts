// Brand Colors
export const COLORS = {
  primary: '#DC143C', // Red
  secondary: '#000000', // Black
  accent: '#39FF14', // Neon Green
  background: '#000000',
  surface: '#151515',
  surfaceLight: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#999999',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  /** Container/card background and gradient */
  container: 'rgba(77, 98, 80, 0.30)',
  containerGradient: ['rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)'] as [string, string, string],
  success: '#39FF14',
  error: '#DC143C',
  warning: '#FFA500',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 42,
};

export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Touch Targets (minimum 44x44 for accessibility)
export const TOUCH_TARGET = 44;
