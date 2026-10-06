import { RELEASE } from '../config/release';
import { syncPending } from '../services/attemptQueue';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  useWindowDimensions,
  Modal,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Ellipse,
} from 'react-native-svg';
import { COLORS } from '../theme/colors';
import { WorldMapScreenProps } from '../types/navigation';
import { JourneyMapData, ZoneSummary, StageSummary } from '../types/curriculum';
import { fetchJourneyMap, CURRENT_USER_ID } from '../services/api';
import { TopHeader } from '../components/TopHeader';
import { MiloAvatar2D } from '../components/MiloAvatar2D';
import { BiomeBackground } from '../components/BiomeBackground';
import { CartoonIslandStageNode } from '../components/CartoonIslandStageNode';
import {
  SecretCaveEntrance,
  CoinArcTrail,
  WoodenLadder,
  CampfireEmbers,
  MagicMushroomGroup,
  PurpleGemChest,
  WoodenFence,
} from '../components/BiomeDecorations';
import { BottomNavBar, MeasuredTabLayouts } from '../components/BottomNavBar';
import { TreasureChest3D } from '../components/TreasureChest3D';
import { LanguageSwitcherModal } from '../components/LanguageSwitcherModal';
import { DailyDrillModal } from '../components/DailyDrillModal';
import { SpotlightTourGuide } from '../components/SpotlightTourGuide';
import { streakService } from '../services/streakService';
import { i18n } from '../services/i18n';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import {
  Lock,
  Star,
  Flag,
  Zap,
  Crown,
  Play,
  Volume2,
  Globe,
  Sparkles,
  Flame,
  X,
  Award,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CANVAS_HEIGHT = 2200; // Chiều cao cuộn thoáng đãng 2200px

// MA TRẬN DỮ LIỆU LỜI THOẠI 10 VÙNG ĐẤT (ZONE_SURVIVAL_TIPS)
const ZONE_SURVIVAL_TIPS: Record<number, string> = {
  1: 'Lạc trong rừng: Đứng yên ôm cây to gần nhất (Hug-a-Tree) và thổi còi 3 tiếng ngắt quãng nhé!',
  2: "Gặp người lạ kéo đi: Hét lớn 'CHÁU KHÔNG QUEN NGƯỜI NÀY!' và chạy đến chú bảo vệ/thu ngân!",
  3: 'Phòng ngập khói: Bò thật thấp sát sàn nhà và dùng mu bàn tay kiểm tra độ nóng cánh cửa!',
  4: 'Bị bỏng nước sôi: Xả ngay dưới vòi nước mát chảy nhẹ 15-20 phút liên tục, không bôi kem đánh răng!',
  5: 'Động đất rung chuyển: Nằm xuống, chui dưới gầm bàn kiên cố và giữ chặt (Drop - Cover - Hold On)!',
  6: 'Đuối sức dưới nước: Thả lỏng toàn thân và nổi ngửa hình sao biển để bảo toàn sức nhé!',
  7: 'Kẹt trên xe bus: Trèo lên ghế lái bấm còi vô lăng liên tục và bật nút đèn tam giác khẩn cấp!',
  8: 'Đám đông chen lấn: Giơ hai tay thủ trước ngực (Boxer Stance) để giữ không gian thở, không cúi nhặt đồ!',
  9: 'Trên mạng xã hội: Tuyệt đối không gửi ảnh mặt, địa chỉ nhà, tên trường hay mật khẩu cho bất kỳ ai!',
  10: 'Cần cứu viện khẩn cấp: Nhớ 4 số vàng 111 (Trẻ em), 113 (Công an), 114 (Cứu hỏa), 115 (Cấp cứu)!',
};

// Cấu hình bảng màu & phong cách 10 Quần Xã
const BIOME_THEMES: Record<
  number,
  {
    bgColor: string;
    roadColor: string;
    roadShadow: string;
    roadDash: string;
    accent: string;
    titleBg: string;
    bannerEmoji: string;
    shortName: string;
  }
> = {
  1: {
    bgColor: '#38BDF8',
    roadColor: '#FEF08A',
    roadShadow: '#15803D',
    roadDash: '#FFE66D',
    accent: '#15803D',
    titleBg: '#22C55E',
    bannerEmoji: '🌲',
    shortName: 'Rừng Xanh',
  },
  2: {
    bgColor: '#6366F1',
    roadColor: '#E2E8F0',
    roadShadow: '#1E1B4B',
    roadDash: '#FACC15',
    accent: '#4338CA',
    titleBg: '#4F46E5',
    bannerEmoji: '🏙️',
    shortName: 'Thành Phố',
  },
  3: {
    bgColor: '#F59E0B',
    roadColor: '#FAEDCD',
    roadShadow: '#78350F',
    roadDash: '#E76F51',
    accent: '#B45309',
    titleBg: '#D97706',
    bannerEmoji: '🏠',
    shortName: 'Tại Gia',
  },
  4: {
    bgColor: '#0284C7',
    roadColor: '#E0F2FE',
    roadShadow: '#075985',
    roadDash: '#EF4444',
    accent: '#0369A1',
    titleBg: '#0284C7',
    bannerEmoji: '🩺',
    shortName: 'Trạm Y Tế',
  },
  5: {
    bgColor: '#7C3AED',
    roadColor: '#EDE9FE',
    roadShadow: '#4C1D95',
    roadDash: '#FACC15',
    accent: '#6D28D9',
    titleBg: '#7C3AED',
    bannerEmoji: '🌋',
    shortName: 'Thiên Tai',
  },
  6: {
    bgColor: '#00B4D8',
    roadColor: '#CAF0F8',
    roadShadow: '#0077B6',
    roadDash: '#023E8A',
    accent: '#0077B6',
    titleBg: '#0096C7',
    bannerEmoji: '🌊',
    shortName: 'Nước Sâu',
  },
  7: {
    bgColor: '#EA580C',
    roadColor: '#FEF08A',
    roadShadow: '#9A3412',
    roadDash: '#9A031E',
    accent: '#C2410C',
    titleBg: '#EA580C',
    bannerEmoji: '🚌',
    shortName: 'Trường Học',
  },
  8: {
    bgColor: '#DB2777',
    roadColor: '#FCE7F3',
    roadShadow: '#9D174D',
    roadDash: '#10B981',
    accent: '#BE185D',
    titleBg: '#DB2777',
    bannerEmoji: '🏬',
    shortName: 'Công Cộng',
  },
  9: {
    bgColor: '#0F172A',
    roadColor: '#1E293B',
    roadShadow: '#020617',
    roadDash: '#00F0FF',
    accent: '#0077B6',
    titleBg: '#1E293B',
    bannerEmoji: '💻',
    shortName: 'Cyber Mạng',
  },
  10: {
    bgColor: '#1E293B',
    roadColor: '#E2E8F0',
    roadShadow: '#0F172A',
    roadDash: '#FFE66D',
    accent: '#0F172A',
    titleBg: '#334155',
    bannerEmoji: '🚨',
    shortName: 'Tổng Hành Dinh',
  },
};

// TỌA ĐỘ CHUẨN XÁC 10 ẢI (Ải 1 bắt đầu tại y: 150 để Milo có không gian hiển thị trọn vẹn)
const STAGE_COORDS = [
  { xPercent: 50, y: 150 },  // Ải 1 (Đỉnh bản đồ, Milo không bao giờ bị cắt)
  { xPercent: 75, y: 350 },  // Ải 2 (Phải)
  { xPercent: 25, y: 550 },  // Ải 3 (Trái)
  { xPercent: 75, y: 750 },  // Ải 4 (Phải)
  { xPercent: 25, y: 950 },  // Ải 5 (Trái - Cạnh Rương Kho Báu)
  { xPercent: 75, y: 1150 }, // Ải 6 (Phải)
  { xPercent: 25, y: 1350 }, // Ải 7 (Trái)
  { xPercent: 75, y: 1550 }, // Ải 8 (Phải)
  { xPercent: 25, y: 1750 }, // Ải 9 (Trái)
  { xPercent: 50, y: 1980 }, // Ải 10 (Boss Checkpoint Giữa)
];

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({ route, navigation }) => {
  const MAP_WIDTH = Math.min(useWindowDimensions().width, 480);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<JourneyMapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedZoneNumber, setSelectedZoneNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'map' | 'ai' | 'badges' | 'parent'>('map');

  // Modal thông tin ải (Stage Info Sheet)
  const [previewStage, setPreviewStage] = useState<StageSummary | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isLangModalVisible, setIsLangModalVisible] = useState<boolean>(false);
  const [isDailyDrillVisible, setIsDailyDrillVisible] = useState<boolean>(false);
  const [isTourGuideVisible, setIsTourGuideVisible] = useState<boolean>(false);
  const [fixedHeaderHeight, setFixedHeaderHeight] = useState<number>(230);
  const [stage1Layout, setStage1Layout] = useState<{ x: number; y: number; width: number; height: number } | undefined>(undefined);
  const [zoneBarLayout, setZoneBarLayout] = useState<{ x: number; y: number; width: number; height: number } | undefined>(undefined);
  const [tabLayouts, setTabLayouts] = useState<MeasuredTabLayouts | undefined>(undefined);
  const [currentLangCode, setCurrentLangCode] = useState<string>(i18n.getLanguage());
  const [streakData, setStreakData] = useState(streakService.getStreakData());

  // Animations: Radar Pulsing Ripples (3 tầng sóng lan tỏa) & Milo Bobbing
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const bobbingAnim = useRef(new Animated.Value(0)).current;
  const arrowBounce = useRef(new Animated.Value(0)).current;
  const mapScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (RELEASE.tour && route?.params?.showTour) {
      setIsTourGuideVisible(true);
      setTimeout(() => {
        mapScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
    }
  }, [route?.params?.showTour]);

  useEffect(() => {
    if (isTourGuideVisible) {
      setTimeout(() => {
        mapScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
    }
  }, [isTourGuideVisible]);

  useEffect(() => {
    const focusUnsub = navigation.addListener('focus', loadData);
    loadData();
    const unsub = i18n.subscribe((newLang) => {
      setCurrentLangCode(newLang);
    });

    // Radar Ripple Wave Animation
    const createRippleAnim = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    createRippleAnim(ripple1, 0).start();
    createRippleAnim(ripple2, 600).start();
    createRippleAnim(ripple3, 1200).start();

    // Milo nhún nhảy theo nhịp thở
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobbingAnim, { toValue: -8, duration: 550, useNativeDriver: true }),
        Animated.timing(bobbingAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]),
    ).start();

    // Mũi tên chỉ xuống trôi bồng bềnh
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBounce, { toValue: 6, duration: 450, useNativeDriver: true }),
        Animated.timing(arrowBounce, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    ).start();
    return () => { unsub(); focusUnsub(); [ripple1, ripple2, ripple3, bobbingAnim, arrowBounce].forEach(a => a.stopAnimation()); };
  }, []);

  const loadData = async () => {
    try {
      setLoadError(null);
      await syncPending(CURRENT_USER_ID);
      const result = await fetchJourneyMap(CURRENT_USER_ID);
      setData(result);
    } catch (error) {
      setData(null);
      setLoadError('Chưa tải được bài học. Bản nội bộ cần kết nối máy chủ; ứng dụng không thay bằng dữ liệu mẫu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    soundService.playPop();
    loadData();
  };

  const handleSelectZone = (zoneNum: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      soundService.playWarning();
      return;
    }
    soundService.playPop();
    setSelectedZoneNumber(zoneNum);
  };

  const handleStageClick = (stage: StageSummary, isUnlocked: boolean) => {
    if (!isUnlocked) {
      soundService.playWarning();
      return;
    }
    soundService.playPop();
    setPreviewStage(stage);
    setModalVisible(true);
  };

  const handleStartStage = () => {
    if (!previewStage || !activeZone) return;
    const checkpointId = previewStage.lessons[0]?.checkpointIds?.[0];
    if (!checkpointId) { setModalVisible(false); setLoadError('Bài này chưa có mã kiểm tra hợp lệ.'); return; }
    soundService.playPop();
    setModalVisible(false);
    navigation.navigate('QuestTest', {
      checkpointId,
      lessonTitle: previewStage.title,
      zoneTitle: activeZone.title,
      themeColor: activeZone.themeColor,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        <Text style={styles.loadingText}>Đang tải bài học…</Text>
      </SafeAreaView>
    );
  }

  if (loadError || !data || data.zones.length === 0) return <SafeAreaView style={styles.loadingContainer}><Text style={{fontSize: 22, color: '#FFFFFF', padding: 20}}>Milo · Bản thử nghiệm nội bộ</Text><Text style={{fontSize: 17, color: '#FFFFFF', padding: 20, textAlign: 'center'}}>{loadError || 'Chưa có bài học để hiển thị.'}</Text><TouchableOpacity accessibilityRole="button" onPress={() => { setLoading(true); loadData(); }} style={{padding: 20, backgroundColor: '#004E89', borderRadius: 16}}><Text style={{color: '#FFFFFF', fontSize: 17}}>Thử tải lại</Text></TouchableOpacity></SafeAreaView>;

  const activeZone = data?.zones.find((z) => z.zoneNumber === selectedZoneNumber) || data?.zones[0];
  const theme = BIOME_THEMES[selectedZoneNumber] || BIOME_THEMES[1];
  const activeZoneStages = activeZone?.stages || [];

  const currentActiveStageIdx = activeZoneStages.findIndex(
    (s) => s.lessons[0]?.status === 'UNLOCKED' || s.lessons[0]?.status === 'IN_PROGRESS',
  );

  // Đường cong Cubic Bezier nối mượt mà chính xác 100% qua 10 điểm STAGE_COORDS
  const buildSvgCurvePath = () => {
    const p = STAGE_COORDS.map((coord) => ({
      x: (MAP_WIDTH * coord.xPercent) / 100,
      y: coord.y,
    }));

    let path = `M ${p[0].x} ${p[0].y}`;
    for (let i = 0; i < p.length - 1; i++) {
      const curr = p[i];
      const next = p[i + 1];
      const controlY = 80;
      path += ` C ${curr.x} ${curr.y + controlY}, ${next.x} ${next.y - controlY}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const svgPathData = buildSvgCurvePath();

  return (
    <SafeAreaView style={[styles.screenContainer, { backgroundColor: theme.bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />

      {/* ==================================================== */}
      {/* 1. KHU VỰC CỐ ĐỊNH (TĨNH) Ở TRÊN CÙNG */}
      {/* ==================================================== */}
      <View
        style={styles.fixedHeaderArea}
        onLayout={(e) => {
          if (e.nativeEvent.layout.height > 0) {
            setFixedHeaderHeight(e.nativeEvent.layout.height);
          }
        }}
      >
        {/* Top Status Bar: Level, XP, Stars */}
        <TopHeader user={data?.user} />

        {/* Thanh cuộn 10 Vùng đất */}
        <View
          style={styles.compactZoneBar}
          onLayout={(e) => {
            setZoneBarLayout(e.nativeEvent.layout);
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.compactZoneScroll}
          >
            {data?.zones.map((zone) => {
              const zoneTheme = BIOME_THEMES[zone.zoneNumber] || BIOME_THEMES[1];
              const isSelected = zone.zoneNumber === selectedZoneNumber;
              const isUnlocked = zone.isUnlocked;

              const completedCount = zone.stages.filter(
                (s) => s.lessons[0]?.status === 'COMPLETED',
              ).length;
              const percent = Math.round((completedCount / (zone.stages.length || 10)) * 100);

              return (
                <TouchableOpacity
                  key={zone.id}
                  activeOpacity={0.85}
                  onPress={() => handleSelectZone(zone.zoneNumber, isUnlocked)}
                  style={[
                    styles.compactIslandBadge,
                    {
                      backgroundColor: isSelected ? zoneTheme.titleBg : isUnlocked ? '#FFFFFF' : '#E2E8F0',
                      borderColor: isSelected ? '#FFE66D' : isUnlocked ? '#CBD5E1' : '#E2E8F0',
                    },
                    isSelected ? styles.compactIslandBadgeActive : null,
                  ]}
                >
                  <View style={styles.islandMiniCircle}>
                    <Text style={styles.islandEmoji}>{zoneTheme.bannerEmoji}</Text>
                    {!isUnlocked ? (
                      <View style={styles.lockBadgeMini}>
                        <Lock size={9} color="#64748B" />
                      </View>
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.islandNumberText,
                      { color: isSelected ? '#FFE66D' : isUnlocked ? zoneTheme.titleBg : '#94A3B8' },
                    ]}
                  >
                    VÙNG {zone.zoneNumber}
                  </Text>

                  <View style={styles.candyProgressTrack}>
                    <View
                      style={[
                        styles.candyProgressFill,
                        {
                          width: `${percent}%`,
                          backgroundColor: isSelected ? '#FFE66D' : '#10B981',
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* KHUNG THOẠI MILO NẰM CỐ ĐỊNH TẠI ĐÂY - HOÀN TOÀN KHÔNG NẰM TRONG BẢN ĐỒ */}
        <View style={styles.miloTipBanner}>
          <MiloAvatar2D emotion="IDLE" size={52} showSpeechBubble={false} />
          <View style={styles.tipSpeechBubble}>
            <View style={styles.tipBubbleArrow} />
            <View style={styles.tipHeaderRow}>
              <View style={[styles.tipTag, { backgroundColor: theme.titleBg }]}>
                <Text style={styles.tipTagText}>{i18n.t('miloTipTag')}</Text>
              </View>
              <View style={styles.tipActionsRow}>
                <TouchableOpacity
                  onPress={() => {
                    soundService.playPop();
                    setIsDailyDrillVisible(false);
                  }}
                  style={styles.streakPillBtn}
                >
                  <Flame size={14} color="#FF6B35" fill="#FF6B35" />
                  <Text style={styles.streakNumberText}>{streakData.currentStreak}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    soundService.playPop();
                    setIsLangModalVisible(RELEASE.multipleLanguages);
                  }}
                  style={styles.langPillBtn}
                >
                  <Text style={styles.langFlagText}>{i18n.getLanguageMeta().flag}</Text>
                  <Globe size={13} color="#00F0FF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    soundService.playPop();
                    voiceService.speakMilo('Bản thử nghiệm nội bộ. Nội dung đang chờ người có chuyên môn duyệt.', 'THINKING');
                  }}
                  style={styles.speakerBtn}
                >
                  <Volume2 size={15} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.tipText}>Bản nội bộ · Nội dung đang chờ người chuyên môn duyệt. Học cùng cha mẹ.</Text>
          </View>
        </View>
      </View>

      {/* ==================================================== */}
      {/* 2. KHU VỰC BẢN ĐỒ CUỘN ĐỘC LẬP BÊN DƯỚI (ẢI 1 BẮT ĐẦU TẠI Y: 150) */}
      {/* ==================================================== */}
      <ScrollView
        ref={mapScrollRef}
        style={styles.canvasScrollView}
        contentContainerStyle={styles.canvasScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryOrange]} />
        }
      >
        {/* Nền SVG Quần Xã Động */}
        <BiomeBackground zoneNumber={selectedZoneNumber} width={MAP_WIDTH} height={CANVAS_HEIGHT} />

        {/* CẢNH QUAN HOẠT HÌNH AAA (SECRET CAVE, COIN ARCS, LADDERS, CAMPFIRES) */}
        <View style={styles.decorationsLayer} pointerEvents="none">
          {/* Căn cứ Hang Đá Bí Mật Học Viện cắm cờ đỏ tại Ải 1 */}
          <View style={{ position: 'absolute', top: 60, left: 16, zIndex: 15 }}>
            <SecretCaveEntrance width={105} height={90} />
          </View>

          {/* Dải đồng xu vàng uốn lượn giữa Ải 1 và Ải 2 */}
          <View style={{ position: 'absolute', top: 215, left: (MAP_WIDTH / 2) - 60, zIndex: 15 }}>
            <CoinArcTrail width={120} height={45} orientation="LEFT_TO_RIGHT" />
          </View>

          {/* Thang gỗ leo vách núi tại Ải 2 */}
          <View style={{ position: 'absolute', top: 360, right: 18, zIndex: 15 }}>
            <WoodenLadder width={34} height={75} />
          </View>

          {/* Cụm nấm ma thuật đỏ & tím gần Ải 3 */}
          <View style={{ position: 'absolute', top: 480, left: 20, zIndex: 15 }}>
            <MagicMushroomGroup width={48} height={40} />
          </View>

          {/* Dải đồng xu vàng giữa Ải 3 và Ải 4 */}
          <View style={{ position: 'absolute', top: 570, left: (MAP_WIDTH / 2) - 60, zIndex: 15 }}>
            <CoinArcTrail width={120} height={45} orientation="RIGHT_TO_LEFT" />
          </View>

          {/* Hàng rào gỗ gần Ải 4 */}
          <View style={{ position: 'absolute', top: 690, right: 22, zIndex: 15 }}>
            <WoodenFence width={48} height={28} />
          </View>

          {/* Đốm lửa trại bập bùng tại Trạm Nghỉ Ải 5 */}
          <View style={{ position: 'absolute', top: 860, left: 24, zIndex: 15 }}>
            <CampfireEmbers width={52} height={48} />
          </View>

          {/* Rương báu & Kim cương tím lấp lánh tại Ải 5 */}
          <View style={{ position: 'absolute', top: 920, right: 20, zIndex: 15 }}>
            <PurpleGemChest width={58} height={44} />
          </View>

          {/* Dải đồng xu vàng giữa Ải 6 và Ải 7 */}
          <View style={{ position: 'absolute', top: 1110, left: (MAP_WIDTH / 2) - 60, zIndex: 15 }}>
            <CoinArcTrail width={120} height={45} orientation="LEFT_TO_RIGHT" />
          </View>

          {/* Thang gỗ leo vách đá cao tại Ải 7 */}
          <View style={{ position: 'absolute', top: 1290, left: 16, zIndex: 15 }}>
            <WoodenLadder width={34} height={75} angleDeg={-10} />
          </View>

          {/* Cụm nấm thần kỳ tại Ải 8 */}
          <View style={{ position: 'absolute', top: 1390, right: 22, zIndex: 15 }}>
            <MagicMushroomGroup width={48} height={40} />
          </View>

          {/* Dải đồng xu vàng giữa Ải 8 và Ải 9 */}
          <View style={{ position: 'absolute', top: 1470, left: (MAP_WIDTH / 2) - 60, zIndex: 15 }}>
            <CoinArcTrail width={120} height={45} orientation="RIGHT_TO_LEFT" />
          </View>

          {/* Hàng rào gỗ tại Ải 9 */}
          <View style={{ position: 'absolute', top: 1580, left: 22, zIndex: 15 }}>
            <WoodenFence width={48} height={28} />
          </View>

          {/* Đuốc lửa chiến thắng đỉnh núi Ải 10 */}
          <View style={{ position: 'absolute', top: 1720, right: 24, zIndex: 15 }}>
            <CampfireEmbers width={52} height={48} />
          </View>
        </View>

        {/* Rương Báu May Mắn 3D (Đặt tại lề đường ải 5) */}
        <View style={{ position: 'absolute', top: 920, right: 28, zIndex: 25 }}>
          <TreasureChest3D bonusXp={selectedZoneNumber * 100} />
        </View>

        {/* ĐƯỜNG MÒN SVG ISOMETRIC UỐN LƯỢN S-CURVE */}
        <View style={styles.svgPathCanvas} pointerEvents="none">
          <Svg width={MAP_WIDTH} height={CANVAS_HEIGHT}>
            {/* Lớp 1: Bóng đổ mặt đường 3D */}
            <Path
              d={svgPathData}
              fill="none"
              stroke={theme.roadShadow}
              strokeWidth={40}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Lớp 2: Mặt đường đá phiến 2.5D */}
            <Path
              d={svgPathData}
              fill="none"
              stroke={theme.roadColor}
              strokeWidth={32}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Lớp 3: Nét đứt dạ quang phát sáng chạy dọc tim đường */}
            <Path
              d={svgPathData}
              fill="none"
              stroke={theme.roadDash}
              strokeWidth={4}
              strokeDasharray="10 8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        {/* 10 BỤC ẢI 3D (ĐẶT CHÍNH XÁC THEO TỌA ĐỘ STAGE_COORDS) */}
        <View style={styles.nodesContainer}>
          {activeZoneStages.map((stage, idx) => {
            const coord = STAGE_COORDS[idx] || STAGE_COORDS[0];
            const lesson = stage.lessons[0];
            const isBossStage = stage.stageNumber === 10;
            const isUnlocked = activeZone?.isUnlocked && lesson?.status !== 'LOCKED';
            const isCompleted = lesson?.status === 'COMPLETED';
            const isCurrentActive = idx === (currentActiveStageIdx >= 0 ? currentActiveStageIdx : 0);

            const nodeWidth = isBossStage ? 140 : 120;
            const halfWidth = nodeWidth / 2;
            const nodeX = (MAP_WIDTH * coord.xPercent) / 100;
            const nodeY = coord.y;

            return (
              <View
                key={stage.id}
                onLayout={(e) => {
                  if (idx === 0) {
                    setStage1Layout(e.nativeEvent.layout);
                  }
                }}
                style={[
                  styles.nodeAnchor,
                  {
                    width: nodeWidth,
                    left: nodeX - halfWidth,
                    top: nodeY - 35,
                  },
                ]}
              >
                {/* Đội Trưởng Milo 2.5D đứng trực tiếp trên bục ải hiện tại */}
                {isCurrentActive ? (
                  <Animated.View
                    style={[
                      styles.miloStageAnchor,
                      { transform: [{ translateY: bobbingAnim }] },
                    ]}
                  >
                    <MiloAvatar2D emotion="CHEERING" size={76} showSpeechBubble={false} />
                    <Animated.View
                      style={[
                        styles.goldenArrowBounce,
                        { transform: [{ translateY: arrowBounce }] },
                      ]}
                    >
                      <ChevronDown size={22} color="#FFE66D" strokeWidth={3.5} />
                    </Animated.View>
                  </Animated.View>
                ) : null}

                {/* 3 Tầng sóng năng lượng lan tỏa (Radar Pulsing Ripples) */}
                {isCurrentActive ? (
                  <View style={styles.radarRippleContainer} pointerEvents="none">
                    <Animated.View
                      style={[
                        styles.radarRing,
                        {
                          transform: [
                            {
                              scale: ripple1.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1.8],
                              }),
                            },
                          ],
                          opacity: ripple1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 0],
                          }),
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.radarRing,
                        {
                          transform: [
                            {
                              scale: ripple2.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1.8],
                              }),
                            },
                          ],
                          opacity: ripple2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 0],
                          }),
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.radarRing,
                        {
                          transform: [
                            {
                              scale: ripple3.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1.8],
                              }),
                            },
                          ],
                          opacity: ripple3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 0],
                          }),
                        },
                      ]}
                    />
                  </View>
                ) : null}

                {/* BỤC ĐẢO NỔI THẢM CỎ & ĐẤT TẦNG LỚP HOẠT HÌNH 2.5D */}
                <CartoonIslandStageNode
                  stage={stage}
                  isUnlocked={!!isUnlocked}
                  isCompleted={!!isCompleted}
                  isBossStage={isBossStage}
                  onPress={() => handleStageClick(stage, !!isUnlocked)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* MODAL THÔNG TIN MÀN CHƠI (STAGE INFO SHEET) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard3D}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Badge Quần Xã */}
            <View style={[styles.modalZoneBadge, { backgroundColor: theme.titleBg }]}>
              <Text style={styles.modalZoneEmoji}>{theme.bannerEmoji}</Text>
              <Text style={styles.modalZoneName}>{activeZone?.title}</Text>
            </View>

            {/* Tiêu đề Ải */}
            <Text style={styles.modalStageNumber}>
              {previewStage?.stageNumber === 10 ? '👑 ĐẠI THỬ THÁCH BOSS TEST' : `ẢI SỐ ${previewStage?.stageNumber}`}
            </Text>
            <Text style={styles.modalStageTitle}>{previewStage?.title}</Text>

            {/* Mô tả nhiệm vụ sinh tồn */}
            <View style={styles.modalDescBox}>
              <ShieldCheck size={20} color="#10B981" />
              <Text style={styles.modalDescText}>{previewStage?.description}</Text>
            </View>

            {/* Phần thưởng */}
            <View style={styles.modalRewardRow}>
              <Award size={18} color="#D97706" />
              <Text style={styles.modalRewardText}>
                Phần Thưởng: +{previewStage?.lessons[0]?.rewardXp || 70} XP & Mảnh Huy Hiệu 🛡️
              </Text>
            </View>

            {/* Nút Bấm 3D Chunky BẮT ĐẦU VƯỢT ẢI */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.modalStartBtn3D,
                { backgroundColor: theme.titleBg, borderBottomColor: '#0F172A' },
              ]}
              onPress={handleStartStage}
            >
              <Text style={styles.modalStartBtnText}>BẮT ĐẦU VƯỢT ẢI 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Chuyển Đổi 5 Ngôn Ngữ Toàn Cầu */}
      <LanguageSwitcherModal
        visible={isLangModalVisible}
        onClose={() => setIsLangModalVisible(false)}
      />

      {/* Modal Luyện Tập Phản Xạ Hằng Ngày (Daily Drill Streak) */}
      <DailyDrillModal
        visible={isDailyDrillVisible}
        onClose={() => {
          setIsDailyDrillVisible(false);
          setStreakData(streakService.getStreakData());
        }}
      />

      {/* Màn Mờ Hướng Dẫn Spotlight Focus 5 Bước */}
      <SpotlightTourGuide
        visible={isTourGuideVisible}
        onFinish={() => setIsTourGuideVisible(false)}
        measuredTargets={{
          zoneBar: zoneBarLayout,
          tabLayouts: tabLayouts,
          stage1: stage1Layout,
          fixedHeaderHeight: fixedHeaderHeight,
        }}
      />

      {/* Game Navigation Dock */}
      <BottomNavBar
        activeTab="map"
        onTabLayoutsMeasured={(layouts) => setTabLayouts(layouts)}
        onTabPress={(tab) => {
          soundService.playPop();
          if (tab === 'ai') {
            navigation.navigate('Scanner');
          } else if (tab === 'backpack' || tab === 'badges') {
            navigation.navigate('Inventory');
          } else if (tab === 'sos') {
            navigation.navigate('Sos');
          } else if (tab === 'parent') {
            navigation.navigate('ParentAuth');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071936',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: '#FFE66D',
    fontWeight: '900',
  },
  fixedHeaderArea: {
    backgroundColor: '#071936',
    zIndex: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#0F2C59',
  },
  compactZoneBar: {
    backgroundColor: '#0F2C59',
    paddingVertical: 6,
    height: 72,
    justifyContent: 'center',
  },
  compactZoneScroll: {
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'center',
  },
  compactIslandBadge: {
    width: 82,
    height: 58,
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  compactIslandBadgeActive: {
    transform: [{ scale: 1.08 }],
    borderWidth: 2.5,
  },
  islandMiniCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  islandEmoji: {
    fontSize: 16,
  },
  lockBadgeMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 1,
  },
  islandNumberText: {
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  candyProgressTrack: {
    width: '80%',
    height: 3.5,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  candyProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  miloTipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0A1E3F',
    borderTopWidth: 1,
    borderTopColor: '#1E3A8A',
  },
  tipSpeechBubble: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#0F172A',
    position: 'relative',
  },
  tipBubbleArrow: {
    position: 'absolute',
    left: -8,
    top: 14,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: '#0F172A',
  },
  tipHeaderRow: {
    flexWrap: 'wrap',
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tipTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  tipActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 3,
  },
  streakNumberText: {
    color: '#FF6B35',
    fontSize: 10,
    fontWeight: '900',
  },
  langPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2C59',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    gap: 3,
  },
  langFlagText: {
    fontSize: 12,
  },
  speakerBtn: {
    padding: 2,
  },
  tipText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  canvasScrollView: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  canvasScrollContent: {
    paddingTop: 10,
    paddingBottom: 150,
    minHeight: CANVAS_HEIGHT,
    position: 'relative',
  },
  decorationsLayer: {
    ...StyleSheet.absoluteFillObject,
    height: CANVAS_HEIGHT,
    zIndex: 2,
  },
  svgPathCanvas: {
    ...StyleSheet.absoluteFillObject,
    height: CANVAS_HEIGHT,
    zIndex: 5,
  },
  nodesContainer: {
    ...StyleSheet.absoluteFillObject,
    height: CANVAS_HEIGHT,
    zIndex: 10,
  },
  nodeAnchor: {
    position: 'absolute',
    alignItems: 'center',
    width: 140,
  },
  miloStageAnchor: {
    position: 'absolute',
    top: -85,
    alignItems: 'center',
    zIndex: 40,
  },
  goldenArrowBounce: {
    marginTop: -4,
    alignItems: 'center',
  },
  radarRippleContainer: {
    position: 'absolute',
    top: -9,
    left: 0,
    right: 0,
    height: 78,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  radarRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#FFE66D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
    borderWidth: 3.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
  modalZoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  modalZoneEmoji: {
    fontSize: 14,
  },
  modalZoneName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  modalStageNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6B35',
    marginBottom: 4,
  },
  modalStageTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 8,
    width: '100%',
  },
  modalDescText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
    lineHeight: 18,
  },
  modalRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 16,
  },
  modalRewardText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  modalStartBtn3D: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2.5,
    borderBottomWidth: 6,
  },
  modalStartBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
