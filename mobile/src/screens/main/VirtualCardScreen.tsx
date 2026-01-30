import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { apiService } from '../../services/api';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { Toast } from '../../components/ui/Toast';

type CardData = {
  reference: string;
  firstSix?: string;
  lastFour?: string;
  pan?: string;
  cvv?: string;
  expiryMonth?: string;
  expiryYear?: string;
  brand?: string;
  balance?: number;
  status?: string;
  holderName?: string;
};

export const VirtualCardScreen = () => {
  const router = useRouter();
  const [card, setCard] = useState<CardData | null>(null);
  const [wallet, setWallet] = useState<{ ngn: number; usd: number }>({ ngn: 0, usd: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const load = useCallback(async () => {
    try {
      const [cardRes, walletRes] = await Promise.all([
        apiService.getCard(),
        apiService.getWalletBalance(),
      ]);
      if (cardRes.success && cardRes.card) setCard(cardRes.card);
      else setCard(null);
      if (walletRes.success && walletRes.wallet) {
        setWallet(walletRes.wallet);
      }
    } catch (e) {
      setCard(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const copyNumber = async () => {
    if (!card) return;
    const num = card.pan || (card.firstSix && card.lastFour ? `${card.firstSix}••••••••${card.lastFour}` : null);
    if (!num) {
      setToast({ visible: true, message: 'Card number not available' });
      return;
    }
    await Clipboard.setStringAsync(num.replace(/\s/g, ''));
    setToast({ visible: true, message: 'Card number copied' });
  };

  const toggleFreeze = async () => {
    if (!card || freezeLoading) return;
    setFreezeLoading(true);
    try {
      const isFrozen = card.status === 'suspended';
      if (isFrozen) {
        await apiService.activateCard(card.reference);
        setToast({ visible: true, message: 'Card activated' });
      } else {
        await apiService.suspendCard(card.reference);
        setToast({ visible: true, message: 'Card frozen' });
      }
      await load();
    } catch (e: any) {
      setToast({ visible: true, message: e.message || 'Action failed' });
    } finally {
      setFreezeLoading(false);
    }
  };

  const displayNumber = card
    ? card.pan
      ? card.pan.replace(/(\d{4})/g, '$1 ').trim()
      : card.firstSix && card.lastFour
        ? `${card.firstSix} •••• •••• ${card.lastFour}`
        : '•••• •••• •••• ••••'
    : '•••• •••• •••• ••••';
  const expiry = card?.expiryMonth && card?.expiryYear
    ? `${card.expiryMonth}/${String(card.expiryYear).slice(-2)}`
    : '••/••';
  const cvv = card?.cvv ?? '•••';
  const isFrozen = card?.status === 'suspended';

  if (loading && !card) {
    return (
      <ImageBackground
        source={require('../../../assets/bgi.png')}
        style={styles.backgroundImage}
        resizeMode="center"
        imageStyle={styles.imageStyle}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <Text style={styles.placeholderText}>Loading…</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!card) {
    return (
      <ImageBackground
        source={require('../../../assets/bgi.png')}
        style={styles.backgroundImage}
        resizeMode="center"
        imageStyle={styles.imageStyle}
      >
        <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.placeholder} />
            <Text style={styles.title}>Virtual Card</Text>
            <View style={styles.placeholder} />
          </View>
          <Card style={styles.emptyCard}>
            <Icon name="card-outline" library="ionicons" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No virtual card yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete KYC to get a USD virtual card. Use it to pay for Netflix, AWS, and more.
            </Text>
            <Button
              title="Get your virtual card"
              onPress={() => router.push('/(tabs)/kyc-card')}
              fullWidth
              style={styles.ctaButton}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
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
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.title}>Virtual Card</Text>
          <View style={styles.placeholder} />
        </View>

        <Card style={styles.cardContainer}>
          <View style={[styles.card, isFrozen && styles.cardFrozen]}>
            {isFrozen && (
              <View style={styles.frozenBadge}>
                <Icon name="lock-closed" library="ionicons" size={14} color={COLORS.text} />
                <Text style={styles.frozenBadgeText}>Frozen</Text>
              </View>
            )}
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>USD Balance</Text>
              <Icon name="card" library="ionicons" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.cardBalance}>{formatCurrency(wallet.usd ?? 0, 'USD')}</Text>
            <View style={styles.cardNumberContainer}>
              <Text style={styles.cardNumber}>{displayNumber}</Text>
            </View>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>Expires</Text>
                <Text style={styles.cardValue}>{expiry}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>CVV</Text>
                <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                  <Text style={styles.cardValue}>{showCvv ? cvv : '•••'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={copyNumber}>
            <Icon name="copy-outline" library="ionicons" size={24} color={COLORS.accent} />
            <Text style={styles.actionText}>Copy Card Number</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleFreeze}
            disabled={freezeLoading}
          >
            <Icon
              name={isFrozen ? 'lock-open-outline' : 'lock-closed-outline'}
              library="ionicons"
              size={24}
              color={COLORS.accent}
            />
            <Text style={styles.actionText}>{isFrozen ? 'Unfreeze' : 'Freeze'} Card</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Card Information</Text>
          <Text style={styles.infoText}>
            Use this virtual USD card to pay globally. Funds are converted from your NGN wallet when you pay.
          </Text>
        </Card>
      </ScrollView>

      {toast.visible && (
        <Toast
          message={toast.message}
          type="info"
          visible
          onHide={() => setToast({ visible: false, message: '' })}
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
  container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  scrollView: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: FONT_SIZES.md, color: COLORS.textMuted },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  placeholder: { width: 40 },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginTop: SPACING.md },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  ctaButton: { alignSelf: 'stretch' },
  cardContainer: { marginBottom: SPACING.xl, padding: 0, overflow: 'hidden' },
  card: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardFrozen: { opacity: 0.85 },
  frozenBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  frozenBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: FONT_SIZES.sm, color: 'rgba(255, 255, 255, 0.8)', marginBottom: SPACING.xs },
  cardBalance: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginVertical: SPACING.md,
  },
  cardNumberContainer: { marginVertical: SPACING.lg },
  cardNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    letterSpacing: 2,
  },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardValue: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },
  actions: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  infoCard: { marginBottom: SPACING.lg },
  infoTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text, marginBottom: SPACING.sm },
  infoText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
});
