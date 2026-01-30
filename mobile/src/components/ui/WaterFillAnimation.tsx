import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../../constants/theme';

interface WaterFillAnimationProps {
  progress: number; // 0 to 1
  success?: boolean;
  failed?: boolean;
  size?: number;
}

export const WaterFillAnimation: React.FC<WaterFillAnimationProps> = ({
  progress,
  success = false,
  failed = false,
  size = 200,
}) => {
  const waterLevel = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate water level
    Animated.timing(waterLevel, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Continuous wave animation
    const waveAnim = Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    waveAnim.start();

    return () => {
      waveAnim.stop();
    };
  }, [progress]);

  const waterHeight = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
  });

  const waveTranslate = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const getWaterColor = () => {
    if (failed) return COLORS.error || '#EF4444';
    if (success) return COLORS.success || '#10B981';
    return COLORS.accent || '#3B82F6';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Container border */}
      <View style={[styles.border, { width: size, height: size, borderRadius: size / 2 }]} />
      
      {/* Water fill */}
      <Animated.View
        style={[
          styles.waterContainer,
          {
            width: size,
            height: waterHeight,
            bottom: 0,
            borderBottomLeftRadius: size / 2,
            borderBottomRightRadius: size / 2,
            overflow: 'hidden',
          },
        ]}
      >
        {/* Wave effect */}
        <Animated.View
          style={[
            styles.wave,
            {
              backgroundColor: getWaterColor(),
              transform: [{ translateX: waveTranslate }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave2,
            {
              backgroundColor: getWaterColor(),
              opacity: 0.7,
              transform: [{ translateX: waveTranslate }],
            },
          ]}
        />
      </Animated.View>

      {/* Success/Error icon overlay */}
      {(success || failed) && (
        <View style={styles.iconOverlay}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: success
                  ? COLORS.success || '#10B981'
                  : COLORS.error || '#EF4444',
              },
            ]}
          >
            {success ? (
              <View style={styles.checkIcon}>
                <View style={styles.checkLine1} />
                <View style={styles.checkLine2} />
              </View>
            ) : (
              <View style={styles.xIcon}>
                <View style={styles.xLine1} />
                <View style={styles.xLine2} />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: COLORS.border || '#E5E7EB',
    backgroundColor: 'transparent',
  },
  waterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    left: -50,
    borderRadius: 50,
  },
  wave2: {
    left: -100,
    top: 10,
  },
  iconOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  checkIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkLine1: {
    width: 3,
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }, { translateX: 2 }, { translateY: -2 }],
    position: 'absolute',
  },
  checkLine2: {
    width: 3,
    height: 18,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateX: -2 }, { translateY: 2 }],
    position: 'absolute',
  },
  xIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine1: {
    width: 3,
    height: 20,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
  },
  xLine2: {
    width: 3,
    height: 20,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
  },
});
