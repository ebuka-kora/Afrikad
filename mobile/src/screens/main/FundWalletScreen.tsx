import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { apiService } from '../../services/api';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { validateAmount } from '../../utils/validation';
import { Toast } from '../../components/ui/Toast';

const quickAmounts = [5000, 10000, 25000, 50000];
const DEPOSIT_POLL_INTERVAL_MS = 6000;

interface BankAccount {
  account_number: string;
  bank_name: string;
  bank_code: string;
  account_name: string;
}

export type DepositStatus = 'pending' | 'completed' | 'failed';

export const FundWalletScreen = () => {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null);
  const [creditedAmount, setCreditedAmount] = useState<number | null>(null);
  const [walletBalanceNgn, setWalletBalanceNgn] = useState<number | null>(null);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoNavigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const depositStatusRef = useRef<DepositStatus | null>(null);
  depositStatusRef.current = depositStatus;

  // Poll for deposit status when user clicks Done and we're waiting
  useEffect(() => {
    if (!waitingForPayment || !reference) return;
    if (depositStatus === 'completed' || depositStatus === 'failed') {
      // Show success/rejected, then after 2 seconds take user back to home (before any reset)
      autoNavigateTimeoutRef.current = setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
      return () => {
        if (autoNavigateTimeoutRef.current) clearTimeout(autoNavigateTimeoutRef.current);
      };
    }

    const checkStatus = async () => {
      try {
        const res = await apiService.getTransactions();
        if (!res.success || !Array.isArray(res.transactions)) return;
        const tx = res.transactions.find(
          (t: any) => (t.paymentReference === reference || t.reference === reference)
        );
        if (!tx) return;
        if (tx.status === 'completed') {
          setDepositStatus('completed');
          setCreditedAmount(tx.amount != null ? tx.amount : expectedAmount ?? 0);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          const balanceRes = await apiService.getWalletBalance();
          if (balanceRes.success && balanceRes.wallet?.ngn != null) {
            setWalletBalanceNgn(balanceRes.wallet.ngn);
          }
        } else if (tx.status === 'failed') {
          setDepositStatus('failed');
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (_) {
        // ignore poll errors
      }
    };

    pollRef.current = setInterval(checkStatus, DEPOSIT_POLL_INTERVAL_MS);
    checkStatus(); // run once immediately
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (autoNavigateTimeoutRef.current) clearTimeout(autoNavigateTimeoutRef.current);
    };
  }, [waitingForPayment, reference, depositStatus, expectedAmount, router]);

  // Reset only when user opens Deposit again *after* having been taken back to home (so they see success/rejected first, then home, then fresh form)
  useFocusEffect(
    useCallback(() => {
      const status = depositStatusRef.current;
      if (status === 'completed' || status === 'failed') {
        setBankAccount(null);
        setExpectedAmount(null);
        setReference(null);
        setDepositStatus(null);
        setCreditedAmount(null);
        setWalletBalanceNgn(null);
        setWaitingForPayment(false);
        setAmount('');
        setError('');
      }
      return () => {};
    }, [])
  );

  const handleFund = async () => {
    const amountNum = parseFloat(amount);
    const validation = validateAmount(amountNum);
    
    if (!validation.valid) {
      setError(validation.message || 'Invalid amount');
      setToastMessage(validation.message || 'Invalid amount');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');
    setBankAccount(null);
    setExpectedAmount(null);
    setReference(null);
    setDepositStatus(null);
    setCreditedAmount(null);
    setWalletBalanceNgn(null);
    setWaitingForPayment(false);

    try {
      const response = await apiService.depositBankTransfer(amountNum);
      if (response.success) {
        setBankAccount(response.bankAccount);
        setExpectedAmount(response.expectedAmount || amountNum);
        setReference(response.reference || null);
        setDepositStatus('pending');
        setToastMessage('Bank account generated. Transfer the exact amount to complete your deposit.');
        setToastType('success');
        setShowToast(true);
      } else {
        setError(response.message || 'Deposit failed');
        setToastMessage(response.message || 'Deposit failed');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
      setToastMessage(err.message || 'Deposit failed');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    setToastMessage(`${label} copied to clipboard`);
    setToastType('success');
    setShowToast(true);
  };

  const selectQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleDone = () => {
    // Start waiting and polling for payment status
    setWaitingForPayment(true);
    setDepositStatus(null);
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
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Fund Wallet</Text>
            <View style={styles.placeholder} />
          </View>

          {waitingForPayment ? (
            <>
              <Card style={styles.card}>
                <View style={styles.waitingContainer}>
                  {depositStatus === 'completed' ? (
                    <>
                      <View style={[styles.statusIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                        <Icon name="checkmark-circle" library="ionicons" size={64} color="#22c55e" />
                      </View>
                      <Text style={styles.statusTitle}>Deposit Successful</Text>
                      <Text style={styles.statusSubtitle}>
                        ₦{(creditedAmount ?? expectedAmount ?? 0).toLocaleString()} has been credited to your wallet.
                      </Text>
                      {walletBalanceNgn != null && (
                        <Text style={styles.balanceText}>
                          New balance: <Text style={styles.amountHighlight}>₦{walletBalanceNgn.toLocaleString()}</Text>
                        </Text>
                      )}
                    </>
                  ) : depositStatus === 'failed' ? (
                    <>
                      <View style={[styles.statusIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                        <Icon name="close-circle" library="ionicons" size={64} color="#ef4444" />
                      </View>
                      <Text style={styles.statusTitle}>Deposit Rejected</Text>
                      <Text style={styles.statusSubtitle}>
                        The transfer could not be completed. Please try again or contact support.
                      </Text>
                    </>
                  ) : (
                    <>
                      <ActivityIndicator size="large" color={COLORS.accent} />
                      <Text style={styles.statusTitle}>Waiting for Payment</Text>
                      <Text style={styles.statusSubtitle}>
                        Please wait while we confirm your deposit...
                      </Text>
                    </>
                  )}
                </View>
              </Card>
            </>
          ) : !bankAccount ? (
            <>
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Add Funds via Bank Transfer</Text>
                <Text style={styles.cardSubtitle}>Enter amount to add to your NGN wallet</Text>

                <Input
                  label="Amount (NGN)"
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  leftIcon={<Text style={styles.currencySymbol}>₦</Text>}
                />

                <View style={styles.quickAmounts}>
                  <Text style={styles.quickLabel}>Quick Amounts</Text>
                  <View style={styles.quickButtons}>
                    {quickAmounts.map((quickAmount) => (
                      <TouchableOpacity
                        key={quickAmount}
                        style={styles.quickButton}
                        onPress={() => selectQuickAmount(quickAmount)}
                      >
                        <Text style={styles.quickButtonText}>
                          {quickAmount.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Button
                  title="Generate Bank Account"
                  onPress={handleFund}
                  loading={loading}
                  fullWidth
                  style={styles.fundButton}
                />
              </Card>

              <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Icon name="information-circle-outline" library="ionicons" size={20} color={COLORS.accent} />
                  <Text style={styles.infoText}>
                    A unique bank account will be generated for this transaction. Transfer the exact amount to complete your deposit.
                  </Text>
                </View>
              </Card>
            </>
          ) : (
            <>
              <Card style={styles.card}>
                <View style={styles.successHeader}>
                  <View style={styles.successIcon}>
                    <Icon name="checkmark-circle" library="ionicons" size={48} color={COLORS.accent} />
                  </View>
                  <Text style={styles.successTitle}>Bank Account Generated</Text>
                  <Text style={styles.successSubtitle}>
                    Transfer exactly <Text style={styles.amountHighlight}>₦{expectedAmount?.toLocaleString()}</Text> to the account below
                  </Text>
                </View>

                <View style={styles.bankAccountCard}>
                  <View style={styles.bankAccountRow}>
                    <View style={styles.bankAccountLabel}>
                      <Text style={styles.bankAccountLabelText}>Account Number</Text>
                    </View>
                    <View style={styles.bankAccountValue}>
                      <Text style={styles.bankAccountValueText}>{bankAccount.account_number}</Text>
                      <TouchableOpacity
                        onPress={() => copyToClipboard(bankAccount.account_number, 'Account number')}
                        style={styles.copyButton}
                      >
                        <Icon name="copy-outline" library="ionicons" size={18} color={COLORS.accent} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.bankAccountRow}>
                    <Text style={styles.bankAccountLabelText}>Account Name</Text>
                    <Text style={styles.bankAccountValueText}>{bankAccount.account_name}</Text>
                  </View>

                  <View style={styles.bankAccountRow}>
                    <Text style={styles.bankAccountLabelText}>Bank</Text>
                    <Text style={styles.bankAccountValueText}>
                      {bankAccount.bank_name.charAt(0).toUpperCase() + bankAccount.bank_name.slice(1)} Bank
                    </Text>
                  </View>

                  {reference && (
                    <View style={styles.bankAccountRow}>
                      <Text style={styles.bankAccountLabelText}>Reference</Text>
                      <Text style={styles.bankAccountValueTextSmall}>{reference}</Text>
                    </View>
                  )}
                </View>

                <Button
                  title="Done"
                  onPress={handleDone}
                  fullWidth
                  style={styles.doneButton}
                />
              </Card>

              <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Icon name="time-outline" library="ionicons" size={20} color={COLORS.accent} />
                  <Text style={styles.infoText}>
                    Your wallet will be credited automatically once the transfer is confirmed. This usually takes 1-2 minutes.
                  </Text>
                </View>
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  quickAmounts: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickButton: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  fundButton: {
    marginTop: SPACING.md,
  },
  doneButton: {
    marginTop: SPACING.lg,
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  balanceText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  pollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  pollingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  amountHighlight: {
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.bold,
  },
  bankAccountCard: {
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bankAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bankAccountLabel: {
    flex: 1,
  },
  bankAccountLabelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  bankAccountValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
    justifyContent: 'flex-end',
  },
  bankAccountValueText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  bankAccountValueTextSmall: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  copyButton: {
    padding: SPACING.xs,
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    minHeight: 300,
    justifyContent: 'center',
  },
  statusIcon: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 50,
  },
  statusTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statusSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});
