import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
  Ellipse,
  G,
} from 'react-native-svg';

interface BiomeBackgroundProps {
  zoneNumber: number;
  width: number;
  height: number;
}

export const BiomeBackground: React.FC<BiomeBackgroundProps> = ({
  zoneNumber,
  width,
  height,
}) => {
  // Animation mây trôi bồng bềnh
  const cloudAnim1 = useRef(new Animated.Value(-150)).current;
  const cloudAnim2 = useRef(new Animated.Value(width)).current;
  const cloudAnim3 = useRef(new Animated.Value(-200)).current;
  const sunPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loops: Animated.CompositeAnimation[]=[];
    const loop=(animation: Animated.CompositeAnimation)=>{const handle=Animated.loop(animation);loops.push(handle);return handle;};
    loop(
      Animated.timing(cloudAnim1, {
        toValue: width + 150,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    loop(
      Animated.timing(cloudAnim2, {
        toValue: -200,
        duration: 45000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    loop(
      Animated.timing(cloudAnim3, {
        toValue: width + 200,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    loop(
      Animated.sequence([
        Animated.timing(sunPulse, { toValue: 1.15, duration: 2500, useNativeDriver: true }),
        Animated.timing(sunPulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ]),
    ).start();
    return()=>loops.forEach(loop=>loop.stop());
  }, [width]);

  // Gradient màu trời hoạt hình tươi sáng rực rỡ (Cartoon Blue Sky & Lush Biomes)
  const getBiomeSky = () => {
    switch (zoneNumber) {
      case 1: // Rừng Xanh Thám Hiểm (Bầu trời xanh trong vắt + Nắng vàng rực rỡ như ảnh mẫu)
        return {
          sky0: '#38BDF8',
          sky50: '#7DD3FC',
          sky100: '#BAE6FD',
          m1: '#93C5FD',
          m2: '#6EE7B7',
          m3: '#34D399',
        };
      case 2: // Thành Phố Hoàng Hôn
        return {
          sky0: '#6366F1',
          sky50: '#818CF8',
          sky100: '#C7D2FE',
          m1: '#A5B4FC',
          m2: '#93C5FD',
          m3: '#60A5FA',
        };
      case 3: // Pháo Đài Nắng Ấm
        return {
          sky0: '#F59E0B',
          sky50: '#FBBF24',
          sky100: '#FEF3C7',
          m1: '#FCD34D',
          m2: '#FDE68A',
          m3: '#D97706',
        };
      case 4: // Trạm Y Tế Băng Tuyết & Nước Mát
        return {
          sky0: '#0284C7',
          sky50: '#38BDF8',
          sky100: '#E0F2FE',
          m1: '#7DD3FC',
          m2: '#A7F3D0',
          m3: '#059669',
        };
      default:
        return {
          sky0: '#38BDF8',
          sky50: '#7DD3FC',
          sky100: '#BAE6FD',
          m1: '#93C5FD',
          m2: '#6EE7B7',
          m3: '#34D399',
        };
    }
  };

  const sky = getBiomeSky();

  return (
    <View style={[StyleSheet.absoluteFillObject, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Bầu trời chuyển sắc hoạt hình */}
          <LinearGradient id="cartoonSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={sky.sky0} />
            <Stop offset="35%" stopColor={sky.sky50} />
            <Stop offset="70%" stopColor={sky.sky100} />
            <Stop offset="100%" stopColor="#D1FAE5" />
          </LinearGradient>

          {/* Vầng thái dương tỏa sáng */}
          <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="40%" stopColor="#FEF08A" />
            <Stop offset="80%" stopColor="rgba(253, 224, 71, 0.4)" />
            <Stop offset="100%" stopColor="rgba(253, 224, 71, 0)" />
          </RadialGradient>

          {/* Mây trắng bồng bềnh 3D */}
          <LinearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="85%" stopColor="#F1F5F9" />
            <Stop offset="100%" stopColor="#CBD5E1" />
          </LinearGradient>

          {/* Đảo bay hậu cảnh xa */}
          <LinearGradient id="bgIslandRock" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#86EFAC" />
            <Stop offset="25%" stopColor="#4ADE80" />
            <Stop offset="60%" stopColor="#B45309" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>
        </Defs>

        {/* 1. NỀN TRỜI HOẠT HÌNH KHỔNG LỒ */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#cartoonSky)" />

        {/* 2. MẶT TRỜI TOỎA NẮNG TRÊN ĐỈNH */}
        <Circle cx={width * 0.8} cy={120} r={90} fill="url(#sunGlow)" />
        <Circle cx={width * 0.8} cy={120} r={40} fill="#FFFBEB" />

        {/* 3. DÃY NÚI XANH MỜ PHÍA CHÂN TRỜI (LAYER 1 - RẤT XA) */}
        <Path
          d={`M 0 350 Q ${width * 0.25} 240 ${width * 0.5} 320 Q ${width * 0.75} 220 ${width} 340 L ${width} ${height} L 0 ${height} Z`}
          fill={sky.m1}
          opacity={0.35}
        />

        {/* 4. DÃY ĐỒI XANH MƯỚT (LAYER 2 - TẦNG GIỮA) */}
        <Path
          d={`M 0 520 Q ${width * 0.3} 420 ${width * 0.6} 500 Q ${width * 0.85} 440 ${width} 530 L ${width} ${height} L 0 ${height} Z`}
          fill={sky.m2}
          opacity={0.4}
        />

        {/* 5. CÁC HÒN ĐẢO BAY NHỎ Ở HẬU CẢNH (FLOATING ISLANDS SILHOUETTE) */}
        {/* Đảo bay xa 1 */}
        <G transform={`translate(${width * 0.12}, 240) scale(0.65)`}>
          <Path d="M 0 20 Q 30 5 60 20 Q 80 15 100 25 Q 60 65 50 75 Q 40 60 0 20 Z" fill="url(#bgIslandRock)" opacity={0.6} />
          {/* Cây nhỏ trên đảo */}
          <Circle cx="35" cy="10" r="10" fill="#22C55E" opacity={0.7} />
          <Circle cx="65" cy="15" r="8" fill="#16A34A" opacity={0.7} />
        </G>

        {/* Đảo bay xa 2 */}
        <G transform={`translate(${width * 0.75}, 650) scale(0.7)`}>
          <Path d="M 0 20 Q 40 5 80 20 Q 100 15 120 25 Q 80 75 60 85 Q 40 70 0 20 Z" fill="url(#bgIslandRock)" opacity={0.5} />
          <Circle cx="45" cy="10" r="12" fill="#22C55E" opacity={0.65} />
        </G>

        {/* Đảo bay xa 3 */}
        <G transform={`translate(${width * 0.08}, 1250) scale(0.75)`}>
          <Path d="M 0 20 Q 35 5 70 20 Q 90 15 110 25 Q 70 70 55 80 Q 35 65 0 20 Z" fill="url(#bgIslandRock)" opacity={0.55} />
          <Circle cx="40" cy="10" r="11" fill="#16A34A" opacity={0.7} />
        </G>
      </Svg>

      {/* 6. MÂY TRÔI HOẠT HÌNH 3D NHIỀU TẦNG */}
      <Animated.View style={[styles.cloudLayer, { top: 90, transform: [{ translateX: cloudAnim1 }] }]} pointerEvents="none">
        <Svg width={180} height={70} viewBox="0 0 180 70">
          <Path
            d="M 25 55 Q 10 55 10 40 Q 10 25 28 25 Q 35 8 58 10 Q 75 -2 98 8 Q 120 2 135 18 Q 155 12 165 28 Q 175 42 160 55 Z"
            fill="url(#cloudGrad)"
            opacity={0.88}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.cloudLayer, { top: 460, transform: [{ translateX: cloudAnim2 }] }]} pointerEvents="none">
        <Svg width={220} height={80} viewBox="0 0 220 80">
          <Path
            d="M 30 65 Q 12 65 12 48 Q 12 30 35 30 Q 45 10 70 12 Q 92 0 120 10 Q 145 2 165 22 Q 190 15 202 34 Q 215 50 195 65 Z"
            fill="url(#cloudGrad)"
            opacity={0.82}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.cloudLayer, { top: 980, transform: [{ translateX: cloudAnim3 }] }]} pointerEvents="none">
        <Svg width={190} height={75} viewBox="0 0 190 75">
          <Path
            d="M 25 60 Q 10 60 10 44 Q 10 28 30 28 Q 40 10 65 12 Q 85 2 110 10 Q 130 4 148 20 Q 170 15 180 32 Q 190 48 172 60 Z"
            fill="url(#cloudGrad)"
            opacity={0.78}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cloudLayer: {
    position: 'absolute',
    left: 0,
  },
});
