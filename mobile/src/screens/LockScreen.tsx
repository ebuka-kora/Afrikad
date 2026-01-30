import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useLock } from '../context/LockContext';

const PIN_STORAGE_KEY = '@afrikad_user_pin';
const BIOMETRIC_STORAGE_KEY = '@afrikad_biometric_enabled';

export function LockScreen() {
  const { unlock } = useLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedPin, biometric] = await Promise.all([
          AsyncStorage.getItem(PIN_STORAGE_KEY),
          AsyncStorage.getItem(BIOMETRIC_STORAGE_KEY),
        ]);
        setHasPin(!!storedPin);
        setBiometricEnabled(biometric === 'true');
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricAvailable(compatible && enrolled);
        if (!storedPin) {
          unlock();
        }
      } catch (e) {
        setHasPin(false);
        unlock();
      }
    })();
  }, [unlock]);

  const handleUnlockWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Afrikad',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        setError('');
        unlock();
      }
    } catch (e) {
      setError('Biometric authentication failed');
      setShowToast(true);
    }
  };

  const handleUnlockWithPin = async () => {
    if (pin.length < 4) {
      setError('Enter your PIN');
      setShowToast(true);
      return;
    }
    try {
      const storedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (storedPin === pin) {
        setError('');
        unlock();
      } else {
        setError('Incorrect PIN');
        setShowToast(true);
        setPin('');
      }
    } catch (e) {
      setError('Failed to verify PIN');
      setShowToast(true);
    }
  };

  if (hasPin === null) {
    return (
      <ImageBackground
        source={require('../../assets/bgi.png')}
        style={styles.backgroundImage}
        resizeMode="center"
        imageStyle={styles.imageStyle}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!hasPin) {
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.centered}>
            <Card style={styles.card}>
              <View style={styles.iconContainer}>
                <Icon name="lock-closed-outline" library="ionicons" size={48} color={COLORS.accent} />
              </View>
              <Text style={styles.title}>App locked</Text>
              <Text style={styles.description}>Enter your PIN or use biometric to unlock</Text>

              {biometricAvailable && biometricEnabled && (
                <Button
                  title="Unlock with Biometric"
                  onPress={handleUnlockWithBiometric}
                  variant="outline"
                  fullWidth
                  style={styles.biometricButton}
                  accessibilityLabel="Unlock with biometric"
                />
              )}

              <Input
                label="PIN"
                placeholder="Enter PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                autoFocus
              />

              <Button
                title="Unlock"
                onPress={handleUnlockWithPin}
                fullWidth
                style={styles.unlockButton}
                accessibilityLabel="Unlock with PIN"
              />
            </Card>
          </View>
        </KeyboardAvoidingView>

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
}

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  biometricButton: {
    marginBottom: SPACING.md,
  },
  unlockButton: {
    marginTop: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
