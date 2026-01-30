import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { validateEmail, validatePassword } from '../../utils/validation';
import { Toast } from '../../components/ui/Toast';

export const SignupScreen = () => {
  const router = useRouter();
  const { register } = useContext(AuthContext)!;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      setShowToast(true);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      setShowToast(true);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Invalid password');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({ firstName, lastName, email, phone, password });
      router.push('/(auth)/otp-verification');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />

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

          <Input
            label="Phone (Optional)"
            placeholder="+234 801 234 5678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Icon name="call-outline" library="ionicons" size={20} color={COLORS.textMuted} />}
          />

          <Input
            label="Password"
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

          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
            fullWidth
            style={styles.signupButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  form: {
    width: '100%',
  },
  signupButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
