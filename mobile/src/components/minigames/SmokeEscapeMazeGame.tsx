import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { soundService } from '../../services/sound';
import { voiceService } from '../../services/voice';
import { MiloAvatar2D } from '../MiloAvatar2D';
import { Flame, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, CheckCircle, ShieldAlert } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SmokeEscapeMazeGameProps {
  onGameComplete: (score: number) => void;
}

// Lưới Mê Cung 4x3: Milo bắt đầu ở [0,0] và cần bò thấp đến cửa EXIT [3,2]
const GRID_COLS = 4;
const GRID_ROWS = 3;

export const SmokeEscapeMazeGame: React.FC<SmokeEscapeMazeGameProps> = ({
  onGameComplete,
}) => {
  const [miloPos, setMiloPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCrawlingLow, setIsCrawlingLow] = useState<boolean>(true);
  const [isEscaped, setIsEscaped] = useState<boolean>(false);

  useEffect(() => {
    voiceService.speakMilo(
      'Khói độc đang bốc lên cao! Bé hãy giúp Milo bò sát sàn nhà để tìm cửa thoát hiểm màu xanh nhé!',
      'DANGER_ALERT',
    );
  }, []);

  const moveMilo = (dx: number, dy: number) => {
    soundService.playPop();
    const newX = Math.max(0, Math.min(GRID_COLS - 1, miloPos.x + dx));
    const newY = Math.max(0, Math.min(GRID_ROWS - 1, miloPos.y + dy));

    setMiloPos({ x: newX, y: newY });

    // Kiểm tra chạm cửa EXIT [3, 2]
    if (newX === 3 && newY === 2) {
      setIsEscaped(true);
      soundService.playFanfare();
      voiceService.speakMilo('Xuất sắc! Milo đã thoát khỏi đám khói an toàn!', 'CHEERING');
      setTimeout(() => {
        onGameComplete(100);
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <View style={styles.headerRow}>
        <Flame size={20} color="#EF4444" />
        <Text style={styles.gameTitle}>MINIGAME: MÊ CUNG BÒ THẤP THOÁT KHÓI</Text>
      </View>

      {/* Tầng khói độc lơ lửng phía trên */}
      <View style={styles.smokeWarningPill}>
        <Text style={styles.smokeWarningText}>☁️ TẦNG KHÓI ĐỘC TRÊN CAO (KHÔNG ĐƯỢC ĐỨNG DẬY)</Text>
      </View>

      {/* Bản Đồ Mê Cung 2D */}
      <View style={styles.mazeGrid}>
        {Array.from({ length: GRID_ROWS }).map((_, r) => (
          <View key={r} style={styles.gridRow}>
            {Array.from({ length: GRID_COLS }).map((_, c) => {
              const isMiloHere = miloPos.x === c && miloPos.y === r;
              const isExit = c === 3 && r === 2;

              return (
                <View
                  key={c}
                  style={[
                    styles.gridCell,
                    isExit ? styles.exitCell : null,
                    isMiloHere ? styles.activeCell : null,
                  ]}
                >
                  {isMiloHere ? (
                    <View style={styles.miloWrapper}>
                      <Text style={styles.miloCrawlEmoji}>🦦</Text>
                      <Text style={styles.crawlingTag}>BÒ THẤP</Text>
                    </View>
                  ) : isExit ? (
                    <View style={styles.exitWrapper}>
                      <Text style={styles.exitDoorEmoji}>🚪</Text>
                      <Text style={styles.exitLabel}>EXIT</Text>
                    </View>
                  ) : (
                    <View style={styles.floorTileDot} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Cụm Phím Điều Hướng Chunky 3D */}
      {!isEscaped ? (
        <View style={styles.dpadContainer}>
          <TouchableOpacity
            style={styles.dpadBtn}
            onPress={() => moveMilo(0, -1)}
            activeOpacity={0.75}
          >
            <ArrowUp size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.dpadMiddleRow}>
            <TouchableOpacity
              style={styles.dpadBtn}
              onPress={() => moveMilo(-1, 0)}
              activeOpacity={0.75}
            >
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.dpadCenter}>
              <Text style={styles.dpadCenterText}>BÒ</Text>
            </View>
            <TouchableOpacity
              style={styles.dpadBtn}
              onPress={() => moveMilo(1, 0)}
              activeOpacity={0.75}
            >
              <ArrowRight size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.dpadBtn}
            onPress={() => moveMilo(0, 1)}
            activeOpacity={0.75}
          >
            <ArrowDown size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.escapedBanner}>
          <CheckCircle size={28} color="#10B981" />
          <Text style={styles.escapedBannerText}>THOÁT HIỂM AN TOÀN! +100 XP 🛡️</Text>
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
    marginBottom: 6,
  },
  gameTitle: {
    color: '#FFE66D',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  smokeWarningPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 8,
  },
  smokeWarningText: {
    color: '#FCA5A5',
    fontSize: 9,
    fontWeight: '900',
  },
  mazeGrid: {
    backgroundColor: '#071936',
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#1E293B',
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 4,
  },
  gridCell: {
    width: 62,
    height: 52,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  activeCell: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
    borderWidth: 2,
  },
  exitCell: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  miloWrapper: {
    alignItems: 'center',
  },
  miloCrawlEmoji: {
    fontSize: 22,
  },
  crawlingTag: {
    color: '#FFE66D',
    fontSize: 7,
    fontWeight: '900',
    marginTop: -2,
  },
  exitWrapper: {
    alignItems: 'center',
  },
  exitDoorEmoji: {
    fontSize: 20,
  },
  exitLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  floorTileDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#475569',
  },
  dpadContainer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dpadBtn: {
    width: 54,
    height: 44,
    backgroundColor: '#0284C7',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#38BDF8',
  },
  dpadCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F2C59',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
  },
  dpadCenterText: {
    color: '#FFE66D',
    fontSize: 11,
    fontWeight: '900',
  },
  escapedBanner: {
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
  escapedBannerText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '900',
  },
});
