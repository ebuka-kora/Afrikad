import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING, TOUCH_TARGET } from '../../constants/theme';
import { Icon } from '../ui/Icon';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <Icon name={icon} library="ionicons" size={20} color={COLORS.accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(77, 98, 80, 0.30)',
    minHeight: TOUCH_TARGET * 1.5,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: 'rgba(77, 98, 80, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
