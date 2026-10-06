import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
  G,
} from 'react-native-svg';
import { Crown, Flag, Lock, Star } from 'lucide-react-native';
import { StageSummary } from '../types/curriculum';

interface CartoonIslandStageNodeProps {
  stage: StageSummary;
  isUnlocked: boolean;
  isCompleted: boolean;
  isBossStage: boolean;
  onPress: () => void;
}

export const CartoonIslandStageNode: React.FC<CartoonIslandStageNodeProps> = ({
  stage,
  isUnlocked,
  isCompleted,
  isBossStage,
  onPress,
}) => {
  const lesson = stage.lessons[0];
  const starsCount = lesson?.stars || 0;
  const islandWidth = isBossStage ? 140 : 120;
  const islandHeight = isBossStage ? 85 : 75;

  return (
    <View style={[styles.islandContainer, { width: islandWidth }]}>
      {/* 1. KHỐI ĐẢO NỔI VECTOR SVG 2.5D (THẢM CỎ + ĐẤT TẦNG LỚP + RỄ CÂY RỦ) */}
      <View style={styles.svgIslandWrapper}>
        <Svg width={islandWidth} height={islandHeight} viewBox="0 0 120 75">
          <Defs>
            {/* Gradient Thảm Cỏ Xanh Hoạt Hình */}
            <LinearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#86EFAC" />
              <Stop offset="30%" stopColor="#22C55E" />
              <Stop offset="100%" stopColor="#15803D" />
            </LinearGradient>

            {/* Gradient Vách Đất Nâu Nhiều Tầng */}
            <LinearGradient id="earthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#92400E" />
              <Stop offset="40%" stopColor="#78350F" />
              <Stop offset="100%" stopColor="#451A03" />
            </LinearGradient>

            {/* Bóng đổ khối đảo */}
            <RadialGradient id="islandShadow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
              <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </RadialGradient>
          </Defs>

          {/* Bóng đổ lơ lửng bên dưới đảo */}
          <Ellipse cx="60" cy="70" rx="45" ry="5" fill="url(#islandShadow)" />

          {/* 1.1 KHỐI ĐẤT NÂU CẮT LỚP (EARTH STRATA) */}
          <Path
            d="M 12 28 Q 20 45 35 55 Q 60 62 85 55 Q 100 45 108 28 Q 95 32 60 32 Q 25 32 12 28 Z"
            fill="url(#earthGrad)"
            stroke="#291402"
            strokeWidth="1.5"
          />

          {/* Vân đá và sỏi nhỏ embedded trong lòng đất */}
          <Ellipse cx="40" cy="42" rx="4" ry="2.5" fill="#B45309" opacity="0.8" />
          <Ellipse cx="78" cy="45" rx="5" ry="3" fill="#B45309" opacity="0.8" />
          <Ellipse cx="58" cy="50" rx="3" ry="2" fill="#92400E" />
          <Path d="M 25 36 Q 32 40 42 38" stroke="#451A03" strokeWidth="1.2" fill="none" />
          <Path d="M 72 38 Q 82 42 95 36" stroke="#451A03" strokeWidth="1.2" fill="none" />

          {/* Rễ cây / Dây leo buông rủ lơ lửng */}
          <Path d="M 32 54 Q 28 62 30 68" stroke="#451A03" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <Path d="M 60 58 Q 62 66 58 72" stroke="#451A03" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path d="M 85 52 Q 88 60 84 65" stroke="#451A03" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          {/* 1.2 THẢM CỎ XANH MƯỚT TRÊN MẶT ĐẢO (LUSH GRASS CAP) */}
          {/* Lớp cỏ dày nhấp nhô */}
          <Path
            d="M 6 22 Q 10 12 30 14 Q 45 8 60 8 Q 75 8 90 14 Q 110 12 114 22 Q 110 28 95 28 Q 78 30 60 28 Q 42 30 25 28 Q 10 28 6 22 Z"
            fill="url(#grassGrad)"
            stroke="#14532D"
            strokeWidth="1.8"
          />

          {/* Viền sáng ngọn cỏ nhấp nhô */}
          <Path
            d="M 12 18 Q 18 12 24 16 Q 32 10 40 14 Q 50 8 60 12 Q 70 8 80 14 Q 88 10 96 16 Q 104 12 108 18"
            stroke="#BBF7D0"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* 2. NÚT HUY HIỆU ẢI HOẠT HÌNH 3D (CHUNKY CARTOON BADGE) */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={'Khám phá: '+stage.title}
        accessibilityState={{disabled:!isUnlocked}}
        activeOpacity={0.85}
        disabled={!isUnlocked}
        onPress={onPress}
        style={[
          styles.badgeButton3D,
          isBossStage ? styles.bossBadgeSize : styles.stageBadgeSize,
          {
            backgroundColor: isUnlocked
              ? isCompleted
                ? '#10B981'
                : isBossStage
                ? '#F59E0B'
                : '#0284C7'
              : '#94A3B8',
            borderColor: isUnlocked
              ? isCompleted
                ? '#6EE7B7'
                : isBossStage
                ? '#FDE047'
                : '#38BDF8'
              : '#CBD5E1',
            borderBottomColor: isUnlocked
              ? isCompleted
                ? '#047857'
                : isBossStage
                ? '#B45309'
                : '#0369A1'
              : '#64748B',
          },
        ]}
      >
        {isBossStage ? (
          <Crown size={isBossStage ? 34 : 28} color="#FFFFFF" fill="#FFE66D" />
        ) : isCompleted ? (
          <Flag size={24} color="#FFFFFF" fill="#FFE66D" />
        ) : isUnlocked ? (
          <Text style={styles.stageNumberText}>{stage.stageNumber}</Text>
        ) : (
          <Lock size={20} color="#E2E8F0" />
        )}
      </TouchableOpacity>

      {/* 3. BẢNG 3 SAO VÀNG NHỎ TRÊN ĐẢO */}
      <View style={styles.starsContainer}>
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            size={12}
            color="#F59E0B"
            fill={starsCount >= s ? '#F59E0B' : 'rgba(15, 23, 42, 0.4)'}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  islandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 95,
  },
  svgIslandWrapper: {
    position: 'absolute',
    top: 15,
    zIndex: 1,
  },
  badgeButton3D: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 3,
    borderBottomWidth: 7,
    zIndex: 10,
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
  },
  stageBadgeSize: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  bossBadgeSize: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3.5,
    borderBottomWidth: 9,
  },
  stageNumberText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
    zIndex: 15,
    marginTop: 2,
  },
});
