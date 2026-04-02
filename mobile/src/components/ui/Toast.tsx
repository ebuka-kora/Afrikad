import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { Icon } from './Icon';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const typeConfig = {
  success: {
    icon: 'checkmark-circle' as const,
    iconColor: COLORS.accent,
    stripe: 'rgba(57, 255, 20, 0.85)',
    iconBg: 'rgba(57, 255, 20, 0.12)',
  },
  error: {
    icon: 'alert-circle' as const,
    iconColor: '#FF6B6B',
    stripe: 'rgba(220, 20, 60, 0.9)',
    iconBg: 'rgba(220, 20, 60, 0.15)',
  },
  info: {
    icon: 'information-circle' as const,
    iconColor: COLORS.textSecondary,
    stripe: 'rgba(255, 255, 255, 0.35)',
    iconBg: 'rgba(255, 255, 255, 0.08)',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3800,
}) => {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const cfg = typeConfig[type];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 8,
            duration: 240,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  const bottomPad = Math.max(insets.bottom, SPACING.md) + SPACING.sm;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{ translateY }],
          paddingBottom: bottomPad,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.cardOuter}>
        <View style={[styles.card, { borderLeftColor: cfg.stripe }]}>
          <View style={[styles.iconCircle, { backgroundColor: cfg.iconBg }]}>
            <Icon name={cfg.icon} library="ionicons" size={26} color={cfg.iconColor} />
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'stretch',
  },
  cardOuter: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingLeft: SPACING.sm,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
