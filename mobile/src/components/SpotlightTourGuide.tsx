import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
import { MiloAvatar2D } from './MiloAvatar2D';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { spatialHaptics } from '../services/spatialHaptics';
import {
  Sparkles,
  MapPin,
  Compass,
  Scan,
  Flame,
  Users,
  Volume2,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MeasuredTargets {
  zoneBar?: { x: number; y: number; width: number; height: number };
  stage1?: { x: number; y: number; width: number; height: number };
  fixedHeaderHeight?: number;
  tabLayouts?: any;
}

export interface SpotlightStepDef {
  id: number;
  title: string;
  speech: string;
  icon: any;
  cardPosition: 'top' | 'bottom';
  type: 'circle' | 'rect';
  gesture?: 'POINTING_DOWN' | 'LOOKING_UP' | 'SCANNING' | 'EMERGENCY_SOS' | 'SALUTING' | 'CHEERING' | 'THINKING';
  getTarget: (
    width: number,
    height: number,
    measured?: MeasuredTargets,
  ) => {
    cx?: number;
    cy?: number;
    r?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rx?: number;
  };
}

const TOUR_STEPS: SpotlightStepDef[] = [
  {
    id: 1,
    title: 'Ải 1: Thử Thách Sinh Tồn 🗺️',
    speech: 'Đây là Ải 1 của Vùng Đất! Hãy chạm vào đây để bắt đầu bài học sinh tồn đầu tiên nhé!',
    icon: MapPin,
    cardPosition: 'bottom',
    type: 'circle',
    gesture: 'POINTING_DOWN',
    getTarget: (w, h, measured) => {
      const headerH = measured?.fixedHeaderHeight || 230;
      const canvasW = Math.min(w, 480);
      const canvasLeft = (w - canvasW) / 2;

      let cx = w / 2;
      let cy = headerH + 145;

      if (measured?.stage1) {
        cx = canvasLeft + measured.stage1.x + measured.stage1.width / 2;
        cy = headerH + 10 + measured.stage1.y + 30;
      }

      return {
        cx,
        cy,
        r: 56,
      };
    },
  },
  {
    id: 2,
    title: '10 Vùng Đất Phiêu Lưu 🏝️',
    speech: 'Phía trên là 10 Vùng Đất Phiêu Lưu bí mật chờ con khám phá!',
    icon: Compass,
    cardPosition: 'bottom',
    type: 'rect',
    gesture: 'LOOKING_UP',
    getTarget: (w, h, measured) => {
      if (measured?.zoneBar && measured.zoneBar.y > 0) {
        return {
          x: measured.zoneBar.x + 6,
          y: measured.zoneBar.y + 2,
          width: measured.zoneBar.width - 12,
          height: measured.zoneBar.height - 4,
          rx: 18,
        };
      }
      return {
        x: 8,
        y: 84,
        width: w - 16,
        height: 72,
        rx: 18,
      };
    },
  },
  {
    id: 3,
    title: 'Quét AI Balo Milo 📸',
    speech: 'Bấm vào đây để dùng Camera Balo Milo soi đồ vật lạ ngoài đời thực!',
    icon: Scan,
    cardPosition: 'top',
    type: 'circle',
    gesture: 'SCANNING',
    getTarget: (w, h) => {
      const cw = Math.min(w - 40, 420);
      const cl = (w - cw) / 2;
      const innerW = cw - 16;
      return {
        cx: cl + 8 + innerW * 0.3,
        cy: h - 41,
        r: 29,
      };
    },
  },
  {
    id: 4,
    title: 'Cứu Hộ Khẩn Cấp (SOS) 🚨',
    speech: 'Nút màu đỏ này là Cứu Hộ Khẩn Cấp - có còi hú và số gọi cứu trợ khi gặp nạn!',
    icon: Flame,
    cardPosition: 'top',
    type: 'circle',
    gesture: 'EMERGENCY_SOS',
    getTarget: (w, h) => {
      const cw = Math.min(w - 40, 420);
      const cl = (w - cw) / 2;
      const innerW = cw - 16;
      return {
        cx: cl + 8 + innerW * 0.7,
        cy: h - 41,
        r: 29,
      };
    },
  },
  {
    id: 5,
    title: 'Cổng Dành Cho Ba Mẹ 👨‍👩‍👧',
    speech: 'Góc này dành riêng cho ba mẹ kiểm tra kết quả rèn luyện của con!',
    icon: Users,
    cardPosition: 'top',
    type: 'circle',
    gesture: 'SALUTING',
    getTarget: (w, h) => {
      const cw = Math.min(w - 40, 420);
      const cl = (w - cw) / 2;
      const innerW = cw - 16;
      return {
        cx: cl + 8 + innerW * 0.9,
        cy: h - 41,
        r: 29,
      };
    },
  },
];

interface SpotlightTourGuideProps {
  visible: boolean;
  onFinish: () => void;
  measuredTargets?: MeasuredTargets;
}

export const SpotlightTourGuide: React.FC<SpotlightTourGuideProps> = ({
  visible,
  onFinish,
  measuredTargets,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: Math.min(SCREEN_WIDTH, 480),
    height: SCREEN_HEIGHT,
  });

  // Animations: 3-Tier Staggered Golden Aura Waves
  const aura1 = useRef(new Animated.Value(0)).current;
  const aura2 = useRef(new Animated.Value(0)).current;
  const aura3 = useRef(new Animated.Value(0)).current;

  // Animations: Step Transition, Milo Pop, and Card Slide
  const cardSlide = useRef(new Animated.Value(25)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const miloBounce = useRef(new Animated.Value(1)).current;
  const spotlightPop = useRef(new Animated.Value(0.9)).current;

  const currentStep = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];
  const StepIcon = currentStep.icon;

  useEffect(() => {
    if (visible) {
      setCurrentStepIdx(0);
      animateStep(0);

      // 3 Tầng sóng hào quang vàng lan tỏa nhịp nhàng liên tục
      const createAuraAnim = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1800,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      const auraLoop = Animated.parallel([
        createAuraAnim(aura1, 0),
        createAuraAnim(aura2, 600),
        createAuraAnim(aura3, 1200),
      ]);

      auraLoop.start();

      return () => {
        auraLoop.stop();
      };
    }
  }, [visible]);

  const animateStep = (stepIdx: number) => {
    const isTop = TOUR_STEPS[stepIdx]?.cardPosition === 'top';
    cardSlide.setValue(isTop ? -30 : 30);
    cardOpacity.setValue(0);
    miloBounce.setValue(0.85);
    spotlightPop.setValue(0.85);

    // Chuyển động nhún nhảy mượt mà như bơ
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.spring(miloBounce, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(spotlightPop, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    const stepObj = TOUR_STEPS[stepIdx];
    if (stepObj) {
      voiceService.speakMilo(stepObj.speech, 'CHEERING');
    }
  };

  const handleNext = () => {
    soundService.playPop();
    spatialHaptics.playHealingSoothe();

    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      animateStep(nextIdx);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    soundService.playFanfare();
    spatialHaptics.playVictoryFanfare();
    voiceService.stop();
    onFinish();
  };

  if (!visible) return null;

  const { width: w, height: h } = containerSize;
  const target = currentStep.getTarget(w, h, measuredTargets);

  return (
    <View
      style={styles.overlayContainer}
      pointerEvents="box-none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }}
    >
      {/* ==================================================== */}
      {/* 1. SVG MASK TRUE CUTOUT SPOTLIGHT (TRONG SUỐT 100% SÁNG RỰC) */}
      {/* ==================================================== */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <Svg width={w} height={h} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Mask id="spotlightHoleMask">
              {/* Toàn bộ vùng phủ tối màu trắng */}
              <Rect x="0" y="0" width={w} height={h} fill="#FFFFFF" />

              {/* Đục lỗ 100% trong suốt (màu đen trong Mask) */}
              {currentStep.type === 'circle' && target.cx !== undefined && target.cy !== undefined ? (
                <Circle cx={target.cx} cy={target.cy} r={target.r || 29} fill="#000000" />
              ) : null}

              {currentStep.type === 'rect' && target.x !== undefined && target.y !== undefined ? (
                <Rect
                  x={target.x}
                  y={target.y}
                  width={target.width || 100}
                  height={target.height || 50}
                  rx={target.rx || 16}
                  ry={target.rx || 16}
                  fill="#000000"
                />
              ) : null}
            </Mask>
          </Defs>

          {/* Lớp nền tối rgba(7, 25, 54, 0.84) đục thủng lỗ Spotlight */}
          <Rect
            x="0"
            y="0"
            width={w}
            height={h}
            fill="#071936"
            fillOpacity={0.84}
            mask="url(#spotlightHoleMask)"
          />

          {/* Viền Neon Vàng Ánh Kim phát sáng tròn trịa quanh lỗ đục */}
          {currentStep.type === 'circle' && target.cx !== undefined && target.cy !== undefined ? (
            <>
              <Circle
                cx={target.cx}
                cy={target.cy}
                r={(target.r || 29) + 3}
                stroke="#00F0FF"
                strokeWidth={1.5}
                fill="none"
                opacity={0.6}
              />
              <Circle
                cx={target.cx}
                cy={target.cy}
                r={target.r || 29}
                stroke="#FFE66D"
                strokeWidth={3.5}
                fill="none"
              />
            </>
          ) : null}

          {currentStep.type === 'rect' && target.x !== undefined && target.y !== undefined ? (
            <>
              <Rect
                x={(target.x || 0) - 2}
                y={(target.y || 0) - 2}
                width={(target.width || 100) + 4}
                height={(target.height || 50) + 4}
                rx={(target.rx || 16) + 2}
                ry={(target.rx || 16) + 2}
                stroke="#00F0FF"
                strokeWidth={1.5}
                fill="none"
                opacity={0.6}
              />
              <Rect
                x={target.x}
                y={target.y}
                width={target.width || 100}
                height={target.height || 50}
                rx={target.rx || 16}
                ry={target.rx || 16}
                stroke="#FFE66D"
                strokeWidth={3.5}
                fill="none"
              />
            </>
          ) : null}
        </Svg>
      </View>

      {/* ==================================================== */}
      {/* 2. 3 TẦNG SÓNG HÀO QUANG VÀNG (AURA RIPPLES) TỎA RA MƯỢT MÀ */}
      {/* ==================================================== */}
      {currentStep.type === 'circle' && target.cx !== undefined && target.cy !== undefined ? (
        <View
          pointerEvents="none"
          style={[
            styles.auraCenterWrapper,
            {
              left: target.cx - (target.r || 29),
              top: target.cy - (target.r || 29),
              width: (target.r || 29) * 2,
              height: (target.r || 29) * 2,
            },
          ]}
        >
          {[aura1, aura2, aura3].map((auraAnim, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.goldenAuraWave,
                {
                  borderRadius: (target.r || 29) * 2,
                  transform: [
                    {
                      scale: auraAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                  opacity: auraAnim.interpolate({
                    inputRange: [0, 0.2, 0.7, 1],
                    outputRange: [0.9, 0.75, 0.25, 0],
                  }),
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      {currentStep.type === 'rect' && target.x !== undefined && target.y !== undefined ? (
        <View
          pointerEvents="none"
          style={[
            styles.auraCenterWrapper,
            {
              left: target.x,
              top: target.y,
              width: target.width,
              height: target.height,
            },
          ]}
        >
          {[aura1, aura2, aura3].map((auraAnim, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.goldenAuraWave,
                {
                  borderRadius: (target.rx || 18) + 4,
                  transform: [
                    {
                      scale: auraAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.09],
                      }),
                    },
                  ],
                  opacity: auraAnim.interpolate({
                    inputRange: [0, 0.2, 0.7, 1],
                    outputRange: [0.9, 0.75, 0.25, 0],
                  }),
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      {/* Lớp nền chặn bấm ra ngoài (Chỉ bấm nút Tiếp theo mới qua phần khác) */}
      <View style={styles.backdropOverlay} pointerEvents="auto" />

      {/* ==================================================== */}
      {/* 3. KHUNG THOẠI MILO 3D & ĐIỀU KHIỂN HƯỚNG DẪN 5 BƯỚC */}
      {/* ==================================================== */}
      <Animated.View
        style={[
          styles.speechCardWrapper,
          currentStep.cardPosition === 'top' ? styles.speechCardTop : styles.speechCardBottom,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <View style={styles.speechCard3D}>
          {/* Header Thẻ: 5 Thanh Tiến Trình + Nút Bỏ Qua */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.stepPillsRow}>
              {[0, 1, 2, 3, 4].map((idx) => {
                const isCurrent = idx === currentStepIdx;
                const isPassed = idx < currentStepIdx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.stepDotPill,
                      isCurrent
                        ? styles.stepDotPillActive
                        : isPassed
                        ? styles.stepDotPillPassed
                        : styles.stepDotPillPending,
                    ]}
                  />
                );
              })}
              <Text style={styles.stepCountText}>
                {currentStepIdx + 1}/5
              </Text>
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.8}
              onPress={handleClose}
            >
              <Text style={styles.skipButtonText}>BỎ QUA ✕</Text>
            </TouchableOpacity>
          </View>

          {/* Hàng Thoại Milo 2.5D + Lời Hướng Dẫn */}
          <View style={styles.miloSpeechRow}>
            <Animated.View style={{ transform: [{ scale: miloBounce }] }}>
              <MiloAvatar2D
                emotion="CHEERING"
                gesture={currentStep.gesture || 'IDLE'}
                size={58}
                showSpeechBubble={false}
              />
            </Animated.View>
            <View style={styles.speechContentCol}>
              <View style={styles.titleSpeakerRow}>
                <View style={styles.stepTitleBadge}>
                  <StepIcon size={15} color="#00F0FF" />
                  <Text style={styles.cardTitleText}>{currentStep.title}</Text>
                </View>
                <TouchableOpacity
                  style={styles.speakerMiniBtn}
                  onPress={() => {
                    soundService.playPop();
                    voiceService.speakMilo(currentStep.speech, 'CHEERING');
                  }}
                >
                  <Volume2 size={15} color="#FFE66D" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardSpeechText}>{currentStep.speech}</Text>
            </View>
          </View>

          {/* Nút Bắt Buộc Nhấn Để Tiếp Tục */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.nextStepBtn}
            onPress={handleNext}
          >
            <Text style={styles.nextStepBtnText}>
              {currentStepIdx < TOUR_STEPS.length - 1 ? 'TIẾP THEO ➜' : 'ĐÃ HIỂU, BẮT ĐẦU NGAY! 🚀'}
            </Text>
            <Sparkles size={16} color="#071936" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  auraCenterWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  goldenAuraWave: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2.5,
    borderColor: '#FFE66D',
    backgroundColor: 'transparent',
  },
  speechCardWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 1001,
  },
  speechCardTop: {
    top: 185,
  },
  speechCardBottom: {
    bottom: 80,
  },
  speechCard3D: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F2C59',
    borderRadius: 22,
    padding: 15,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#38BDF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepDotPill: {
    width: 16,
    height: 6,
    borderRadius: 3,
  },
  stepDotPillActive: {
    backgroundColor: '#00F0FF',
    width: 24,
  },
  stepDotPillPassed: {
    backgroundColor: '#10B981',
  },
  stepDotPillPending: {
    backgroundColor: '#1E3A8A',
  },
  stepCountText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
  },
  skipButton: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  skipButtonText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '800',
  },
  miloSpeechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  speechContentCol: {
    flex: 1,
  },
  titleSpeakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  cardTitleText: {
    color: '#00F0FF',
    fontSize: 13.5,
    fontWeight: '900',
    flexShrink: 1,
  },
  speakerMiniBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE66D',
  },
  cardSpeechText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  nextStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#0284C7',
    gap: 6,
  },
  nextStepBtnText: {
    color: '#071936',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
