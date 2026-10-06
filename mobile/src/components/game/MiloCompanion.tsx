import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, AppState, Easing, Image, Platform, StyleSheet, Text, View,
  type StyleProp, type ViewStyle,
} from 'react-native';
import { useExperiencePreferences } from '../../services/experiencePreferences';

export type MiloCompanionState = 'idle' | 'guiding' | 'thinking' | 'encouraging' | 'explaining' | 'paused';

export type MiloCompanionProps = {
  state?: MiloCompanionState;
  size?: number;
  /** Pass screen focus here; default suitable for a component mounted only while visible. */
  active?: boolean;
  /** A parent that virtualizes or tracks offscreen scenery can pause it here. */
  visible?: boolean;
  /** May request less motion; cannot override the user's or OS reduced-motion preference. */
  reducedMotion?: boolean;
  decorative?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const MILO = require('../../../assets/milo_rescue_pup.png');
const MILO_THINKING = require('../../../assets/milo_thinking.png');
const LABELS: Record<MiloCompanionState, string> = {
  idle: 'Milo đang đồng hành cùng bạn',
  guiding: 'Milo hướng dẫn nhiệm vụ',
  thinking: 'Milo cùng bạn suy nghĩ',
  encouraging: 'Milo động viên bạn',
  explaining: 'Milo cùng bạn tìm hiểu lời giải',
  paused: 'Milo đang nghỉ',
};

/**
 * Two existing mascot poses, six presentation states. This is not a six-pose character rig.
 * A reaction runs on its first eligible presentation, including after preference hydration.
 * An already presented reaction never replays on resume; breathing pauses on blur/background.
 * Web also observes viewport intersection. Native callers supply offscreen visibility explicitly.
 * It emits no audio, haptics, rewards or learning events.
 */
export function MiloCompanion({
  state = 'idle', size = 132, active = true, visible = true, reducedMotion = false,
  decorative = true, accessibilityLabel, style,
}: MiloCompanionProps) {
  const { effectiveReducedMotion, loading } = useExperiencePreferences();
  const container = useRef<View>(null);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [inViewport, setInViewport] = useState(Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined');
  const [imageFailed, setImageFailed] = useState(false);
  const movement = useRef(new Animated.Value(0)).current;
  const presentedState = useRef<MiloCompanionState | undefined>();
  const source = state === 'thinking' || state === 'explaining' ? MILO_THINKING : MILO;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => setForeground(next === 'active'));
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined' || !container.current) return;
    const target = container.current as unknown as Element;
    let mounted = true;
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === target);
      if (mounted && entry) setInViewport(entry.isIntersecting && entry.intersectionRatio > 0);
    }, { threshold: 0 });
    try {
      observer.observe(target);
    } catch {
      // A non-DOM web renderer falls back to the caller's explicit visibility signal.
      setInViewport(true);
      observer.disconnect();
    }
    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, []);
  useEffect(() => { setImageFailed(false); }, [source]);

  useEffect(() => {
    movement.stopAnimation();
    movement.setValue(0);
    if (loading || effectiveReducedMotion || reducedMotion || !active || !visible || !inViewport || !foreground || state === 'paused' || imageFailed) return;

    const timing = (toValue: number, duration: number) => Animated.timing(movement, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
      isInteraction: false,
    });
    let animation: Animated.CompositeAnimation | undefined;
    if (state === 'idle' || state === 'thinking') {
      animation = Animated.loop(Animated.sequence([
        Animated.delay(700), timing(1, 1200), timing(0, 1200),
      ]));
    } else if (presentedState.current !== state) {
      animation = Animated.sequence([
        timing(1, state === 'encouraging' ? 220 : 180),
        timing(0, state === 'encouraging' ? 260 : 220),
      ]);
    }
    if (animation) {
      presentedState.current = state;
      animation.start();
    }
    return () => {
      animation?.stop();
      movement.stopAnimation();
      movement.setValue(0);
    };
  }, [state, active, visible, inViewport, foreground, effectiveReducedMotion, reducedMotion, loading, imageFailed, movement]);

  const translateY = movement.interpolate({ inputRange: [0, 1], outputRange: [0, state === 'encouraging' ? -12 : -6] });
  const scale = movement.interpolate({ inputRange: [0, 1], outputRange: [1, state === 'encouraging' ? 1.08 : 1.025] });
  const opacity = movement.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });
  return <View
    ref={container}
    pointerEvents="none"
    style={[styles.frame, { width: size, height: size }, style]}
    accessible={!decorative}
    accessibilityRole={decorative ? undefined : 'image'}
    accessibilityLabel={decorative ? undefined : (accessibilityLabel || LABELS[state])}
    accessibilityElementsHidden={decorative}
    importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
  >
    <View style={[styles.shadow, { width: size * 0.59, bottom: size * 0.035, height: size * 0.08 }]} />
    <Animated.View style={[styles.figure, { opacity, transform: [{ translateY }, { scale }] }]}>
      {imageFailed
        ? <View style={styles.fallback}><Text style={styles.fallbackText}>Milo</Text></View>
        : <Image source={source} onError={() => setImageFailed(true)} resizeMode="contain" style={styles.image} accessible={false} />}
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  figure: { width: '100%', height: '100%' },
  image: { width: '100%', height: '100%' },
  shadow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(21, 46, 56, 0.12)' },
  fallback: { flex: 1, borderRadius: 999, backgroundColor: '#FFDE85', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#B37C2D' },
  fallbackText: { fontSize: 24, fontWeight: '800', color: '#493623' },
});
