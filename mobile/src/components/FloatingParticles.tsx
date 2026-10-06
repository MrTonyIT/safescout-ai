import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface FloatingCloudProps {
  top?: number;
  left?: number;
  right?: number;
  scale?: number;
  duration?: number;
}

export const FloatingCloud: React.FC<FloatingCloudProps> = ({
  top = 100,
  left,
  right,
  scale = 1,
  duration = 4000,
}) => {
  const driftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim, {
          toValue: 12,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftAnim, {
          toValue: -12,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [duration]);

  return (
    <Animated.View
      style={[
        styles.cloudContainer,
        { top, left, right, transform: [{ translateX: driftAnim }, { scale }] },
      ]}
      pointerEvents="none"
    >
      <Svg width={80} height={40} viewBox="0 0 80 40">
        <Path
          d="M 15 32 Q 5 32 5 24 Q 5 15 15 16 Q 20 8 30 8 Q 42 6 48 14 Q 56 10 65 16 Q 75 16 75 25 Q 75 32 65 32 Z"
          fill="rgba(255, 255, 255, 0.75)"
        />
      </Svg>
    </Animated.View>
  );
};

export const TwinklingStar: React.FC<{ top: number; left?: number; right?: number; delay?: number }> = ({
  top,
  left,
  right,
  delay = 0,
}) => {
  const twinkle = useRef(new Animated.Value(0.2)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(twinkle, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(twinkle, { toValue: 0.2, duration: 800, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    }, delay);
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.starContainer,
        { top, left, right, opacity: twinkle, transform: [{ scale }] },
      ]}
      pointerEvents="none"
    >
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d="M 12 0 L 15 8 L 24 12 L 15 16 L 12 24 L 9 16 L 0 12 L 9 8 Z"
          fill="#FFE66D"
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cloudContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  starContainer: {
    position: 'absolute',
    zIndex: 3,
  },
});
