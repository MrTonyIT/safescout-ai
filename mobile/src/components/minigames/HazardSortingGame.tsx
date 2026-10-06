import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { soundService } from '../../services/sound';
import { voiceService } from '../../services/voice';
import { Sparkles, CheckCircle, AlertTriangle, Backpack } from 'lucide-react-native';

interface HazardSortingGameProps {
  onGameComplete: (score: number) => void;
}

const ITEMS_TO_SORT = [
  { id: 'item_1', name: 'Nấm Độc Sặc Sỡ', emoji: '🍄', type: 'HAZARD' },
  { id: 'item_2', name: 'Còi Cứu Nạn 3 Tiếng', emoji: '📯', type: 'SURVIVAL' },
  { id: 'item_3', name: 'Chai Nước Tẩy Rửa', emoji: '🧴', type: 'HAZARD' },
  { id: 'item_4', name: 'Áo Phao Cứu Sinh', emoji: '🦺', type: 'SURVIVAL' },
];

export const HazardSortingGame: React.FC<HazardSortingGameProps> = ({
  onGameComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentItem = ITEMS_TO_SORT[currentIndex];

  useEffect(() => {
    voiceService.speakMilo(
      'Bé hãy phân loại vật phẩm: Đồ nguy hiểm bỏ vào Thùng Rác Đỏ, đồ cứu hộ bỏ vào Balo Vàng nhé!',
      'THINKING',
    );
  }, []);

  const handleSort = (chosenType: 'HAZARD' | 'SURVIVAL') => {
    if (isFinished || !currentItem) return;

    if (chosenType === currentItem.type) {
      soundService.playSuccessSound();
      setCorrectCount((prev) => prev + 1);
    } else {
      soundService.playAlertSound();
    }

    if (currentIndex + 1 < ITEMS_TO_SORT.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      soundService.playFanfare();
      voiceService.speakMilo('Con đã làm xong lượt thực hành. Hãy cùng xem lại các lựa chọn.', 'THINKING');
      setTimeout(() => {
        onGameComplete(Math.round(((correctCount + (chosenType === currentItem.type ? 1 : 0)) / ITEMS_TO_SORT.length) * 100));
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <View style={styles.headerRow}>
        <Sparkles size={20} color="#FFE66D" />
        <Text style={styles.gameTitle}>MINIGAME: PHÂN LOẠI HIỂM NGUY & ĐỒ CỨU HỘ</Text>
      </View>

      {/* Tiến độ */}
      <Text style={styles.progressText}>
        Vật phẩm {currentIndex + 1} / {ITEMS_TO_SORT.length}
      </Text>

      {/* Thẻ vật phẩm đang hiển thị */}
      {!isFinished && currentItem ? (
        <View style={styles.itemDisplayCard}>
          <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
          <Text style={styles.itemName}>{currentItem.name}</Text>
        </View>
      ) : null}

      {/* 2 Nút Phân Loại Chunky 3D */}
      {!isFinished ? (
        <View style={styles.sortButtonsRow}>
          <TouchableOpacity
            style={[styles.sortBtn3D, styles.hazardBtn]}
            onPress={() => handleSort('HAZARD')}
            activeOpacity={0.85}
          >
            <AlertTriangle size={24} color="#FFFFFF" />
            <Text style={styles.sortBtnText}>THÙNG NGUY HIỂM</Text>
            <Text style={styles.sortBtnSub}>Tránh xa!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortBtn3D, styles.survivalBtn]}
            onPress={() => handleSort('SURVIVAL')}
            activeOpacity={0.85}
          >
            <Backpack size={24} color="#FFFFFF" />
            <Text style={styles.sortBtnText}>BALO CỨU HỘ</Text>
            <Text style={styles.sortBtnSub}>Cất vào balo!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.finishedBanner}>
          <CheckCircle size={28} color="#10B981" />
          <Text style={styles.finishedBannerText}>PHÂN LOẠI HOÀN HẢO! +100 XP 🛡️</Text>
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
    marginBottom: 4,
  },
  gameTitle: {
    color: '#FFE66D',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  itemDisplayCard: {
    backgroundColor: '#071936',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    width: '80%',
    borderWidth: 2,
    borderColor: '#1E293B',
    marginVertical: 8,
  },
  itemEmoji: {
    fontSize: 48,
    marginBottom: 6,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 10,
  },
  sortBtn3D: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderColor: '#FFFFFF',
  },
  hazardBtn: {
    backgroundColor: '#EF4444',
    borderBottomColor: '#991B1B',
  },
  survivalBtn: {
    backgroundColor: '#059669',
    borderBottomColor: '#047857',
  },
  sortBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  sortBtnSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '700',
  },
  finishedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#10B981',
    marginTop: 10,
  },
  finishedBannerText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '900',
  },
});
