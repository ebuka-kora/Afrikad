import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import {
  deriveTransactionSource,
  normalizeTransactionStatus,
  transactionAmountColor,
  transactionAmountPrefix,
  transactionTypeLabel,
} from '../../utils/transactionDisplay';

/** Frosted mint for success state — softer than neon accent */
const GLASS_GREEN_TEXT = 'rgba(206, 255, 220, 0.98)';
const GLASS_GREEN_ICON = 'rgba(170, 245, 195, 0.95)';
const GLASS_GREEN_BORDER = 'rgba(200, 255, 220, 0.42)';

export const TransactionDetailsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [tx, setTx] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Missing transaction');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getTransactionById(String(id));
      if (res.success && res.transaction) {
        setTx(res.transaction);
      } else {
        setError((res as any).message || 'Could not load transaction');
        setTx(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Something went wrong');
      setTx(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)/transactions');
      return true;
    });
    return () => sub.remove();
  }, [router]);

  const merchant = String(tx?.merchantName ?? tx?.description ?? '—');
  const amount = Number(tx?.amount) || 0;
  const currency = (tx?.currency === 'USD' ? 'USD' : 'NGN') as 'NGN' | 'USD';
  const type = String(tx?.type ?? 'payment');
  const status = normalizeTransactionStatus(tx);
  const source = deriveTransactionSource(tx);
  const sourceLabel = source === 'card' ? 'Card' : 'Wallet';
  const amountPrefix = transactionAmountPrefix(status, type);
  const amountColor = transactionAmountColor(status, type);

  const initial = merchant.trim().charAt(0).toUpperCase() || '₦';

  const reference = String(
    tx?.paymentReference ?? tx?.koraTransactionId ?? tx?.koraSwapId ?? tx?._id ?? '—'
  );

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={[
            styles.hero,
            { paddingTop: Math.max(insets.top, SPACING.md) + SPACING.sm },
          ]}
        >
          <View style={styles.heroGlass} pointerEvents="none">
            <BlurView
              intensity={Platform.OS === 'ios' ? 48 : 36}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                'rgba(72, 160, 120, 0.28)',
                'rgba(28, 72, 58, 0.88)',
                'rgba(12, 32, 26, 0.94)',
              ]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.07)', 'transparent', 'rgba(40, 120, 85, 0.18)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroGlassEdge} />
          </View>

          <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/transactions')}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Transaction details</Text>
            <View style={styles.backPlaceholder} />
          </View>

          {loading ? (
            <View style={styles.heroLoading}>
              <ActivityIndicator color={GLASS_GREEN_ICON} size="large" />
            </View>
          ) : error ? (
            <View style={styles.heroError}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={load} style={styles.retryBtn}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : tx ? (
            <>
              <Text style={[styles.amount, { color: amountColor }]}>
                {amountPrefix}
                {formatCurrency(amount, currency)}
              </Text>
              <Text style={styles.merchant} numberOfLines={2}>
                {merchant}
              </Text>

              <View style={styles.avatarWrap}>
                <View
                  style={[
                    styles.avatarGlassOuter,
                    status === 'success' && styles.avatarGlassOuterSuccess,
                  ]}
                >
                  <LinearGradient
                    colors={
                      status === 'pending'
                        ? ['rgba(255, 165, 0, 0.4)', 'rgba(255, 165, 0, 0.1)']
                        : status === 'failed'
                          ? ['rgba(220, 20, 60, 0.35)', 'rgba(220, 20, 60, 0.08)']
                          : [
                              'rgba(255,255,255,0.14)',
                              'rgba(120, 220, 160, 0.22)',
                              'rgba(57, 255, 20, 0.1)',
                            ]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarRing}
                  >
                    <View style={styles.avatarInner}>
                      <Text style={styles.avatarLetter}>{initial}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.pills}>
                <View style={styles.pillDark}>
                  <Icon
                    name={source === 'card' ? 'card-outline' : 'wallet-outline'}
                    library="ionicons"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.pillDarkText}>{sourceLabel}</Text>
                </View>
                <View style={[styles.pillMint, status === 'pending' && styles.pillPending]}>
                  <Icon
                    name="layers-outline"
                    library="ionicons"
                    size={16}
                    color={
                      status === 'pending'
                        ? COLORS.secondary
                        : GLASS_GREEN_TEXT
                    }
                  />
                  <Text style={[styles.pillMintText, status === 'pending' && styles.pillPendingText]}>
                    {transactionTypeLabel(type)}
                  </Text>
                  <Icon
                    name="chevron-down"
                    library="ionicons"
                    size={14}
                    color={
                      status === 'pending'
                        ? COLORS.secondary
                        : GLASS_GREEN_TEXT
                    }
                  />
                </View>
              </View>
            </>
          ) : null}
          </View>
        </View>

        {!loading && !error && tx ? (
          <View style={[styles.body, { paddingBottom: insets.bottom + SPACING.xl }]}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Icon name="document-text-outline" library="ionicons" size={22} color={GLASS_GREEN_ICON} />
                  <Text style={styles.cardTitle}>Summary</Text>
                </View>
                <TouchableOpacity hitSlop={12}>
                  <Icon name="ellipsis-horizontal" library="ionicons" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <SummaryRow label="Type" value={transactionTypeLabel(type)} />
              <SummaryRow label="Status" value={status} capitalize />
              {tx?.fxRate != null && Number(tx.fxRate) > 0 ? (
                <SummaryRow label="Exchange rate" value={`₦${Number(tx.fxRate).toLocaleString()} / $1`} />
              ) : null}
              <View style={styles.cardDivider} />
              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Amount</Text>
                <Text style={[styles.summaryTotalValue, { color: amountColor }]}>
                  {amountPrefix}
                  {formatCurrency(amount, currency)}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>Details</Text>
            <View style={styles.card}>
              <DetailRow label="Date & time" value={formatDateTime(tx?.createdAt)} />
              <DetailRow label="Reference" value={reference} mono />
              {tx?.description ? <DetailRow label="Description" value={String(tx.description)} /> : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

function SummaryRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, capitalize && styles.capitalize]}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailMono]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(180, 255, 210, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
    }),
  },
  heroGlass: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  heroGlassEdge: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backPlaceholder: {
    width: 40,
  },
  heroTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  amount: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  merchant: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarGlassOuter: {
    borderRadius: 48,
    padding: 2,
  },
  avatarGlassOuterSuccess: {
    borderWidth: 1.5,
    borderColor: GLASS_GREEN_BORDER,
    backgroundColor: 'rgba(57, 255, 20, 0.06)',
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  pills: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pillDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillDarkText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  pillMint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(200, 255, 220, 0.38)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(120, 255, 180, 0.35)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
    }),
  },
  pillMintText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: GLASS_GREEN_TEXT,
  },
  pillPending: {
    backgroundColor: COLORS.warning,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 80, 0.5)',
  },
  pillPendingText: {
    color: COLORS.secondary,
  },
  heroLoading: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  heroError: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  errorText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
  },
  retryBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    color: GLASS_GREEN_TEXT,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  sectionHeading: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  detailRow: {
    marginBottom: SPACING.lg,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  detailMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FONT_SIZES.sm,
  },
});
