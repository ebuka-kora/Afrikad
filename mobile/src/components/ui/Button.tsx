import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, TOUCH_TARGET } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      minHeight: TOUCH_TARGET,
      borderRadius: BORDER_RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 24 : 20,
      paddingVertical: size === 'sm' ? 10 : size === 'lg' ? 16 : 12,
      opacity: disabled || loading ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return { 
          ...baseStyle, 
          backgroundColor: COLORS.accent,
          shadowColor: COLORS.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 5,
        };
      case 'secondary':
        return { 
          ...baseStyle, 
          backgroundColor: 'rgba(220, 20, 60, 0.20)',
          borderWidth: 1,
          borderColor: 'rgba(220, 20, 60, 0.15)',
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'ghost':
        return { 
          ...baseStyle, 
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'sm' ? FONT_SIZES.sm : size === 'lg' ? FONT_SIZES.lg : FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.semibold,
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, color: COLORS.secondary };
      case 'secondary':
        return { ...baseStyle, color: COLORS.text };
      case 'outline':
      case 'ghost':
        return { ...baseStyle, color: COLORS.text };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        fullWidth && { width: '100%' },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.secondary : COLORS.text}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
