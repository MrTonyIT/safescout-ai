import { fetchJourneyMap, CURRENT_USER_ID } from '../services/api';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { InventoryScreenProps } from '../types/navigation';
import { offlineStorage, QuantumBadgeInventoryItem } from '../services/offlineStorage';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { TopHeader } from '../components/TopHeader';
import { BottomNavBar } from '../components/BottomNavBar';
import { MiloAvatar2D } from '../components/MiloAvatar2D';
import {
  ArrowLeft,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Volume2,
  Layers,
  Flame,
  Zap,
  Star,
  BookOpen,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ navigation }) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'shards'>('badges');
  const [badges, setBadges] = useState<QuantumBadgeInventoryItem[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<QuantumBadgeInventoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Animations
  const synthPulse = useRef(new Animated.Value(1)).current;
  const badgeInspectScale = useRef(new Animated.Value(0.7)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInventory();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(synthPulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(synthPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();

    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    );
    rotation.start();
    return () => { pulse.stop(); rotation.stop(); voiceService.stop(); };
  }, []);

  const loadInventory = async () => {
    try {
      setLoadError(null);
      const map = await fetchJourneyMap(CURRENT_USER_ID);
      setBadges(map.zones.flatMap(zone => zone.badge ? [{ id: zone.id, zoneNumber: zone.zoneNumber, badgeName: zone.badge.name, badgeCode: zone.badge.code, badgeEmoji: '⭐', category: zone.title, shardsCollected: zone.badge.collectedShards, totalShardsRequired: zone.badge.requiredShards, isSynthesized: zone.badge.isUnlocked, unlockedAt: null, certifiedProtocol: 'Huy hiệu học tập trong ứng dụng; không phải chứng nhận cứu hộ.', miloKeyAdvice: 'Hãy cùng cha mẹ ôn lại bài đã học.' }] : []));
    } catch { setBadges([]); setLoadError('Chưa tải được thành tích. Không có dữ liệu mẫu thay thế.'); }
  };

  const handleInspectBadge = (badge: QuantumBadgeInventoryItem) => {
    soundService.playPop();
    setSelectedBadge(badge);
    setModalVisible(true);

    badgeInspectScale.setValue(0.5);
    Animated.spring(badgeInspectScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    voiceService.speakMilo(
      `Huy Hiệu ${badge.badgeName}! ${badge.miloKeyAdvice}`,
      'CHEERING',
    );
  };

  const totalUnlocked = badges.filter((b) => b.isSynthesized).length;
  const totalShards = badges.reduce((acc, b) => acc + b.shardsCollected, 0);
  const masteryPercentage = Math.round((totalUnlocked / (badges.length || 10)) * 100);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />
      {loadError ? <Text accessibilityRole="alert" style={{padding: 16, color: '#FFFFFF', fontSize: 17}}>{loadError}</Text> : null}

      {/* Top Fixed Header */}
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
          <Text style={styles.headerTag}>THÀNH TÍCH HỌC TẬP</Text>
          <Text style={styles.headerTitle}>Thành tích của con</Text>
        </View>
        <Animated.View style={[styles.energyCoreIcon, { transform: [{ rotate: spin }] }]}>
          <Zap size={18} color="#00F0FF" />
        </Animated.View>
      </View>

      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Tổng Quan Năng Lượng Balo */}
        <View style={styles.summaryCard3D}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStatBox}>
              <Award size={24} color="#FFE66D" />
              <Text style={styles.summaryStatNumber}>{totalUnlocked}/10</Text>
              <Text style={styles.summaryStatLabel}>Huy Hiệu</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStatBox}>
              <Layers size={24} color="#38BDF8" />
              <Text style={styles.summaryStatNumber}>{totalShards}/40</Text>
              <Text style={styles.summaryStatLabel}>Mảnh Ghép</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStatBox}>
              <Sparkles size={24} color="#10B981" />
              <Text style={styles.summaryStatNumber}>{masteryPercentage}%</Text>
              <Text style={styles.summaryStatLabel}>Huy hiệu đã mở</Text>
            </View>
          </View>

          {/* Thanh Tiến Trình Thành Thạo Toàn Diện */}
          <View style={styles.masteryBarTrack}>
            <View style={[styles.masteryBarFill, { width: `${masteryPercentage}%` }]} />
          </View>
        </View>

        {/* Cụm 2 Tab Chuyển Đổi: HUY HIỆU & MẢNH GHÉP */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabButton, activeTab === 'badges' ? styles.tabButtonActive : null]}
            onPress={() => {
              soundService.playPop();
              setActiveTab('badges');
            }}
          >
            <Award size={16} color={activeTab === 'badges' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.tabButtonText, activeTab === 'badges' ? styles.tabButtonTextActive : null]}>
              Huy Hiệu ({totalUnlocked}/10)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabButton, activeTab === 'shards' ? styles.tabButtonActive : null]}
            onPress={() => {
              soundService.playPop();
              setActiveTab('shards');
            }}
          >
            <Layers size={16} color={activeTab === 'shards' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.tabButtonText, activeTab === 'shards' ? styles.tabButtonTextActive : null]}>
              Mảnh Kỹ Năng ({totalShards}/40)
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: DANH SÁCH 10 HUY HIỆU DANH DỰ */}
        {activeTab === 'badges' ? (
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                activeOpacity={0.85}
                onPress={() => handleInspectBadge(badge)}
                style={[
                  styles.badgeCard3D,
                  badge.isSynthesized ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                ]}
              >
                {/* Biểu tượng Huy Hiệu */}
                <View
                  style={[
                    styles.badgeIconCircle,
                    badge.isSynthesized ? styles.badgeIconCircleUnlocked : styles.badgeIconCircleLocked,
                  ]}
                >
                  <Text style={styles.badgeEmoji}>{badge.badgeEmoji}</Text>
                  {badge.isSynthesized ? (
                    <View style={styles.starBadgeCheck}>
                      <Star size={11} color="#FFFFFF" fill="#FFE66D" />
                    </View>
                  ) : (
                    <View style={styles.lockBadgeOverlay}>
                      <Lock size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Thông tin Huy Hiệu */}
                <View style={styles.badgeInfoCol}>
                  <Text style={styles.badgeCategoryText}>VÙNG {badge.zoneNumber} • {badge.category}</Text>
                  <Text style={styles.badgeNameText} numberOfLines={1}>
                    {badge.badgeName}
                  </Text>

                  {badge.isSynthesized ? (
                    <View style={styles.unlockedTag}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={styles.unlockedTagText}>ĐÃ ĐẠT ĐƯỢC ✓</Text>
                    </View>
                  ) : (
                    <View style={styles.shardProgressRow}>
                      <Text style={styles.shardProgressText}>
                        Mảnh ghép: {badge.shardsCollected}/{badge.totalShardsRequired}
                      </Text>
                      <View style={styles.miniTrack}>
                        <View
                          style={[
                            styles.miniFill,
                            { width: `${(badge.shardsCollected / badge.totalShardsRequired) * 100}%` },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* TAB 2: TỔNG HỢP MẢNH GHÉP LƯỢNG TỬ */
          <View style={styles.shardsContainer}>
            {badges.map((badge) => {
              const canSynth = badge.shardsCollected >= badge.totalShardsRequired && !badge.isSynthesized;
              return (
                <View key={badge.id} style={styles.shardCard3D}>
                  <View style={styles.shardCardHeader}>
                    <Text style={styles.shardCardEmoji}>{badge.badgeEmoji}</Text>
                    <View style={styles.shardCardTitleCol}>
                      <Text style={styles.shardCardTitle}>Vùng {badge.zoneNumber}: {badge.badgeName}</Text>
                      <Text style={styles.shardCardSub}>
                        Thu thập: {badge.shardsCollected}/{badge.totalShardsRequired} Mảnh Lượng Tử
                      </Text>
                    </View>
                  </View>

                  {/* Hàng 4 Mảnh Ghép Trực Quan */}
                  <View style={styles.shardsVisualRow}>
                    {[1, 2, 3, 4].map((sIndex) => {
                      const isCollected = badge.shardsCollected >= sIndex;
                      return (
                        <View
                          key={sIndex}
                          style={[
                            styles.shardSlot,
                            isCollected ? styles.shardSlotCollected : styles.shardSlotEmpty,
                          ]}
                        >
                          {isCollected ? (
                            <Zap size={16} color="#00F0FF" />
                          ) : (
                            <Text style={styles.shardSlotIndex}>{sIndex}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* Nút Ghép Mảnh / Đã Hoàn Thành */}
                  {badge.isSynthesized ? (
                    <View style={styles.synthCompletedTag}>
                      <CheckCircle2 size={15} color="#10B981" />
                      <Text style={styles.synthCompletedText}>ĐÃ TỔNG HỢP HUY HIỆU THÀNH CÔNG</Text>
                    </View>
                  ) : canSynth ? (
                    <View style={styles.synthIncompleteBox}>
                      <Text style={styles.synthIncompleteText}>Chờ máy chủ xác nhận huy hiệu.</Text>
                    </View>
                  ) : (
                    <View style={styles.synthIncompleteBox}>
                      <Text style={styles.synthIncompleteText}>
                        Cần thêm {badge.totalShardsRequired - badge.shardsCollected} mảnh để ghép hoàn chỉnh
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ==================================================== */}
      {/* MODAL SOI CHI TIẾT HUY HIỆU 3D & BÍ KÍP SINH TỒN */}
      {/* ==================================================== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent3D,
              { transform: [{ scale: badgeInspectScale }] },
            ]}
          >
            {/* Vòng Hào Quang Huy Hiệu */}
            <View style={styles.modalBadgeGlowCircle}>
              <Text style={styles.modalBadgeEmoji}>{selectedBadge?.badgeEmoji}</Text>
            </View>

            <Text style={styles.modalBadgeCategory}>
              VÙNG {selectedBadge?.zoneNumber} • {selectedBadge?.category}
            </Text>
            <Text style={styles.modalBadgeTitle}>{selectedBadge?.badgeName}</Text>

            {/* Thẻ Chứng Nhận Phác Đồ Quốc Tế */}
            <View style={styles.modalCertBox}>
              <ShieldCheck size={16} color="#10B981" />
              <Text style={styles.modalCertText}>{selectedBadge?.certifiedProtocol}</Text>
            </View>

            {/* Lời Khuyên Cốt Lõi Của Milo */}
            <View style={styles.modalMiloSpeechBox}>
              <View style={styles.modalMiloSpeechHeader}>
                <MiloAvatar2D emotion="CHEERING" size={36} showSpeechBubble={false} />
                <Text style={styles.modalMiloSpeechTitle}>BÍ KÍP SINH TỒN CỦA MILO 🎙️</Text>
              </View>
              <Text style={styles.modalMiloSpeechText}>{selectedBadge?.miloKeyAdvice}</Text>
            </View>

            {/* Cụm Nút Hành Động */}
            <View style={styles.modalActionsCol}>
              <TouchableOpacity
                style={styles.speakAgainBtn}
                activeOpacity={0.85}
                onPress={() => {
                  soundService.playPop();
                  if (selectedBadge) {
                    voiceService.speakMilo(selectedBadge.miloKeyAdvice, 'CHEERING');
                  }
                }}
              >
                <Volume2 size={18} color="#071936" />
                <Text style={styles.speakAgainBtnText}>NGHE LẠI LỜI KHUYÊN 🔊</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalBtn}
                activeOpacity={0.8}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeModalBtnText}>ĐÓNG LẠI</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Thanh Điều Hướng Đáy Gaming Capsule Dock */}
      <BottomNavBar
        activeTab="badges"
        onTabPress={(tab) => {
          soundService.playPop();
          if (tab === 'map') navigation.navigate('WorldMap');
          if (tab === 'ai') navigation.navigate('Scanner');
          if (tab === 'badges') navigation.navigate('Inventory');
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
  energyCoreIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
  },
  contentScrollView: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  contentScrollContainer: {
    padding: 14,
    paddingBottom: 90,
    gap: 14,
  },
  summaryCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#1E3A8A',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryStatBox: {
    alignItems: 'center',
  },
  summaryStatNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryStatLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1.5,
    height: 36,
    backgroundColor: '#1E3A8A',
  },
  masteryBarTrack: {
    height: 8,
    backgroundColor: '#071936',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  masteryBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0A1E3F',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#0284C7',
  },
  tabButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  badgesGrid: {
    gap: 10,
  },
  badgeCard3D: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    gap: 12,
  },
  badgeCardUnlocked: {
    backgroundColor: '#0F2C59',
    borderColor: '#38BDF8',
  },
  badgeCardLocked: {
    backgroundColor: '#0B172A',
    borderColor: '#1E293B',
    opacity: 0.85,
  },
  badgeIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeIconCircleUnlocked: {
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    borderWidth: 2,
    borderColor: '#FFE66D',
  },
  badgeIconCircleLocked: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  badgeEmoji: {
    fontSize: 28,
  },
  starBadgeCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  lockBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeInfoCol: {
    flex: 1,
  },
  badgeCategoryText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  badgeNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedTagText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  shardProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shardProgressText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  miniTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#071936',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
    borderRadius: 3,
  },
  shardsContainer: {
    gap: 12,
  },
  shardCard3D: {
    backgroundColor: '#0F2C59',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
  },
  shardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  shardCardEmoji: {
    fontSize: 26,
  },
  shardCardTitleCol: {
    flex: 1,
  },
  shardCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  shardCardSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  shardsVisualRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  shardSlot: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  shardSlotCollected: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00F0FF',
  },
  shardSlotEmpty: {
    backgroundColor: '#071936',
    borderColor: '#1E3A8A',
  },
  shardSlotIndex: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
  },
  synthCompletedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  synthCompletedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
  },
  synthButtonReady: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFE66D',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#D97706',
  },
  synthButtonReadyText: {
    color: '#071936',
    fontSize: 12,
    fontWeight: '900',
  },
  synthIncompleteBox: {
    alignItems: 'center',
    backgroundColor: '#071936',
    paddingVertical: 8,
    borderRadius: 12,
  },
  synthIncompleteText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent3D: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F2C59',
    borderRadius: 26,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderBottomWidth: 7,
    borderColor: '#00F0FF',
  },
  modalBadgeGlowCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFE66D',
    marginBottom: 10,
  },
  modalBadgeEmoji: {
    fontSize: 46,
  },
  modalBadgeCategory: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalBadgeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  modalCertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: 12,
  },
  modalCertText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '700',
    flexShrink: 1,
  },
  modalMiloSpeechBox: {
    width: '100%',
    backgroundColor: '#071936',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    marginBottom: 16,
  },
  modalMiloSpeechHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalMiloSpeechTitle: {
    color: '#FFE66D',
    fontSize: 11,
    fontWeight: '900',
  },
  modalMiloSpeechText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  modalActionsCol: {
    width: '100%',
    gap: 8,
  },
  speakAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00F0FF',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#0284C7',
  },
  speakAgainBtnText: {
    color: '#071936',
    fontSize: 13,
    fontWeight: '900',
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  closeModalBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
});
