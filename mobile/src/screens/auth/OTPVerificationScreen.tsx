import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { validateOTP } from '../../utils/validation';
import { Toast } from '../../components/ui/Toast';

export const OTPVerificationScreen = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (!validateOTP(otpString)) {
      setError('Please enter a valid OTP');
      setShowToast(true);
      return;
    }

    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      // Navigation will happen via AuthContext
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < otp.length - 1) {
      // Focus next input (would need refs in real implementation)
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
          <Icon name="lock-closed-outline" library="ionicons" size={64} color={COLORS.accent} />
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          fullWidth
          style={styles.verifyButton}
        />

        <TouchableOpacity style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
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
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  otpInput: {
    flex: 1,
    height: 56,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    textAlign: 'center',
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  verifyButton: {
    marginBottom: SPACING.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
