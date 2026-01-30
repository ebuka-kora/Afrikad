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
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Toast } from '../../components/ui/Toast';
import { apiService } from '../../services/api';

export const KycForCardScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

  // Personal Information
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [zipCode, setZipCode] = useState('');

  // Identity
  const [identityType, setIdentityType] = useState('passport');
  const [identityNumber, setIdentityNumber] = useState('');
  const [identityImage, setIdentityImage] = useState('');
  const [identityCountry, setIdentityCountry] = useState('Nigeria');

  // Country Identity
  const [countryIdentityType, setCountryIdentityType] = useState('national_id');
  const [countryIdentityNumber, setCountryIdentityNumber] = useState('');
  const [countryIdentityCountry, setCountryIdentityCountry] = useState('Nigeria');

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!dateOfBirth || !street || !city || !state || !zipCode) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!identityNumber || !countryIdentityNumber) {
      showToast('Please provide identity information', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.submitKyc({
        dateOfBirth,
        address: {
          street,
          city,
          state,
          country,
          zipCode,
        },
        identity: {
          type: identityType,
          number: identityNumber,
          image: identityImage || undefined, // Base64 string or URL from image picker/upload
          country: identityCountry,
        },
        countryIdentity: {
          type: countryIdentityType,
          number: countryIdentityNumber,
          country: countryIdentityCountry,
        },
      });

      if (response.success) {
        showToast('KYC submitted successfully! Your virtual card will be created shortly.', 'success');
        setTimeout(() => {
          router.replace('/(tabs)/card');
        }, 2000);
      } else {
        showToast(response.message || 'Failed to submit KYC. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('KYC submission error:', error);
      showToast(error.response?.data?.message || 'An error occurred. Please try again.', 'error');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>KYC for Virtual Card</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.infoCard}>
            <Icon name="information-circle-outline" library="ionicons" size={24} color={COLORS.accent} />
            <Text style={styles.infoText}>
              Complete your KYC verification to get a USD virtual card. All information is secure and encrypted.
            </Text>
          </Card>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              keyboardType="default"
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Input
              label="Street Address"
              placeholder="Enter street address"
              value={street}
              onChangeText={setStreet}
            />
            <Input
              label="City"
              placeholder="Enter city"
              value={city}
              onChangeText={setCity}
            />
            <Input
              label="State"
              placeholder="Enter state"
              value={state}
              onChangeText={setState}
            />
            <Input
              label="Country"
              placeholder="Enter country"
              value={country}
              onChangeText={setCountry}
            />
            <Input
              label="Zip/Postal Code"
              placeholder="Enter zip code"
              value={zipCode}
              onChangeText={setZipCode}
            />
          </View>

          {/* Identity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identity Document</Text>
            <Input
              label="Identity Type"
              placeholder="passport, driver_license, etc."
              value={identityType}
              onChangeText={setIdentityType}
            />
            <Input
              label="Identity Number"
              placeholder="Enter identity number"
              value={identityNumber}
              onChangeText={setIdentityNumber}
            />
            <Input
              label="Identity Country"
              placeholder="Enter country"
              value={identityCountry}
              onChangeText={setIdentityCountry}
            />
          </View>

          {/* Country Identity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>National Identity</Text>
            <Input
              label="Identity Type"
              placeholder="national_id, etc."
              value={countryIdentityType}
              onChangeText={setCountryIdentityType}
            />
            <Input
              label="Identity Number"
              placeholder="Enter national ID number"
              value={countryIdentityNumber}
              onChangeText={setCountryIdentityNumber}
            />
            <Input
              label="Country"
              placeholder="Enter country"
              value={countryIdentityCountry}
              onChangeText={setCountryIdentityCountry}
            />
          </View>

          <Button
            title="Submit KYC"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible
          onHide={() => setToast({ visible: false, message: '', type: 'info' })}
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
  keyboardView: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    padding: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});
