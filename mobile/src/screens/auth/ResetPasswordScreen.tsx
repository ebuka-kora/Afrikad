import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { validatePassword } from '../../utils/validation';
import { Toast } from '../../components/ui/Toast';
import { apiService } from '../../services/api';

export const ResetPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const rawToken = params.token;
  const resetToken =
    typeof rawToken === 'string'
      ? rawToken
      : Array.isArray(rawToken)
        ? rawToken[0]
        : undefined;

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      setShowToast(true);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Invalid password');
      setShowToast(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setShowToast(true);
      return;
    }

    if (!resetToken) {
      setError('Reset link expired or invalid. Please request a new one.');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiService.resetPassword(resetToken, password);
      if (response.success) {
        router.replace('/(auth)/password-reset-success');
      } else {
        setError((response as { message?: string }).message || 'Reset failed');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed. Token may have expired.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="New Password"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  library="ionicons"
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            }
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  library="ionicons"
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            }
          />

          <Button
            title="Reset Password"
            onPress={handleReset}
            loading={loading}
            fullWidth
            style={styles.resetButton}
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
    paddingTop: 60,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: SPACING.md,
  },
});
