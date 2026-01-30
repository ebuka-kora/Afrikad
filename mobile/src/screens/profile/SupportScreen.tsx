import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';

export const SupportScreen = () => {
  const router = useRouter();

  const supportOptions = [
    {
      id: 'faq',
      icon: 'help-circle-outline',
      title: 'FAQ',
      subtitle: 'Frequently asked questions',
      onPress: () => router.push('/(tabs)/profile/faq'),
    },
    {
      id: 'email',
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: 'support@afrikad.com',
      onPress: () => Linking.openURL('mailto:support@afrikad.com'),
    },
    {
      id: 'chat',
      icon: 'chatbubble-outline',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      onPress: () => router.push('/(tabs)/profile/live-chat'),
    },
    {
      id: 'phone',
      icon: 'call-outline',
      title: 'Phone Support',
      subtitle: '+234 800 AFRIKAD',
      onPress: () => Linking.openURL('tel:+2348002374523'),
    },
  ];

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
        <Text style={styles.title}>Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Get Help</Text>
          <Text style={styles.cardSubtitle}>
            We're here to help you with any questions or issues you may have.
          </Text>
        </Card>

        {supportOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.option}
            onPress={option.onPress}
          >
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Icon name={option.icon} library="ionicons" size={24} color={COLORS.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" library="ionicons" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  content: {
    padding: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
