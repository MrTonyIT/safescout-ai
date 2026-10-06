import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { survivalBlackout, BlackoutState } from '../services/survivalBlackout';
import { soundService } from '../services/sound';
import { BatteryCharging, Radio, Shield, Power } from 'lucide-react-native';

interface SurvivalBlackoutOverlayProps {
  visible: boolean;
  onExit: () => void;
}

export const SurvivalBlackoutOverlay: React.FC<SurvivalBlackoutOverlayProps> = ({
  visible,
  onExit,
}) => {
  const [state, setState] = useState<BlackoutState>(survivalBlackout.getState());

  useEffect(() => {
    if (visible) {
      const activeState = survivalBlackout.activateBlackout();
      setState(activeState);
      const unsub = survivalBlackout.subscribe((s) => setState(s));
      return () => {
        survivalBlackout.deactivateBlackout();
        unsub();
      };
    }
  }, [visible]);

  const handleExit = () => {
    soundService.playPop();
    survivalBlackout.deactivateBlackout();
    onExit();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.blackoutContainer}>
        <StatusBar hidden />

        {/* Thông tin tối giản phát quang sinh tồn OLED */}
        <View style={styles.topStatus}>
          <BatteryCharging size={20} color="#10B981" />
          <Text style={styles.batteryText}>
            PIN SINH TỒN: ~{state.batteryHoursRemaining} GIỜ LIÊN TỤC (OLED 0 NITS)
          </Text>
        </View>

        {/* Vùng phát xung tín hiệu GPS */}
        <View style={styles.pulseCenterBox}>
          <View style={styles.pulseDotGreen} />
          <Radio size={32} color="#00F0FF" />
          <Text style={styles.beaconMainText}>ĐANG PHÁT XUNG TÍN HIỆU CỨU NẠN</Text>
          <Text style={styles.beaconSubText}>
            GPS: {state.latitude.toFixed(4)}°N, {state.longitude.toFixed(4)}°E
          </Text>
          <Text style={styles.pulseCountText}>
            Đã phát {state.totalPulsesSent} gói tin vô tuyến tới đội cứu hộ
          </Text>
        </View>

        {/* Hướng dẫn thoát */}
        <TouchableOpacity
          style={styles.exitButtonMinimal}
          activeOpacity={0.7}
          onPress={handleExit}
        >
          <Power size={18} color="#EF4444" />
          <Text style={styles.exitText}>CHẠM ĐỂ BẬT LẠI MÀN HÌNH CHÍNH</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blackoutContainer: {
    flex: 1,
    backgroundColor: '#000000', // OLED Pure Black 0 nits
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  topStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  batteryText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pulseCenterBox: {
    alignItems: 'center',
    gap: 10,
  },
  pulseDotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00F0FF',
    marginBottom: 4,
  },
  beaconMainText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  beaconSubText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  pulseCountText: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  exitButtonMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
  },
  exitText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
