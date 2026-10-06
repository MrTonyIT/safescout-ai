import React from 'react';
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

// ====================================================================
// 1. CĂN CỨ HANG ĐÁ BÍ MẬT CỦA HỌC VIỆN (SECRET CAVE / BUNKER ENTRANCE)
// Lấy cảm hứng trực tiếp từ Cửa Hầm Mỏ có Cờ Đỏ ở góc trái ảnh mẫu
// ====================================================================
export const SecretCaveEntrance: React.FC<{ width?: number; height?: number }> = ({
  width = 110,
  height = 95,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 110 95">
      <Defs>
        <LinearGradient id="rockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8C5E35" />
          <Stop offset="50%" stopColor="#6F4522" />
          <Stop offset="100%" stopColor="#4A2800" />
        </LinearGradient>
        <LinearGradient id="caveHoleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#110A05" />
          <Stop offset="100%" stopColor="#2E1B0F" />
        </LinearGradient>
        <LinearGradient id="woodBeam" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#D4A373" />
          <Stop offset="100%" stopColor="#8C5E35" />
        </LinearGradient>
        <LinearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#DC2626" />
        </LinearGradient>
      </Defs>

      {/* Bóng đổ nền */}
      <Ellipse cx="55" cy="88" rx="48" ry="7" fill="rgba(0,0,0,0.3)" />

      {/* Khối vách núi đá vòm ngoài */}
      <Path
        d="M 12 88 L 18 55 L 35 25 L 55 18 L 75 25 L 92 55 L 98 88 Z"
        fill="url(#rockGrad)"
        stroke="#331A05"
        strokeWidth="3"
      />

      {/* Mặt cắt đá sắc cạnh 3D */}
      <Path d="M 35 25 L 42 45 L 25 60 L 18 55 Z" fill="#A77A4E" opacity="0.6" />
      <Path d="M 75 25 L 68 45 L 85 60 L 92 55 Z" fill="#582F0E" opacity="0.8" />
      <Path d="M 55 18 L 48 35 L 62 35 Z" fill="#D4A373" opacity="0.7" />

      {/* Cửa vòm hang sâu hun hút */}
      <Path
        d="M 36 88 L 36 50 Q 55 35 74 50 L 74 88 Z"
        fill="url(#caveHoleGrad)"
        stroke="#1E0E05"
        strokeWidth="2.5"
      />

      {/* Khung gỗ trợ lực vòm cửa */}
      <Path
        d="M 32 88 L 32 48 Q 55 30 78 48 L 78 88 L 72 88 L 72 52 Q 55 38 38 52 L 38 88 Z"
        fill="url(#woodBeam)"
        stroke="#331A05"
        strokeWidth="2"
      />

      {/* Cửa song sắt / chấn song kiên cố */}
      <Path
        d="M 44 52 L 44 88 M 55 45 L 55 88 M 66 52 L 66 88 M 38 68 L 72 68 M 38 78 L 72 78"
        stroke="#334155"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Ánh đèn lồng ấm áp bên trong hầm */}
      <Circle cx="55" cy="58" r="7" fill="#FFE66D" opacity="0.6" />

      {/* Cột cờ & Lá cờ Đỏ Học Viện Thám Hiểm */}
      <Path d="M 55 18 L 55 3" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 55 4 L 75 9 L 55 15 Z" fill="url(#flagGrad)" stroke="#991B1B" strokeWidth="1" />
      <Circle cx="55" cy="3" r="2.5" fill="#F59E0B" />

      {/* Bụi cỏ hoa dại chân vách đá */}
      <Path d="M 8 88 Q 14 78 20 88 M 90 88 Q 96 78 102 88" stroke="#52B788" strokeWidth="3" fill="none" />
      <Circle cx="12" cy="82" r="3" fill="#FF6B6B" />
      <Circle cx="98" cy="82" r="3" fill="#FFE66D" />
    </Svg>
  );
};

// ====================================================================
// 2. DẢI ĐỒNG XU VÀNG PHÁT SÁNG UỐN LƯỢN (COIN ARC TRAIL)
// Lấy cảm hứng từ các dải 5 đồng xu bay vòng cung trong ảnh mẫu
// ====================================================================
export const CoinArcTrail: React.FC<{
  width?: number;
  height?: number;
  orientation?: 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';
}> = ({ width = 120, height = 45, orientation = 'LEFT_TO_RIGHT' }) => {
  const coins = [
    { cx: 15, cy: orientation === 'LEFT_TO_RIGHT' ? 32 : 12 },
    { cx: 38, cy: orientation === 'LEFT_TO_RIGHT' ? 20 : 18 },
    { cx: 60, cy: orientation === 'LEFT_TO_RIGHT' ? 14 : 26 },
    { cx: 82, cy: orientation === 'LEFT_TO_RIGHT' ? 18 : 34 },
    { cx: 105, cy: orientation === 'LEFT_TO_RIGHT' ? 28 : 40 },
  ];

  return (
    <Svg width={width} height={height} viewBox="0 0 120 45">
      <Defs>
        <RadialGradient id="goldCoinGrad" cx="35%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#FFFBEB" />
          <Stop offset="30%" stopColor="#FDE047" />
          <Stop offset="70%" stopColor="#EAB308" />
          <Stop offset="100%" stopColor="#A16207" />
        </RadialGradient>
        <RadialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="rgba(253, 224, 71, 0.6)" />
          <Stop offset="100%" stopColor="rgba(253, 224, 71, 0)" />
        </RadialGradient>
      </Defs>

      {coins.map((c, i) => (
        <G key={i}>
          {/* Quầng sáng vàng */}
          <Circle cx={c.cx} cy={c.cy} r="12" fill="url(#goldGlow)" />
          {/* Đồng xu 3D */}
          <Ellipse cx={c.cx} cy={c.cy + 1} rx="7.5" ry="8.5" fill="#713F12" />
          <Ellipse cx={c.cx} cy={c.cy} rx="7.5" ry="8.5" fill="url(#goldCoinGrad)" stroke="#78350F" strokeWidth="1" />
          {/* Vân nổi trong xu */}
          <Ellipse cx={c.cx} cy={c.cy} rx="4.5" ry="5.5" fill="none" stroke="#CA8A04" strokeWidth="1" />
          {/* Điểm lóe sáng */}
          <Circle cx={c.cx - 2.5} cy={c.cy - 3} r="1.5" fill="#FFFFFF" opacity="0.9" />
        </G>
      ))}
    </Svg>
  );
};

// ====================================================================
// 3. THANG GỖ THÁM HIỂM LEO VÁCH NÚI (WOODEN LADDER)
// ====================================================================
export const WoodenLadder: React.FC<{ width?: number; height?: number; angleDeg?: number }> = ({
  width = 36,
  height = 80,
  angleDeg = 0,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 36 80"
      style={{ transform: [{ rotate: `${angleDeg}deg` }] }}
    >
      <Defs>
        <LinearGradient id="ladderWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#D4A373" />
          <Stop offset="50%" stopColor="#A77A4E" />
          <Stop offset="100%" stopColor="#6F4522" />
        </LinearGradient>
      </Defs>

      {/* Bóng đổ */}
      <Rect x="8" y="4" width="24" height="74" fill="rgba(0,0,0,0.18)" rx="4" />

      {/* 2 Thanh gỗ dọc */}
      <Rect x="4" y="2" width="6" height="76" rx="3" fill="url(#ladderWood)" stroke="#331A05" strokeWidth="1.5" />
      <Rect x="26" y="2" width="6" height="76" rx="3" fill="url(#ladderWood)" stroke="#331A05" strokeWidth="1.5" />

      {/* Các bậc thang ngang */}
      {[14, 28, 42, 56, 70].map((y, idx) => (
        <G key={idx}>
          <Rect x="4" y={y} width="28" height="5" rx="2" fill="url(#ladderWood)" stroke="#331A05" strokeWidth="1.2" />
          {/* Mối dây thừng buộc */}
          <Circle cx="7" cy={y + 2.5} r="2" fill="#FEF08A" stroke="#713F12" strokeWidth="0.8" />
          <Circle cx="29" cy={y + 2.5} r="2" fill="#FEF08A" stroke="#713F12" strokeWidth="0.8" />
        </G>
      ))}
    </Svg>
  );
};

// ====================================================================
// 4. ĐỐM LỬA TRẠI BẬP BÙNG & THAN CỦI (CAMPFIRE & EMBERS)
// ====================================================================
export const CampfireEmbers: React.FC<{ width?: number; height?: number }> = ({
  width = 55,
  height = 50,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 55 50">
      <Defs>
        <RadialGradient id="fireLightGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="rgba(255, 107, 53, 0.7)" />
          <Stop offset="60%" stopColor="rgba(255, 230, 109, 0.3)" />
          <Stop offset="100%" stopColor="rgba(255, 107, 53, 0)" />
        </RadialGradient>
        <LinearGradient id="flameGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#DC2626" />
          <Stop offset="60%" stopColor="#F97316" />
          <Stop offset="100%" stopColor="#FDE047" />
        </LinearGradient>
        <LinearGradient id="flameGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#EA580C" />
          <Stop offset="70%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#FFFFFF" />
        </LinearGradient>
      </Defs>

      {/* Quầng sáng lửa ấm */}
      <Circle cx="27" cy="25" r="22" fill="url(#fireLightGlow)" />

      {/* Vòng đá bảo vệ quanh bếp */}
      <Ellipse cx="14" cy="42" rx="6" ry="3.5" fill="#78716C" stroke="#292524" strokeWidth="1" />
      <Ellipse cx="27" cy="44" rx="7" ry="4" fill="#A8A29E" stroke="#292524" strokeWidth="1" />
      <Ellipse cx="40" cy="42" rx="6" ry="3.5" fill="#78716C" stroke="#292524" strokeWidth="1" />

      {/* Củi chéo */}
      <Path d="M 12 42 L 42 34" stroke="#582F0E" strokeWidth="5" strokeLinecap="round" />
      <Path d="M 42 42 L 12 34" stroke="#7F4F24" strokeWidth="5" strokeLinecap="round" />

      {/* Ngọn lửa chính 3D */}
      <Path
        d="M 18 38 Q 12 24 22 18 Q 24 10 27 5 Q 30 10 32 18 Q 42 24 36 38 Q 27 43 18 38 Z"
        fill="url(#flameGrad1)"
      />
      {/* Lõi lửa trắng vàng rực rỡ */}
      <Path
        d="M 22 36 Q 19 26 25 20 Q 27 14 27 10 Q 28 14 29 20 Q 35 26 32 36 Q 27 39 22 36 Z"
        fill="url(#flameGrad2)"
      />

      {/* Tàn lửa bay lên */}
      <Circle cx="22" cy="6" r="1.5" fill="#FEF08A" />
      <Circle cx="32" cy="8" r="1.2" fill="#F97316" />
      <Circle cx="28" cy="2" r="1.8" fill="#FDE047" />
    </Svg>
  );
};

// ====================================================================
// 5. CỤM NẤM MA THUẬT ĐỎ & NÓN TÍM (MAGIC MUSHROOMS)
// ====================================================================
export const MagicMushroomGroup: React.FC<{ width?: number; height?: number }> = ({
  width = 50,
  height = 42,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 50 42">
      <Defs>
        <RadialGradient id="redCap" cx="35%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#F87171" />
          <Stop offset="70%" stopColor="#DC2626" />
          <Stop offset="100%" stopColor="#7F1D1D" />
        </RadialGradient>
        <RadialGradient id="purpleCap" cx="40%" cy="30%" r="60%">
          <Stop offset="0%" stopColor="#C084FC" />
          <Stop offset="70%" stopColor="#7E22CE" />
          <Stop offset="100%" stopColor="#3B0764" />
        </RadialGradient>
      </Defs>

      {/* Bóng đổ */}
      <Ellipse cx="25" cy="38" rx="20" ry="3.5" fill="rgba(0,0,0,0.2)" />

      {/* Nấm Tím Nhỏ Bên Trái */}
      <Rect x="12" y="24" width="5" height="13" rx="2.5" fill="#FEF3C7" stroke="#582F0E" strokeWidth="0.8" />
      <Path d="M 6 25 Q 15 8 23 25 Z" fill="url(#purpleCap)" stroke="#3B0764" strokeWidth="1.2" />
      <Circle cx="15" cy="18" r="1.2" fill="#FFFFFF" opacity="0.8" />

      {/* Nấm Đỏ Chấm Bi Lớn Bên Phải */}
      <Rect x="30" y="20" width="7" height="17" rx="3.5" fill="#FFFBEB" stroke="#582F0E" strokeWidth="1" />
      <Path d="M 20 22 Q 33 5 47 22 Z" fill="url(#redCap)" stroke="#7F1D1D" strokeWidth="1.5" />
      {/* Các chấm bi trắng */}
      <Circle cx="28" cy="14" r="2.5" fill="#FFFFFF" />
      <Circle cx="37" cy="12" r="2" fill="#FFFFFF" />
      <Circle cx="41" cy="18" r="1.8" fill="#FFFFFF" />
      <Circle cx="25" cy="19" r="1.5" fill="#FFFFFF" />

      {/* Ngọn cỏ dại mọc kèm */}
      <Path d="M 2" y="38" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
};

// ====================================================================
// 6. RƯƠNG BÁU & KIM CƯƠNG TÍM LẤP LÁNH (PURPLE GEM & CHEST)
// ====================================================================
export const PurpleGemChest: React.FC<{ width?: number; height?: number }> = ({
  width = 60,
  height = 45,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 45">
      <Defs>
        <LinearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E879F9" />
          <Stop offset="40%" stopColor="#A855F7" />
          <Stop offset="100%" stopColor="#581C87" />
        </LinearGradient>
      </Defs>

      {/* Bóng đổ */}
      <Ellipse cx="30" cy="40" rx="25" ry="4" fill="rgba(0,0,0,0.22)" />

      {/* Kim Cương Tím 3D đa diện */}
      <G transform="translate(8, 12)">
        <Path d="M 12 0 L 22 8 L 12 24 L 2 8 Z" fill="url(#gemGrad)" stroke="#3B0764" strokeWidth="1.5" />
        <Path d="M 12 0 L 2 8 L 12 24 Z" fill="#9333EA" opacity="0.7" />
        <Path d="M 12 0 L 12 24 L 22 8 Z" fill="#C084FC" opacity="0.9" />
        {/* Điểm lấp lánh */}
        <Circle cx="12" cy="7" r="1.8" fill="#FFFFFF" />
      </G>

      {/* Hộp Gỗ Cổ Điển Nhỏ */}
      <G transform="translate(32, 16)">
        <Rect x="0" y="6" width="22" height="16" rx="3" fill="#78350F" stroke="#291402" strokeWidth="1.2" />
        <Path d="M 0 6 Q 11 0 22 6 Z" fill="#92400E" stroke="#291402" strokeWidth="1.2" />
        {/* Nẹp vàng */}
        <Rect x="4" y="6" width="3" height="16" fill="#FACC15" />
        <Rect x="15" y="6" width="3" height="16" fill="#FACC15" />
        <Circle cx="11" cy="14" r="2" fill="#FEF08A" stroke="#713F12" strokeWidth="0.8" />
      </G>
    </Svg>
  );
};

// ====================================================================
// 7. HÀNG RÀO GỖ THÁM HIỂM (WOODEN FENCE)
// ====================================================================
export const WoodenFence: React.FC<{ width?: number; height?: number }> = ({
  width = 50,
  height = 30,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 50 30">
      <Defs>
        <LinearGradient id="fenceWood" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#D4A373" />
          <Stop offset="100%" stopColor="#8C5E35" />
        </LinearGradient>
      </Defs>

      {/* 2 Thanh gỗ ngang */}
      <Rect x="2" y="8" width="46" height="4" rx="1.5" fill="url(#fenceWood)" stroke="#331A05" strokeWidth="1" />
      <Rect x="2" y="18" width="46" height="4" rx="1.5" fill="url(#fenceWood)" stroke="#331A05" strokeWidth="1" />

      {/* 3 Cọc gỗ vát chóp */}
      {[6, 21, 36].map((x, i) => (
        <Path
          key={i}
          d={`M ${x} 28 L ${x} 5 L ${x + 4} 1 L ${x + 8} 5 L ${x + 8} 28 Z`}
          fill="url(#fenceWood)"
          stroke="#331A05"
          strokeWidth="1.2"
        />
      ))}
    </Svg>
  );
};
