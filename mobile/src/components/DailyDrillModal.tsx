import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { streakService, DailyStreakData } from '../services/streakService';
import { MiloAvatar2D } from './MiloAvatar2D';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { spatialHaptics } from '../services/spatialHaptics';
import { Flame, CheckCircle, Sparkles, X, Zap } from 'lucide-react-native';

interface DailyDrillModalProps {
  visible: boolean;
  onClose: () => void;
}

const DAILY_DRILL_QUESTION = {
  question: 'Khi phát hiện mùi khét và khói mù trong phòng, việc đầu tiên bé cần làm là gì?',
  options: [
    { id: 'opt_1', text: 'Bò thấp sát sàn nhà và tìm khăn ẩm bịt mũi miệng 🫁', isCorrect: true },
    { id: 'opt_2', text: 'Đứng thẳng người và chạy đi tìm đồ chơi yêu thích 🧸', isCorrect: false },
    { id: 'opt_3', text: 'Mở cửa sổ hóng gió và nấp vào tủ quần áo 🚪', isCorrect: false },
  ],
};

export const DailyDrillModal: React.FC<DailyDrillModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [streak, setStreak] = useState<DailyStreakData>(streakService.getStreakData());

  useEffect(() => {
    if (visible) {
      setIsAnswered(false);
      setSelectedOpt(null);
      voiceService.speakMilo(
        'Câu hỏi Luyện Tập Hằng Ngày: ' + DAILY_DRILL_QUESTION.question,
        'THINKING',
      );
    }
  }, [visible]);

  const handleSelectOption = (optId: string, isCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedOpt(optId);
    setIsAnswered(true);

    if (isCorrect) {
      soundService.playFanfare();
      spatialHaptics.playVictoryFanfare();
      const updated = streakService.completeDailyDrill();
      setStreak(updated);
      voiceService.speakMilo('Chính xác tuyệt đối! Bé đã giữ vững ngọn lửa sinh tồn 7 ngày liên tiếp!', 'CHEERING');
    } else {
      soundService.playAlertSound();
      spatialHaptics.playElectricShock();
      voiceService.speakMilo('Chưa chính xác rồi, khói độc luôn bốc lên cao nên bé phải luôn bò thấp sát sàn nhà nhé!', 'DANGER_ALERT');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard3D}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.streakBadge}>
              <Flame size={20} color="#FF6B35" fill="#FF6B35" />
              <Text style={styles.streakBadgeText}>CHUỖI LỬA {streak.currentStreak} NGÀY</Text>
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

          {/* Avatar Milo và Câu hỏi */}
          <View style={styles.miloCol}>
            <MiloAvatar2D emotion={isAnswered ? 'CHEERING' : 'THINKING'} size={72} showSpeechBubble={false} />
            <Text style={styles.drillTag}>LUYỆN TẬP PHẢN XẠ HÀNG NGÀY (DAILY DRILL)</Text>
            <Text style={styles.questionText}>{DAILY_DRILL_QUESTION.question}</Text>
          </View>

          {/* Danh sách lựa chọn chunky */}
          <View style={styles.optionsCol}>
            {DAILY_DRILL_QUESTION.options.map((opt) => {
              const isSelected = selectedOpt === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  disabled={isAnswered}
                  activeOpacity={0.85}
                  style={[
                    styles.optButton3D,
                    isSelected ? (opt.isCorrect ? styles.optCorrect : styles.optWrong) : null,
                  ]}
                  onPress={() => handleSelectOption(opt.id, opt.isCorrect)}
                >
                  <Text style={styles.optText}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isAnswered ? (
            <TouchableOpacity
              style={styles.continueBtn3D}
              activeOpacity={0.85}
              onPress={() => {
                soundService.playPop();
                onClose();
              }}
            >
              <Text style={styles.continueBtnText}>NHẬN +50 XP & TIẾP TỤC 🚀</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 25, 54, 0.88)',
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF6B35',
  },
  streakBadgeText: {
    color: '#FF6B35',
    fontSize: 11,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#1E293B',
    borderRadius: 10,
  },
  miloCol: {
    alignItems: 'center',
    marginVertical: 6,
  },
  drillTag: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
  optionsCol: {
    gap: 8,
    marginVertical: 12,
  },
  optButton3D: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#334155',
  },
  optCorrect: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
  },
  optWrong: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  optText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  continueBtn3D: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomColor: '#C2410C',
    marginTop: 4,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
