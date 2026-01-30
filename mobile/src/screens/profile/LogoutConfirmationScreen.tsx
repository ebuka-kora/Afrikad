import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';

export const LogoutConfirmationScreen = () => {
  const router = useRouter();
  const { logout } = useContext(AuthContext)!;

  const handleConfirm = async () => {
    await logout();
    // Navigation will happen automatically via AuthContext
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <Icon name="log-out-outline" library="ionicons" size={64} color={COLORS.error} />
          </View>

          <Text style={styles.title}>Logout?</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to logout? You'll need to login again to access your account.
          </Text>

          <View style={styles.buttons}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              fullWidth
              style={styles.cancelButton}
            />
            <Button
              title="Logout"
              onPress={handleConfirm}
              variant="secondary"
              fullWidth
              style={styles.logoutButton}
            />
          </View>
        </Card>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  buttons: {
    width: '100%',
    gap: SPACING.md,
  },
  cancelButton: {
    marginBottom: 0,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
  },
});
