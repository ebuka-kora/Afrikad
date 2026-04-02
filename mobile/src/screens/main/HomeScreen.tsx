import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ImageBackground, Image, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { getReadNotificationIds, pruneReadNotificationIds } from '../../utils/notificationReadState';
import { getNotificationIdsFromTransactions } from '../../utils/notificationsFromTransactions';
import { normalizeTransactionRow, type NormalizedTransaction } from '../../utils/transactionDisplay';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { WalletCard } from '../../components/afrikad/WalletCard';
import { DepositWithdrawalCard } from '../../components/afrikad/DepositWithdrawalCard';
import { TransactionItem } from '../../components/afrikad/TransactionItem';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Toast } from '../../components/ui/Toast';

export const HomeScreen = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext)!;
  const [ngnBalance, setNgnBalance] = useState(0);
  const [usdBalance, setUsdBalance] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh wallet and transactions when screen gains focus (e.g., returning from Fund Wallet after deposit)
  useFocusEffect(
    React.useCallback(() => {
      loadData(false);
      loadUnreadNotificationCount();
    }, [])
  );

  const loadUnreadNotificationCount = async () => {
    try {
      const response = await apiService.getTransactions();
      if (response.success && Array.isArray(response.transactions) && response.transactions.length > 0) {
        const txs = response.transactions;
        const ids = getNotificationIdsFromTransactions(txs);
        await pruneReadNotificationIds(ids);
        const readIds = await getReadNotificationIds();
        const unreadCount = ids.filter((id) => !readIds.includes(id)).length;
        setUnreadNotificationCount(unreadCount);
      } else {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error loading unread notification count:', error);
      setUnreadNotificationCount(0);
    }
  };

  const loadData = async (showError = true) => {
    try {
      setLoading(true);
      setError('');
      const [walletResponse, transactionsResponse] = await Promise.all([
        apiService.getWalletBalance(),
        apiService.getTransactions(),
      ]);
      
      if (walletResponse.success) {
        setNgnBalance(walletResponse.wallet.ngn || 0);
        setUsdBalance(walletResponse.wallet.usd || 0);
        setExchangeRate(walletResponse.exchangeRate != null ? walletResponse.exchangeRate : null);
      } else if (showError) {
        setError('Failed to load wallet balance');
        setShowToast(true);
      }
      
      if (transactionsResponse.success && Array.isArray(transactionsResponse.transactions)) {
        const normalizedTransactions = transactionsResponse.transactions
          .slice(0, 4)
          .map((tx: any) => normalizeTransactionRow(tx));
        setTransactions(normalizedTransactions);
        
        // Calculate unread notification count
        await loadUnreadNotificationCount();
      } else if (showError) {
        setError('Failed to load transactions');
        setShowToast(true);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      if (showError) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to load data. Pull to retry.';
        setError(errorMsg);
        setShowToast(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false); // Don't show error toast on pull-to-refresh
  };

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
        >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              Afri<Text style={styles.logoAccent}>KAD</Text>
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <Icon name="notifications-outline" library="ionicons" size={20} color={COLORS.textMuted} />
              {unreadNotificationCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotificationCount > 99 ? '99+' : String(unreadNotificationCount)}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconButton,
                user?.profileImage ? styles.profileButtonWithImage : styles.profileButton,
                styles.profileHeaderHit,
              ]}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.85}
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.headerProfileImage} />
              ) : (
                <Icon name="person" library="ionicons" size={22} color={COLORS.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Hi, {user?.username || 'User'}</Text>
          <Text style={styles.greetingSubtext}>Welcome back</Text>
        </View>

        {/* Wallet Card (live NGN/USD rate from Kora when available) */}
        <WalletCard ngnBalance={ngnBalance} usdBalance={usdBalance} exchangeRate={exchangeRate} />

        {/* Deposit & Withdrawal Card */}
        <DepositWithdrawalCard />

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              merchant={transaction.merchant}
              amount={transaction.amount}
              currency={transaction.currency}
              status={transaction.status}
              date={transaction.date}
              source={transaction.source}
              txType={transaction.type}
              onPress={() => router.push(`/(tabs)/transaction/${encodeURIComponent(transaction.id)}`)}
            />
          ))}
        </View>
      </ScrollView>

      {showToast && (
        <Toast
          message={error}
          type="error"
          visible={showToast}
          onHide={() => setShowToast(false)}
        />
      )}
    </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageStyle: {
    width: '107%',
    height: '110%',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  logo: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
  /** Slightly larger than other header icons so the profile photo reads clearly */
  profileHeaderHit: {
    width: 50,
    height: 58,
    borderRadius: 100,
  },
  profileButtonWithImage: {
    backgroundColor: 'transparent',
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  headerProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accent,
  },
  greeting: {
    marginBottom: SPACING.lg,
  },
  greetingText: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  greetingSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  rateCard: {
    marginBottom: SPACING.lg,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  rateValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  rateRight: {
    alignItems: 'flex-end',
  },
  feeValue: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xl,
  },
  viewAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
  },
});
