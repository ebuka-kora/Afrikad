import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { apiService } from '../../services/api';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { TransactionItem } from '../../components/afrikad/TransactionItem';
import { Icon } from '../../components/ui/Icon';

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: 'success' | 'failed';
  date: string;
}

export const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions();
      if (response.success && Array.isArray(response.transactions)) {
        const normalizedTransactions: Transaction[] = response.transactions.map((tx: any) => ({
          id: String(tx._id ?? tx.id ?? ''),
          merchant: String(tx.merchantName ?? tx.description ?? '—'),
          amount: Number(tx.amount) || 0,
          currency: (tx.currency === 'USD' ? 'USD' : 'NGN') as 'NGN' | 'USD',
          status: (tx.status === 'failed' ? 'failed' : 'success') as 'success' | 'failed',
          date: tx.createdAt ? String(tx.createdAt) : '',
        }));
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

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem
      merchant={item.merchant}
      amount={item.amount}
      currency={item.currency}
      status={item.status}
      date={item.date}
    />
  );

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

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'success' && styles.filterButtonActive]}
          onPress={() => setFilter('success')}
        >
          <Text style={[styles.filterText, filter === 'success' && styles.filterTextActive]}>
            Success
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'failed' && styles.filterButtonActive]}
          onPress={() => setFilter('failed')}
        >
          <Text style={[styles.filterText, filter === 'failed' && styles.filterTextActive]}>
            Failed
          </Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  filterTextActive: {
    color: COLORS.secondary,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
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
