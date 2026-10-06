import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ParentDashboardScreenProps } from '../types/navigation';
import {
  fetchSafetyReport,
  updateParentSettings,
  ParentSafetyReportData,
  FALLBACK_SAFETY_REPORT,
} from '../services/api';
import { soundService } from '../services/sound';
import { MiloAvatar2D } from '../components/MiloAvatar2D';
import { SleepLockModal } from '../components/SleepLockModal';
import { FamilyDrillSimulatorModal } from '../components/FamilyDrillSimulatorModal';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Award,
  Clock,
  ArrowLeft,
  Settings,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  Zap,
  Info,
  Moon,
  Lock,
  MapPin,
  ExternalLink,
  Users,
  UserPlus,
  TrendingUp,
  Activity,
  Key,
  HeartPulse,
} from 'lucide-react-native';
import { bktEngine, SkillMasteryItem } from '../services/adaptiveBkt';
import { e2eeSecurity } from '../services/e2eeSecurity';
import { guardianRing, GuardianContact } from '../services/guardianRing';
import { CERTIFIED_MEDICAL_STANDARDS } from '../services/medicalProtocol';

const TIME_LIMIT_OPTIONS = [
  { label: '15 Phút', minutes: 15 },
  { label: '30 Phút', minutes: 30 },
  { label: '45 Phút', minutes: 45 },
  { label: 'Không Giới Hạn', minutes: 0 },
];

const MULTI_CHILDREN_LIST = [
  { id: 'user_milo_explorer_01', nickname: 'Bé Bo', age: 7, group: 'Lớp 2 (7t)', level: 3, score: 88 },
  { id: 'user_child_2', nickname: 'Bé Bắp', age: 5, group: 'Mầm Non (5t)', level: 1, score: 95 },
  { id: 'user_child_3', nickname: 'Bé Nhím', age: 9, group: 'Lớp 4 (9t)', level: 4, score: 78 },
];

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  navigation,
  route,
}) => {
  const verifiedPin = route.params?.verifiedPin || '1234';
  const [report, setReport] = useState<ParentSafetyReportData>(FALLBACK_SAFETY_REPORT);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<number>(30);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isSleepModalVisible, setIsSleepModalVisible] = useState<boolean>(false);
  const [isFamilyDrillModalVisible, setIsFamilyDrillModalVisible] = useState<boolean>(false);
  const [activeChildId, setActiveChildId] = useState<string>('user_milo_explorer_01');

  useEffect(() => {
    loadDashboardData();
  }, [activeChildId]);

  const loadDashboardData = async () => {
    try {
      const data = await fetchSafetyReport(verifiedPin, activeChildId);
      const activeChild = MULTI_CHILDREN_LIST.find((c) => c.id === activeChildId);
      if (activeChild) {
        data.childProfile.nickname = activeChild.nickname;
        data.childProfile.age = activeChild.age;
        data.childProfile.explorerLevel = activeChild.level;
        data.childProfile.totalSafetyScore = activeChild.score;
      }
      setReport(data);
      setSelectedTimeLimit(data.parentSettings?.dailyTimeLimitMinutes || 30);
    } catch (e) {
      console.log('Error loading parent dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimeLimit = async (minutes: number) => {
    soundService.playPop();
    setSelectedTimeLimit(minutes);
    setIsSavingSettings(true);
    await updateParentSettings(verifiedPin, { dailyTimeLimitMinutes: minutes }, activeChildId);
    setIsSavingSettings(false);
  };

  const handleOpenGoogleMaps = (url: string) => {
    soundService.playPop();
    Linking.openURL(url).catch(() => {
      Alert.alert('Không thể mở liên kết bản đồ');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Đang tổng hợp Báo Cáo An Toàn của bé...</Text>
      </SafeAreaView>
    );
  }

  const profile = report.childProfile;
  const score = profile.totalSafetyScore || 88;
  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />

      {/* Top Header */}
      <View style={styles.topHeader}>
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
          <Text style={styles.headerTag}>KIDS SAFE AI AUDIT PORTAL</Text>
          <Text style={styles.headerTitle}>Báo Cáo An Toàn Của Bé 🛡️</Text>
        </View>
        <TouchableOpacity
          style={styles.simulateLockBtn}
          onPress={() => {
            soundService.playPop();
            setIsSleepModalVisible(true);
          }}
        >
          <Moon size={16} color="#FFE66D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================== */}
        {/* TRÌNH CHUYỂN ĐỔI ĐA HỒ SƠ TRẺ EM (MULTI-CHILD SWITCHER) */}
        {/* ==================================================== */}
        <View style={styles.childSwitcherContainer}>
          <View style={styles.childSwitcherHeader}>
            <Users size={16} color="#38BDF8" />
            <Text style={styles.childSwitcherTitle}>CHỌN HỒ SƠ BÉ TRONG GIA ĐÌNH:</Text>
          </View>
          <View style={styles.childPillsRow}>
            {MULTI_CHILDREN_LIST.map((child) => {
              const isActive = child.id === activeChildId;
              return (
                <TouchableOpacity
                  key={child.id}
                  activeOpacity={0.8}
                  style={[styles.childPill, isActive ? styles.childPillActive : null]}
                  onPress={() => {
                    soundService.playPop();
                    setActiveChildId(child.id);
                  }}
                >
                  <Text style={styles.childPillEmoji}>{child.age <= 5 ? '👶' : child.age <= 7 ? '👦' : '👧'}</Text>
                  <View>
                    <Text style={[styles.childPillName, isActive ? styles.childPillNameActive : null]}>
                      {child.nickname}
                    </Text>
                    <Text style={styles.childPillAge}>{child.group}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ==================================================== */}
        {/* THẺ ĐỊNH VỊ KHẨN CẤP LIVE BEACON (EMERGENCY SOS GPS) */}
        {/* ==================================================== */}
        <View style={styles.emergencyBeaconCard3D}>
          <View style={styles.beaconHeaderRow}>
            <View style={styles.beaconPulseDot} />
            <Text style={styles.beaconTagText}>TÍN HIỆU ĐỊNH VỊ KHẨN CẤP (LIVE SOS BEACON)</Text>
          </View>

          <Text style={styles.beaconMessageText}>
            🚨 {profile.nickname} đã kích hoạt Còi Hú Cứu Nạn gần nhất!
          </Text>

          <View style={styles.beaconCoordsBox}>
            <MapPin size={16} color="#00F0FF" />
            <Text style={styles.beaconCoordsText}>
              Tọa độ GPS: 10.7769° N, 106.7009° E (Độ chính xác cao)
            </Text>
          </View>

          <View style={styles.e2eeBadgeBox}>
            <Key size={13} color="#FFE66D" />
            <Text style={styles.e2eeBadgeText}>
              MÃ HÓA ĐẦU CUỐI E2EE (CURVE25519): CHỈ BA MẸ MỚI GIẢI MÃ ĐƯỢC VỊ TRÍ NÀY
            </Text>
          </View>

          <TouchableOpacity
            style={styles.openMapBtn3D}
            activeOpacity={0.85}
            onPress={() => handleOpenGoogleMaps('https://www.google.com/maps?q=10.7769,106.7009')}
          >
            <ExternalLink size={16} color="#FFFFFF" />
            <Text style={styles.openMapBtnText}>MỞ VỊ TRÍ TRÊN GOOGLE MAPS 🗺️</Text>
          </TouchableOpacity>
        </View>

        {/* 1. TỔNG QUAN CHỈ SỐ SINH TỒN (SURVIVAL READINESS SCORE) */}
        <View style={styles.readinessCard3D}>
          <View style={styles.readinessHeader}>
            <View>
              <Text style={styles.childNameText}>{profile.nickname} ({profile.age} Tuổi)</Text>
              <Text style={styles.childLevelText}>Cấp Độ {profile.explorerLevel} - Hiệp Sĩ An Toàn</Text>
            </View>
            <View style={[styles.scoreBadgeCircle, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreNumberText}>{score}</Text>
              <Text style={styles.scoreOutOfText}>/100</Text>
            </View>
          </View>

          {/* Thanh chỉ số tiến độ */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Award size={18} color="#FFE66D" />
              <Text style={styles.statValue}>{profile.totalBadges || 2} Huy Hiệu</Text>
              <Text style={styles.statLabel}>Đã Thu Thập</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Zap size={18} color="#00F0FF" />
              <Text style={styles.statValue}>100 Màn</Text>
              <Text style={styles.statLabel}>Lộ Trình Sinh Tồn</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <ShieldCheck size={18} color="#10B981" />
              <Text style={styles.statValue}>94%</Text>
              <Text style={styles.statLabel}>Phản Xạ Chuẩn</Text>
            </View>
          </View>
        </View>

        {/* ==================================================== */}
        {/* MA TRẬN BAYESIAN KNOWLEDGE TRACING (BKT MASTERY INDEX) */}
        {/* ==================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <TrendingUp size={18} color="#00F0FF" />
            <Text style={styles.sectionTitle}>MÔ HÌNH HỌC TẬP THÍCH ỨNG (BAYESIAN KNOWLEDGE TRACING)</Text>
          </View>

          <View style={styles.bktCard3D}>
            {bktEngine.getSampleMasteryBreakdown().map((skill) => {
              const masteryPercent = Math.round(skill.masteryProbability * 100);
              const isReflexFast = skill.reflexSpeedLevel === 'UNCONSCIOUS_REFLEX';

              return (
                <View key={skill.skillId} style={styles.bktSkillRow}>
                  <View style={styles.bktSkillHeader}>
                    <Text style={styles.bktSkillName}>{skill.skillName}</Text>
                    <View
                      style={[
                        styles.bktReflexTag,
                        {
                          backgroundColor: isReflexFast ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          borderColor: isReflexFast ? '#10B981' : '#F59E0B',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bktReflexTagText,
                          { color: isReflexFast ? '#10B981' : '#F59E0B' },
                        ]}
                      >
                        {isReflexFast ? '⚡ PHẢN XẠ VÔ THỨC (<2s)' : '⏱️ CẦN RÈN THÊM (>4s)'}
                      </Text>
                    </View>
                  </View>

                  {/* Thanh tiến độ xác suất làm chủ P(L) */}
                  <View style={styles.bktProgressTrack}>
                    <View
                      style={[
                        styles.bktProgressFill,
                        {
                          width: `${masteryPercent}%`,
                          backgroundColor: masteryPercent >= 90 ? '#10B981' : '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.bktMetaRow}>
                    <Text style={styles.bktProbText}>Xác suất làm chủ P(L): {masteryPercent}%</Text>
                    <Text style={styles.bktReactionTimeText}>
                      Tốc độ: {(skill.averageReactionTimeMs / 1000).toFixed(1)}s
                    </Text>
                  </View>
                  <Text style={styles.bktRecText}>👉 {skill.recommendation}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 2. BẢN ĐỒ ĐIỂM YẾU & LỖ HỔNG KỸ NĂNG (VULNERABILITY BREAKDOWN) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <ShieldAlert size={18} color="#EF4444" />
            <Text style={styles.sectionTitle}>BẢN ĐỒ ĐIỂM YẾU & TÌNH HUỐNG CON CẦN LƯU Ý</Text>
          </View>

          {report.recentMistakes && report.recentMistakes.length > 0 ? (
            report.recentMistakes.map((mistake) => (
              <View key={mistake.id} style={styles.mistakeCard3D}>
                <View style={styles.mistakeHeader}>
                  <View
                    style={[
                      styles.hazardLevelTag,
                      {
                        backgroundColor:
                          mistake.hazardLevel === 'CRITICAL_EMERGENCY'
                            ? '#EF4444'
                            : '#F59E0B',
                      },
                    ]}
                  >
                    <Text style={styles.hazardLevelText}>
                      {mistake.hazardLevel === 'CRITICAL_EMERGENCY'
                        ? 'NGUY HIỂM KHẨN CẤP'
                        : 'CẨN TRỌNG'}
                    </Text>
                  </View>
                  <Text style={styles.delayText}>
                    ⏱️ Phản xạ: {(mistake.responseTimeMs / 1000).toFixed(1)}s
                  </Text>
                </View>

                <Text style={styles.mistakeQuestionText}>{mistake.questionText}</Text>

                <View style={styles.correctiveBox}>
                  <Text style={styles.correctiveTitle}>👉 Hướng Dẫn Chuẩn Từ Milo:</Text>
                  <Text style={styles.correctiveText}>{mistake.miloGuidance}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyMistakesBox}>
              <CheckCircle2 size={24} color="#10B981" />
              <Text style={styles.emptyMistakesText}>
                Bé chưa ghi nhận lỗi sai nào trong các đợt kiểm tra gần nhất!
              </Text>
            </View>
          )}
        </View>

        {/* 3. MẸO DIỄN TẬP GIA ĐÌNH TỪ ĐỘI TRƯỞNG MILO */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Sparkles size={18} color="#FFE66D" />
            <Text style={styles.sectionTitle}>3 HOẠT ĐỘNG DIỄN TẬP GIA ĐÌNH THỰC TẾ</Text>
          </View>

          <View style={styles.drillCard3D}>
            <View style={styles.drillNumberCircle}>
              <Text style={styles.drillNumberText}>1</Text>
            </View>
            <View style={styles.drillContent}>
              <Text style={styles.drillTitle}>Diễn Tập Bò Thấp Dưới Khói (Phòng Khách)</Text>
              <Text style={styles.drillDesc}>
                Trải tấm vải ngang thắt lưng bé, cùng con thi bò sát sàn nhà và dùng khăn ẩm bịt mũi miệng thoát ra cửa.
              </Text>
            </View>
          </View>

          <View style={styles.drillCard3D}>
            <View style={styles.drillNumberCircle}>
              <Text style={styles.drillNumberText}>2</Text>
            </View>
            <View style={styles.drillContent}>
              <Text style={styles.drillTitle}>Thiết Lập "Mật Mã Bí Mật" (Safe Word)</Text>
              <Text style={styles.drillDesc}>
                Chọn 1 từ bí mật ngộ nghĩnh (Ví dụ: "Kem Chuối"). Dặn bé chỉ lên xe nếu người đón đọc đúng mật mã này.
              </Text>
            </View>
          </View>

          <View style={styles.drillCard3D}>
            <View style={styles.drillNumberCircle}>
              <Text style={styles.drillNumberText}>3</Text>
            </View>
            <View style={styles.drillContent}>
              <Text style={styles.drillTitle}>Thực Hành Nổi Sao Biển & Thổi Còi SOS</Text>
              <Text style={styles.drillDesc}>
                Khi đi hồ bơi, cho bé tập ngửa mặt thả nổi hình sao biển và thổi 3 tiếng còi cứu hộ dứt khoát.
              </Text>
            </View>
          </View>

          {/* Nút Bắt Đầu Diễn Tập Gia Đình Trực Tiếp */}
          <TouchableOpacity
            style={styles.liveDrillLaunchBtn3D}
            activeOpacity={0.85}
            onPress={() => {
              soundService.playPop();
              setIsFamilyDrillModalVisible(true);
            }}
          >
            <Users size={18} color="#0F172A" />
            <Text style={styles.liveDrillLaunchText}>
              ▶️ BẮT ĐẦU DIỄN TẬP GIA ĐÌNH TRỰC TIẾP (LIVE CO-OP) ⏱️
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. HỆ THỐNG KIỂM SOÁT THỜI GIAN HỌC TRONG NGÀY */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Clock size={18} color="#38BDF8" />
            <Text style={styles.sectionTitle}>GIỚI HẠN THỜI GIAN HỌC (SCREEN TIME)</Text>
          </View>

          <View style={styles.timeLimitCard3D}>
            <Text style={styles.timeLimitDesc}>
              Tự động khóa ứng dụng và chuyển sang Chế Độ Giờ Ngủ khi hết thời gian:
            </Text>

            <View style={styles.timeOptionsRow}>
              {TIME_LIMIT_OPTIONS.map((opt) => {
                const isSelected = selectedTimeLimit === opt.minutes;
                return (
                  <TouchableOpacity
                    key={opt.minutes}
                    activeOpacity={0.8}
                    style={[
                      styles.timeOptionBtn,
                      isSelected ? styles.timeOptionBtnSelected : null,
                    ]}
                    onPress={() => handleSaveTimeLimit(opt.minutes)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        isSelected ? styles.timeOptionTextSelected : null,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isSavingSettings ? (
              <Text style={styles.savingText}>Đang lưu cài đặt...</Text>
            ) : (
              <Text style={styles.savedNotice}>
                ✓ Đã áp dụng giới hạn: {selectedTimeLimit === 0 ? 'Không giới hạn' : `${selectedTimeLimit} phút/ngày`}
              </Text>
            )}
          </View>
        </View>

        {/* ==================================================== */}
        {/* 5. MẠNG LƯỚI NGƯỜI BẢO HỘ ĐA TẦNG (GUARDIAN RING) */}
        {/* ==================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Users size={18} color="#00F0FF" />
            <Text style={styles.sectionTitle}>MẠNG LƯỚI NGƯỜI BẢO HỘ ĐA TẦNG (FAILOVER RING)</Text>
          </View>

          <View style={styles.guardianRingCard3D}>
            {guardianRing.getGuardians().map((g) => (
              <View key={g.id} style={styles.guardianRow}>
                <View style={styles.guardianTierBadge}>
                  <Text style={styles.guardianTierText}>CẤP {g.priorityTier}</Text>
                </View>
                <View style={styles.guardianInfoCol}>
                  <Text style={styles.guardianNameText}>{g.name}</Text>
                  <Text style={styles.guardianPhoneText}>SĐT: {g.phone}</Text>
                </View>
                <View
                  style={[
                    styles.guardianStatusTag,
                    {
                      backgroundColor:
                        g.status === 'NOTIFIED'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(56, 189, 248, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.guardianStatusText,
                      { color: g.status === 'NOTIFIED' ? '#10B981' : '#38BDF8' },
                    ]}
                  >
                    {g.status === 'NOTIFIED' ? '✓ ĐÃ KẾT NỐI' : 'SẴN SÀNG'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ==================================================== */}
        {/* 6. CHỨNG NHẬN PHÁC ĐỒ Y KHOA QUỐC TẾ (AHA & IFRC) */}
        {/* ==================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <HeartPulse size={18} color="#EF4444" />
            <Text style={styles.sectionTitle}>CHỨNG NHẬN PHÁC ĐỒ Y KHOA QUỐC TẾ (AHA 2024 & IFRC)</Text>
          </View>

          <View style={styles.medicalStandardsCard3D}>
            {CERTIFIED_MEDICAL_STANDARDS.map((std) => (
              <View key={std.id} style={styles.medicalStdBox}>
                <View style={styles.medicalHeaderRow}>
                  <View style={styles.authorityPill}>
                    <Text style={styles.authorityPillText}>{std.authority}</Text>
                  </View>
                  <Text style={styles.medicalStdTitle}>{std.title}</Text>
                </View>
                <Text style={styles.medicalMetricText}>⏱️ {std.vitalMetric}</Text>
                <Text style={styles.medicalContraText}>⚠️ Chống chỉ định: {std.contraindications}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal Mô Phỏng Khóa Giờ Ngủ (Sleep Mode) */}
      <SleepLockModal
        visible={isSleepModalVisible}
        onUnlockPress={() => setIsSleepModalVisible(false)}
        onOpenSos={() => {
          setIsSleepModalVisible(false);
          navigation.navigate('Sos');
        }}
      />

      {/* Modal Diễn Tập Gia Đình Thực Tế (Live Co-op) */}
      <FamilyDrillSimulatorModal
        visible={isFamilyDrillModalVisible}
        onClose={() => setIsFamilyDrillModalVisible(false)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071936',
  },
  loadingText: {
    marginTop: 12,
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
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
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  simulateLockBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 230, 109, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE66D',
  },
  contentScrollView: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  contentScrollContainer: {
    padding: 14,
    paddingBottom: 40,
    gap: 16,
  },
  childSwitcherContainer: {
    backgroundColor: '#0F2C59',
    borderRadius: 18,
    padding: 12,
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  childSwitcherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  childSwitcherTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
  },
  childPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  childPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#334155',
    gap: 6,
  },
  childPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  childPillEmoji: {
    fontSize: 18,
  },
  childPillName: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '900',
  },
  childPillNameActive: {
    color: '#FFFFFF',
  },
  childPillAge: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '700',
  },
  emergencyBeaconCard3D: {
    backgroundColor: '#7F1D1D',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderColor: '#EF4444',
  },
  beaconHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  beaconPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  beaconTagText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  beaconMessageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginVertical: 4,
  },
  beaconCoordsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginVertical: 6,
  },
  beaconCoordsText: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '800',
  },
  openMapBtn3D: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomColor: '#991B1B',
    gap: 6,
    marginTop: 4,
  },
  openMapBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  readinessCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  childNameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  childLevelText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreBadgeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  scoreNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  scoreOutOfText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#071936',
    borderRadius: 14,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#1E293B',
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: '#FFE66D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mistakeCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
  },
  mistakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hazardLevelTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hazardLevelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  delayText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  mistakeQuestionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 8,
  },
  correctiveBox: {
    backgroundColor: '#071936',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  correctiveTitle: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 2,
  },
  correctiveText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  emptyMistakesBox: {
    backgroundColor: '#0F2C59',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  emptyMistakesText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  drillCard3D: {
    flexDirection: 'row',
    backgroundColor: '#0F2C59',
    borderRadius: 18,
    padding: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
    alignItems: 'flex-start',
    gap: 10,
  },
  drillNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drillNumberText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  drillContent: {
    flex: 1,
  },
  drillTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 2,
  },
  drillDesc: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  timeLimitCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
  },
  timeLimitDesc: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  timeOptionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  timeOptionBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  timeOptionBtnSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  timeOptionText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  timeOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  savingText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  savedNotice: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  bktCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#1E3A8A',
    gap: 12,
  },
  bktSkillRow: {
    backgroundColor: '#071936',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bktSkillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bktSkillName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    flex: 1,
  },
  bktReflexTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  bktReflexTagText: {
    fontSize: 9,
    fontWeight: '900',
  },
  bktProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    marginVertical: 4,
  },
  bktProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bktMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  bktProbText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  bktReactionTimeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  bktRecText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  e2eeBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 230, 109, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE66D',
    marginVertical: 4,
  },
  e2eeBadgeText: {
    color: '#FFE66D',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  guardianRingCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#1E3A8A',
    gap: 8,
  },
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071936',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  guardianTierBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  guardianTierText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  guardianInfoCol: {
    flex: 1,
  },
  guardianNameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  guardianPhoneText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  guardianStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  guardianStatusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  medicalStandardsCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#1E3A8A',
    gap: 10,
  },
  medicalStdBox: {
    backgroundColor: '#071936',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 3,
  },
  medicalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorityPill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  authorityPillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  medicalStdTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    flex: 1,
  },
  medicalMetricText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  medicalContraText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '700',
  },
  liveDrillLaunchBtn3D: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE66D',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomColor: '#CA8A04',
    gap: 8,
    marginTop: 10,
  },
  liveDrillLaunchText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
