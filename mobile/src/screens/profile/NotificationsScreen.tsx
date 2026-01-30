import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { formatRelativeDate } from '../../utils/formatDate';
import { apiService } from '../../services/api';

export const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // For now, generate notifications from recent transactions
      // In the future, this can be a dedicated notifications endpoint
      const response = await apiService.getTransactions();
      if (response.success && Array.isArray(response.transactions)) {
        const transactionNotifications = response.transactions.slice(0, 10).map((tx: any, index: number) => ({
          id: String(tx._id ?? index),
          title: tx.status === 'completed' ? 'Payment Successful' : tx.status === 'failed' ? 'Transaction Failed' : 'Transaction Update',
          message: tx.merchantName 
            ? `Your ${tx.status === 'completed' ? 'payment' : 'transaction'} of ${tx.currency === 'NGN' ? '₦' : '$'}${tx.amount?.toLocaleString()} to ${tx.merchantName} was ${tx.status}`
            : `Transaction ${tx.status}`,
          time: tx.createdAt ? new Date(tx.createdAt) : new Date(),
          read: index > 2, // Mark older notifications as read
        }));
        setNotifications(transactionNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <Card style={[styles.notificationCard, !item.read ? styles.unreadCard : null]}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationLeft}>
          <View style={[styles.iconContainer, !item.read && styles.unreadIcon]}>
            <Icon
              name="notifications-outline"
              library="ionicons"
              size={20}
              color={item.read ? COLORS.textMuted : COLORS.accent}
            />
          </View>
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, !item.read ? styles.unreadTitle : null]}>
              {item.title}
            </Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{formatRelativeDate(item.time)}</Text>
          </View>
        </View>
      </View>
    </Card>
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadNotifications}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" library="ionicons" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No notifications</Text>
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
  },
  notificationCard: {
    marginBottom: SPACING.md,
  },
  unreadCard: {
    borderColor: COLORS.accent + '33',
    borderWidth: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadIcon: {
    backgroundColor: COLORS.accent + '20',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  unreadTitle: {
    color: COLORS.text,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
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
  },
});
