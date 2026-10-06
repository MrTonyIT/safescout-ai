import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { MiloEmotion } from '../types/curriculum';
import {
  Shield,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Compass,
  Scan,
  Flame,
  Flag,
} from 'lucide-react-native';

const PUP_MASCOT_IMG = require('../../assets/milo_rescue_pup.png');
const PUP_THINKING_IMG = require('../../assets/milo_thinking.png');

export type MiloGesture =
  | 'IDLE'
  | 'POINTING_DOWN'
  | 'LOOKING_UP'
  | 'SCANNING'
  | 'EMERGENCY_SOS'
  | 'SALUTING'
  | 'CHEERING'
  | 'THINKING'
  | 'WORRIED';

interface MiloAvatar2DProps {
  emotion?: MiloEmotion;
  gesture?: MiloGesture;
  size?: number;
  speechText?: string;
  actionRequired?: string | null;
  showSpeechBubble?: boolean;
  showFullBody?: boolean;
  customImage?: any;
}

export const MiloAvatar2D: React.FC<MiloAvatar2DProps> = ({
  emotion = 'IDLE',
  gesture = 'IDLE',
  size = 84,
  speechText,
  actionRequired,
  showSpeechBubble = true,
  showFullBody = false,
  customImage,
}) => {
  // =========================================================================
  // ANIMATION LOOPS: 60FPS SMOOTH TRANSFORMS (WEB & MOBILE COMPATIBLE)
  // =========================================================================
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotateVal = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const propY = useRef(new Animated.Value(0)).current;

  const activeMode: MiloGesture = gesture !== 'IDLE' ? gesture : (emotion as MiloGesture);

  useEffect(() => {
    translateY.setValue(0);
    scale.setValue(1);
    rotateVal.setValue(0);
    shadowScale.setValue(1);

    // 1. Phụ kiện bay bồng bềnh (Floating Prop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(propY, { toValue: -6, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(propY, { toValue: 2, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    ).start();

    // 2. Vòng hào quang phát sáng nhịp nhàng
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.8, duration: 700, useNativeDriver: false }),
        Animated.timing(glowOpacity, { toValue: 0.25, duration: 700, useNativeDriver: false }),
      ]),
    ).start();

    // 3. Chuyển động hoạt hình cử chỉ (Duolingo Style Bouncy Gestures)
    if (activeMode === 'POINTING_DOWN') {
      // Ải 1: Nghiêng người về phía trước, nhún người chỉ xuống
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, { toValue: 5, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1.05, duration: 550, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: 5, duration: 550, useNativeDriver: false }),
            Animated.timing(shadowScale, { toValue: 1.15, duration: 550, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, { toValue: -5, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
            Animated.timing(scale, { toValue: 0.98, duration: 600, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: 2, duration: 600, useNativeDriver: false }),
            Animated.timing(shadowScale, { toValue: 0.85, duration: 600, useNativeDriver: false }),
          ]),
        ]),
      ).start();
    } else if (activeMode === 'LOOKING_UP') {
      // 10 Vùng đất: Ngước nhìn lên trên
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, { toValue: -8, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1.04, duration: 700, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: -5, duration: 700, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(scale, { toValue: 0.98, duration: 700, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: -1, duration: 700, useNativeDriver: false }),
          ]),
        ]),
      ).start();
    } else if (activeMode === 'SCANNING') {
      // Quét AI: Lắc lư tập trung
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rotateVal, { toValue: 6, duration: 400, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1.06, duration: 400, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(rotateVal, { toValue: -6, duration: 400, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 0.96, duration: 400, useNativeDriver: false }),
          ]),
        ]),
      ).start();
    } else if (activeMode === 'EMERGENCY_SOS') {
      // SOS: Nhịp đập khẩn cấp
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, { toValue: -6, duration: 150, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: 4, duration: 150, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1.08, duration: 150, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 150, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: -4, duration: 150, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 0.94, duration: 150, useNativeDriver: false }),
          ]),
        ]),
      ).start();
    } else if (activeMode === 'CHEERING' || activeMode === 'SALUTING') {
      // Ăn mừng: Nhảy cẫng lên ăn mừng cực vui nhộn
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, { toValue: -14, duration: 250, easing: Easing.out(Easing.back(1.5)), useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1.08, duration: 250, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: 4, duration: 250, useNativeDriver: false }),
            Animated.timing(shadowScale, { toValue: 0.6, duration: 250, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.bounce, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1.0, duration: 220, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: 0, duration: 220, useNativeDriver: false }),
            Animated.timing(shadowScale, { toValue: 1.0, duration: 220, useNativeDriver: false }),
          ]),
          Animated.delay(350),
        ]),
      ).start();
    } else if (activeMode === 'THINKING') {
      // Suy nghĩ: Nghiêng đầu tò mò
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rotateVal, { toValue: 10, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(translateY, { toValue: -3, duration: 650, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(rotateVal, { toValue: 6, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(translateY, { toValue: 0, duration: 650, useNativeDriver: false }),
          ]),
        ]),
      ).start();
    } else {
      // IDLE: Nhịp thở tự nhiên nhún nhảy êm dịu
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, { toValue: -5, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
            Animated.timing(scale, { toValue: 1.04, duration: 950, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: 2, duration: 950, useNativeDriver: false }),
            Animated.timing(shadowScale, { toValue: 0.8, duration: 950, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
            Animated.timing(scale, { toValue: 0.98, duration: 950, useNativeDriver: false }),
            Animated.timing(rotateVal, { toValue: -2, duration: 950, useNativeDriver: false }),
            Animated.timing(shadowScale, { toValue: 1.0, duration: 950, useNativeDriver: false }),
          ]),
        ]),
      ).start();
    }
  }, [activeMode]);

  const rotateStr = rotateVal.interpolate({
    inputRange: [-15, 0, 15],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  // Cấu hình huy hiệu phụ kiện
  const getContextualProp = () => {
    switch (activeMode) {
      case 'POINTING_DOWN':
        return {
          icon: <Flag size={15} color="#FFFFFF" fill="#FFE66D" />,
          bgColor: '#0284C7',
          tag: 'CHỈ DẪN 🚩',
          haloColor: '#38BDF8',
        };
      case 'LOOKING_UP':
        return {
          icon: <Compass size={15} color="#FFFFFF" />,
          bgColor: '#10B981',
          tag: 'KHÁM PHÁ 🏝️',
          haloColor: '#10B981',
        };
      case 'SCANNING':
        return {
          icon: <Scan size={15} color="#FFFFFF" />,
          bgColor: '#00F0FF',
          tag: 'SOI AI 📸',
          haloColor: '#00F0FF',
        };
      case 'EMERGENCY_SOS':
        return {
          icon: <Flame size={15} color="#FFFFFF" fill="#FFE66D" />,
          bgColor: '#DC2626',
          tag: 'CÒI HÚ 🚨',
          haloColor: '#EF4444',
        };
      case 'SALUTING':
      case 'CHEERING':
        return {
          icon: <Sparkles size={15} color="#FFFFFF" fill="#FFE66D" />,
          bgColor: '#F59E0B',
          tag: 'CHÀO BÉ ⭐',
          haloColor: '#F59E0B',
        };
      case 'THINKING':
        return {
          icon: <HelpCircle size={15} color="#FFFFFF" />,
          bgColor: '#8B5CF6',
          tag: 'SUY NGHĨ 💭',
          haloColor: '#8B5CF6',
        };
      case 'IDLE':
      default:
        return {
          icon: <Shield size={15} color="#FFFFFF" fill="#FF6B35" />,
          bgColor: '#FF6B35',
          tag: 'ĐỘI TRƯỞNG 🐕‍🦺',
          haloColor: '#FF6B35',
        };
    }
  };

  const propConfig = getContextualProp();

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        {/* ========================================================================= */}
        {/* KHỐI MASCOT HOẠT HÌNH NỀN TRONG SUỐT 100% (TRANSPARENT PNG SQUASH & BOUNCE) */}
        {/* ========================================================================= */}
        <View style={[styles.miloFullBodyWrapper, { width: size, height: size * 1.1 }]}>
          {/* 1. Bóng đổ lơ lửng dưới chân cún */}
          <Animated.View
            style={[
              styles.characterDropShadow,
              {
                width: size * 0.65,
                height: 8,
                borderRadius: 4,
                transform: [{ scaleX: shadowScale }],
              },
            ]}
          />

          {/* 2. Vòng hào quang phát sáng êm ái */}
          <Animated.View
            style={[
              styles.characterGroundHalo,
              {
                width: size * 0.85,
                height: size * 0.85,
                borderRadius: (size * 0.85) / 2,
                backgroundColor: propConfig.haloColor,
                opacity: glowOpacity,
              },
            ]}
          />

          {/* 3. Chú Cún Cứu Hộ Đội Trưởng Milo 3D HD Trong Suốt (Active Animated) */}
          <Animated.View
            style={[
              styles.mascotImageHolder,
              {
                width: size,
                height: size,
                transform: [
                  { translateY },
                  { rotate: rotateStr },
                  { scale },
                ],
              },
            ]}
          >
            <Image
              source={customImage || (activeMode === 'THINKING' ? PUP_THINKING_IMG : PUP_MASCOT_IMG)}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 4. Huy hiệu phụ kiện động theo ngữ cảnh */}
          <Animated.View
            style={[
              styles.contextualMiniBadge,
              {
                backgroundColor: propConfig.bgColor,
                transform: [{ translateY: propY }],
              },
            ]}
          >
            {propConfig.icon}
          </Animated.View>
        </View>

        {/* ========================================================================= */}
        {/* KHUNG THOẠI COMIC SPEECH BUBBLE CHUẨN DUOLINGO */}
        {/* ========================================================================= */}
        {showSpeechBubble && speechText ? (
          <View style={styles.bubbleContainer}>
            <View style={styles.bubbleArrow} />
            <View style={styles.bubbleHeaderRow}>
              <View style={[styles.nameBadge, { backgroundColor: propConfig.bgColor }]}>
                <Text style={styles.nameText}>Đội Trưởng Milo • {propConfig.tag}</Text>
              </View>
              {activeMode === 'CHEERING' ? <Text style={styles.emojiDecor}>⭐🎉</Text> : null}
            </View>
            <Text style={styles.speechText}>{speechText}</Text>
            {actionRequired ? (
              <View style={styles.actionBox}>
                <Text style={styles.actionText}>👉 {actionRequired}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miloFullBodyWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  characterDropShadow: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    zIndex: -2,
  },
  characterGroundHalo: {
    position: 'absolute',
    top: '8%',
    zIndex: -1,
  },
  mascotImageHolder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  contextualMiniBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 30,
  },
  bubbleContainer: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 3,
    borderBottomWidth: 5,
    borderColor: '#0F2C59',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  bubbleArrow: {
    position: 'absolute',
    left: -10,
    top: '40%',
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: '#0F2C59',
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  emojiDecor: {
    fontSize: 13,
  },
  speechText: {
    color: '#0F2C59',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionBox: {
    marginTop: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  actionText: {
    color: '#C2410C',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
