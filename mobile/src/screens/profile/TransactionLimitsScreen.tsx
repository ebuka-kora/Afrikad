import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { formatCurrency } from '../../utils/formatCurrency';

export const TransactionLimitsScreen = () => {
  const router = useRouter();

  const limits = [
    { label: 'Daily Limit', value: formatCurrency(500000, 'NGN'), description: 'Maximum per day' },
    { label: 'Monthly Limit', value: formatCurrency(5000000, 'NGN'), description: 'Maximum per month' },
    { label: 'Single Transaction', value: formatCurrency(100000, 'NGN'), description: 'Maximum per transaction' },
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
        <Text style={styles.title}>Transaction Limits</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Your Limits</Text>
          <Text style={styles.cardSubtitle}>
            These are your current transaction limits. Contact support to adjust them.
          </Text>
        </Card>

        {limits.map((limit, index) => (
          <Card key={index} style={styles.limitCard}>
            <View style={styles.limitRow}>
              <View style={styles.limitLeft}>
                <Text style={styles.limitLabel}>{limit.label}</Text>
                <Text style={styles.limitDescription}>{limit.description}</Text>
              </View>
              <Text style={styles.limitValue}>{limit.value}</Text>
            </View>
          </Card>
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
  limitCard: {
    marginBottom: SPACING.md,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLeft: {
    flex: 1,
  },
  limitLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  limitDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  limitValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.accent,
  },
});
