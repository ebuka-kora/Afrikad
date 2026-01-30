import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Toast } from '../../components/ui/Toast';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatAmountInput, parseFormattedNumber } from '../../utils/formatNumber';

const quickAmounts = [10, 25, 50, 100];

export const PaymentScreen = () => {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quote, setQuote] = useState<{
    amountUsd: number;
    rate: number;
    baseAmountNgn: number;
    fee: number;
    totalAmountNgn: number;
  } | null>(null);
  const [wallet, setWallet] = useState<{ ngn: number; usd: number }>({ ngn: 0, usd: 0 });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

  useEffect(() => {
    loadWallet();
  }, []);

  // Calculate estimated NGN when amount changes
  useEffect(() => {
    const amountUsd = parseFormattedNumber(amount);
    if (amountUsd > 0) {
      fetchQuote(amountUsd);
    } else {
      setQuote(null);
    }
  }, [amount]);

  const loadWallet = async () => {
    try {
      const response = await apiService.getWalletBalance();
      if (response.success && response.wallet) {
        setWallet(response.wallet);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const fetchQuote = async (amountUsd: number) => {
    if (amountUsd <= 0) {
      setQuote(null);
      return;
    }

    setLoadingQuote(true);
    try {
      const response = await apiService.getFxQuote(amountUsd);
      if (response.success && response.quote) {
        setQuote(response.quote);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Don't show error toast for quote failures, just don't show quote
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
  };

  const handlePayment = async () => {
    const amountUsd = parseFormattedNumber(amount);

    if (!amount || isNaN(amountUsd) || amountUsd <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (amountUsd < 0.01) {
      showToast('Minimum payment amount is $0.01', 'error');
      return;
    }

    if (!quote) {
      showToast('Please wait for exchange rate calculation', 'error');
      return;
    }

    if (wallet.ngn < quote.totalAmountNgn) {
      showToast('Insufficient balance', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.makePayment(amountUsd, merchantName || undefined);

      if (response.success) {
        showToast('Payment processed successfully!', 'success');
        
        // Update wallet balance
        if (response.wallet) {
          setWallet(response.wallet);
        }

        // Clear form
        setAmount('');
        setMerchantName('');

        // Navigate back after a delay
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        showToast(response.message || 'Payment failed. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      showToast(error.response?.data?.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Make Payment</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Wallet Balance */}
            <Card style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(wallet.ngn, 'NGN')}</Text>
            </Card>

            {/* Payment Form */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Payment Details</Text>

              <Input
                label="Amount (USD)"
                placeholder="0.00"
                value={amount}
                onChangeText={(text) => setAmount(formatAmountInput(text))}
                keyboardType="decimal-pad"
                autoFocus
              />

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={styles.quickAmountButton}
                    onPress={() => setAmount(formatAmountInput(quickAmount.toString()))}
                  >
                    <Text style={styles.quickAmountText}>${quickAmount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Merchant Name (Optional)"
                placeholder="e.g., Netflix, Amazon"
                value={merchantName}
                onChangeText={setMerchantName}
                style={styles.merchantInput}
              />

              {/* Conversion Info */}
              {quote && (
                <Card style={styles.conversionInfo}>
                  <View style={styles.conversionRow}>
                    <Text style={styles.conversionLabel}>Exchange Rate:</Text>
                    <Text style={styles.conversionValue}>₦{quote.rate.toLocaleString()} = $1</Text>
                  </View>
                  <View style={styles.conversionRow}>
                    <Text style={styles.conversionLabel}>Base Amount:</Text>
                    <Text style={styles.conversionValue}>{formatCurrency(quote.baseAmountNgn, 'NGN')}</Text>
                  </View>
                  <View style={styles.conversionRow}>
                    <Text style={styles.conversionLabel}>Fee:</Text>
                    <Text style={styles.conversionValue}>{formatCurrency(quote.fee, 'NGN')}</Text>
                  </View>
                  <View style={[styles.conversionRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total to Pay:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(quote.totalAmountNgn, 'NGN')}</Text>
                  </View>
                </Card>
              )}

              {loadingQuote && (
                <View style={styles.loadingQuote}>
                  <Text style={styles.loadingQuoteText}>Calculating exchange rate...</Text>
                </View>
              )}

              <Button
                title="Make Payment"
                onPress={handlePayment}
                loading={loading}
                fullWidth
                style={styles.submitButton}
                disabled={
                  !amount ||
                  isNaN(parseFormattedNumber(amount)) ||
                  parseFormattedNumber(amount) <= 0 ||
                  !quote ||
                  loadingQuote
                }
              />
            </Card>

            {/* Info Card */}
            <Card style={styles.infoCard}>
              <Icon name="information-circle-outline" library="ionicons" size={20} color={COLORS.accent} />
              <Text style={styles.infoText}>
                Payments are processed instantly. Your NGN balance will be converted to USD at the current exchange rate.
              </Text>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>

        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            visible
            onHide={() => setToast({ visible: false, message: '', type: 'info' })}
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  balanceCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  formCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  formTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accent,
  },
  merchantInput: {
    marginBottom: SPACING.md,
  },
  conversionInfo: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conversionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  conversionValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  totalRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accent,
  },
  loadingQuote: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  loadingQuoteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
