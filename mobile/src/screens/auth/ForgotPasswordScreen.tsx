import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { validateEmail } from '../../utils/validation';
import { Toast } from '../../components/ui/Toast';
import { apiService } from '../../services/api';

export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleContinue = async () => {
    if (!email) {
      setError('Please enter your email');
      setShowToast(true);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiService.forgotPassword(email);
      if (response.success) {
        const token = (response as { resetToken?: string }).resetToken;
        if (token) {
          router.push({ pathname: '/(auth)/reset-password', params: { token, email } });
        } else {
          setError('Check your email for reset instructions.');
          setShowToast(true);
        }
      } else {
        setError((response as { message?: string }).message || 'Request failed');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request failed. Try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="lock-closed-outline" library="ionicons" size={64} color={COLORS.accent} />
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Icon name="mail-outline" library="ionicons" size={20} color={COLORS.textMuted} />}
          />

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            fullWidth
            style={styles.continueButton}
          />

          <Button
            title="Back to Login"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            fullWidth
          />
        </View>
      </View>

      {showToast && (
        <Toast
          message={error}
          type="error"
          visible={showToast}
          onHide={() => setShowToast(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: 80,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  form: {
    width: '100%',
  },
  continueButton: {
    marginBottom: SPACING.md,
  },
});
