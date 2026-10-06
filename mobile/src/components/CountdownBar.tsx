import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { Clock, AlertTriangle } from 'lucide-react-native';

interface CountdownBarProps {
  totalSeconds: number;
  onTimeOut: () => void;
  isPaused?: boolean;
}

export const CountdownBar: React.FC<CountdownBarProps> = ({
  totalSeconds = 7,
  onTimeOut,
  isPaused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(totalSeconds);

  useEffect(() => {
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timeLeft <= 0 && !isPaused) {
        onTimeOut();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalSeconds) * 100));

  // Đổi màu theo độ khẩn cấp
  const getBarColor = () => {
    if (timeLeft <= 2) return COLORS.danger;
    if (timeLeft <= 4) return COLORS.warning;
    return COLORS.success;
  };

  const barColor = getBarColor();
  const isUrgent = timeLeft <= 2;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.iconRow}>
          {isUrgent ? (
            <AlertTriangle size={18} color={COLORS.danger} />
          ) : (
            <Clock size={18} color={barColor} />
          )}
          <Text style={[styles.titleText, { color: barColor }]}>
            {isUrgent ? 'CẢNH BÁO PHẢN XẠ NHANH!' : 'Thời gian phản xạ'}
          </Text>
        </View>
        <Text style={[styles.timeNumber, { color: barColor }]}>{timeLeft}s</Text>
      </View>

      {/* Thanh Bar Co Rút */}
      <View style={styles.trackBackground}>
        <View
          style={[
            styles.fillBar,
            {
              width: `${progressPercent}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  timeNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  trackBackground: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 6,
  },
});
