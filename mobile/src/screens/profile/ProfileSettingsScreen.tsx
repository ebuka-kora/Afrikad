import React, { useState, useContext } from 'react';
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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
  /** null = keep server value; string = new data URL or URL; '' = remove */
  const [profileImageDraft, setProfileImageDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const displayAvatarUri =
    profileImageDraft !== null ? profileImageDraft || undefined : user?.profileImage || undefined;

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
      const payload: Parameters<typeof apiService.updateProfile>[0] = {
        firstName,
        lastName,
        username: username.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
      };
      if (profileImageDraft !== null) {
        payload.profileImage = profileImageDraft;
      }
      const response = await apiService.updateProfile(payload);

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

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Photo library permission is required to change your profile image');
      setShowToast(true);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    const prefix = mime.startsWith('image/') ? mime : 'image/jpeg';
    setProfileImageDraft(`data:${prefix};base64,${asset.base64}`);
  };

  const clearProfileImage = () => {
    setProfileImageDraft('');
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
            <Text style={styles.avatarSectionLabel}>Profile photo</Text>
            <View style={styles.avatarRow}>
              <TouchableOpacity
                onPress={pickProfileImage}
                activeOpacity={0.85}
                style={styles.avatarTouchable}
              >
                {displayAvatarUri ? (
                  <Image source={{ uri: displayAvatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="person" library="ionicons" size={40} color={COLORS.textMuted} />
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Icon name="camera" library="ionicons" size={16} color={COLORS.secondary} />
                </View>
              </TouchableOpacity>
              <View style={styles.avatarActions}>
                <TouchableOpacity onPress={pickProfileImage} style={styles.avatarLink}>
                  <Text style={styles.avatarLinkText}>Choose photo</Text>
                </TouchableOpacity>
                {!!displayAvatarUri && (
                  <TouchableOpacity onPress={clearProfileImage} style={styles.avatarLink}>
                    <Text style={[styles.avatarLinkText, styles.avatarRemoveText]}>Remove photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

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
              label="Phone"
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
  avatarSectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: COLORS.surface,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  avatarActions: {
    flex: 1,
    gap: SPACING.xs,
  },
  avatarLink: {
    paddingVertical: SPACING.xs,
  },
  avatarLinkText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accent,
  },
  avatarRemoveText: {
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.normal,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});
