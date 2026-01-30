import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Toast } from '../../components/ui/Toast';
import { apiService } from '../../services/api';
import { validateEmail } from '../../utils/validation';

export const ProfileSettingsScreen = () => {
  const router = useRouter();
  const { user, updateUser } = useContext(AuthContext)!;
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSave = async () => {
    if (!firstName || !lastName) {
      setError('First name and last name are required');
      setShowToast(true);
      return;
    }
    if (!email?.trim()) {
      setError('Email is required');
      setShowToast(true);
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.updateProfile({
        firstName,
        lastName,
        username: username.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
      });

      if (response.success && response.user) {
        updateUser(response.user);
        setError('');
        router.back();
      } else {
        setError(response.message || 'Failed to update profile');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
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
        <Text style={styles.title}>Edit Profile</Text>
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
              label="Username"
              placeholder="johndoe"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Phone (Optional)"
              placeholder="+234 801 234 5678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              fullWidth
              style={styles.saveButton}
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
  saveButton: {
    marginTop: SPACING.md,
  },
});
