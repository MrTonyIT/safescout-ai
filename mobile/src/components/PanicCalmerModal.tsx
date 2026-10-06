import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { panicCalmer, BreathState } from '../services/panicCalmer';
import { MiloAvatar2D } from './MiloAvatar2D';
import { soundService } from '../services/sound';
import { Heart, X, Sparkles, Wind } from 'lucide-react-native';

interface PanicCalmerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PanicCalmerModal: React.FC<PanicCalmerModalProps> = ({
  visible,
  onClose,
}) => {
  const [breathState, setBreathState] = useState<BreathState>({
    phase: 'INHALE',
    phaseLabel: 'HÍT VÀO SÂU',
    secondsRemaining: 4,
    cycleCount: 0,
    guideText: 'Hít sâu không khí trong lành bằng mũi 👃',
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      panicCalmer.startCalmSession();
      const unsub = panicCalmer.subscribe((s) => {
        setBreathState(s);

        if (s.phase === 'INHALE') {
          Animated.timing(scaleAnim, {
            toValue: 1.45,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        } else if (s.phase === 'EXHALE') {
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        }
      });

      return () => {
        panicCalmer.stopCalmSession();
        unsub();
      };
    }
  }, [visible]);

  const handleClose = () => {
    soundService.playPop();
    panicCalmer.stopCalmSession();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard3D}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <Wind size={20} color="#00F0FF" />
              <Text style={styles.headerTitle}>HÍT THỞ BÌNH TĨNH CÙNG MILO (4-4-4)</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Vòng tròn nhịp thở phát sáng 2.5D */}
          <View style={styles.breathingCircleContainer}>
            <Animated.View
              style={[
                styles.breathingGlowRing,
                {
                  transform: [{ scale: scaleAnim }],
                  borderColor:
                    breathState.phase === 'INHALE'
                      ? '#38BDF8'
                      : breathState.phase === 'EXHALE'
                      ? '#10B981'
                      : '#FFE66D',
                },
              ]}
            >
              <View style={styles.innerMiloCenter}>
                <MiloAvatar2D emotion="THINKING" size={78} showSpeechBubble={false} />
                <Text style={styles.countdownNumberText}>
                  {breathState.secondsRemaining}s
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Nhãn trạng thái nhịp thở */}
          <View style={styles.phaseBadgeContainer}>
            <Text style={styles.phaseLabelText}>{breathState.phaseLabel}</Text>
            <Text style={styles.guideText}>{breathState.guideText}</Text>
          </View>

          {/* Bộ đếm chu kỳ */}
          <View style={styles.cycleCounterBox}>
            <Heart size={16} color="#EF4444" fill="#EF4444" />
            <Text style={styles.cycleText}>
              Đã hoàn thành: {breathState.cycleCount} chu kỳ thư giãn não bộ
            </Text>
          </View>

          {/* Nút Hoàn Tất */}
          <TouchableOpacity
            style={styles.doneBtn3D}
            activeOpacity={0.85}
            onPress={handleClose}
          >
            <Text style={styles.doneBtnText}>BÉ ĐÃ BÌNH TĨNH RỒI! 🛡️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 25, 54, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard3D: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0F2C59',
    borderRadius: 26,
    padding: 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: '#1E3A8A',
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#FFE66D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#1E293B',
    borderRadius: 10,
  },
  breathingCircleContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 14,
  },
  breathingGlowRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerMiloCenter: {
    alignItems: 'center',
  },
  countdownNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: -4,
  },
  phaseBadgeContainer: {
    alignItems: 'center',
    backgroundColor: '#071936',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    width: '100%',
    marginVertical: 8,
  },
  phaseLabelText: {
    color: '#00F0FF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  guideText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  cycleCounterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  cycleText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  doneBtn3D: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#047857',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
