import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { Icon } from '../ui/Icon';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import {
  type NormalizedTxStatus,
  type TransactionSource,
  transactionAmountColor,
  transactionAmountPrefix,
} from '../../utils/transactionDisplay';

interface TransactionItemProps {
  merchant: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: NormalizedTxStatus;
  date: string;
  /** Wallet (NGN wallet / non-card rails) vs card payment */
  source: TransactionSource;
  /** Backend type: deposit → + on success, etc. */
  txType: string;
  onPress?: () => void;
}

function statusIcon(status: NormalizedTxStatus): { name: string; color: string } {
  if (status === 'failed') return { name: 'close-circle', color: COLORS.error };
  if (status === 'pending') return { name: 'time-outline', color: COLORS.warning };
  return { name: 'checkmark-circle', color: COLORS.accent };
}

function statusIconStyle(status: NormalizedTxStatus) {
  if (status === 'failed') return styles.iconFailed;
  if (status === 'pending') return styles.iconPending;
  return styles.iconSuccess;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  merchant,
  amount,
  currency,
  status,
  date,
  source,
  txType,
  onPress,
}) => {
  const si = statusIcon(status);
  const sourceLabel = source === 'card' ? 'Card' : 'Wallet';
  const prefix = transactionAmountPrefix(status, txType);
  const amountColor = transactionAmountColor(status, txType);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, statusIconStyle(status)]}>
          <Icon name={si.name} library="ionicons" size={22} color={si.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.merchant} numberOfLines={3}>
            {merchant}
          </Text>
          <View style={styles.sourceRow}>
            <Icon
              name={source === 'card' ? 'card-outline' : 'wallet-outline'}
              library="ionicons"
              size={14}
              color={COLORS.textMuted}
            />
            <Text style={styles.sourceText}>{sourceLabel}</Text>
            <Text style={styles.sourceDot}>·</Text>
            <Text style={styles.date}>{formatDate(date)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}
          {formatCurrency(amount, currency)}
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
    alignItems: 'flex-start',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
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
  iconPending: {
    backgroundColor: 'rgba(255, 165, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.25)',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  merchant: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  sourceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  sourceDot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  rightSection: {
    alignItems: 'flex-end',
    paddingLeft: SPACING.sm,
    minWidth: 88,
  },
  amount: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  status: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
});
