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
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { apiService } from '../../services/api';
import { validatePassword } from '../../utils/validation';

export const ChangePasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      setShowToast(true);
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Invalid password');
      setShowToast(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setShowToast(true);
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      if (response.success) {
        setError('');
        setShowToast(false);
        router.back();
      } else {
        setError(response.message || 'Failed to change password');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
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
          <Text style={styles.title}>Change Password</Text>
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
                Enter your current password and choose a new secure password
              </Text>

              <Input
                label="Current Password"
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Icon
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      library="ionicons"
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                }
              />

              <Input
                label="New Password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Icon
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      library="ionicons"
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                }
              />

              <Input
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
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
                title="Change Password"
                onPress={handleChangePassword}
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
