import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { soundService } from '../../services/sound';
import { voiceService } from '../../services/voice';
import { MiloAvatar2D } from '../MiloAvatar2D';
import { ShieldCheck, Heart, Sparkles, CheckCircle } from 'lucide-react-native';

interface FirstAidBandageGameProps {
  onGameComplete: (score: number) => void;
}

export const FirstAidBandageGame: React.FC<FirstAidBandageGameProps> = ({
  onGameComplete,
}) => {
  const [treatmentProgress, setTreatmentProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<'WATER' | 'GAUZE' | 'BANDAGE' | 'DONE'>('WATER');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    voiceService.speakMilo(
      'Vết bỏng đang bị rát! Bé hãy chạm liên tục vào Vòi Nước Mát để hạ nhiệt 15 phút nhé!',
      'THINKING',
    );

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const handleApplyTreatment = () => {
    soundService.playPop();

    if (currentStep === 'WATER') {
      const nextP = treatmentProgress + 25;
      setTreatmentProgress(nextP);
      if (nextP >= 50) {
        soundService.playSuccessSound();
        setCurrentStep('GAUZE');
        voiceService.speakMilo('Rất tốt! Bây giờ hãy đặt Miếng Gạc Vô Khuẩn sạch lên vết thương!', 'CHEERING');
      }
    } else if (currentStep === 'GAUZE') {
      const nextP = treatmentProgress + 25;
      setTreatmentProgress(nextP);
      if (nextP >= 75) {
        soundService.playSuccessSound();
        setCurrentStep('BANDAGE');
        voiceService.speakMilo('Bước cuối cùng: Quấn Băng Cuộn cố định nhẹ nhàng!', 'CHEERING');
      }
    } else if (currentStep === 'BANDAGE') {
      const nextP = 100;
      setTreatmentProgress(nextP);
      setCurrentStep('DONE');
      soundService.playFanfare();
      voiceService.speakMilo('Hoàn hảo! Bé đã sơ cứu vết thương đúng chuẩn y khoa quốc tế!', 'CHEERING');
      setTimeout(() => {
        onGameComplete(100);
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề Minigame */}
      <View style={styles.headerRow}>
        <Heart size={20} color="#EF4444" fill="#EF4444" />
        <Text style={styles.gameTitle}>MINIGAME: SƠ CỨU BỎNG & VẾT THƯƠNG</Text>
      </View>

      {/* Khu vực cánh tay bị thương 2.5D */}
      <View style={styles.woundDisplayArea}>
        <Svg width={180} height={140} viewBox="0 0 180 140">
          <Defs>
            <LinearGradient id="armSkin" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FDBA74" />
              <Stop offset="100%" stopColor="#FB923C" />
            </LinearGradient>
          </Defs>

          {/* Cánh tay bé */}
          <Path
            d="M 20 50 Q 90 40 160 50 L 160 90 Q 90 100 20 90 Z"
            fill="url(#armSkin)"
            stroke="#EA580C"
            strokeWidth="3"
          />

          {/* Vết bỏng đỏ ở giữa cánh tay */}
          {treatmentProgress < 100 ? (
            <Circle
              cx="90"
              cy="70"
              r={treatmentProgress >= 50 ? 12 : 20}
              fill={treatmentProgress >= 50 ? '#FCA5A5' : '#EF4444'}
              stroke="#B91C1C"
              strokeWidth="2"
            />
          ) : null}

          {/* Nước mát đang xả */}
          {currentStep === 'WATER' ? (
            <Path
              d="M 85 20 Q 90 45 90 65 M 95 20 Q 95 45 95 65"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeDasharray="4 4"
            />
          ) : null}

          {/* Miếng gạc trắng đè lên */}
          {treatmentProgress >= 75 ? (
            <Rect
              x="72"
              y="52"
              width="36"
              height="36"
              rx="6"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          ) : null}

          {/* Băng quấn hoàn tất */}
          {treatmentProgress === 100 ? (
            <Path
              d="M 60 50 L 75 90 M 80 50 L 95 90 M 100 50 L 115 90"
              stroke="#FFFFFF"
              strokeWidth="4"
            />
          ) : null}
        </Svg>

        {/* Thanh Tiến Độ Chữa Lành */}
        <View style={styles.healthBarContainer}>
          <View style={[styles.healthBarFill, { width: `${treatmentProgress}%` }]} />
        </View>
        <Text style={styles.healthPercentText}>Đã chữa lành: {treatmentProgress}%</Text>
      </View>

      {/* Lời Nhắc Bước Thực Hiện */}
      <View style={styles.instructionBubble}>
        <Text style={styles.instructionText}>
          {currentStep === 'WATER'
            ? '💧 Chạm vòi nước: Xả nước mát 15-20 phút hạ nhiệt vết bỏng'
            : currentStep === 'GAUZE'
            ? '🩹 Chạm đặt gạc: Phủ gạc vô khuẩn sạch không dính'
            : currentStep === 'BANDAGE'
            ? '🎗️ Chạm quấn băng: Cố định nhẹ nhàng không quấn quá chặt'
            : '🎉 Đã hoàn thành sơ cứu thành công!'}
        </Text>
      </View>

      {/* Nút Thao Tác Chunky 3D */}
      {currentStep !== 'DONE' ? (
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.actionButton3D,
              {
                backgroundColor:
                  currentStep === 'WATER'
                    ? '#0284C7'
                    : currentStep === 'GAUZE'
                    ? '#10B981'
                    : '#F59E0B',
              },
            ]}
            onPress={handleApplyTreatment}
          >
            <Text style={styles.actionButtonText}>
              {currentStep === 'WATER'
                ? '💧 XẢ NƯỚC MÁT (CHẠM VÀO ĐÂY)'
                : currentStep === 'GAUZE'
                ? '🩹 ĐẶT MIẾNG GẠC VÔ KHUẨN'
                : '🎗️ QUẤN BĂNG CUỘN BẢO VỆ'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={styles.doneBanner}>
          <CheckCircle size={28} color="#10B981" />
          <Text style={styles.doneBannerText}>XUẤT SẮC! +100 XP SƠ CỨU 🛡️</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F2C59',
    borderRadius: 22,
    padding: 16,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: '#1E3A8A',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gameTitle: {
    color: '#FFE66D',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  woundDisplayArea: {
    alignItems: 'center',
    backgroundColor: '#071936',
    borderRadius: 18,
    padding: 12,
    width: '100%',
    marginVertical: 6,
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  healthBarContainer: {
    width: '85%',
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  healthPercentText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  instructionBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
    width: '100%',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  instructionText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  actionButton3D: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  doneBannerText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '900',
  },
});
