import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import { Icon } from '../ui/Icon';

const FALLBACK_RATE = 1600; // NGN per $1 when live rate unavailable

interface WalletCardProps {
  ngnBalance: number;
  usdBalance: number;
  /** Live NGN per 1 USD from Kora (included in wallet balance API) */
  exchangeRate?: number | null;
}

export const WalletCard: React.FC<WalletCardProps> = ({ ngnBalance, usdBalance, exchangeRate }) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const rate = exchangeRate != null && exchangeRate > 0 ? exchangeRate : FALLBACK_RATE;
  const approxUsdFromNgn = ngnBalance > 0 ? ngnBalance / rate : 0;

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const getHiddenText = (length: number) => {
    return '•'.repeat(Math.max(8, length));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.balanceContainer}>
              <Text style={styles.label}>Total Balance</Text>
              <Text style={styles.ngnBalance}>
                {isBalanceVisible ? formatCurrency(ngnBalance, 'NGN') : `₦${getHiddenText(12)}`}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.iconContainer}
              onPress={toggleBalanceVisibility}
              activeOpacity={0.7}
            >
              <Icon 
                name={isBalanceVisible ? "eye" : "eye-off"} 
                library="ionicons" 
                size={24} 
                color={COLORS.textMuted} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.usdContainer}>
            <Text style={styles.usdBalance}>
              ≈ {isBalanceVisible ? formatCurrency(approxUsdFromNgn, 'USD') : `$${getHiddenText(8)}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>Exchange Rate</Text>
              <Text style={styles.footerValue}>₦{rate.toLocaleString()} / $1</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(77, 98, 80, 0.30)',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: SPACING.lg,
  },
  content: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  balanceContainer: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ngnBalance: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: 'rgba(77, 98, 80, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  usdBalance: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accent,
  },
  badge: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  footerValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  usdValue: {
    color: COLORS.accent,
  },
});
