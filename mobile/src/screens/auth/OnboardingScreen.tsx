import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const containerGradient = ['rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)', 'rgba(77, 98, 80, 0.30)'] as const;

const slides = [
  {
    icon: 'globe-outline',
    title: 'Spend Globally Without Borders',
    description: 'Break free from payment limitations and shop from anywhere in the world',
    gradient: containerGradient,
  },
  {
    icon: 'cash-outline',
    title: 'Fund in Naira. Pay in Dollars.',
    description: 'AfriKAD converts your money instantly behind the scenes',
    gradient: containerGradient,
  },
  {
    icon: 'card-outline',
    title: 'Your Secure Virtual USD Card',
    description: 'Bank-level security protecting your funds and transactions',
    gradient: containerGradient,
  },
];

export const OnboardingScreen = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <LinearGradient colors={slide.gradient} style={styles.gradient} />
      
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>
          Afri<Text style={styles.logoAccent}>KAD</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        horizontal
        scrollEnabled={false}
      >
        <View style={styles.slideContainer}>
          <View style={styles.iconWrapper}>
            <Icon name={slide.icon} library="ionicons" size={80} color={COLORS.accent} />
          </View>
          
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {currentSlide < slides.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
          <Button
            title={currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    zIndex: 10,
  },
  logo: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  slideContainer: {
    width: width - SPACING.xl * 2,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  skipButton: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  nextButton: {
    flex: 1,
  },
});
