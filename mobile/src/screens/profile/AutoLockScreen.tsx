import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useLock } from '../../context/LockContext';
import { AUTO_LOCK_OPTIONS, AutoLockSeconds } from '../../context/LockContext';

export const AutoLockScreen = () => {
  const router = useRouter();
  const { autoLockSeconds, setAutoLockSeconds } = useLock();

  const handleSelect = async (value: AutoLockSeconds) => {
    await setAutoLockSeconds(value);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Lock after</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Text style={styles.description}>
              When you leave the app, it will lock after this time. On app open or refresh you always see sign-in or the lock screen.
            </Text>
            {AUTO_LOCK_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.optionRow}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {autoLockSeconds === opt.value && (
                  <Icon name="checkmark-circle" library="ionicons" size={22} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}
          </Card>
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
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  optionLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
});
