import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { Icon } from '../ui/Icon';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface TransactionItemProps {
  merchant: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: 'success' | 'failed';
  date: string;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  merchant,
  amount,
  currency,
  status,
  date,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            status === 'success' ? styles.iconSuccess : styles.iconFailed,
          ]}
        >
          <Icon
            name={status === 'success' ? 'checkmark-circle' : 'close-circle'}
            library="ionicons"
            size={20}
            color={status === 'success' ? COLORS.accent : COLORS.error}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.merchant}>{merchant}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            status === 'failed' && styles.amountFailed,
          ]}
        >
          -{formatCurrency(amount, currency)}
        </Text>
        <Text style={styles.status}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.3)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(77, 98, 80, 0.30)',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  iconSuccess: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  iconFailed: {
    backgroundColor: 'rgba(220, 20, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  merchant: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  amountFailed: {
    color: COLORS.error,
  },
  status: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
});
