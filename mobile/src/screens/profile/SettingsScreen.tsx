import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, ImageBackground, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Toast } from '../../components/ui/Toast';
import { useLock, AUTO_LOCK_OPTIONS } from '../../context/LockContext';

const BIOMETRIC_STORAGE_KEY = '@afrikad_biometric_enabled';
const NOTIFICATIONS_STORAGE_KEY = '@afrikad_notifications_enabled';

export const SettingsScreen = () => {
  const router = useRouter();
  const { autoLockSeconds } = useLock();
  const autoLockLabel = AUTO_LOCK_OPTIONS.find((o) => o.value === autoLockSeconds)?.label ?? 'Immediately';
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showToast, setShowToast] = React.useState(false);

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
    requestNotificationPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const [biometric, notifications] = await Promise.all([
        AsyncStorage.getItem(BIOMETRIC_STORAGE_KEY),
        AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY),
      ]);
      setBiometricEnabled(biometric === 'true');
      setNotificationsEnabled(notifications !== 'false'); // Default to true
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          setNotificationsEnabled(false);
          await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'false');
        }
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometricAvailable && value) {
      setError('Biometric authentication is not available on this device');
      setShowToast(true);
      return;
    }

    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable biometric authentication',
          cancelLabel: 'Cancel',
        });

        if (result.success) {
          setBiometricEnabled(true);
          await AsyncStorage.setItem(BIOMETRIC_STORAGE_KEY, 'true');
        } else {
          setBiometricEnabled(false);
        }
      } catch (error: any) {
        setError('Failed to enable biometric authentication');
        setShowToast(true);
        setBiometricEnabled(false);
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem(BIOMETRIC_STORAGE_KEY, 'false');
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'true');
        } else {
          setError('Notification permission denied');
          setShowToast(true);
          setNotificationsEnabled(false);
        }
      } catch (error: any) {
        setError('Failed to enable notifications');
        setShowToast(true);
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'false');
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>App preferences</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="finger-print-outline" library="ionicons" size={20} color={COLORS.accent} />
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.text}
              disabled={!biometricAvailable}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="notifications-outline" library="ionicons" size={20} color={COLORS.accent} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.text}
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(tabs)/profile/auto-lock')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="timer-outline" library="ionicons" size={20} color={COLORS.accent} />
              <Text style={styles.settingLabel}>Lock after</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{autoLockLabel}</Text>
              <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(tabs)/profile/pin-code')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="keypad-outline" library="ionicons" size={20} color={COLORS.accent} />
              <Text style={styles.settingLabel}>PIN Code</Text>
            </View>
            <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(tabs)/profile/change-password')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="lock-closed-outline" library="ionicons" size={20} color={COLORS.accent} />
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {showToast && (
        <Toast
          message={error}
          type="error"
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
  content: {
    padding: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
});
