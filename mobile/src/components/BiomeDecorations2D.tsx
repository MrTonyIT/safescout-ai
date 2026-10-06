import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';

interface BiomeDecorationProps {
  zoneNumber: number;
  width?: number;
  height?: number;
}

export const BiomeDecorations2D: React.FC<BiomeDecorationProps> = ({
  zoneNumber,
  width = 160,
  height = 90,
}) => {
  switch (zoneNumber) {
    // 🌲 Vùng 1: Rừng Xanh Hoang Dã (Cây Cổ Thụ & Nấm Đỏ 2.5D)
    case 1:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          <Defs>
            <LinearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#2EC4B6" />
              <Stop offset="100%" stopColor="#1B4332" />
            </LinearGradient>
            <LinearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#8D5B4C" />
              <Stop offset="100%" stopColor="#4A2810" />
            </LinearGradient>
          </Defs>
          {/* Bóng đổ */}
          <Ellipse cx="50" cy="80" rx="35" ry="6" fill="rgba(0, 0, 0, 0.15)" />
          {/* Thân cây */}
          <Rect x="44" y="45" width="12" height="35" rx="3" fill="url(#trunkGrad)" />
          {/* Tán cây 3 tầng 2.5D */}
          <Circle cx="50" cy="48" r="24" fill="url(#treeGrad)" stroke="#1B4332" strokeWidth="2" />
          <Circle cx="40" cy="36" r="18" fill="#52B788" stroke="#1B4332" strokeWidth="2" />
          <Circle cx="60" cy="36" r="18" fill="#74C69D" stroke="#1B4332" strokeWidth="2" />
          <Circle cx="50" cy="24" r="16" fill="#95D5B2" stroke="#1B4332" strokeWidth="2" />
          {/* Nấm độc đốm đỏ */}
          <Ellipse cx="110" cy="82" rx="14" ry="4" fill="rgba(0, 0, 0, 0.15)" />
          <Rect x="107" y="65" width="6" height="17" rx="3" fill="#FFF9EB" stroke="#784433" strokeWidth="1" />
          <Path d="M 96 68 Q 110 46 124 68 Z" fill="#E63946" stroke="#9B2226" strokeWidth="1.5" />
          <Circle cx="104" cy="58" r="2.5" fill="#FFFFFF" />
          <Circle cx="116" cy="60" r="2" fill="#FFFFFF" />
          <Circle cx="110" cy="53" r="1.5" fill="#FFFFFF" />
        </Svg>
      );

    // 🏙️ Vùng 2: Thành Phố Nhộn Nhịp (Tòa Nhà & Đèn Tín Hiệu)
    case 2:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          {/* Bóng đổ */}
          <Ellipse cx="70" cy="84" rx="45" ry="5" fill="rgba(0, 0, 0, 0.15)" />
          {/* Tòa nhà sau */}
          <Rect x="20" y="20" width="30" height="64" rx="4" fill="#64748B" stroke="#334155" strokeWidth="2" />
          <Rect x="26" y="28" width="6" height="8" rx="1" fill="#FEF08A" />
          <Rect x="38" y="28" width="6" height="8" rx="1" fill="#FEF08A" />
          <Rect x="26" y="44" width="6" height="8" rx="1" fill="#FEF08A" />
          <Rect x="38" y="44" width="6" height="8" rx="1" fill="#FEF08A" />
          {/* Tòa nhà chính màu cam */}
          <Rect x="44" y="32" width="38" height="52" rx="4" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          <Rect x="50" y="40" width="8" height="8" rx="1" fill="#FFFFFF" />
          <Rect x="68" y="40" width="8" height="8" rx="1" fill="#FFFFFF" />
          <Rect x="50" y="54" width="8" height="8" rx="1" fill="#FFFFFF" />
          <Rect x="68" y="54" width="8" height="8" rx="1" fill="#FFFFFF" />
          {/* Cột Đèn Giao Thông 3D */}
          <Rect x="110" y="38" width="14" height="42" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="117" cy="46" r="3.5" fill="#EF4444" />
          <Circle cx="117" cy="56" r="3.5" fill="#F59E0B" />
          <Circle cx="117" cy="66" r="3.5" fill="#10B981" />
          <Rect x="115" y="80" width="4" height="6" fill="#334155" />
        </Svg>
      );

    // 🏠 Vùng 3: Pháo Đài Tại Gia (Nhà Gỗ & Làn Khói Cảnh Báo)
    case 3:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          <Ellipse cx="75" cy="84" rx="40" ry="5" fill="rgba(0, 0, 0, 0.15)" />
          {/* Khói cam hoạt hình */}
          <Circle cx="98" cy="20" r="7" fill="#FED7AA" opacity="0.8" />
          <Circle cx="106" cy="14" r="9" fill="#FDBA74" opacity="0.8" />
          <Circle cx="116" cy="8" r="11" fill="#FB923C" opacity="0.7" />
          {/* Ống khói */}
          <Rect x="92" y="24" width="12" height="20" fill="#991B1B" stroke="#7F1D1D" strokeWidth="1.5" />
          {/* Thân nhà */}
          <Rect x="40" y="44" width="65" height="40" rx="3" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          {/* Mái nhà đỏ */}
          <Path d="M 32 46 L 72.5 18 L 113 46 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2.5" />
          {/* Cửa sổ & Cửa chính */}
          <Rect x="50" y="52" width="14" height="14" rx="2" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1.5" />
          <Rect x="78" y="56" width="16" height="28" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
        </Svg>
      );

    // 🩺 Vùng 4: Trạm Y Tế Thần Tốc (Trạm Cứu Thương & Vali 3D)
    case 4:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          <Ellipse cx="65" cy="84" rx="36" ry="5" fill="rgba(0, 0, 0, 0.15)" />
          {/* Lều Cứu Thương Trắng */}
          <Path d="M 30 84 L 65 30 L 100 84 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
          {/* Chữ Thập Đỏ Cứu Nạn */}
          <Rect x="60" y="50" width="10" height="24" fill="#EF4444" rx="2" />
          <Rect x="53" y="57" width="24" height="10" fill="#EF4444" rx="2" />
          {/* Vali Y Tế 3D */}
          <Rect x="110" y="58" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
          <Path d="M 120 58 L 120 54 Q 124 50 128 54 L 128 58" fill="none" stroke="#DC2626" strokeWidth="2" />
          <Rect x="122" y="65" width="4" height="10" fill="#DC2626" />
          <Rect x="119" y="68" width="10" height="4" fill="#DC2626" />
        </Svg>
      );

    // 🌋 Vùng 5: Thung Lũng Thiên Tai (Mây Sấm Sét & Vết Nứt Địa Chấn)
    case 5:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          {/* Vết nứt mặt đất */}
          <Path d="M 20 84 L 45 76 L 65 86 L 90 74 L 120 82" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Đám mây giông tím đậm */}
          <Circle cx="60" cy="30" r="18" fill="#475569" />
          <Circle cx="80" cy="24" r="22" fill="#334155" />
          <Circle cx="102" cy="32" r="16" fill="#475569" />
          {/* Tia Sét Vàng Phát Sáng */}
          <Path d="M 82 38 L 72 54 L 84 56 L 70 78 L 92 50 L 80 48 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        </Svg>
      );

    // 🌊 Vùng 6: Vùng Nước Sâu (Gợn Sóng 2.5D & Phao Cứu Sinh)
    case 6:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          {/* Gợn sóng đại dương */}
          <Path d="M 10 70 Q 30 55 50 70 T 90 70 T 130 70 T 170 70" fill="none" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
          <Path d="M 0 82 Q 25 68 50 82 T 100 82 T 150 82" fill="none" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
          {/* Phao Cứu Sinh Đỏ Trắng 3D */}
          <Circle cx="110" cy="45" r="20" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
          <Circle cx="110" cy="45" r="10" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
          {/* Sọc Trắng */}
          <Rect x="107" y="25" width="6" height="40" fill="#FFFFFF" />
          <Rect x="90" y="42" width="40" height="6" fill="#FFFFFF" />
        </Svg>
      );

    // 🚌 Vùng 7: Chuyến Xe & Trường Học (Xe Buýt Vàng 3D)
    case 7:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          <Ellipse cx="75" cy="85" rx="45" ry="5" fill="rgba(0, 0, 0, 0.15)" />
          {/* Thân Xe Buýt Vàng */}
          <Rect x="30" y="36" width="90" height="42" rx="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
          {/* Cửa Kính Đen/Xanh */}
          <Rect x="40" y="44" width="16" height="14" rx="2" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <Rect x="62" y="44" width="16" height="14" rx="2" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <Rect x="84" y="44" width="16" height="14" rx="2" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <Rect x="106" y="42" width="10" height="26" rx="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          {/* Bánh Xe 3D */}
          <Circle cx="50" cy="78" r="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="50" cy="78" r="3" fill="#94A3B8" />
          <Circle cx="100" cy="78" r="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="100" cy="78" r="3" fill="#94A3B8" />
          {/* Đèn Khẩn Cấp Nhấp Nháy */}
          <Circle cx="35" cy="40" r="3.5" fill="#EF4444" />
          <Circle cx="115" cy="40" r="3.5" fill="#EF4444" />
        </Svg>
      );

    // 🏬 Vùng 8: Nơi Công Cộng (Trung Tâm Mini & Biển Báo EXIT)
    case 8:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          <Ellipse cx="70" cy="84" rx="40" ry="5" fill="rgba(0, 0, 0, 0.15)" />
          {/* Tòa nhà vòm trung tâm thương mại */}
          <Path d="M 30 84 L 30 50 Q 70 30 110 50 L 110 84 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
          <Rect x="60" y="58" width="20" height="26" rx="4" fill="#67E8F9" stroke="#0891B2" strokeWidth="2" />
          {/* Biển Báo Thoát Hiểm Dạ Quang EXIT */}
          <Rect x="100" y="24" width="36" height="20" rx="4" fill="#10B981" stroke="#047857" strokeWidth="2" />
          <Circle cx="110" cy="34" r="3" fill="#FFFFFF" />
          <Path d="M 116 34 L 128 34 M 124 30 L 128 34 L 124 38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    // 💻 Vùng 9: Vệ Binh Không Gian Mạng (Khối Cầu Dữ Liệu & Ma Trận Neon)
    case 9:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          <Defs>
            <RadialGradient id="cyberGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#00F0FF" />
              <Stop offset="70%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#1E1B4B" />
            </RadialGradient>
          </Defs>
          {/* Lưới ma trận */}
          <Path d="M 20 70 L 140 70 M 30 80 L 130 80 M 40 60 L 60 84 M 80 60 L 80 84 M 120 60 L 100 84" stroke="#00F0FF" strokeWidth="1" opacity="0.6" fill="none" />
          {/* Quả Cầu Dữ Liệu Hologram */}
          <Circle cx="80" cy="42" r="24" fill="url(#cyberGlow)" stroke="#00F0FF" strokeWidth="2" />
          <Ellipse cx="80" cy="42" rx="34" ry="10" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0.8" />
          <Circle cx="80" cy="42" r="6" fill="#FFFFFF" />
        </Svg>
      );

    // 🚨 Vùng 10: Tổng Hành Dinh Cứu Hộ (Tháp Chỉ Huy & Hải Đăng Đỉnh Núi)
    case 10:
    default:
      return (
        <Svg width={width} height={height} viewBox="0 0 160 90">
          {/* Đỉnh núi tuyết */}
          <Path d="M 20 84 L 80 20 L 140 84 Z" fill="#475569" stroke="#1E293B" strokeWidth="2" />
          <Path d="M 60 41 L 80 20 L 100 41 L 90 46 L 80 40 L 70 46 Z" fill="#FFFFFF" />
          {/* Tháp Hải Đăng Cứu Hộ SOS */}
          <Rect x="72" y="14" width="16" height="30" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
          <Rect x="72" y="22" width="16" height="6" fill="#FFFFFF" />
          {/* Đèn Pha Hải Đăng Chiếu Sáng */}
          <Circle cx="80" cy="14" r="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <Path d="M 80 14 L 140 0 L 140 28 Z" fill="#FACC15" opacity="0.35" />
          {/* Cột Cờ Chiến Thắng */}
          <Rect x="44" y="44" width="3" height="28" fill="#D97706" />
          <Path d="M 47 46 L 65 52 L 47 58 Z" fill="#FFE66D" stroke="#B45309" strokeWidth="1" />
        </Svg>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
