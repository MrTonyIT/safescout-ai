import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { MiloAvatar2D } from './MiloAvatar2D';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { spatialHaptics } from '../services/spatialHaptics';
import { Users, Play, CheckCircle, Flame, X, Sparkles, Trophy } from 'lucide-react-native';

interface FamilyDrillSimulatorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FamilyDrillSimulatorModal: React.FC<FamilyDrillSimulatorModalProps> = ({
  visible,
  onClose,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setIsRunning(false);
      setIsCompleted(false);
      setSecondsElapsed(0);
      voiceService.speakMilo(
        'Ba mẹ hãy bấm Bắt Đầu để kích hoạt diễn tập gia đình thực tế trong phòng nhé!',
        'THINKING',
      );
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const startDrill = () => {
    soundService.playAlertSound();
    spatialHaptics.playElectricShock();
    setIsRunning(true);
    setSecondsElapsed(0);
    voiceService.speakMilo(
      'BÁO ĐỘNG DIỄN TẬP! Bé và ba mẹ hãy cùng nhau bò thấp ra cửa chính ngay bây giờ!',
      'DANGER_ALERT',
    );

    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
  };

  const finishDrill = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsCompleted(true);
    soundService.playFanfare();
    spatialHaptics.playVictoryFanfare();
    voiceService.speakMilo(
      `Tuyệt vời! Cả nhà đã thoát hiểm thành công trong ${secondsElapsed} giây!`,
      'CHEERING',
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard3D}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Users size={20} color="#00F0FF" />
              <Text style={styles.modalTitle}>DIỄN TẬP GIA ĐÌNH THỰC TẾ (LIVE CO-OP)</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                soundService.playPop();
                onClose();
              }}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Avatar Milo & Hướng dẫn */}
          <View style={styles.centerCol}>
            <MiloAvatar2D emotion={isRunning ? 'DANGER_ALERT' : isCompleted ? 'CHEERING' : 'THINKING'} size={72} showSpeechBubble={false} />
            <Text style={styles.scenarioName}>TÌNH HUỐNG: BÒ THẤP DƯỚI KHÓI PHÒNG KHÁCH</Text>
            <Text style={styles.scenarioDesc}>
              {isRunning
                ? '⏳ Đồng hồ đang đếm giây! Bé và ba mẹ hãy nhanh chóng bò ra cửa!'
                : isCompleted
                ? `🏆 Xuất sắc! Thời gian phản xạ của cả nhà: ${secondsElapsed}s`
                : 'Trải một tấm vải ngang bụng, cùng bé thi bò sát sàn nhà ra cửa thoát hiểm!'}
            </Text>
          </View>

          {/* Đồng hồ bấm giờ */}
          {isRunning ? (
            <View style={styles.timerCircle}>
              <Text style={styles.timerNumber}>{secondsElapsed}s</Text>
              <Text style={styles.timerSub}>ĐANG DIỄN TẬP</Text>
            </View>
          ) : null}

          {/* Cụm Nút Điều Khiển */}
          {!isRunning && !isCompleted ? (
            <TouchableOpacity
              style={styles.startBtn3D}
              activeOpacity={0.85}
              onPress={startDrill}
            >
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startBtnText}>BẮT ĐẦU BẤM GIỜ DIỄN TẬP ⏱️</Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity
              style={styles.finishBtn3D}
              activeOpacity={0.85}
              onPress={finishDrill}
            >
              <CheckCircle size={18} color="#FFFFFF" />
              <Text style={styles.finishBtnText}>CẢ NHÀ ĐÃ RA ĐẾN CỬA AN TOÀN! 🚪</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.completeBtn3D}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Trophy size={18} color="#0F172A" />
              <Text style={styles.completeBtnText}>HOÀN TẤT & LƯU VÀO HỒ SƠ 🌟</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 25, 54, 0.9)',
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
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
  centerCol: {
    alignItems: 'center',
    marginVertical: 6,
  },
  scenarioName: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 8,
  },
  scenarioDesc: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
  },
  timerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#071936',
    borderWidth: 3,
    borderColor: '#EF4444',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  timerNumber: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: '900',
  },
  timerSub: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
  },
  startBtn3D: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#38BDF8',
    borderBottomColor: '#0369A1',
    marginTop: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  finishBtn3D: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomColor: '#047857',
    marginTop: 10,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  completeBtn3D: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFE66D',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomColor: '#CA8A04',
    marginTop: 10,
  },
  completeBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
});
