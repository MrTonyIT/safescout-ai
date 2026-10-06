import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Sparkles, Gift, Award, X } from 'lucide-react-native';
import { soundService } from '../services/sound';

interface TreasureChest3DProps {
  bonusXp?: number;
}

export const TreasureChest3D: React.FC<TreasureChest3DProps> = ({ bonusXp = 50 }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const handleOpen = () => {
    soundService.playFanfare();
    setOpened(true);
    setModalVisible(true);

    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={handleOpen}>
        <Animated.View style={[styles.chestWrapper, { transform: [{ scale: bounceAnim }] }]}>
          {/* Sparkle badge */}
          {!opened ? (
            <View style={styles.sparkleBadge}>
              <Sparkles size={12} color="#FFFFFF" />
              <Text style={styles.sparkleText}>MỞ QUÀ</Text>
            </View>
          ) : null}

          {/* SVG Rương Kho Báu 3D */}
          <Svg width={64} height={52} viewBox="0 0 64 52">
            <Defs>
              <LinearGradient id="chestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#F59E0B" />
                <Stop offset="100%" stopColor="#B45309" />
              </LinearGradient>
              <LinearGradient id="goldRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FDE047" />
                <Stop offset="100%" stopColor="#EAB308" />
              </LinearGradient>
            </Defs>
            {/* Thân Rương */}
            <Rect x="8" y="20" width="48" height="28" rx="6" fill="url(#chestGrad)" stroke="#78350F" strokeWidth="2.5" />
            {/* Nẹp Vàng */}
            <Rect x="26" y="20" width="12" height="28" fill="url(#goldRibbon)" stroke="#78350F" strokeWidth="1.5" />
            {/* Nắp Rương */}
            <Path
              d={opened ? 'M 6 12 Q 32 0 58 12 L 56 20 Q 32 10 8 20 Z' : 'M 6 20 Q 32 6 58 20 L 58 22 L 6 22 Z'}
              fill="#D97706"
              stroke="#78350F"
              strokeWidth="2.5"
            />
            {/* Ổ Khóa */}
            <Circle cx="32" cy="27" r="4" fill="#FEF08A" stroke="#78350F" strokeWidth="1.5" />
          </Svg>
        </Animated.View>
      </TouchableOpacity>

      {/* Modal Mở Quà */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.rewardIconCircle}>
              <Gift size={48} color="#D97706" />
            </View>
            <Text style={styles.rewardTitle}>RƯƠNG BÍ MẬT MILO! 🎁</Text>
            <Text style={styles.rewardDesc}>Chúc mừng nhà thám hiểm nhí đã tìm thấy rương sinh tồn!</Text>

            <View style={styles.rewardPill}>
              <Award size={20} color="#D97706" />
              <Text style={styles.rewardXpText}>+{bonusXp} Điểm Thám Hiểm XP</Text>
            </View>

            <TouchableOpacity style={styles.claimButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.claimButtonText}>NHẬN THƯỞNG NGAY ⭐</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
    zIndex: 15,
  },
  chestWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -14,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 5,
  },
  sparkleText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0F172A',
  },
  rewardIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004E89',
    marginBottom: 6,
  },
  rewardDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 14,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
    marginBottom: 18,
  },
  rewardXpText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
  },
  claimButton: {
    width: '100%',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#0F172A',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
