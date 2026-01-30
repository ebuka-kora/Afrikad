import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { validateEmail } from '../../utils/validation';
import { Toast } from '../../components/ui/Toast';

export const LoginScreen = () => {
  const router = useRouter();
  const { login } = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
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
      await login(email, password);
      // Navigation will happen automatically via AuthContext
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            Afri<Text style={styles.logoAccent}>KAD</Text>
          </Text>
          <Text style={styles.subtitle}>Welcome back</Text>
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

          <Input
            label="Password"
            placeholder="Enter your password"
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

          <View style={styles.options}>
            <TouchableOpacity style={styles.rememberMe}>
              <Icon name="checkbox-outline" library="ionicons" size={20} color={COLORS.textMuted} />
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
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
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  form: {
    width: '100%',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rememberText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  forgotText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
  },
  loginButton: {
    marginBottom: SPACING.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
