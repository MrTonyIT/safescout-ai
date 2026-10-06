import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Linking,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../theme/colors';
import { SosScreenProps } from '../types/navigation';
import { MiloAvatar2D } from '../components/MiloAvatar2D';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { dispatchSosBeaconToParent } from '../services/geo';
import { bleMeshSos, MeshRelayPacket } from '../services/meshSos';
import { spatialHaptics } from '../services/spatialHaptics';
import { e2eeSecurity } from '../services/e2eeSecurity';
import { guardianRing } from '../services/guardianRing';
import { PanicCalmerModal } from '../components/PanicCalmerModal';
import { SurvivalBlackoutOverlay } from '../components/SurvivalBlackoutOverlay';
import { BottomNavBar } from '../components/BottomNavBar';
import {
  Flame,
  Volume2,
  VolumeX,
  Zap,
  PhoneCall,
  ShieldAlert,
  ArrowLeft,
  Sun,
  Moon,
  AlertCircle,
  HelpCircle,
  MapPin,
  Users,
  Info,
  Radio,
  Wifi,
  Wind,
  BatteryCharging,
  Lock,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EMERGENCY_SERVICES = [
  {
    number: '111',
    name: 'Tổng Đài Trẻ Em',
    desc: 'Bảo vệ trẻ em khỏi bạo lực, xâm hại & bóc lột.',
    color: '#0284C7',
    border: '#0369A1',
    badge: 'QUỐC GIA',
    icon: '🛡️',
  },
  {
    number: '113',
    name: 'Cảnh Sát / Công An',
    desc: 'Bắt cóc, kẻ trộm, đe dọa bạo lực khẩn cấp.',
    color: '#1D4ED8',
    border: '#1E40AF',
    badge: 'PHẢN ỨNG NHANH',
    icon: '🚓',
  },
  {
    number: '114',
    name: 'Cứu Hỏa & Cứu Nạn',
    desc: 'Cháy nhà, hỏa hoạn, kẹt thang máy, sập hầm.',
    color: '#DC2626',
    border: '#B91C1C',
    badge: 'CHỮA CHÁY',
    icon: '🚒',
  },
  {
    number: '115',
    name: 'Cấp Cứu Y Tế',
    desc: 'Bất tỉnh, ngạt thở, gãy xương, bỏng nặng.',
    color: '#059669',
    border: '#047857',
    badge: 'CẤP CỨU',
    icon: '🚑',
  },
];

export const SosScreen: React.FC<SosScreenProps> = ({ navigation }) => {
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [strobeColor, setStrobeColor] = useState<'#FFFFFF' | '#EF4444'>('#FFFFFF');
  const [meshPacket, setMeshPacket] = useState<MeshRelayPacket | null>(null);
  const [isPanicModalVisible, setIsPanicModalVisible] = useState<boolean>(false);
  const [isBlackoutVisible, setIsBlackoutVisible] = useState<boolean>(false);

  // Animations: Radar Shockwave for SOS Button
  const shockwave1 = useRef(new Animated.Value(0)).current;
  const shockwave2 = useRef(new Animated.Value(0)).current;
  const sosScale = useRef(new Animated.Value(1)).current;

  // Siren interval ref
  const sirenIntervalRef = useRef<any>(null);
  const strobeIntervalRef = useRef<any>(null);

  useEffect(() => {
    const unsub = bleMeshSos.subscribe((p) => setMeshPacket({ ...p }));
    // Shockwave Loops
    const createShockwave = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    createShockwave(shockwave1, 0).start();
    createShockwave(shockwave2, 900).start();

    // Nút SOS nhấp nháy
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosScale, { toValue: 1.06, duration: 600, useNativeDriver: true }),
        Animated.timing(sosScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ).start();

    return () => {
      stopSiren();
      stopStrobe();
      unsub();
    };
  }, []);

  // 1. Còi Hú Cứu Nạn Max Volume
  const toggleSiren = () => {
    soundService.playPop();
    if (isSirenActive) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const startSiren = () => {
    setIsSirenActive(true);
    soundService.playAlertSound();
    spatialHaptics.playElectricShock();
    dispatchSosBeaconToParent('SOS_SIREN', '🚨 CÒI HÚ CỨU NẠN: Bé vừa kích hoạt còi SOS âm lượng tối đa!');
    guardianRing.dispatchSosToGuardians();
    const packet = bleMeshSos.startMeshBroadcast('🚨 CÒI HÚ CỨU NẠN: Bé vừa kích hoạt còi SOS!');
    setMeshPacket(packet);
    voiceService.speakMilo('Đã bật còi hú cứu nạn và kích hoạt mạng vô tuyến BLE Mesh chuyển tiếp vị trí tới ba mẹ!', 'DANGER_ALERT');

    sirenIntervalRef.current = setInterval(() => {
      soundService.playAlertSound();
    }, 600);
  };

  const stopSiren = () => {
    setIsSirenActive(false);
    bleMeshSos.stopMeshBroadcast();
    setMeshPacket(null);
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  };

  // 2. Đèn Chớp Tín Hiệu SOS Morse (3 Ngắn - 3 Dài - 3 Ngắn)
  const toggleStrobe = () => {
    soundService.playPop();
    if (isStrobeActive) {
      stopStrobe();
    } else {
      startStrobe();
    }
  };

  const startStrobe = () => {
    setIsStrobeActive(true);
    let step = 0;
    voiceService.speakMilo('Đã bật đèn chớp tín hiệu Morse SOS quốc tế!', 'THINKING');
    // Morse SOS pattern timing
    strobeIntervalRef.current = setInterval(() => {
      step = (step + 1) % 12;
      // 3 chớp ngắn (step 0, 2, 4), 3 chớp dài (step 6, 8, 10)
      if (step === 0 || step === 2 || step === 4 || step === 6 || step === 8 || step === 10) {
        setStrobeColor((prev) => (prev === '#FFFFFF' ? '#EF4444' : '#FFFFFF'));
      }
    }, 250);
  };

  const stopStrobe = () => {
    setIsStrobeActive(false);
    if (strobeIntervalRef.current) {
      clearInterval(strobeIntervalRef.current);
      strobeIntervalRef.current = null;
    }
  };

  // 3. Gọi Khẩn Cấp 1-Chạm
  const handleCallEmergency = (number: string, name: string) => {
    soundService.playAlertSound();
    dispatchSosBeaconToParent('SPEED_DIAL', `📞 Bé vừa gọi số cứu nạn khẩn cấp: ${number} (${name})`);
    voiceService.speakMilo(`Đang kết nối cuộc gọi cứu nạn tới số ${number}. Bé hãy nói rõ địa chỉ nhé!`, 'DANGER_ALERT');
    const telUrl = `tel:${number}`;

    if (Platform.OS === 'web') {
      window.open(telUrl, '_self');
    } else {
      Linking.canOpenURL(telUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(telUrl);
          } else {
            Alert.alert('Không thể thực hiện cuộc gọi', `Thiết bị không hỗ trợ gọi trực tiếp đến số ${number}`);
          }
        })
        .catch(() => {
          Linking.openURL(telUrl);
        });
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />

      {/* Chớp Đèn Toàn Màn Hình Khi Bật Strobe */}
      {isStrobeActive ? (
        <View
          style={[
            styles.strobeOverlay,
            { backgroundColor: strobeColor, opacity: 0.85 },
          ]}
          pointerEvents="none"
        />
      ) : null}

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            stopSiren();
            stopStrobe();
            soundService.playPop();
            navigation.navigate('WorldMap');
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTag}>BỘ CÔNG CỤ SINH TỒN OFFLINE</Text>
          <Text style={styles.headerTitle}>Cứu Hộ Khẩn Cấp (SOS) 🚨</Text>
        </View>
        <View style={styles.offlinePill}>
          <Text style={styles.offlineText}>100% OFFLINE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Nhắc Nhở Của Đội Trưởng Milo */}
        <View style={styles.miloAlertBanner}>
          <MiloAvatar2D emotion={isSirenActive ? 'DANGER_ALERT' : 'THINKING'} size={60} showSpeechBubble={false} />
          <View style={styles.miloAlertBubble}>
            <Text style={styles.miloAlertTitle}>Lệnh Cứu Hộ Khẩn Cấp! 🛡️</Text>
            <Text style={styles.miloAlertText}>
              Bình tĩnh nào bạn nhỏ! Hãy bấm Còi Hú hoặc gọi các số cứu nạn bên dưới để nhận trợ giúp ngay lập tức!
            </Text>
          </View>
        </View>

        {/* 1. NÚT CÒI HÚ CỨU NẠN MAX VOLUME KHỔNG LỒ */}
        <View style={styles.sosButtonSection}>
          <View style={styles.shockwaveContainer} pointerEvents="none">
            <Animated.View
              style={[
                styles.shockwaveRing,
                {
                  transform: [
                    {
                      scale: shockwave1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.2],
                      }),
                    },
                  ],
                  opacity: shockwave1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 0],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.shockwaveRing,
                {
                  transform: [
                    {
                      scale: shockwave2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.2],
                      }),
                    },
                  ],
                  opacity: shockwave2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 0],
                  }),
                },
              ]}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: sosScale }] }}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.giantSosButton3D,
                isSirenActive ? styles.giantSosButtonActive : null,
              ]}
              onPress={toggleSiren}
            >
              {isSirenActive ? (
                <VolumeX size={44} color="#FFFFFF" />
              ) : (
                <Volume2 size={44} color="#FFFFFF" />
              )}
              <Text style={styles.giantSosText}>
                {isSirenActive ? 'TẮT CÒI HÚ' : 'CÒI HÚ SOS'}
              </Text>
              <Text style={styles.giantSosSubText}>
                {isSirenActive ? 'Đang phát âm lượng cực đại' : 'Chạm để phát còi cứu nạn'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 2. ĐÈN CHỚP TÍN HIỆU MORSE */}
        <View style={styles.toolRow}>
          <TouchableOpacity
            style={[
              styles.strobeBtn3D,
              isStrobeActive ? styles.strobeBtnActive : null,
            ]}
            onPress={toggleStrobe}
            activeOpacity={0.8}
          >
            <Zap size={24} color={isStrobeActive ? '#EF4444' : '#FFE66D'} />
            <Text style={styles.toolBtnText}>
              {isStrobeActive ? 'TẮT ĐÈN MORSE' : 'ĐÈN CHỚP SOS MORSE'}
            </Text>
            <Text style={styles.toolBtnSub}>3 Ngắn - 3 Dài - 3 Ngắn</Text>
          </TouchableOpacity>
        </View>

        {/* HÀNG CÔNG CỤ SINH TỒN THẦN KINH & NĂNG LƯỢNG */}
        <View style={styles.calmerBlackoutRow}>
          <TouchableOpacity
            style={[styles.calmerBtn3D]}
            onPress={() => {
              soundService.playPop();
              setIsPanicModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <Wind size={20} color="#00F0FF" />
            <Text style={styles.calmerBtnText}>HÍT THỞ 4-4-4 🫁</Text>
            <Text style={styles.calmerBtnSub}>Hạ sợ hãi & bình tĩnh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.blackoutBtn3D]}
            onPress={() => {
              soundService.playPop();
              setIsBlackoutVisible(true);
            }}
            activeOpacity={0.85}
          >
            <BatteryCharging size={20} color="#10B981" />
            <Text style={styles.blackoutBtnText}>PIN 48H OLED 🔋</Text>
            <Text style={styles.blackoutBtnSub}>Tối giản khi đi lạc</Text>
          </TouchableOpacity>
        </View>

        {/* ==================================================== */}
        {/* THẺ TRẠNG THÁI MẠNG VÔ TUYẾN BLE MESH RELAY (OFFLINE) */}
        {/* ==================================================== */}
        {meshPacket ? (
          <View style={styles.meshRelayCard3D}>
            <View style={styles.meshHeaderRow}>
              <Radio size={16} color="#00F0FF" />
              <Text style={styles.meshHeaderTitle}>MẠNG VÔ TUYẾN CỨU NẠN P2P BLE MESH</Text>
              <View style={styles.meshLiveDot} />
            </View>
            <Text style={styles.meshStatusText}>
              📶 Đang phát sóng tiếp sức qua {meshPacket.relayNodesCount} thiết bị trung gian ({meshPacket.hopCount} Hops)!
            </Text>
            <View style={styles.meshMetaRow}>
              <Text style={styles.meshNodeId}>Node: {meshPacket.originDeviceId}</Text>
              <Text style={styles.meshDbmText}>Tín hiệu: {meshPacket.signalStrengthDbm} dBm</Text>
            </View>
          </View>
        ) : null}

        {/* 3. DANH SÁCH 4 SỐ VÀNG CỨU NẠN 1-CHẠM */}
        <View style={styles.emergencyDialSection}>
          <Text style={styles.sectionHeaderTitle}>📞 4 PHÍM GỌI CỨU NẠN KHẨN CẤP (1-CHẠM):</Text>

          <View style={styles.serviceGrid}>
            {EMERGENCY_SERVICES.map((srv) => (
              <TouchableOpacity
                key={srv.number}
                activeOpacity={0.85}
                style={[
                  styles.serviceCard3D,
                  { backgroundColor: srv.color, borderBottomColor: srv.border },
                ]}
                onPress={() => handleCallEmergency(srv.number, srv.name)}
              >
                <View style={styles.serviceHeaderRow}>
                  <Text style={styles.serviceEmoji}>{srv.icon}</Text>
                  <View style={styles.serviceBadgeTag}>
                    <Text style={styles.serviceBadgeText}>{srv.badge}</Text>
                  </View>
                </View>
                <Text style={styles.serviceBigNumber}>{srv.number}</Text>
                <Text style={styles.serviceName}>{srv.name}</Text>
                <Text style={styles.serviceDesc}>{srv.desc}</Text>
                <View style={styles.callNowRow}>
                  <PhoneCall size={14} color="#FFFFFF" />
                  <Text style={styles.callNowText}>GỌI NGAY</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. HƯỚNG DẪN 3 CÂU BÉ CẦN NÓI KHI GỌI CỨU NẠN */}
        <View style={styles.goldenRuleCard}>
          <View style={styles.goldenRuleHeader}>
            <Info size={20} color="#FFE66D" />
            <Text style={styles.goldenRuleTitle}>⭐ 3 THÔNG TIN VÀNG CẦN NÓI KHI GỌI:</Text>
          </View>
          <View style={styles.ruleItem}>
            <MapPin size={16} color="#00F0FF" />
            <Text style={styles.ruleItemText}>
              <Text style={styles.ruleHighlight}>1. Địa chỉ con ở đâu:</Text> Số nhà, tên đường, trường học hoặc vật mốc gần nhất.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <AlertCircle size={16} color="#FF6B35" />
            <Text style={styles.ruleItemText}>
              <Text style={styles.ruleHighlight}>2. Chuyện gì xảy ra:</Text> Có đám cháy, người bị thương hay có kẻ xấu.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <Users size={16} color="#10B981" />
            <Text style={styles.ruleItemText}>
              <Text style={styles.ruleHighlight}>3. Có bao nhiêu người:</Text> Có ai bị kẹt lại không và giữ máy theo hướng dẫn.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Hít Thở Sinh Tồn 4-4-4 */}
      <PanicCalmerModal
        visible={isPanicModalVisible}
        onClose={() => setIsPanicModalVisible(false)}
      />

      {/* Màn Hình Đen OLED Tiết Kiệm Pin 48H */}
      <SurvivalBlackoutOverlay
        visible={isBlackoutVisible}
        onExit={() => setIsBlackoutVisible(false)}
      />

      {/* Bottom Navigation Dock */}
      <BottomNavBar
        activeTab="sos"
        onTabPress={(tab) => {
          stopSiren();
          stopStrobe();
          soundService.playPop();
          if (tab === 'map') navigation.navigate('WorldMap');
          if (tab === 'ai') navigation.navigate('Scanner');
          if (tab === 'backpack' || tab === 'badges') navigation.navigate('Inventory');
          if (tab === 'parent') navigation.navigate('ParentAuth');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#071936',
    width: '100%',
    height: '100%',
  },
  strobeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0A1E3F',
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  headerTag: {
    color: '#FF6B35',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  offlinePill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  contentScrollView: {
    flex: 1,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  contentScrollContainer: {
    padding: 14,
    paddingBottom: 110,
  },
  miloAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2C59',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2.5,
    borderColor: '#FF6B35',
    marginBottom: 16,
  },
  miloAlertBubble: {
    flex: 1,
    marginLeft: 10,
  },
  miloAlertTitle: {
    color: '#FFE66D',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  miloAlertText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  sosButtonSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    position: 'relative',
    height: 180,
  },
  shockwaveContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shockwaveRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  giantSosButton3D: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EF4444',
    borderWidth: 4,
    borderBottomWidth: 10,
    borderColor: '#FFFFFF',
    borderBottomColor: '#991B1B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  giantSosButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#FACC15',
  },
  giantSosText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  giantSosSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  toolRow: {
    marginBottom: 16,
  },
  strobeBtn3D: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#475569',
  },
  strobeBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  toolBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  toolBtnSub: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  emergencyDialSection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    color: '#FFE66D',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard3D: {
    width: (SCREEN_WIDTH - 38) / 2,
    borderRadius: 18,
    padding: 12,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#FFFFFF',
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceEmoji: {
    fontSize: 20,
  },
  serviceBadgeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  serviceBigNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  serviceName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  serviceDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    lineHeight: 14,
    minHeight: 28,
  },
  callNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  callNowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  goldenRuleCard: {
    backgroundColor: '#0F2C59',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    gap: 8,
  },
  goldenRuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  goldenRuleTitle: {
    color: '#FFE66D',
    fontSize: 12,
    fontWeight: '900',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleItemText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  ruleHighlight: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  meshRelayCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#0284C7',
    marginVertical: 10,
    width: '100%',
  },
  meshHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  meshHeaderTitle: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    flex: 1,
  },
  meshLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  meshStatusText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    marginVertical: 4,
  },
  meshMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meshNodeId: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  meshDbmText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  calmerBlackoutRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginVertical: 6,
  },
  calmerBtn3D: {
    flex: 1,
    backgroundColor: '#0369A1',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#38BDF8',
    borderBottomColor: '#075985',
  },
  calmerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  calmerBtnSub: {
    color: '#E0F2FE',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  blackoutBtn3D: {
    flex: 1,
    backgroundColor: '#065F46',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#10B981',
    borderBottomColor: '#047857',
  },
  blackoutBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  blackoutBtnSub: {
    color: '#D1FAE5',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
});
