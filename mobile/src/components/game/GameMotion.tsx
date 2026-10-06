import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {Animated, AppState, Easing, Platform, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Svg, {Ellipse, Path} from 'react-native-svg';
import {useExperiencePreferences} from '../../services/experiencePreferences';

export const GameExperience = createContext({motion: false, tap: () => {}});
export const useGameExperience = () => useContext(GameExperience);

export function useMotionPermission(active: boolean) {
  const {effectiveReducedMotion, loading} = useExperiencePreferences();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => sub.remove();
  }, []);
  return active && foreground && !loading && !effectiveReducedMotion;
}

/** Finite transitions never delay or change the underlying action. */
export function MotionReveal({children, trigger, style}: {children: React.ReactNode; trigger?: string; style?: StyleProp<ViewStyle>}) {
  const {motion} = useGameExperience();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (!motion) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, {toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false});
    animation.start();
    return () => animation.stop();
  }, [trigger, motion, progress]);
  return <Animated.View style={[style, {
    opacity: progress.interpolate({inputRange: [0, 1], outputRange: [.5, 1]}),
    transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [12, 0]})}],
  }]}>{children}</Animated.View>;
}

/** Two shared tracks for all clouds, cleaned up on pause; no particle timers. */
export function WorldAtmosphere({active, width}: {active: boolean; width: number}) {
  const enabled = useMotionPermission(active);
  const frame = useRef<View>(null);
  const [inView, setInView] = useState(Platform.OS !== 'web');
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') {setInView(true); return;}
    const element = frame.current as unknown as Element;
    if (!element) return;
    const observer = new IntersectionObserver(entries => setInView(entries.some(e => e.isIntersecting)), {threshold: 0});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    drift.stopAnimation(); drift.setValue(0);
    if (!enabled || !inView) return;
    const timing = (toValue: number) => Animated.timing(drift, {toValue, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web', isInteraction: false});
    const loop = Animated.loop(Animated.sequence([timing(1), timing(0)]));
    loop.start(); return () => loop.stop();
  }, [enabled, inView, drift]);
  return <View ref={frame} pointerEvents="none" accessible={false} accessibilityElementsHidden style={[StyleSheet.absoluteFill, {height: 360}]}>
    {[{x: .08, y: 18, s: 1}, {x: .63, y: 140, s: .7}].map((cloud, i) => <Animated.View testID={'world-cloud-'+i} key={i} style={{position: 'absolute', left: width * cloud.x, top: cloud.y, opacity: .84, transform: [{translateX: drift.interpolate({inputRange: [0, 1], outputRange: [0, i ? -24 : 30]})}, {scale: cloud.s}]}}>
      <Svg width={112} height={50} viewBox="0 0 112 50"><Ellipse cx={57} cy={37} rx={52} ry={11} fill="#EAFBFF"/><Path d="M9 37Q5 17 25 18Q32 -5 54 12Q78 0 87 22Q112 17 107 37Z" fill="#FFFFFF"/></Svg>
    </Animated.View>)}
  </View>;
}

const celebrated = new Set<string>();
/** Cosmetic only, keyed by server receipt; never awards XP or reacts to pending. */
export function RewardBurst({receiptId, enabled}: {receiptId: string; enabled: boolean}) {
  const {motion} = useGameExperience();
  const phase = useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!enabled || !motion || celebrated.has(receiptId)) return;
    celebrated.add(receiptId);
    if (celebrated.size > 150) celebrated.delete(celebrated.values().next().value!);
    setVisible(true); phase.setValue(0);
    const animation = Animated.timing(phase, {toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false});
    animation.start(({finished}) => {if (finished) setVisible(false);});
    return () => {animation.stop(); setVisible(false);};
  }, [receiptId, enabled, motion, phase]);
  if (!visible) return null;
  return <View pointerEvents="none" accessible={false} style={[StyleSheet.absoluteFill, {overflow: 'hidden', zIndex: 5}]}>{Array.from({length: 12}, (_, i) => <Animated.View key={i} style={{position: 'absolute', left: `${8 + i * 7}%`, top: 115, width: i % 2 ? 7 : 10, height: i % 2 ? 12 : 8, borderRadius: 3, backgroundColor: ['#FFD36B', '#39BCA6', '#F18C70', '#86CBF0'][i % 4], opacity: phase.interpolate({inputRange: [0, .75, 1], outputRange: [1, 1, 0]}), transform: [{translateY: phase.interpolate({inputRange: [0, .32, 1], outputRange: [0, -65 - (i % 3) * 20, 145 + (i % 4) * 15]})}, {rotate: phase.interpolate({inputRange: [0, 1], outputRange: ['0deg', `${i % 2 ? 260 : -200}deg`]})}]}}/>)}</View>;
}
