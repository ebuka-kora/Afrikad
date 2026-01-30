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
  Modal,
  FlatList,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Toast } from '../../components/ui/Toast';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatAmountInput, parseFormattedNumber } from '../../utils/formatNumber';

interface Bank {
  code: string;
  name: string;
}

const quickAmounts = [5000, 10000, 25000, 50000];

export const WithdrawScreen = () => {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [wallet, setWallet] = useState<{ ngn: number; usd: number }>({ ngn: 0, usd: 0 });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

  useEffect(() => {
    loadWallet();
    loadBanks();
  }, []);

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

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await apiService.getBanks();
      if (response.success && Array.isArray(response.banks)) {
        setBanks(response.banks);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
      showToast('Failed to load banks. Please try again.', 'error');
    } finally {
      setLoadingBanks(false);
    }
  };

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
  };

  const handleWithdraw = async () => {
    const amountNum = parseFormattedNumber(amount);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (amountNum < 100) {
      showToast('Minimum withdrawal amount is ₦100', 'error');
      return;
    }

    if (wallet.ngn < amountNum) {
      showToast('Insufficient balance', 'error');
      return;
    }

    if (!accountNumber || accountNumber.trim().length < 10) {
      showToast('Please enter a valid account number', 'error');
      return;
    }

    if (!selectedBank || !selectedBank.code) {
      showToast('Please select a bank', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.withdraw(
        amountNum,
        accountNumber.trim(),
        selectedBank.code,
        selectedBank.name
      );

      if (response.success) {
        showToast('Withdrawal initiated successfully!', 'success');
        
        // Update wallet balance
        if (response.wallet) {
          setWallet(response.wallet);
        }

        // Clear form
        setAmount('');
        setAccountNumber('');
        setSelectedBank(null);

        // Navigate back after a delay
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        showToast(response.message || 'Withdrawal failed. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      showToast(error.response?.data?.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setShowBankPicker(false);
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
          <Text style={styles.title}>Withdraw Funds</Text>
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

          {/* Withdrawal Form */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Withdrawal Details</Text>

            <Input
              label="Amount (NGN)"
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
                  <Text style={styles.quickAmountText}>₦{quickAmount.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Account Number"
              placeholder="Enter account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Bank Selection */}
            <View style={styles.bankSelector}>
              <Text style={styles.inputLabel}>Bank</Text>
              <TouchableOpacity
                style={styles.bankButton}
                onPress={() => setShowBankPicker(true)}
                disabled={loadingBanks}
              >
                <Text style={[styles.bankButtonText, !selectedBank && styles.bankButtonPlaceholder]}>
                  {selectedBank ? selectedBank.name : 'Select Bank'}
                </Text>
                <Icon name="chevron-down" library="ionicons" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Button
              title="Withdraw"
              onPress={handleWithdraw}
              loading={loading}
              fullWidth
              style={styles.submitButton}
              disabled={
                !amount ||
                isNaN(parseFormattedNumber(amount)) ||
                parseFormattedNumber(amount) <= 0 ||
                !accountNumber ||
                !selectedBank
              }
            />
          </Card>

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <Icon name="information-circle-outline" library="ionicons" size={20} color={COLORS.accent} />
            <Text style={styles.infoText}>
              Withdrawals are processed to your selected bank account. Processing time is typically 1-3 business days.
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bank Picker Modal */}
      <Modal
        visible={showBankPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <Icon name="close" library="ionicons" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={banks}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => selectBank(item)}
                >
                  <Text style={styles.bankItemName}>{item.name}</Text>
                  {selectedBank?.code === item.code && (
                    <Icon name="checkmark" library="ionicons" size={20} color={COLORS.accent} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyBanks}>
                  <Text style={styles.emptyBanksText}>
                    {loadingBanks ? 'Loading banks...' : 'No banks available'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

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
  bankSelector: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bankButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bankButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  bankButtonPlaceholder: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
    paddingTop: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  bankItemName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  emptyBanks: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyBanksText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
});
