import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';

export const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext)!;

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        {/* Centered Profile Header */}
        <View style={styles.profileHeaderSection}>
          <LinearGradient
            colors={['rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Not set'}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/(tabs)/profile/edit-profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <Card style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile/settings')} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Icon name="settings-outline" library="ionicons" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Settings</Text>
                  <Text style={styles.menuSubtitle}>App preferences</Text>
                </View>
              </View>
              <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/notifications')} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Icon name="notifications-outline" library="ionicons" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Notifications</Text>
                  <Text style={styles.menuSubtitle}>Manage notifications</Text>
                </View>
              </View>
              <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile/transaction-limits')} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Icon name="card-outline" library="ionicons" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Transaction Limits</Text>
                  <Text style={styles.menuSubtitle}>Set spending limits</Text>
                </View>
              </View>
              <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile/support')} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Icon name="help-circle-outline" library="ionicons" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Support</Text>
                  <Text style={styles.menuSubtitle}>Get help & FAQ</Text>
                </View>
              </View>
              <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Card style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile/logout-confirmation')} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.logoutIcon]}>
                  <Icon name="log-out-outline" library="ionicons" size={20} color={COLORS.error} />
                </View>
                <Text style={styles.logoutLabel}>Logout</Text>
              </View>
              <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  profileHeaderSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  profileName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: 'rgba(77, 98, 80, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    backgroundColor: 'rgba(220, 20, 60, 0.15)',
    borderColor: 'rgba(220, 20, 60, 0.12)',
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  logoutLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.error,
  },
  badge: {
    backgroundColor: COLORS.accent,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.secondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    marginHorizontal: SPACING.lg,
  },
});
