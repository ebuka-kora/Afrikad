import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export const PasswordResetSuccessScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="checkmark-circle" library="ionicons" size={80} color={COLORS.accent} />
        </View>

        <Text style={styles.title}>Password Reset Successful!</Text>
        <Text style={styles.subtitle}>
          Your password has been reset successfully. You can now login with your new password.
        </Text>

        <Button
          title="Continue to Login"
          onPress={() => router.replace('/(auth)/login')}
          fullWidth
          style={styles.button}
        />
      </View>
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  button: {
    width: '100%',
  },
});
