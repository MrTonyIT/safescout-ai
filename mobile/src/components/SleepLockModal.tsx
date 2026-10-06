import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';
import { Flame, Lock, Moon, Sparkles, PhoneCall } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepLockModalProps {
  visible: boolean;
  onUnlockPress: () => void;
  onOpenSos: () => void;
}

export const SleepLockModal: React.FC<SleepLockModalProps> = ({
  visible,
  onUnlockPress,
  onOpenSos,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card3D}>
          {/* Tag Giờ Nghỉ Ngơi */}
          <View style={styles.bedtimeTag}>
            <Moon size={16} color="#FFE66D" />
            <Text style={styles.bedtimeTagText}>ĐÃ HẾT GIỜ HỌC TRONG NGÀY</Text>
          </View>

          {/* SVG 2.5D Chú Rái Cá Milo Trùm Chăn Ngủ Say 🌙 */}
          <View style={styles.miloSleepContainer}>
            <Svg width={140} height={120} viewBox="0 0 140 120">
              <Defs>
                <LinearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#1E1B4B" />
                  <Stop offset="100%" stopColor="#0F172A" />
                </LinearGradient>
                <LinearGradient id="blanketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#3B82F6" />
                  <Stop offset="100%" stopColor="#1D4ED8" />
                </LinearGradient>
                <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FEF08A" />
                  <Stop offset="60%" stopColor="#FACC15" />
                  <Stop offset="100%" stopColor="transparent" />
                </RadialGradient>
              </Defs>

              {/* Nền đêm trăng sao */}
              <Circle cx="70" cy="60" r="54" fill="url(#nightSky)" />

              {/* Mặt trăng lưỡi liềm vàng */}
              <Path
                d="M 100 25 A 14 14 0 0 0 94 48 A 18 18 0 0 1 100 25 Z"
                fill="#FACC15"
              />

              {/* Các ngôi sao lấp lánh */}
              <Circle cx="40" cy="30" r="2" fill="#FFE66D" />
              <Circle cx="55" cy="22" r="1.5" fill="#FFE66D" />
              <Circle cx="85" cy="20" r="2.5" fill="#FFE66D" />
              <Circle cx="30" cy="50" r="1.5" fill="#FFE66D" />

              {/* Đầu Milo ngủ nhắm mắt bình yên */}
              <Circle cx="58" cy="55" r="20" fill="#8B5E3C" />
              <Ellipse cx="58" cy="62" rx="13" ry="8" fill="#FFF1E6" />
              <Circle cx="58" cy="58" r="3" fill="#2B1810" />

              {/* Đôi mắt ngủ nhắm cong chữ U */}
              <Path
                d="M 48 54 Q 52 58 55 54 M 61 54 Q 64 58 67 54"
                stroke="#2B1810"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Mũ ngủ đêm có quả bông tròn */}
              <Path
                d="M 42 45 Q 60 30 76 42 Q 62 48 42 45 Z"
                fill="#EF4444"
              />
              <Circle cx="78" cy="40" r="4.5" fill="#FFFFFF" />

              {/* Chiếc chăn ấm áp 3D đắp kín thân */}
              <Path
                d="M 32 64 Q 70 56 108 64 L 114 98 Q 70 106 26 98 Z"
                fill="url(#blanketGrad)"
                stroke="#1E40AF"
                strokeWidth="2"
              />
              {/* Họa tiết sao trên chăn */}
              <Circle cx="50" cy="78" r="2.5" fill="#93C5FD" />
              <Circle cx="72" cy="84" r="3" fill="#93C5FD" />
              <Circle cx="92" cy="76" r="2.5" fill="#93C5FD" />

              {/* Tiếng thở ZZZ ngộ nghĩnh */}
              <Path d="M 96 34 L 102 34 L 96 42 L 102 42" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <Path d="M 106 24 L 114 24 L 106 34 L 114 34" stroke="#FFE66D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>

          {/* Lời nhắn chúc ngủ ngon */}
          <Text style={styles.title}>Giờ Nghỉ Ngơi Nạp Năng Lượng! 🌙</Text>
          <Text style={styles.message}>
            Đội Trưởng Milo và Nhà thám hiểm nhí đã hoàn thành xuất sắc bài học hôm nay. Hãy nghỉ ngơi để mắt và não bộ luôn khỏe mạnh nhé!
          </Text>

          {/* NGOẠI LỆ CỨU MẠNG 24/7: CÒI & CỨU HỘ KHẨN CẤP */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emergencySosBtn}
            onPress={onOpenSos}
          >
            <Flame size={20} color="#FFFFFF" />
            <Text style={styles.emergencySosBtnText}>
              CÒI HÚ & GỌI CỨU HỘ (SOS 24/7) 🚨
            </Text>
          </TouchableOpacity>

          {/* Nút Ba Mẹ Mở Khóa */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.parentUnlockBtn}
            onPress={onUnlockPress}
          >
            <Lock size={16} color="#94A3B8" />
            <Text style={styles.parentUnlockText}>Ba Mẹ Mở Khóa Bằng Mã PIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 25, 54, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card3D: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  bedtimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 109, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE66D',
    gap: 6,
    marginBottom: 10,
  },
  bedtimeTagText: {
    color: '#FFE66D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  miloSleepContainer: {
    marginVertical: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  message: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  emergencySosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomColor: '#991B1B',
    gap: 8,
    marginBottom: 12,
  },
  emergencySosBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  parentUnlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  parentUnlockText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
});
