import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { formatRelativeDate } from '../../utils/formatDate';
import { apiService } from '../../services/api';
import {
  getNotificationIdsFromTransactions,
  notificationsFromTransactions,
  NotificationItem,
  NotificationKind,
} from '../../utils/notificationsFromTransactions';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  pruneReadNotificationIds,
} from '../../utils/notificationReadState';

const STRIPE: Record<NotificationKind, string> = {
  success: 'rgba(57, 255, 20, 0.85)',
  error: 'rgba(255, 107, 107, 0.95)',
  info: 'rgba(138, 180, 255, 0.75)',
};

const ICON_TINT: Record<NotificationKind, { bg: string; color: string }> = {
  success: { bg: 'rgba(57, 255, 20, 0.12)', color: COLORS.accent },
  error: { bg: 'rgba(255, 107, 107, 0.14)', color: '#FF8A8A' },
  info: { bg: 'rgba(138, 180, 255, 0.12)', color: '#A8C7FF' },
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions();
      if (response.success && Array.isArray(response.transactions)) {
        const txs = response.transactions;
        const ids = getNotificationIdsFromTransactions(txs);
        await pruneReadNotificationIds(ids);
        const readIds = await getReadNotificationIds();
        setNotifications(notificationsFromTransactions(txs, readIds));
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => {
      const next = prev === id ? null : id;
      if (next !== null) {
        void (async () => {
          await markNotificationAsRead(next);
          setNotifications((list) => list.map((n) => (n.id === next ? { ...n, read: true } : n)));
        })();
      }
      return next;
    });
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    const stripe = STRIPE[item.kind];
    const tint = ICON_TINT[item.kind];
    const expanded = expandedId === item.id;

    return (
      <View style={styles.cardShadow}>
        <TouchableOpacity
          style={[
            styles.card,
            { borderLeftColor: stripe },
            !item.read && styles.cardUnread,
            expanded && styles.cardExpanded,
          ]}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.92}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={`${item.title}. ${expanded ? 'Tap to collapse' : 'Tap to read full message'}`}
        >
          <View style={[styles.iconCircle, { backgroundColor: tint.bg }]}>
            <Icon name={item.iconName} library="ionicons" size={24} color={tint.color} />
          </View>
          <View style={styles.textBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.titleMeta}>
                <Text style={styles.notificationTime}>{formatRelativeDate(item.time)}</Text>
                <Icon
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  library="ionicons"
                  size={18}
                  color={COLORS.textMuted}
                />
              </View>
            </View>
            <Text
              style={[styles.notificationMessage, expanded && styles.notificationMessageExpanded]}
              numberOfLines={expanded ? undefined : 2}
            >
              {item.message}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          extraData={`${expandedId}-${notifications.filter((n) => !n.read).length}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadNotifications}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-off-outline" library="ionicons" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptyHint}>When you pay, top up, or withdraw, updates will show up here.</Text>
            </View>
          }
        />
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
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  cardShadow: {
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  cardExpanded: {
    paddingBottom: SPACING.lg,
  },
  cardUnread: {
    borderColor: 'rgba(57, 255, 20, 0.22)',
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  titleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexShrink: 0,
  },
  notificationTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  unreadTitle: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  notificationMessageExpanded: {
    lineHeight: 22,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
