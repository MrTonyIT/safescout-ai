import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Rect,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export type SkeletalGesture =
  | 'IDLE'
  | 'POINTING_DOWN'
  | 'LOOKING_UP'
  | 'SCANNING'
  | 'EMERGENCY_SOS'
  | 'SALUTING'
  | 'CHEERING'
  | 'THINKING'
  | 'WORRIED';

interface MiloSkeletalCharacterProps {
  gesture?: SkeletalGesture;
  size?: number;
  isTalking?: boolean;
}

export const MiloSkeletalCharacter: React.FC<MiloSkeletalCharacterProps> = ({
  gesture = 'IDLE',
  size = 120,
  isTalking = true,
}) => {
  // ==========================================
  // KHUNG XƯƠNG HOẠT HÌNH (SKELETAL BONE ANIMATIONS)
  // ==========================================
  // 1. Khớp Gốc Thân & Trọng Tâm (Root & Torso Spine)
  const rootY = useRef(new Animated.Value(0)).current;
  const rootScale = useRef(new Animated.Value(1)).current;
  const torsoBreathe = useRef(new Animated.Value(1)).current;

  // 2. Khớp Đầu & Cổ (Head & Neck Bone)
  const headRotate = useRef(new Animated.Value(0)).current;
  const headY = useRef(new Animated.Value(0)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;

  // 3. Khớp Đuôi (Tail Bone - Ngoáy tít qua lại)
  const tailAngle = useRef(new Animated.Value(0)).current;

  // 4. Khớp Cánh Tay Phải (Right Arm / Waving / Whistle Bone)
  const rightArmAngle = useRef(new Animated.Value(0)).current;
  const rightArmY = useRef(new Animated.Value(0)).current;

  // 5. Khớp Cánh Tay Trái (Left Arm / Pointing / Holding Bone)
  const leftArmAngle = useRef(new Animated.Value(0)).current;
  const leftArmX = useRef(new Animated.Value(0)).current;
  const leftArmY = useRef(new Animated.Value(0)).current;

  // 6. Khớp Mắt & Miệng (Facial Features: Blink & Mouth Talk)
  const eyeBlink = useRef(new Animated.Value(1)).current;
  const mouthOpen = useRef(new Animated.Value(0)).current;

  // 7. Khớp Chân & Dậm Nhảy (Feet / Jump Bone)
  const leftFootY = useRef(new Animated.Value(0)).current;
  const rightFootY = useRef(new Animated.Value(0)).current;

  // 8. Đèn Pin & Ăng-ten Phát Sáng (Headlamp & Beacon FX)
  const lampGlow = useRef(new Animated.Value(0.6)).current;
  const beaconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset defaults
    rootY.setValue(0);
    headRotate.setValue(0);
    tailAngle.setValue(0);
    rightArmAngle.setValue(0);
    leftArmAngle.setValue(0);
    leftFootY.setValue(0);
    rightFootY.setValue(0);

    // ==========================================
    // A. VÒNG LẶP ĐUÔI NGOE NGUẨY LIÊN TỤC (TAIL WAG)
    // ==========================================
    const isExcited = gesture === 'CHEERING' || gesture === 'SALUTING' || gesture === 'POINTING_DOWN';
    Animated.loop(
      Animated.sequence([
        Animated.timing(tailAngle, {
          toValue: isExcited ? 28 : 16,
          duration: isExcited ? 140 : 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tailAngle, {
          toValue: isExcited ? -28 : -16,
          duration: isExcited ? 140 : 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // ==========================================
    // B. VÒNG LẶP CHỚP MẮT TỰ NHIÊN (NATURAL BLINKING)
    // ==========================================
    Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(eyeBlink, { toValue: 0.1, duration: 60, useNativeDriver: true }),
        Animated.timing(eyeBlink, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.delay(120),
        Animated.timing(eyeBlink, { toValue: 0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(eyeBlink, { toValue: 1, duration: 70, useNativeDriver: true }),
      ]),
    ).start();

    // ==========================================
    // C. VÒNG LẶP MIỆNG NÓI CHUYỆN (TALKING MOUTH)
    // ==========================================
    if (isTalking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthOpen, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(mouthOpen, { toValue: 0.2, duration: 140, useNativeDriver: true }),
          Animated.timing(mouthOpen, { toValue: 0.8, duration: 160, useNativeDriver: true }),
          Animated.timing(mouthOpen, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ).start();
    }

    // ==========================================
    // D. VÒNG LẶP ĐÈN PIN & ĂNG TEN CỨU HỘ (LIGHT FX)
    // ==========================================
    Animated.loop(
      Animated.sequence([
        Animated.timing(lampGlow, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(lampGlow, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ]),
    ).start();

    if (gesture === 'EMERGENCY_SOS') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(beaconPulse, { toValue: 1.8, duration: 180, useNativeDriver: true }),
          Animated.timing(beaconPulse, { toValue: 0.8, duration: 180, useNativeDriver: true }),
        ]),
      ).start();
    }

    // ==========================================
    // E. DIỄN HOẠT THEO TỪNG CỬ CHỈ (CONTEXTUAL GESTURES)
    // ==========================================
    if (gesture === 'POINTING_DOWN') {
      // Ải 1: Nghiêng người về phía trước, CÁNH TAY TRÁI VƯƠN XUỐNG CHỈ VÀO BỤC ẢI
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(headRotate, { toValue: 8, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(leftArmAngle, { toValue: 38, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(leftArmY, { toValue: 6, duration: 650, useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: -15, duration: 650, useNativeDriver: true }),
            Animated.timing(rootY, { toValue: 4, duration: 650, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(headRotate, { toValue: 4, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(leftArmAngle, { toValue: 30, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(leftArmY, { toValue: 0, duration: 650, useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: 0, duration: 650, useNativeDriver: true }),
            Animated.timing(rootY, { toValue: 0, duration: 650, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    } else if (gesture === 'LOOKING_UP') {
      // 10 Vùng đất: Ngước nhìn lên trên, hai tai vểnh lên, tay giơ la bàn
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(headRotate, { toValue: -14, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(headY, { toValue: -6, duration: 750, useNativeDriver: true }),
            Animated.timing(leftArmAngle, { toValue: -24, duration: 750, useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: -24, duration: 750, useNativeDriver: true }),
            Animated.timing(earWiggle, { toValue: 6, duration: 750, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(headRotate, { toValue: -8, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(headY, { toValue: -2, duration: 750, useNativeDriver: true }),
            Animated.timing(leftArmAngle, { toValue: -12, duration: 750, useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: -12, duration: 750, useNativeDriver: true }),
            Animated.timing(earWiggle, { toValue: -2, duration: 750, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    } else if (gesture === 'SCANNING') {
      // Quét AI: Tay cầm máy soi ra phía trước, mắt mở to, thân mình nghiêng nhẹ
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(leftArmAngle, { toValue: 18, duration: 550, useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: 18, duration: 550, useNativeDriver: true }),
            Animated.timing(headRotate, { toValue: 5, duration: 550, useNativeDriver: true }),
            Animated.timing(rootScale, { toValue: 1.05, duration: 550, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(leftArmAngle, { toValue: 8, duration: 550, useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: 8, duration: 550, useNativeDriver: true }),
            Animated.timing(headRotate, { toValue: -5, duration: 550, useNativeDriver: true }),
            Animated.timing(rootScale, { toValue: 0.98, duration: 550, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    } else if (gesture === 'EMERGENCY_SOS') {
      // Cứu hộ SOS: Đưa còi lên miệng thổi, dậm chân nhanh, đèn nhấp nháy
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rightArmAngle, { toValue: -42, duration: 250, useNativeDriver: true }),
            Animated.timing(rightArmY, { toValue: -8, duration: 250, useNativeDriver: true }),
            Animated.timing(headRotate, { toValue: 4, duration: 250, useNativeDriver: true }),
            Animated.timing(leftFootY, { toValue: -5, duration: 250, useNativeDriver: true }),
            Animated.timing(rightFootY, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(rightArmAngle, { toValue: -32, duration: 250, useNativeDriver: true }),
            Animated.timing(rightArmY, { toValue: -4, duration: 250, useNativeDriver: true }),
            Animated.timing(headRotate, { toValue: -4, duration: 250, useNativeDriver: true }),
            Animated.timing(leftFootY, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(rightFootY, { toValue: -5, duration: 250, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    } else if (gesture === 'SALUTING') {
      // Cổng Ba Mẹ: Đứng nghiêm, tay phải giơ lên chào kiểu Đội Trưởng
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rightArmAngle, { toValue: -48, duration: 600, useNativeDriver: true }),
            Animated.timing(rightArmY, { toValue: -10, duration: 600, useNativeDriver: true }),
            Animated.timing(headRotate, { toValue: 4, duration: 600, useNativeDriver: true }),
            Animated.timing(rootY, { toValue: -3, duration: 600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(rightArmAngle, { toValue: -44, duration: 600, useNativeDriver: true }),
            Animated.timing(rightArmY, { toValue: -8, duration: 600, useNativeDriver: true }),
            Animated.timing(headRotate, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.timing(rootY, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    } else if (gesture === 'CHEERING') {
      // Ăn mừng chiến thắng: Nhảy cẫng lên, 2 tay giơ cao, 2 chân co lại
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rootY, { toValue: -16, duration: 280, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: -55, duration: 280, useNativeDriver: true }),
            Animated.timing(leftArmAngle, { toValue: -55, duration: 280, useNativeDriver: true }),
            Animated.timing(leftFootY, { toValue: -8, duration: 280, useNativeDriver: true }),
            Animated.timing(rightFootY, { toValue: -8, duration: 280, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(rootY, { toValue: 0, duration: 320, easing: Easing.bounce, useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: 0, duration: 320, useNativeDriver: true }),
            Animated.timing(leftArmAngle, { toValue: 0, duration: 320, useNativeDriver: true }),
            Animated.timing(leftFootY, { toValue: 0, duration: 320, useNativeDriver: true }),
            Animated.timing(rightFootY, { toValue: 0, duration: 320, useNativeDriver: true }),
          ]),
          Animated.delay(300),
        ]),
      ).start();
    } else if (gesture === 'THINKING') {
      // Suy nghĩ: Nghiêng đầu, tay gãi cằm
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(headRotate, { toValue: 16, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: -36, duration: 750, useNativeDriver: true }),
            Animated.timing(rightArmY, { toValue: -6, duration: 750, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(headRotate, { toValue: 12, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: -30, duration: 750, useNativeDriver: true }),
            Animated.timing(rightArmY, { toValue: -4, duration: 750, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    } else {
      // IDLE: Vẫy tay chào thân thiện + Nhịp thở tự nhiên
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rootY, { toValue: -5, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: -26, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(torsoBreathe, { toValue: 1.04, duration: 1100, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(rootY, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(rightArmAngle, { toValue: 6, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(torsoBreathe, { toValue: 1.0, duration: 1100, useNativeDriver: true }),
          ]),
        ]),
      ).start();
    }
  }, [gesture, isTalking]);

  // ==========================================
  // CHUYỂN ĐỔI GÓC XOAY KHUNG XƯƠNG THÀNH DEGREE STRING
  // ==========================================
  const headRotateStr = headRotate.interpolate({
    inputRange: [-20, 0, 20],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  const tailAngleStr = tailAngle.interpolate({
    inputRange: [-35, 0, 35],
    outputRange: ['-35deg', '0deg', '35deg'],
  });

  const rightArmAngleStr = rightArmAngle.interpolate({
    inputRange: [-60, 0, 60],
    outputRange: ['-60deg', '0deg', '60deg'],
  });

  const leftArmAngleStr = leftArmAngle.interpolate({
    inputRange: [-60, 0, 60],
    outputRange: ['-60deg', '0deg', '60deg'],
  });

  const earWiggleStr = earWiggle.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <Animated.View
      style={[
        styles.characterContainer,
        {
          width: size,
          height: size * 1.1,
          transform: [{ translateY: rootY }, { scale: rootScale }],
        },
      ]}
    >
      <Svg
        width={size}
        height={size * 1.1}
        viewBox="0 0 200 220"
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          {/* Lông Vàng Cún Cứu Hộ Lượng Tử */}
          <LinearGradient id="furGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="40%" stopColor="#FBBF24" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>

          {/* Lông Mõm & Bụng Kem Trắng Sáng */}
          <LinearGradient id="muzzleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FEF3C7" />
            <Stop offset="100%" stopColor="#FDE68A" />
          </LinearGradient>

          {/* Mũ Bảo Hộ Cứu Nạn Vàng Năng Lượng */}
          <LinearGradient id="helmetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FACC15" />
            <Stop offset="45%" stopColor="#EAB308" />
            <Stop offset="100%" stopColor="#CA8A04" />
          </LinearGradient>

          {/* Áo Phao Cứu Hộ Cam Phản Quang */}
          <LinearGradient id="vestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FB923C" />
            <Stop offset="50%" stopColor="#EA580C" />
            <Stop offset="100%" stopColor="#C2410C" />
          </LinearGradient>

          {/* Balo Cứu Hộ Lượng Tử Xanh Đậm */}
          <LinearGradient id="backpackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E3A8A" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Hào Quang Đèn Pin */}
          <RadialGradient id="lampLightGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
            <Stop offset="60%" stopColor="#FACC15" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#CA8A04" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* ======================================================== */}
        {/* 1. KHỚP ĐUÔI NGOE NGUẨY (SKELETAL TAIL BONE) */}
        {/* ======================================================== */}
        <G origin="145, 140" rotation={tailAngleStr as any}>
          {/* Lông đuôi bông xù vểnh lên */}
          <Path
            d="M 140 145 C 165 130 185 110 180 85 C 160 100 150 120 135 138 Z"
            fill="url(#furGrad)"
            stroke="#92400E"
            strokeWidth="3.5"
          />
          {/* Chóp đuôi trắng kem */}
          <Path
            d="M 172 96 C 182 86 180 85 170 98 Z"
            fill="#FEF3C7"
          />
        </G>

        {/* ======================================================== */}
        {/* 2. KHỚP BALO CỨU HỘ & ĂNG TEN (SKELETAL BACKPACK BONE) */}
        {/* ======================================================== */}
        <G id="Backpack">
          {/* Túi Balo Cứu Hộ Xanh Lượng Tử */}
          <Rect
            x="122"
            y="112"
            width="34"
            height="46"
            rx="8"
            fill="url(#backpackGrad)"
            stroke="#0284C7"
            strokeWidth="3"
          />
          {/* Vạch phản quang vàng trên Balo */}
          <Rect x="122" y="124" width="34" height="6" fill="#FACC15" />

          {/* Túi Sơ Cứu Chữ Thập Đỏ */}
          <Rect x="130" y="136" width="20" height="16" rx="4" fill="#DC2626" />
          <Rect x="138" y="139" width="4" height="10" fill="#FFFFFF" />
          <Rect x="135" y="142" width="10" height="4" fill="#FFFFFF" />

          {/* Cột Ăng-ten Cứu Hộ */}
          <Path d="M 144 112 L 146 92" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          {/* Đèn Beacon Phát Tín Hiệu SOS Chớp Tắt */}
          <Circle cx="146" cy="90" r="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <Circle cx="146" cy="90" r="8" fill="#38BDF8" opacity={0.6} />
        </G>

        {/* ======================================================== */}
        {/* 3. KHỚP 2 CHÂN SAU (SKELETAL REAR FEET BONE) */}
        {/* ======================================================== */}
        <G id="RearFeet">
          {/* Chân sau phải */}
          <Path
            d="M 125 155 Q 145 160 148 185 Q 148 198 132 198 Q 120 198 120 180 Z"
            fill="url(#furGrad)"
            stroke="#92400E"
            strokeWidth="3"
          />
          {/* Móng vuốt cún */}
          <Path d="M 128 198 L 128 190 M 136 198 L 136 190" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
        </G>

        {/* ======================================================== */}
        {/* 4. KHỚP THÂN MÌNH & ÁO PHAO (SKELETAL TORSO BONE) */}
        {/* ======================================================== */}
        <G id="TorsoBody">
          {/* Thân cún tròn trịa mũm mĩm */}
          <Ellipse cx="98" cy="148" rx="38" ry="34" fill="url(#furGrad)" stroke="#92400E" strokeWidth="3.5" />

          {/* Áo Phao Cứu Hộ Cam Đội Trưởng Milo */}
          <Path
            d="M 66 130 Q 98 122 130 130 Q 134 165 98 174 Q 62 165 66 130 Z"
            fill="url(#vestGrad)"
            stroke="#9A3412"
            strokeWidth="3"
          />

          {/* Dây Đai An Toàn Xanh Lượng Tử & Vạch Phản Quang */}
          <Path d="M 80 130 L 82 172 M 116 130 L 114 172" stroke="#1D4ED8" strokeWidth="4" />
          <Path d="M 68 150 Q 98 158 128 150" stroke="#FACC15" strokeWidth="4.5" fill="none" />

          {/* Huy Hiệu Chân Chó Cứu Hộ Trên Ngực */}
          <Path
            d="M 98 136 L 108 144 L 104 158 L 98 162 L 92 158 L 88 144 Z"
            fill="#FEF08A"
            stroke="#CA8A04"
            strokeWidth="2"
          />
          <Circle cx="98" cy="148" r="3.5" fill="#D97706" />
          <Circle cx="94" cy="144" r="1.8" fill="#D97706" />
          <Circle cx="102" cy="144" r="1.8" fill="#D97706" />

          {/* Chiếc Còi Cứu Hộ Xanh Lá Buông Trước Ngực */}
          <Path d="M 112 144 L 116 156 L 110 158 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
          <Circle cx="112" cy="144" r="2.5" fill="#EAB308" />
        </G>

        {/* ======================================================== */}
        {/* 5. KHỚP 2 CHÂN TRƯỚC (SKELETAL FRONT FEET BONE) */}
        {/* ======================================================== */}
        <G id="FrontFeet">
          {/* Chân trước trái */}
          <Path
            d="M 64 160 Q 60 190 56 200 Q 72 205 80 198 Q 80 180 78 160 Z"
            fill="url(#furGrad)"
            stroke="#92400E"
            strokeWidth="3.5"
          />
          <Path d="M 64 200 L 64 192 M 72 200 L 72 192" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />

          {/* Chân trước phải */}
          <Path
            d="M 104 160 Q 106 185 110 200 Q 126 204 130 196 Q 124 175 118 160 Z"
            fill="url(#furGrad)"
            stroke="#92400E"
            strokeWidth="3.5"
          />
          <Path d="M 118 200 L 118 192 M 124 198 L 124 190" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
        </G>

        {/* ======================================================== */}
        {/* 6. KHỚP CÁNH TAY TRÁI (SKELETAL LEFT ARM - CHỈ TRỎ) */}
        {/* ======================================================== */}
        <G origin="60, 130" rotation={leftArmAngleStr as any}>
          {/* Tay áo phao cứu hộ cam */}
          <Ellipse cx="54" cy="134" rx="14" ry="10" fill="url(#vestGrad)" stroke="#9A3412" strokeWidth="2.5" />
          {/* Cẳng tay lông vàng */}
          <Path
            d="M 50 138 Q 36 150 28 162 Q 38 170 48 160 Q 55 148 54 138 Z"
            fill="url(#furGrad)"
            stroke="#92400E"
            strokeWidth="3"
          />
          {/* Bàn chân cún / Ngón tay chỉ trỏ hướng xuống */}
          <Circle cx="34" cy="164" r="8" fill="#FEF3C7" stroke="#92400E" strokeWidth="2.5" />
          <Circle cx="31" cy="166" r="2" fill="#92400E" />
          <Circle cx="37" cy="166" r="2" fill="#92400E" />
        </G>

        {/* ======================================================== */}
        {/* 7. KHỚP CÁNH TAY PHẢI (SKELETAL RIGHT ARM - VẪY CHÀO) */}
        {/* ======================================================== */}
        <G origin="40, 110" rotation={rightArmAngleStr as any}>
          {/* Cẳng tay vung lên cao vẫy chào */}
          <Path
            d="M 48 118 Q 30 102 24 85 Q 38 78 48 94 Q 56 108 52 120 Z"
            fill="url(#furGrad)"
            stroke="#92400E"
            strokeWidth="3.5"
          />
          {/* Đệm Bàn Chân Chó Cứu Hộ Hồng Đáng Yêu (Paw Pads) */}
          <Ellipse cx="28" cy="84" rx="11" ry="10" fill="#FEF3C7" stroke="#92400E" strokeWidth="3" />
          {/* Đệm chính giữa */}
          <Path
            d="M 28 83 Q 23 88 25 91 Q 28 92 31 91 Q 33 88 28 83 Z"
            fill="#78350F"
          />
          {/* 3 Đệm ngón chân nhỏ */}
          <Circle cx="21" cy="80" r="2.2" fill="#78350F" />
          <Circle cx="27" cy="76" r="2.4" fill="#78350F" />
          <Circle cx="33" cy="79" r="2.2" fill="#78350F" />
        </G>

        {/* ======================================================== */}
        {/* 8. KHỚP ĐẦU, CỔ, TAI & MŨ BẢO HỘ (SKELETAL HEAD BONE) */}
        {/* ======================================================== */}
        <G origin="98, 90" rotation={headRotateStr as any}>
          {/* 8.1 Tai Cún Rủ Xuống Cực Dễ Thương (Tai Phải & Tai Trái) */}
          <G origin="60, 45" rotation={earWiggleStr as any}>
            <Path
              d="M 58 46 Q 30 55 22 85 Q 24 110 44 105 Q 60 98 62 60 Z"
              fill="url(#furGrad)"
              stroke="#92400E"
              strokeWidth="3.5"
            />
            <Path d="M 32 78 Q 36 94 45 92" stroke="#CA8A04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </G>

          <G origin="140, 50" rotation={earWiggleStr as any}>
            <Path
              d="M 136 48 Q 166 60 174 90 Q 170 114 150 108 Q 134 98 134 62 Z"
              fill="url(#furGrad)"
              stroke="#92400E"
              strokeWidth="3.5"
            />
          </G>

          {/* 8.2 Khối Đầu Tròn To Của Cún */}
          <Circle cx="98" cy="68" r="46" fill="url(#furGrad)" stroke="#92400E" strokeWidth="4" />

          {/* 8.3 Mõm Trắng Kem & Má Hồng Phúng Phính */}
          <Ellipse cx="98" cy="84" rx="28" ry="20" fill="url(#muzzleGrad)" stroke="#CA8A04" strokeWidth="2" />
          <Circle cx="72" cy="78" r="7" fill="#FCA5A5" opacity={0.6} />
          <Circle cx="124" cy="78" r="7" fill="#FCA5A5" opacity={0.6} />

          {/* 8.4 Mũi Cún Màu Nâu Đen Bóng Bẩy */}
          <Path
            d="M 90 74 Q 98 70 106 74 Q 98 84 90 74 Z"
            fill="#1C1917"
            stroke="#0C0A09"
            strokeWidth="1.5"
          />
          {/* Vệt sáng trên mũi */}
          <Ellipse cx="96" cy="73" rx="2.5" ry="1.2" fill="#FFFFFF" opacity={0.8} />

          {/* 8.5 Miệng Cười Mở Rộng & Lưỡi Hồng (Mouth Talk Anim) */}
          <G origin="98, 86">
            <Path
              d="M 98 80 L 98 86 Q 90 98 80 88 M 98 86 Q 106 98 116 88"
              fill="none"
              stroke="#1C1917"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Vòm họng & Lưỡi hồng thè ra khi cười */}
            <Path
              d="M 88 88 Q 98 108 108 88 Q 98 94 88 88 Z"
              fill="#DC2626"
            />
            <Path
              d="M 92 92 Q 98 104 104 92 Z"
              fill="#F472B6"
            />
          </G>

          {/* 8.6 Đôi Mắt To Tròn Long Lanh (Eye Blink Anim) */}
          <G origin="98, 60" scaleY={eyeBlink as any}>
            {/* Mắt Trái */}
            <Ellipse cx="78" cy="60" rx="10" ry="13" fill="#1C1917" />
            <Circle cx="75" cy="55" r="4.5" fill="#FFFFFF" />
            <Circle cx="81" cy="65" r="2.2" fill="#FFFFFF" />
            {/* Lông mày trái */}
            <Path d="M 68 45 Q 78 38 88 44" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" fill="none" />

            {/* Mắt Phải */}
            <Ellipse cx="118" cy="60" rx="10" ry="13" fill="#1C1917" />
            <Circle cx="115" cy="55" r="4.5" fill="#FFFFFF" />
            <Circle cx="121" cy="65" r="2.2" fill="#FFFFFF" />
            {/* Lông mày phải */}
            <Path d="M 108 44 Q 118 38 128 45" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </G>

          {/* 8.7 MŨ BẢO HỘ CỨU NẠN 3D (RESCUE HELMET) */}
          <Path
            d="M 52 50 Q 98 16 144 50 Q 150 56 142 62 Q 98 48 54 62 Q 46 56 52 50 Z"
            fill="url(#helmetGrad)"
            stroke="#854D0E"
            strokeWidth="3.5"
          />
          {/* Vành Mũ Xanh Lượng Tử */}
          <Path
            d="M 50 58 Q 98 44 146 58 L 144 64 Q 98 50 52 64 Z"
            fill="#1D4ED8"
            stroke="#1E3A8A"
            strokeWidth="1.5"
          />

          {/* Huy Hiệu Chân Chó Cứu Hộ Trên Mũ */}
          <Circle cx="132" cy="42" r="8" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
          <Circle cx="132" cy="43" r="3" fill="#FFFFFF" />
          <Circle cx="129" cy="40" r="1.5" fill="#FFFFFF" />
          <Circle cx="135" cy="40" r="1.5" fill="#FFFFFF" />

          {/* 8.8 ĐÈN PIN LƯỢNG TỬ PHÁT SÁNG TRÊN MŨ (QUANTUM HEADLAMP) */}
          <Rect x="86" y="16" width="24" height="18" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="98" cy="25" r="7.5" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
          {/* Quầng sáng đèn pin quét nhẹ */}
          <Circle cx="98" cy="25" r="14" fill="url(#lampLightGrad)" opacity={lampGlow as any} />
        </G>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  characterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
