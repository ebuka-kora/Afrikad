import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';

const PIN_STORAGE_KEY = '@afrikad_user_pin';

export const PinCodeScreen = () => {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [mode, setMode] = useState<'set' | 'change'>('set');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  React.useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const existingPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (existingPin) {
        setMode('change');
      }
    } catch (error) {
      console.error('Error checking PIN:', error);
    }
  };

  const handleSetPin = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      setShowToast(true);
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem(PIN_STORAGE_KEY, pin);
      setError('');
      setShowToast(false);
      router.back();
    } catch (error) {
      setError('Failed to save PIN');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (currentPin.length < 4) {
      setError('Please enter your current PIN');
      setShowToast(true);
      return;
    }

    try {
      const storedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (storedPin !== currentPin) {
        setError('Current PIN is incorrect');
        setShowToast(true);
        return;
      }
    } catch (error) {
      setError('Failed to verify PIN');
      setShowToast(true);
      return;
    }

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      setShowToast(true);
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem(PIN_STORAGE_KEY, pin);
      setError('');
      setShowToast(false);
      router.back();
    } catch (error) {
      setError('Failed to update PIN');
      setShowToast(true);
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>
            {mode === 'set' ? 'Set PIN Code' : 'Change PIN Code'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Card style={styles.card}>
              <View style={styles.iconContainer}>
                <Icon name="lock-closed-outline" library="ionicons" size={48} color={COLORS.accent} />
              </View>
              <Text style={styles.description}>
                {mode === 'set'
                  ? 'Set a 4-digit PIN code to secure your account'
                  : 'Enter your current PIN, then set a new one'}
              </Text>

              {mode === 'change' && (
                <Input
                  label="Current PIN"
                  placeholder="Enter current PIN"
                  value={currentPin}
                  onChangeText={setCurrentPin}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={6}
                />
              )}

              <Input
                label={mode === 'set' ? 'PIN Code' : 'New PIN Code'}
                placeholder="Enter 4-6 digit PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />

              <Input
                label="Confirm PIN"
                placeholder="Confirm your PIN"
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />

              <Button
                title={mode === 'set' ? 'Set PIN' : 'Change PIN'}
                onPress={mode === 'set' ? handleSetPin : handleChangePin}
                loading={loading}
                fullWidth
                style={styles.submitButton}
              />
            </Card>
          </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});
