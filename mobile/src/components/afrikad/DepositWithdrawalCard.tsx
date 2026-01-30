import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { Icon } from '../ui/Icon';

export const DepositWithdrawalCard: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.actionsRow}>
            {/* Deposit Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/fund-wallet')}
              activeOpacity={0.8}
            >
              {/* <View style={[styles.iconContainer, styles.depositIcon]}>
                <Icon name="add" library="ionicons" size={24} color={COLORS.accent} />
              </View> */}
              <Text style={styles.actionLabel}>Deposit</Text>
            </TouchableOpacity>

            {/* Withdrawal Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/withdraw')}
              activeOpacity={0.8}
            >
              {/* <View style={[styles.iconContainer, styles.withdrawIcon]}>
                <Icon name="remove" library="ionicons" size={24} color={COLORS.primary} />
              </View> */}
              <Text style={styles.actionLabel}>Withdraw</Text>

            </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: SPACING.lg,
  },
  content: {
    position: 'relative',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(77, 98, 80, 0.30)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  depositIcon: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  withdrawIcon: {
    backgroundColor: 'rgba(220, 20, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  actionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actionSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
