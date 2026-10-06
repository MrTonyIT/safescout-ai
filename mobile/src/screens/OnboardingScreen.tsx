import { RELEASE } from '../config/release';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { OnboardingScreenProps } from '../types/navigation';
import { MiloAvatar2D } from '../components/MiloAvatar2D';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { spatialHaptics } from '../services/spatialHaptics';
import {
  Sparkles,
  ArrowRight,
  Bell,
  Clock,
  Compass,
  Users,
  Award,
  CheckCircle2,
  Volume2,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AGE_OPTIONS = [
  { id: '5_6', label: '5 - 6 Tuổi', sub: 'Mầm Non & Lớp 1', icon: '🌱' },
  { id: '7_8', label: '7 - 8 Tuổi', sub: 'Lớp 2 - Lớp 3', icon: '🚀' },
  { id: '9_10', label: '9 - 10 Tuổi', sub: 'Lớp 4 - Lớp 5', icon: '⭐' },
  { id: '11_plus', label: '11+ Tuổi', sub: 'Tiền Trung Học', icon: '👑' },
];

const REFERRAL_OPTIONS = [
  { id: 'social', label: '📺 YouTube / TikTok', sub: 'Xem video thám hiểm' },
  { id: 'school', label: '🏫 Thầy cô / Trường học', sub: 'Giờ học kỹ năng sống' },
  { id: 'parents', label: '👨‍👩‍👧 Ba mẹ giới thiệu', sub: 'Gia đình cùng rèn luyện' },
  { id: 'friends', label: '🎮 Bạn bè rủ chơi', sub: 'Biệt đội nhí cùng thi đấu' },
];

const TIME_OPTIONS = [
  { id: '15', minutes: 15, label: '⚡ 15 Phút', desc: 'Rèn luyện phản xạ nhanh', badge: 'Khuyên Dùng' },
  { id: '30', minutes: 30, label: '🌟 30 Phút', desc: 'Vượt ải & Minigame sâu', badge: 'Tiêu Chuẩn' },
  { id: '45', minutes: 45, label: '🔥 45 Phút', desc: 'Đại kiện tướng sinh tồn', badge: 'Nâng Cao' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedAge, setSelectedAge] = useState<string>('7_8');
  const [selectedReferral, setSelectedReferral] = useState<string>('parents');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);

  // Animations
  const mascotBounce = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const stepTransition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mascot idle floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotBounce, { toValue: -8, duration: 1000, useNativeDriver: true }),
        Animated.timing(mascotBounce, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();

    animateStepChange();
  }, [step]);

  const animateStepChange = () => {
    contentFade.setValue(0);
    stepTransition.setValue(20);

    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(stepTransition, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
    ]).start();

    // Voice speak instructions
    setTimeout(() => {
      if (step === 1) {
        voiceService.speakMilo('Chào Nhà thám hiểm nhí! Con năm nay bao nhiêu tuổi rồi?', 'CHEERING');
      } else if (step === 2) {
        voiceService.speakMilo('Con biết đến Học Viện Thám Hiểm qua đâu thế?', 'THINKING');
      } else if (step === 3) {
        voiceService.speakMilo('Mỗi ngày con muốn cùng Milo rèn luyện bao lâu?', 'CHEERING');
      } else if (step === 4) {
        voiceService.speakMilo('Đây là bản thử nội bộ, nội dung đang chờ duyệt. Thông báo chưa được bật.', 'THINKING');
      }
    }, 200);
  };

  const handleNextStep = () => {
    soundService.playPop();
    spatialHaptics.playHealingSoothe();
    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const handleCompleteOnboarding = async (enableNotifications: boolean) => {
    soundService.playFanfare();
    spatialHaptics.playVictoryFanfare();

    try {
      // Lưu trữ cấu hình người chơi
      const profile = {
        ageGroup: selectedAge,
        referralChannel: selectedReferral,
        dailyMinutes: selectedMinutes,
        notificationsEnabled: false,
        onboardedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('milo_has_onboarded_v1', 'true');
      await AsyncStorage.setItem('milo_child_profile_v1', JSON.stringify(profile));

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('milo_has_onboarded_v1', 'true');
        window.localStorage.setItem('milo_child_profile_v1', JSON.stringify(profile));
      }
    } catch (e) {
      console.log('Error saving onboarding state:', e);
    }

    // Chuyển sang WorldMap và kích hoạt Spotlight Tour Guide
    navigation.replace('WorldMap', { showTour: RELEASE.tour });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />

      {/* Header Tiến Trình 4 Bước */}
      <View style={styles.topHeader}>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => {
            const isActive = step === s;
            const isDone = step > s;
            return (
              <View key={s} style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepDot,
                    isActive ? styles.stepDotActive : isDone ? styles.stepDotDone : styles.stepDotPending,
                  ]}
                >
                  {isDone ? (
                    <CheckCircle2 size={12} color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.stepDotText, isActive ? styles.stepDotTextActive : null]}>
                      {s}
                    </Text>
                  )}
                </View>
                {s < 4 ? (
                  <View style={[styles.stepLine, isDone ? styles.stepLineDone : null]} />
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot Milo 2.5D Trung Tâm */}
        <Animated.View style={[styles.mascotHolder, { transform: [{ translateY: mascotBounce }] }]}>
          <MiloAvatar2D
            emotion={step === 4 ? 'CHEERING' : step === 3 ? 'CHEERING' : step === 2 ? 'THINKING' : 'CHEERING'}
            customImage={
              step === 4
                ? require('../../assets/milo_backpack.png')
                : step === 3
                ? require('../../assets/milo_timing.png')
                : undefined
            }
            size={110}
            showSpeechBubble={false}
          />
        </Animated.View>

        {/* Khung Thoại Sinh Động Của Milo */}
        <View style={styles.miloBubbleCard}>
          <View style={styles.bubbleHeaderRow}>
            <Text style={styles.bubbleTag}>ĐỘI TRƯỞNG MILO</Text>
            <TouchableOpacity
              style={styles.speakerBtn}
              onPress={() => {
                soundService.playPop();
                if (step === 1) voiceService.speakMilo('Chào Nhà thám hiểm nhí! Con năm nay bao nhiêu tuổi rồi?');
                if (step === 2) voiceService.speakMilo('Con biết đến Học Viện Thám Hiểm qua đâu thế?');
                if (step === 3) voiceService.speakMilo('Mỗi ngày con muốn cùng Milo rèn luyện bao lâu?');
                if (step === 4) voiceService.speakMilo('Bản thử nội bộ. Nội dung đang chờ duyệt. Thông báo chưa được bật.');
              }}
            >
              <Volume2 size={16} color="#FFE66D" />
            </TouchableOpacity>
          </View>

          <Text style={styles.bubblePromptText}>
            {step === 1 && 'Chào Nhà thám hiểm nhí! 🌟 Con năm nay bao nhiêu tuổi rồi?'}
            {step === 2 && 'Tuyệt vời! Con biết đến Học Viện Thám Hiểm qua đâu thế? 🗺️'}
            {step === 3 && 'Mỗi ngày con muốn cùng Milo rèn luyện phản xạ bao lâu? ⏱️'}
            {step === 4 && 'Bản thử nội bộ: nội dung đang chờ duyệt, chưa bật thông báo.'}
          </Text>
        </View>

        {/* Nội dung tương tác từng bước */}
        <Animated.View
          style={[
            styles.interactiveArea,
            {
              opacity: contentFade,
              transform: [{ translateY: stepTransition }],
            },
          ]}
        >
          {/* ==================================================== */}
          {/* BƯỚC 1: CHỌN ĐỘ TUỔI (4 NÚT CHUNKY 3D) */}
          {/* ==================================================== */}
          {step === 1 ? (
            <View style={styles.optionsGrid2x2}>
              {AGE_OPTIONS.map((opt) => {
                const isSelected = selectedAge === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.85}
                    onPress={() => {
                      soundService.playPop();
                      setSelectedAge(opt.id);
                    }}
                    style={[
                      styles.chunkyOptionCard,
                      isSelected ? styles.chunkyOptionCardSelected : null,
                    ]}
                  >
                    <Text style={styles.optionEmoji}>{opt.icon}</Text>
                    <Text style={[styles.optionMainText, isSelected ? styles.optionTextSelected : null]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.optionSubText}>{opt.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* ==================================================== */}
          {/* BƯỚC 2: KÊNH BIẾT ĐẾN APP */}
          {/* ==================================================== */}
          {step === 2 ? (
            <View style={styles.optionsList}>
              {REFERRAL_OPTIONS.map((opt) => {
                const isSelected = selectedReferral === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.85}
                    onPress={() => {
                      soundService.playPop();
                      setSelectedReferral(opt.id);
                    }}
                    style={[
                      styles.listOptionCard,
                      isSelected ? styles.listOptionCardSelected : null,
                    ]}
                  >
                    <View style={styles.listOptionInfo}>
                      <Text style={[styles.listOptionMain, isSelected ? styles.optionTextSelected : null]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.listOptionSub}>{opt.sub}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected ? styles.radioCircleSelected : null,
                      ]}
                    >
                      {isSelected ? <View style={styles.radioInnerDot} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* ==================================================== */}
          {/* BƯỚC 3: MỤC TIÊU THỜI GIAN RÈN LUYỆN */}
          {/* ==================================================== */}
          {step === 3 ? (
            <View style={styles.optionsList}>
              {TIME_OPTIONS.map((opt) => {
                const isSelected = selectedMinutes === opt.minutes;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.85}
                    onPress={() => {
                      soundService.playPop();
                      setSelectedMinutes(opt.minutes);
                    }}
                    style={[
                      styles.timeOptionCard,
                      isSelected ? styles.timeOptionCardSelected : null,
                    ]}
                  >
                    <View style={styles.timeBadgeRow}>
                      <Text style={[styles.timeMainText, isSelected ? styles.optionTextSelected : null]}>
                        {opt.label}
                      </Text>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText}>{opt.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.timeDescText}>{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* ==================================================== */}
          {/* BƯỚC 4: XIN QUYỀN THÔNG BÁO CỨU HỘ */}
          {/* ==================================================== */}
          {step === 4 ? (
            <View style={styles.notifPromptBox}>
              <View style={styles.notifIconCircle}>
                <Bell size={40} color="#FFE66D" />
              </View>
              <Text style={styles.notifTitle}>Học cùng cha mẹ</Text>
              <Text style={styles.notifSub}>
                Bản thử nghiệm nội bộ. Nội dung đang chờ thẩm định trước khi mở cho cộng đồng.
              </Text>

              <View style={styles.notifActionsCol}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.enableNotifBtn}
                  onPress={() => handleCompleteOnboarding(true)}
                >
                  <Bell size={18} color="#071936" />
                  <Text style={styles.enableNotifBtnText}>VÀO BẢN THỬ NGHIỆM</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.skipNotifBtn}
                  onPress={() => handleCompleteOnboarding(false)}
                >
                  <Text style={styles.skipNotifBtnText}>TIẾP TỤC KHÔNG THÔNG BÁO</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* Thanh Điều Hướng Dưới (Bước 1 - 3) */}
      {step < 4 ? (
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.continueBtn}
            onPress={handleNextStep}
          >
            <Text style={styles.continueBtnText}>TIẾP TỤC BƯỚC {step + 1}</Text>
            <ArrowRight size={20} color="#071936" />
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071936',
    width: '100%',
    height: '100%',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0A1E3F',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1E3A8A',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 380,
    alignSelf: 'center',
    width: '100%',
  },
  stepIndicatorCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepDotActive: {
    backgroundColor: '#00F0FF',
    borderColor: '#38BDF8',
  },
  stepDotDone: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  stepDotPending: {
    backgroundColor: '#0F2C59',
    borderColor: '#1E3A8A',
  },
  stepDotText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '900',
  },
  stepDotTextActive: {
    color: '#071936',
    fontWeight: '900',
  },
  stepLine: {
    width: (SCREEN_WIDTH > 450 ? 380 : SCREEN_WIDTH - 80) / 4.8,
    height: 3,
    backgroundColor: '#1E3A8A',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  stepLineDone: {
    backgroundColor: '#10B981',
  },
  mainScrollView: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  scrollContent: {
    padding: 18,
    alignItems: 'center',
    paddingBottom: 40,
  },
  mascotHolder: {
    marginTop: 8,
    marginBottom: 12,
  },
  miloBubbleCard: {
    width: '100%',
    backgroundColor: '#0F2C59',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#38BDF8',
    marginBottom: 18,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bubbleTag: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  speakerBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubblePromptText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  interactiveArea: {
    width: '100%',
  },
  optionsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  chunkyOptionCard: {
    width: '48%',
    backgroundColor: '#0A1E3F',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#1E3A8A',
  },
  chunkyOptionCardSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#00F0FF',
    borderBottomColor: '#0369A1',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  optionMainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionSubText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  optionsList: {
    gap: 10,
  },
  listOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A1E3F',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
  },
  listOptionCardSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#00F0FF',
    borderBottomColor: '#0369A1',
  },
  listOptionInfo: {
    flex: 1,
  },
  listOptionMain: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  listOptionSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioCircleSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#071936',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00F0FF',
  },
  timeOptionCard: {
    backgroundColor: '#0A1E3F',
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
  },
  timeOptionCardSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#00F0FF',
    borderBottomColor: '#0369A1',
  },
  timeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeMainText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE66D',
  },
  badgePillText: {
    color: '#FFE66D',
    fontSize: 10,
    fontWeight: '900',
  },
  timeDescText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  notifPromptBox: {
    alignItems: 'center',
    backgroundColor: '#0F2C59',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#1E3A8A',
  },
  notifIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 230, 109, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE66D',
    marginBottom: 14,
  },
  notifTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  notifSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  notifActionsCol: {
    width: '100%',
    gap: 10,
  },
  enableNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE66D',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#D97706',
    gap: 8,
  },
  enableNotifBtnText: {
    color: '#071936',
    fontSize: 14,
    fontWeight: '900',
  },
  skipNotifBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  skipNotifBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomNavContainer: {
    padding: 16,
    backgroundColor: '#0A1E3F',
    borderTopWidth: 2,
    borderTopColor: '#1E3A8A',
    alignItems: 'center',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#0284C7',
    gap: 8,
  },
  continueBtnText: {
    color: '#071936',
    fontSize: 14,
    fontWeight: '900',
  },
});
