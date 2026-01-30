import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return SPACING.sm;
      case 'md':
        return SPACING.md;
      case 'lg':
        return SPACING.lg;
      default:
        return SPACING.md;
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.lg,
      padding: getPadding(),
    };

    switch (variant) {
      case 'default':
        return { 
          ...baseStyle, 
          backgroundColor: 'rgba(77, 98, 80, 0.30)',
          borderWidth: 1,
          borderColor: 'rgba(77, 98, 80, 0.30)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(77, 98, 80, 0.30)',
          borderWidth: 1.5,
          borderColor: 'rgba(77, 98, 80, 0.30)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(77, 98, 80, 0.30)',
          borderWidth: 1,
          borderColor: 'rgba(77, 98, 80, 0.30)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        };
      default:
        return baseStyle;
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
