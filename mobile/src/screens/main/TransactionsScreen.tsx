import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Platform,
} from 'react-native';
import { apiService } from '../../services/api';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { TransactionItem } from '../../components/afrikad/TransactionItem';
import { Icon } from '../../components/ui/Icon';
import type { NormalizedTransaction } from '../../utils/transactionDisplay';
import { normalizeTransactionRow } from '../../utils/transactionDisplay';

type StatusFilter = 'all' | 'success' | 'failed' | 'pending';

export const TransactionsScreen = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions();
      if (response.success && Array.isArray(response.transactions)) {
        const normalizedTransactions = response.transactions.map((tx: any) => normalizeTransactionRow(tx));
        setTransactions(normalizedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  const renderTransaction = ({ item }: { item: NormalizedTransaction }) => (
    <TransactionItem
      merchant={item.merchant}
      amount={item.amount}
      currency={item.currency}
      status={item.status}
      date={item.date}
      source={item.source}
      txType={item.type}
      onPress={() => router.push(`/(tabs)/transaction/${encodeURIComponent(item.id)}`)}
    />
  );

  const filterChips: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'success', label: 'Success' },
    { key: 'failed', label: 'Failed' },
    { key: 'pending', label: 'Pending' },
  ];

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.title}>Transactions</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.filtersWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
            style={styles.filtersScrollOuter}
            bounces={false}
          >
            {filterChips.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.filterButton, filter === key && styles.filterButtonActive]}
                onPress={() => setFilter(key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="document-outline" library="ionicons" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
              </View>
            }
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
    /** Darker scrim so list sits on calmer surface (background image is less distracting). */
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  filtersWrap: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  /** Min height so labels are never vertically clipped inside the scroll row. */
  filtersScrollOuter: {
    flexGrow: 0,
    minHeight: 48,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    alignItems: 'center',
    minHeight: 48,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      android: { overflow: 'visible' as const },
    }),
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
  filterTextActive: {
    color: COLORS.secondary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
