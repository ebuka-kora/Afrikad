import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqItems = [
  {
    id: '1',
    question: 'How do I add funds to my wallet?',
    answer:
      'Go to Home, tap "Fund Wallet", enter the amount and generate a unique bank account. Transfer the exact amount to that account and your wallet will be credited within 1–2 minutes.',
  },
  {
    id: '2',
    question: 'How do I withdraw to my bank account?',
    answer:
      'Tap "Withdraw" from Home, enter the amount and your bank account details, then select your bank. Withdrawals are processed within 24 hours on business days.',
  },
  {
    id: '3',
    question: 'What is the virtual card and how do I get it?',
    answer:
      'The virtual card lets you make USD payments online. Complete KYC (identity verification) from the Card tab to request your virtual card. Approval usually takes 1–2 business days.',
  },
  {
    id: '4',
    question: 'What are my transaction limits?',
    answer:
      'View your current daily, monthly, and per-transaction limits under Profile → Transaction Limits. Contact support if you need higher limits.',
  },
  {
    id: '5',
    question: 'How do I update my profile or contact details?',
    answer:
      'Tap your profile, then "Edit profile" to update your name, username, email, and phone number. Changes are saved immediately.',
  },
  {
    id: '6',
    question: 'Who do I contact for account or payment issues?',
    answer:
      'Use Email Support (support@afrikad.com), Live Chat from this Support screen, or call +234 800 AFRIKAD. We typically respond within 24 hours.',
  },
];

export const FAQScreen = () => {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
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
          <Text style={styles.title}>FAQ</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.introCard}>
            <Text style={styles.introTitle}>Frequently asked questions</Text>
            <Text style={styles.introSubtitle}>
              Find quick answers to common questions about AfriKAD.
            </Text>
          </Card>

          {faqItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => toggleExpand(item.id)}
              >
                <Card style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}>
                  <View style={styles.faqHeader}>
                    <Text style={styles.question}>{item.question}</Text>
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      library="ionicons"
                      size={20}
                      color={COLORS.accent}
                    />
                  </View>
                  {isExpanded && (
                    <Text style={styles.answer}>{item.answer}</Text>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}
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
    paddingBottom: SPACING.xxl,
  },
  introCard: {
    marginBottom: SPACING.lg,
  },
  introTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  introSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  faqCard: {
    marginBottom: SPACING.sm,
  },
  faqCardExpanded: {
    marginBottom: SPACING.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  question: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  answer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
