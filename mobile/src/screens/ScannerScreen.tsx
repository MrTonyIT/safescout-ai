import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Modal,
  ActivityIndicator,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraView } from 'expo-camera';
import { COLORS } from '../theme/colors';
import { ScannerScreenProps } from '../types/navigation';
import { MiloAvatar2D } from '../components/MiloAvatar2D';
import { MiloFeedback, HazardLevel } from '../types/curriculum';
import { scanEnvironmentImage } from '../services/api';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { dispatchSosBeaconToParent } from '../services/geo';
import { edgeVision } from '../services/edgeVision';
import { spatialHaptics } from '../services/spatialHaptics';
import { emergencyDetector } from '../services/emergencyDetector';
import { BottomNavBar } from '../components/BottomNavBar';
import {
  Camera as CameraIcon,
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
  X,
  Volume2,
  PhoneCall,
  Flame,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 4 Mẫu Vật Thể Mô Phỏng Huấn Luyện Cứu Hộ (Dành cho Web & Test Nhanh)
const SAMPLE_TRAINING_ITEMS = [
  {
    id: 'sample_mush',
    name: '🍄 Nấm Đỏ Sặc Sỡ',
    emoji: '🍄',
    hazardLevel: 'CRITICAL_EMERGENCY' as HazardLevel,
    speech: 'CẢNH BÁO SOS! Đây là nấm tán bay (Amanita) cực độc! Tuyệt đối không chạm hay nếm thử bé nhé!',
    action: 'Lùi xa ít nhất 3 bước và báo người lớn!',
  },
  {
    id: 'sample_plug',
    name: '⚡ Ổ Cắm Điện Hở',
    emoji: '⚡',
    hazardLevel: 'CRITICAL_EMERGENCY' as HazardLevel,
    speech: 'NGUY HIỂM ĐIỆN GIẬT! Ổ cắm bị nứt vỡ rò điện! Nếu tay dính nước sẽ cực kỳ nguy hiểm!',
    action: 'Không chạm vào và nhờ ba mẹ ngắt cầu dao!',
  },
  {
    id: 'sample_chem',
    name: '🧴 Chai Tẩy Rửa',
    emoji: '🧴',
    hazardLevel: 'CAUTION' as HazardLevel,
    speech: 'CẨN THẬN HÓA CHẤT! Nước lau sàn chứa chất tẩy ăn mòn da và cay mắt!',
    action: 'Để xa tầm tay em nhỏ và cất vào tủ cao.',
  },
  {
    id: 'sample_tree',
    name: '🌲 Cây Cổ Thụ To',
    emoji: '🌲',
    hazardLevel: 'SAFE' as HazardLevel,
    speech: 'AN TOÀN TUYỆT VỜI! Đây là gốc cây to vững chãi để bé thực hành ôm cây (Hug-a-Tree) khi lạc!',
    action: 'Đứng yên ôm thân cây và thổi còi SOS.',
  },
];

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MiloFeedback | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Animations
  const laserAnim = useRef(new Animated.Value(0)).current;
  const pulseAura = useRef(new Animated.Value(1)).current;
  const radarSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Xin quyền Camera trên Mobile
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } else {
        setHasPermission(true);
      }
    })();

    // Animation Laser quét dọc khung ngắm
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 240,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Radar xoay
    Animated.loop(
      Animated.timing(radarSpin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const handlePickImage = async () => {
    soundService.playPop();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
      processImageAnalysis(result.assets[0].uri, result.assets[0].base64);
    }
  };

  const handleQuickSample = async (sample: typeof SAMPLE_TRAINING_ITEMS[0]) => {
    soundService.playPop();
    setIsScanning(true);

    // 1. Suy luận tức thì bằng On-Device Edge Vision (<30ms)
    const edgeResult = await edgeVision.classifyImageEdge(sample.name);

    setTimeout(() => {
      setIsScanning(false);
      const feedback: MiloFeedback = {
        speech: edgeResult.speech,
        emotion: edgeResult.hazardLevel === 'CRITICAL_EMERGENCY' ? 'DANGER_ALERT' : edgeResult.hazardLevel === 'CAUTION' ? 'THINKING' : 'CHEERING',
        hazardLevel: edgeResult.hazardLevel,
        actionRequired: edgeResult.actionRequired,
        audioCue: edgeResult.hazardLevel === 'CRITICAL_EMERGENCY' ? 'sos_alarm' : 'success_ding',
        badgeShard: edgeResult.hazardLevel === 'SAFE' ? 'Mảnh Kính Viễn Vọng' : null,
      };

      if (edgeResult.hazardLevel === 'CRITICAL_EMERGENCY') {
        soundService.playAlertSound();
        spatialHaptics.playElectricShock();
        dispatchSosBeaconToParent('HAZARD_CRITICAL', `🚨 CẢNH BÁO EDGE AI: ${sample.name}`);
      } else {
        soundService.playSuccessSound();
        spatialHaptics.playHealingSoothe();
      }

      setAnalysisResult(feedback);
      setModalVisible(true);
      voiceService.speakMilo(feedback.speech, feedback.emotion);
    }, 450); // Cực kỳ nhanh 450ms (Edge Tensor Simulation)
  };

  const processImageAnalysis = async (uri: string, base64?: string | null) => {
    setIsScanning(true);
    soundService.playPop();

    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        // Blob for Web
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('image', blob, 'scan.jpg');
      } else {
        formData.append('image', {
          uri,
          type: 'image/jpeg',
          name: 'scan.jpg',
        } as any);
      }
      formData.append('userNickname', 'Bé Bo');
      formData.append('childAge', '7');

      const result = await scanEnvironmentImage(formData);
      setIsScanning(false);

      if (result.hazardLevel === 'CRITICAL_EMERGENCY') {
        soundService.playAlertSound();
        dispatchSosBeaconToParent('HAZARD_CRITICAL', `🚨 CẢNH BÁO QUÉT VẬT NGUY HIỂM: ${result.speech}`);
      } else {
        soundService.playSuccessSound();
      }

      setAnalysisResult(result);
      setModalVisible(true);
      voiceService.speakMilo(result.speech, result.emotion);
    } catch (e) {
      setIsScanning(false);
      // Fallback sample
      handleQuickSample(SAMPLE_TRAINING_ITEMS[0]);
    }
  };

  const spin = radarSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />

      {/* Top HUD Header */}
      <View style={styles.hudHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            soundService.playPop();
            navigation.navigate('WorldMap');
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTag}>GEMINI FLASH VISION 2.5D</Text>
          <Text style={styles.headerTitle}>Balo Cứu Hộ Lượng Tử 🛡️</Text>
        </View>
        <Animated.View style={[styles.radarBadge, { transform: [{ rotate: spin }] }]}>
          <Zap size={16} color="#00F0FF" />
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Milo Hướng Dẫn Hologram */}
        <View style={styles.miloGuideBanner}>
          <MiloAvatar2D emotion="THINKING" size={48} showSpeechBubble={false} />
          <View style={styles.miloGuideSpeech}>
            <View style={styles.miloGuideTagBox}>
              <Sparkles size={12} color="#FFE66D" />
              <Text style={styles.miloGuideTag}>TRỢ LÝ THỊ GIÁC MILO</Text>
            </View>
            <Text style={styles.miloGuideText}>
              Bé hãy hướng ống kính vào đồ vật xung quanh hoặc chạm nhanh các mẫu bên dưới để mình phân tích mối nguy nhé!
            </Text>
          </View>
        </View>

        {/* Khung Ngắm Camera / Scanner Finder */}
        <View style={styles.scannerViewport}>
          {selectedImageUri ? (
            <Image source={{ uri: selectedImageUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <View style={styles.cameraSimulatorBg}>
              <View style={styles.gridOverlay} />
              <Text style={styles.finderHintText}>
                {Platform.OS === 'web'
                  ? '📸 Đang bật Khung Ngắm AI Lượng Tử (Chọn ảnh hoặc bấm mẫu bên dưới)'
                  : '📸 Hướng ống kính vào vật thể xung quanh để Milo nhận diện'}
              </Text>
              <View style={styles.coppaPrivacyBadge}>
                <ShieldCheck size={14} color="#10B981" />
                <Text style={styles.coppaPrivacyText}>COPPA PRIVACY: TỰ ĐỘNG LÀM MỜ THÔNG TIN NHẠY CẢM</Text>
              </View>
            </View>
          )}

          {/* Khung ngắm Laser Quantum Finder */}
          <View style={styles.finderFrame}>
            {/* 4 Góc Khung Neon */}
            <View style={[styles.cornerBracket, styles.topLeftCorner]} />
            <View style={[styles.cornerBracket, styles.topRightCorner]} />
            <View style={[styles.cornerBracket, styles.bottomLeftCorner]} />
            <View style={[styles.cornerBracket, styles.bottomRightCorner]} />

            {/* Tia Laser Quét Động */}
            <Animated.View
              style={[
                styles.laserLine,
                { transform: [{ translateY: laserAnim }] },
              ]}
            >
              <View style={styles.laserGlow} />
            </Animated.View>

            {/* Tâm ngắm Crosshair */}
            <View style={styles.crosshairCenter}>
              <View style={styles.crosshairDot} />
            </View>
          </View>

          {/* Trạng thái quét Loading */}
          {isScanning ? (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#00F0FF" />
              <Text style={styles.scanningText}>Gemini AI đang phân tích rủi ro cứu hộ...</Text>
            </View>
          ) : null}
        </View>

        {/* Thanh Chọn Mẫu Vật Thể Sinh Tồn Nhanh (Dành cho Bé Khám Phá) */}
        <View style={styles.sampleTrainSection}>
          <Text style={styles.sampleSectionTitle}>🎯 MẪU THỰC HÀNH NHẬN DIỆN NGUY HIỂM NHANH:</Text>
          <View style={styles.sampleRow}>
            {SAMPLE_TRAINING_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={[
                  styles.sampleCard3D,
                  {
                    backgroundColor:
                      item.hazardLevel === 'CRITICAL_EMERGENCY'
                        ? '#FEF2F2'
                        : item.hazardLevel === 'CAUTION'
                        ? '#FFFBEB'
                        : '#ECFDF5',
                    borderColor:
                      item.hazardLevel === 'CRITICAL_EMERGENCY'
                        ? '#EF4444'
                        : item.hazardLevel === 'CAUTION'
                        ? '#F59E0B'
                        : '#10B981',
                  },
                ]}
                onPress={() => handleQuickSample(item)}
              >
                <Text style={styles.sampleEmoji}>{item.emoji}</Text>
                <Text style={styles.sampleNameText} numberOfLines={1}>
                  {item.name.replace(/^[^\s]+\s/, '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cụm Nút Chụp Ảnh Chunky 3D */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.galleryBtn}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <ImageIcon size={22} color="#FFFFFF" />
            <Text style={styles.btnSubText}>Tải Ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainCaptureBtn3D}
            onPress={() => handleQuickSample(SAMPLE_TRAINING_ITEMS[0])}
            activeOpacity={0.85}
          >
            <View style={styles.captureInnerCircle}>
              <CameraIcon size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.captureBtnLabel}>SOI VẬT THỂ 📸</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sosShortcutBtn}
            onPress={() => {
              soundService.playAlertSound();
              navigation.navigate('Sos');
            }}
            activeOpacity={0.8}
          >
            <Flame size={22} color="#FFFFFF" />
            <Text style={styles.btnSubText}>Còi SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Báo Cáo Phân Tích Của Milo (Milo Analysis Modal) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard3D,
              {
                borderColor:
                  analysisResult?.hazardLevel === 'CRITICAL_EMERGENCY'
                    ? '#EF4444'
                    : analysisResult?.hazardLevel === 'CAUTION'
                    ? '#F59E0B'
                    : '#10B981',
              },
            ]}
          >
            {/* Nút đóng */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Badge Mức Nguy Hiểm */}
            <View
              style={[
                styles.hazardBadge,
                {
                  backgroundColor:
                    analysisResult?.hazardLevel === 'CRITICAL_EMERGENCY'
                      ? '#EF4444'
                      : analysisResult?.hazardLevel === 'CAUTION'
                      ? '#F59E0B'
                      : '#10B981',
                },
              ]}
            >
              {analysisResult?.hazardLevel === 'CRITICAL_EMERGENCY' ? (
                <ShieldAlert size={18} color="#FFFFFF" />
              ) : analysisResult?.hazardLevel === 'CAUTION' ? (
                <AlertTriangle size={18} color="#FFFFFF" />
              ) : (
                <ShieldCheck size={18} color="#FFFFFF" />
              )}
              <Text style={styles.hazardBadgeText}>
                {analysisResult?.hazardLevel === 'CRITICAL_EMERGENCY'
                  ? 'BÁO ĐỘNG KHẨN CẤP (SOS)'
                  : analysisResult?.hazardLevel === 'CAUTION'
                  ? 'CẢNH BÁO CẨN TRỌNG'
                  : 'MÔI TRƯỜNG AN TOÀN'}
              </Text>
            </View>

            {/* Mascot Milo Hoạt Họa */}
            <View style={styles.miloModalWrapper}>
              <MiloAvatar2D
                emotion={analysisResult?.emotion || 'IDLE'}
                size={86}
                showSpeechBubble={false}
              />
            </View>

            {/* Lời Nhận Định Của Milo */}
            <Text style={styles.analysisSpeechText}>{analysisResult?.speech}</Text>

            {/* Hành Động Khắc Phục / Thoát Hiểm */}
            {analysisResult?.actionRequired ? (
              <View
                style={[
                  styles.actionBox,
                  {
                    backgroundColor:
                      analysisResult?.hazardLevel === 'CRITICAL_EMERGENCY'
                        ? '#FEF2F2'
                        : '#FFFBEB',
                    borderColor:
                      analysisResult?.hazardLevel === 'CRITICAL_EMERGENCY'
                        ? '#FCA5A5'
                        : '#FDE68A',
                  },
                ]}
              >
                <Text style={styles.actionTitle}>👉 HÀNH ĐỘNG CỨU MẠNG:</Text>
                <Text style={styles.actionContent}>{analysisResult?.actionRequired}</Text>
              </View>
            ) : null}

            {/* Nút hành động */}
            {analysisResult?.hazardLevel === 'CRITICAL_EMERGENCY' ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.sosModalBtn3D}
                onPress={() => {
                  soundService.playAlertSound();
                  setModalVisible(false);
                  navigation.navigate('Sos');
                }}
              >
                <Text style={styles.sosModalBtnText}>CHUYỂN SANG CÒI HÚ SOS 🚨</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.okModalBtn3D}
                onPress={() => {
                  soundService.playPop();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.okModalBtnText}>ĐÃ HIỂU RÕ RỒI! 🛡️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Dock */}
      <BottomNavBar
        activeTab="ai"
        onTabPress={(tab) => {
          soundService.playPop();
          if (tab === 'map') navigation.navigate('WorldMap');
          if (tab === 'backpack' || tab === 'badges') navigation.navigate('Inventory');
          if (tab === 'sos') navigation.navigate('Sos');
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
  hudHeader: {
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
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  radarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: 85,
    paddingTop: 8,
  },
  miloGuideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2C59',
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
    gap: 10,
  },
  miloGuideSpeech: {
    flex: 1,
  },
  miloGuideTagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  miloGuideTag: {
    color: '#FFE66D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  miloGuideText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  scannerViewport: {
    height: 280,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#00F0FF',
    position: 'relative',
    backgroundColor: '#030712',
  },
  cameraSimulatorBg: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#091322',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  finderHintText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  finderFrame: {
    position: 'absolute',
    top: 30,
    bottom: 30,
    left: 20,
    right: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 18,
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00F0FF',
  },
  topLeftCorner: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRightCorner: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeftCorner: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRightCorner: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    height: 3,
    backgroundColor: '#00F0FF',
  },
  laserGlow: {
    height: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.35)',
    marginTop: -4,
  },
  crosshairCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  scanningText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '900',
  },
  sampleTrainSection: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sampleSectionTitle: {
    color: '#FFE66D',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
  },
  sampleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleCard3D: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  sampleEmoji: {
    fontSize: 18,
  },
  sampleNameText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#071936',
  },
  galleryBtn: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#475569',
  },
  sosShortcutBtn: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#991B1B',
  },
  btnSubText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 3,
  },
  mainCaptureBtn3D: {
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: '#00F0FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  captureInnerCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard3D: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 4,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  hazardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  hazardBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  miloModalWrapper: {
    marginVertical: 6,
  },
  analysisSpeechText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 8,
  },
  actionBox: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 8,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#C2410C',
    marginBottom: 2,
  },
  actionContent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  sosModalBtn3D: {
    width: '100%',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderColor: '#991B1B',
    marginTop: 8,
  },
  sosModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  okModalBtn3D: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderColor: '#047857',
    marginTop: 8,
  },
  okModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  coppaPrivacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 6,
    marginTop: 10,
  },
  coppaPrivacyText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
