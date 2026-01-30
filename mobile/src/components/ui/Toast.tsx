import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      default:
        return COLORS.surface;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, backgroundColor: getBackgroundColor() },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    fontWeight: '500',
  },
});
