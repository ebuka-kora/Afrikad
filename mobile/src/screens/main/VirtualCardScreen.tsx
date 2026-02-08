import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/api';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { Toast } from '../../components/ui/Toast';

const CARD_ASPECT_RATIO = 1.586; // Standard credit card (85.60 × 53.98 mm)
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

function DetailRow({
  label,
  value,
  onCopy,
  right,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueRow}>
        <Text style={styles.detailValue}>{value}</Text>
        {right}
        {onCopy && (
          <TouchableOpacity onPress={onCopy} style={styles.detailCopyBtn}>
            <Icon name="copy-outline" library="ionicons" size={18} color={COLORS.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
  holder_name?: string;
};

export const VirtualCardScreen = () => {
  const router = useRouter();
  const [card, setCard] = useState<CardData | null>(null);
  const [wallet, setWallet] = useState<{ ngn: number; usd: number }>({ ngn: 0, usd: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [detailsVisible, setDetailsVisible] = useState(false);

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

  const copyToClipboard = async (value: string, label: string) => {
    if (!value) return;
    await Clipboard.setStringAsync(value.replace(/\s/g, ''));
    setToast({ visible: true, message: `${label} copied` });
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
  const holderName = card?.holderName ?? card?.holder_name ?? 'Card Holder';
  const brand = (card?.brand ?? 'visa').toLowerCase();
  const isPending = card?.status === 'pending';

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

        <View style={styles.cardWrapper}>
          <View style={[styles.cardOuter, isFrozen && styles.cardFrozen]}>
            <LinearGradient
              colors={['rgba(30, 35, 32, 0.98)', 'rgba(45, 55, 48, 0.98)', 'rgba(25, 30, 27, 0.98)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Top row: chip + status + brand */}
              <View style={styles.cardTopRow}>
                <View style={styles.chip} />
                <View style={styles.cardTopRight}>
                  {isFrozen && (
                    <View style={styles.frozenBadge}>
                      <Icon name="lock-closed" library="ionicons" size={10} color={COLORS.text} />
                      <Text style={styles.frozenBadgeText}>Frozen</Text>
                    </View>
                  )}
                  {isPending && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                  <Text style={styles.brandLabel}>{brand === 'mastercard' ? 'Mastercard' : 'Visa'}</Text>
                </View>
              </View>

              {/* USD balance */}
              <Text style={styles.cardBalanceLabel}>USD Balance</Text>
              <Text style={styles.cardBalance}>{formatCurrency(card?.balance ?? wallet?.usd ?? 0, 'USD')}</Text>

              {/* Card number (4 groups) */}
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumber}>{displayNumber}</Text>
              </View>

              {/* Bottom row: holder name, expiry (CVV only in details) */}
              <View style={styles.cardBottomRow}>
                <View style={styles.holderBlock}>
                  <Text style={styles.cardMetaLabel}>Card Holder</Text>
                  <Text style={styles.cardHolderName} numberOfLines={1}>{holderName}</Text>
                </View>
                <View style={styles.expiryCvvRow}>
                  <View>
                    <Text style={styles.cardMetaLabel}>Expires</Text>
                    <Text style={styles.cardMetaValue}>{expiry}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => setDetailsVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="document-text-outline" library="ionicons" size={22} color={COLORS.accent} />
          <Text style={styles.viewDetailsText}>View card details</Text>
          <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About this card</Text>
          <Text style={styles.infoText}>
            Virtual USD card for global payments. Fund from your NGN wallet; spend in USD online and in-app.
          </Text>
        </Card>
      </ScrollView>

      <Modal
        visible={detailsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailsVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDetailsVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Card details</Text>
              <TouchableOpacity onPress={() => setDetailsVisible(false)} hitSlop={16}>
                <Icon name="close" library="ionicons" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
              <DetailRow
                label="Card number"
                value={card?.pan ? card.pan.replace(/(\d{4})/g, '$1 ').trim() : (card?.firstSix && card?.lastFour ? `${card.firstSix} •••• •••• ${card.lastFour}` : '—')}
                onCopy={card?.pan ? () => copyToClipboard(card.pan.replace(/\s/g, ''), 'Card number') : undefined}
              />
              <DetailRow
                label="CVV"
                value={showCvv ? (card?.cvv ?? '—') : '•••'}
                right={
                  <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                    <Text style={styles.detailReveal}>{showCvv ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                }
                onCopy={showCvv && card?.cvv ? () => copyToClipboard(card.cvv!, 'CVV') : undefined}
              />
              <DetailRow label="Expiry" value={expiry} />
              <DetailRow label="Card holder" value={holderName} onCopy={() => copyToClipboard(holderName, 'Name')} />
              <DetailRow label="Brand" value={brand === 'mastercard' ? 'Mastercard' : 'Visa'} />
              <DetailRow label="USD balance" value={formatCurrency(card?.balance ?? wallet?.usd ?? 0, 'USD')} />
              <DetailRow label="Status" value={card?.status ? card.status.charAt(0).toUpperCase() + card.status.slice(1) : '—'} />
              <DetailRow
                label="Reference"
                value={card?.reference ?? '—'}
                onCopy={card?.reference ? () => copyToClipboard(card.reference, 'Reference') : undefined}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
  cardWrapper: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  cardOuter: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  cardFrozen: { opacity: 0.9 },
  cardGradient: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    width: 40,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardTopRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  frozenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  frozenBadgeText: { fontSize: 10, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },
  pendingBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  pendingBadgeText: { fontSize: 10, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.warning },
  brandLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.5,
  },
  cardBalanceLabel: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  cardBalance: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardNumberContainer: { marginVertical: SPACING.xs },
  cardNumber: {
    fontSize: 15,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    letterSpacing: 3,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderBlock: { flex: 1, marginRight: SPACING.md, minWidth: 0 },
  cardMetaLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 2,
  },
  cardHolderName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  expiryCvvRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    alignItems: 'flex-end',
  },
  cardMetaValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(77, 98, 80, 0.25)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
  },
  viewDetailsText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
    paddingBottom: SPACING.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  detailsScroll: { padding: SPACING.lg },
  detailRow: { marginBottom: SPACING.lg },
  detailLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.xs },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.sm },
  detailValue: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: FONT_WEIGHTS.medium, flex: 1 },
  detailCopyBtn: { padding: SPACING.xs },
  detailReveal: { fontSize: FONT_SIZES.sm, color: COLORS.accent, fontWeight: FONT_WEIGHTS.medium },
  infoCard: { marginBottom: SPACING.lg },
  infoTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text, marginBottom: SPACING.sm },
  infoText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
});
