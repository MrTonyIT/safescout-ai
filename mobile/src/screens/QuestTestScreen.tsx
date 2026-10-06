import { RELEASE } from '../config/release';
import { newAttemptId, savePending, acknowledgePending, PendingAttempt } from '../services/attemptQueue';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme/colors';
import { QuestTestScreenProps } from '../types/navigation';
import {
  CheckpointDetailData,
  TestQuestionItem,
  AnswerItemPayload,
  TestSubmissionResult,
} from '../types/curriculum';
import {
  fetchCheckpointDetails,
  submitTestAnswers,
  CURRENT_USER_ID,
} from '../services/api';
import { MiloAvatar2D } from '../components/MiloAvatar2D';
import { CountdownBar } from '../components/CountdownBar';
import { BiomeDecorations2D } from '../components/BiomeDecorations2D';
import { TwinklingStar } from '../components/FloatingParticles';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { spatialHaptics } from '../services/spatialHaptics';
import { bktEngine } from '../services/adaptiveBkt';
import { spacedRepetition } from '../services/spacedRepetitionService';
import { offlineStorage } from '../services/offlineStorage';
import { FirstAidBandageGame } from '../components/minigames/FirstAidBandageGame';
import { SmokeEscapeMazeGame } from '../components/minigames/SmokeEscapeMazeGame';
import { HazardSortingGame } from '../components/minigames/HazardSortingGame';
import {
  ArrowLeft,
  Trophy,
  RotateCcw,
  Star,
  Zap,
  Award,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react-native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const APP_MAX_WIDTH = Math.min(WINDOW_WIDTH, 480);

export const QuestTestScreen: React.FC<QuestTestScreenProps> = ({ route, navigation }) => {
  const { checkpointId, lessonTitle, zoneTitle, themeColor } = route.params;

  const [error, setError] = useState<string | null>(null);
  const attemptId = useRef(newAttemptId());
  const pendingAttempt = useRef<PendingAttempt | null>(null);
  const sessionStarted = useRef(Date.now());
  const submitLock = useRef(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CheckpointDetailData | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<AnswerItemPayload[]>([]);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isMinigameActive, setIsMinigameActive] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestSubmissionResult | null>(null);

  const victoryScale = useRef(new Animated.Value(0)).current;
  const starBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuestions();
  }, [checkpointId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await fetchCheckpointDetails(checkpointId, CURRENT_USER_ID);
      if (!detail?.questions?.length) throw new Error('Bài học chưa có câu hỏi.');
      setData(detail);
      setStartTimeMs(Date.now());
      sessionStarted.current = Date.now();
    } catch (error) {
      setData(null);
      setError('Chưa tải được bài học này. Hãy thử lại khi có kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion: TestQuestionItem | undefined = data?.questions[currentIdx];
  const totalQuestions = data?.questions.length || 0;

  useEffect(() => {
    if (currentQuestion?.promptText) {
      voiceService.speakMilo(
        currentQuestion.promptText,
        currentQuestion.questionType === 'TIMED_REFLEX' ? 'DANGER_ALERT' : 'THINKING',
      );
    }
    return () => {
      voiceService.stop();
    };
  }, [currentIdx, currentQuestion?.promptText]);

  const handleSelectOption = async (optionId: string) => {
    if (isAnswered || !currentQuestion) return;

    soundService.playPop();
    spatialHaptics.playHealingSoothe();

    setSelectedOptionId(optionId);
    setIsAnswered(true);
    setIsTimerPaused(true);

    const responseTime = Date.now() - startTimeMs;
    const answer: AnswerItemPayload = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      responseTimeMs: responseTime,
    };

    setUserAnswers((prev) => [...prev, answer]);


  };

  const handleTimeOut = async () => {
    if (isAnswered || !currentQuestion) return;

    soundService.playWarning();
    spatialHaptics.playElectricShock();

    setIsAnswered(true);
    setIsTimerPaused(true);

    const answer: AnswerItemPayload = {
      questionId: currentQuestion.id,
      selectedOptionId: undefined,
      responseTimeMs: 7000,
    };

    setUserAnswers((prev) => [...prev, answer]);


  };

  const handleTapOrderOption = (optionId: string) => {
    if (isAnswered) return;
    soundService.playPop();
    if (orderedIds.includes(optionId)) {
      setOrderedIds(orderedIds.filter((id) => id !== optionId));
    } else {
      setOrderedIds([...orderedIds, optionId]);
    }
  };

  const handleConfirmOrder = async () => {
    if (isAnswered || !currentQuestion) return;

    soundService.playPop();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    setIsAnswered(true);
    setIsTimerPaused(true);

    const responseTime = Date.now() - startTimeMs;
    const answer: AnswerItemPayload = {
      questionId: currentQuestion.id,
      orderedOptionIds: orderedIds,
      responseTimeMs: responseTime,
    };

    setUserAnswers((prev) => [...prev, answer]);
  };

  const handleMinigameComplete = (score: number) => {
    spatialHaptics.playVictoryFanfare();
    setIsAnswered(true);
    setIsTimerPaused(true);

    const responseTime = Date.now() - startTimeMs;
    const optId = currentQuestion?.options[0]?.id;
    const answer: AnswerItemPayload = {
      questionId: currentQuestion?.id || '',
      selectedOptionId: optId,
      responseTimeMs: responseTime,
    };

    setUserAnswers((prev) => [...prev, answer]);
  };

  const handleNextOrSubmit = async () => {
    soundService.playPop();
    setIsMinigameActive(false);
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setOrderedIds([]);
      setIsAnswered(false);
      setIsTimerPaused(false);
      setStartTimeMs(Date.now());
    } else {
      await submitTest();
    }
  };

  const submitTest = async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    try {
      setError(null);
      setSubmitting(true);
      const totalTimeSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStarted.current) / 1000),
      );

      if (!pendingAttempt.current) pendingAttempt.current = {attemptId: attemptId.current, checkpointId, userId: CURRENT_USER_ID, answers: userAnswers, totalTimeTakenSeconds: totalTimeSeconds};
      const payload = pendingAttempt.current;
      await savePending(payload);
      const result = await submitTestAnswers(payload.checkpointId, payload.userId, payload.answers, payload.totalTimeTakenSeconds, payload.attemptId);
      // A failed local cleanup can safely retry the same server receipt later.
      try { await acknowledgePending(payload.userId, payload.attemptId); } catch {}

      setTestResult(result);
      setResultModalVisible(true);

      victoryScale.setValue(0);
      starBounce.setValue(0);
      Animated.spring(victoryScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      Animated.spring(starBounce, {
        toValue: 1,
        friction: 4,
        tension: 50,
        delay: 200,
        useNativeDriver: true,
      }).start();

      if (result.isPassed) {

        soundService.playFanfare();
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
      }
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (!status && pendingAttempt.current) {
        try { await savePending(pendingAttempt.current); setError('Bài làm đã lưu trên thiết bị, đang chờ gửi. Chưa có điểm hoặc phần thưởng.'); }
        catch { setError('Chưa lưu được bài làm. Giữ màn hình này và thử gửi lại.'); }
      } else setError('Máy chủ chưa chấp nhận bài làm. Chưa ghi nhận điểm. Hãy thử lại.');
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColor || COLORS.primaryOrange} />
        <Text style={styles.loadingText}>Đội Trưởng Milo đang chuẩn bị đấu trường 2.5D...</Text>
      </SafeAreaView>
    );
  }

  if (!data) return <SafeAreaView style={styles.loadingContainer}><Text style={{fontSize: 18, padding: 24}}>{error || 'Bài học chưa sẵn sàng.'}</Text><TouchableOpacity accessibilityRole="button" onPress={loadQuestions} style={{padding: 20}}><Text>Thử tải lại</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} style={{padding: 20}}><Text>Quay lại</Text></TouchableOpacity></SafeAreaView>;

  const zoneNum = parseInt(zoneTitle?.match(/\d+/)?.[0] || '1', 10);

  return (
    <SafeAreaView style={styles.outerDeviceBackground}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />

      <TwinklingStar top={60} left={25} delay={100} />
      <TwinklingStar top={180} right={35} delay={400} />
      <TwinklingStar top={450} left={30} delay={600} />

      {/* Frame Điện Thoại */}
      <View style={styles.appPhoneFrame}>
        {/* Header Điều Hướng Game */}
        <View style={[styles.header, { backgroundColor: themeColor || COLORS.primaryBlue }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              soundService.playPop();
              navigation.goBack();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerZoneText}>{zoneTitle}</Text>
            <Text style={styles.headerLessonText} numberOfLines={1}>
              {lessonTitle}
            </Text>
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              ẢI {currentIdx + 1} / {totalQuestions}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContent}>
          {error ? <Text accessibilityRole="alert" style={{padding: 16, fontSize: 16, color: '#9A3412'}}>{error}</Text> : null}
          {/* ==================================================== */}
          {/* TẦNG 1: KHUNG TRANH HOẠT HỌA TÌNH HUỐNG (SCENIC DIORAMA) */}
          {/* ==================================================== */}
          <View style={styles.scenicDioramaCard}>
            <View style={styles.dioramaArtHolder}>
              <BiomeDecorations2D zoneNumber={zoneNum} width={145} height={82} />
              <View style={styles.miloObserver}>
                <MiloAvatar2D
                  emotion={
                    isAnswered
                      ? selectedOptionId
                        ? 'CHEERING'
                        : 'DANGER_ALERT'
                      : currentQuestion?.questionType === 'TIMED_REFLEX'
                      ? 'DANGER_ALERT'
                      : 'THINKING'
                  }
                  size={76}
                  showSpeechBubble={false}
                />
              </View>
            </View>

            {/* Badge Chế Độ Câu Hỏi + Nút Loa Đọc Tiếng Việt */}
            <View style={styles.badgeSpeakerRow}>
              {(currentQuestion as any)?.isSrsReview ? (
                <View style={styles.srsReviewBadge}>
                  <RotateCcw size={12} color="#071936" />
                  <Text style={styles.srsReviewText}>
                    🔄 ÔN TẬP PHẢN XẠ MILO (ĐỘ BỀN: {(currentQuestion as any).stabilityScore || 25}%)
                  </Text>
                </View>
              ) : (
                <View style={styles.hazardBadge}>
                  <Text style={styles.hazardText}>
                    {currentQuestion?.questionType === 'TIMED_REFLEX'
                      ? 'CÙNG MILO SUY NGHĨ'
                      : currentQuestion?.questionType === 'DRAG_DROP_ORDER'
                      ? '🔢 SẮP XẾP BƯỚC THOÁT HIỂM'
                      : '🎯 LỰA CHỌN AN TOÀN'}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.questionSpeakerBtn}
                onPress={() => {
                  soundService.playPop();
                  voiceService.speakMilo(
                    currentQuestion?.promptText || '',
                    currentQuestion?.questionType === 'TIMED_REFLEX' ? 'DANGER_ALERT' : 'THINKING',
                  );
                }}
              >
                <Volume2 size={16} color="#FFE66D" />
              </TouchableOpacity>
            </View>

            <Text style={styles.promptText}>{currentQuestion?.promptText}</Text>
          </View>

          {/* ==================================================== */}
          {/* TẦNG 2: THANH NĂNG LƯỢNG ĐẾM NGƯỢC (COUNTDOWN BAR) */}
          {/* ==================================================== */}
          {RELEASE.timedChallenges && currentQuestion?.questionType === 'TIMED_REFLEX' && !isAnswered ? (
            <View style={styles.timerWrapper}>
              <CountdownBar
                totalSeconds={currentQuestion.timeLimitSeconds || 7}
                onTimeOut={handleTimeOut}
                isPaused={isTimerPaused}
              />
            </View>
          ) : null}

          {/* ==================================================== */}
          {/* TẦNG 3: BÀN PHÍM HÀNH ĐỘNG CHUNKY 3D ĐỒ CHƠI */}
          {/* ==================================================== */}
          <View style={styles.chunkyOptionsContainer}>
            {/* Nút Kích Hoạt Minigame Thực Hành */}
            {!isAnswered ? (
              <TouchableOpacity
                style={[
                  styles.minigameTriggerBtn3D,
                  isMinigameActive ? styles.minigameTriggerBtnActive : null,
                ]}
                onPress={() => {
                  soundService.playPop();
                  setIsMinigameActive(RELEASE.minigames && !isMinigameActive);
                }}
                activeOpacity={0.85}
              >
                <Sparkles size={16} color="#FFE66D" />
                <Text style={styles.minigameTriggerText}>
                  {isMinigameActive
                    ? '✖ ĐÓNG MINIGAME (VỀ CÂU HỎI)'
                    : 'Đọc kỹ tình huống và chọn câu trả lời'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {isMinigameActive ? (
              zoneNum === 4 ? (
                <FirstAidBandageGame onGameComplete={handleMinigameComplete} />
              ) : zoneNum === 3 ? (
                <SmokeEscapeMazeGame onGameComplete={handleMinigameComplete} />
              ) : (
                <HazardSortingGame onGameComplete={handleMinigameComplete} />
              )
            ) : currentQuestion?.questionType === 'DRAG_DROP_ORDER' ? (
              // Dạng Tap-to-Order Sắp xếp các bước
              <View>
                <Text style={styles.tapOrderInstruction}>
                  Chạm lần lượt vào từng bước theo đúng thứ tự 1 ➔ 2 ➔ 3:
                </Text>
                {currentQuestion.options.map((option) => {
                  const orderIndex = orderedIds.indexOf(option.id);
                  const isSelected = orderIndex !== -1;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      disabled={isAnswered}
                      activeOpacity={0.8}
                      onPress={() => handleTapOrderOption(option.id)}
                      style={[
                        styles.chunkyOptionButton,
                        isSelected ? styles.chunkyOptionActiveBlue : null,
                      ]}
                    >
                      <View style={styles.optionRow}>
                        <View
                          style={[
                            styles.orderNumberBadge3D,
                            isSelected ? styles.orderNumberActive : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.orderNumberText,
                              isSelected ? { color: '#FFFFFF' } : null,
                            ]}
                          >
                            {isSelected ? orderIndex + 1 : '—'}
                          </Text>
                        </View>
                        <Text style={styles.optionText}>{option.optionText}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {!isAnswered ? (
                  <View style={styles.orderActionsRow}>
                    <TouchableOpacity
                      style={styles.resetOrderButton}
                      onPress={() => {
                        soundService.playPop();
                        setOrderedIds([]);
                      }}
                    >
                      <RotateCcw size={16} color={COLORS.textMuted} />
                      <Text style={styles.resetOrderText}>Chọn lại từ đầu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.confirmOrderButton3D,
                        {
                          backgroundColor:
                            orderedIds.length === currentQuestion.options.length
                              ? COLORS.primaryOrange
                              : COLORS.lockedGray,
                          borderBottomColor:
                            orderedIds.length === currentQuestion.options.length
                              ? '#C2410C'
                              : '#64748B',
                        },
                      ]}
                      disabled={orderedIds.length !== currentQuestion.options.length}
                      onPress={handleConfirmOrder}
                    >
                      <Text style={styles.confirmOrderText}>XÁC NHẬN THỨ TỰ ➔</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : (
              // Dạng Single Choice & Timed Reflex
              currentQuestion?.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <TouchableOpacity
                    key={option.id}
                    disabled={isAnswered}
                    activeOpacity={0.85}
                    onPress={() => handleSelectOption(option.id)}
                    style={[
                      styles.chunkyOptionButton,
                      isSelected ? styles.chunkyOptionSelected : null,
                    ]}
                  >
                    <View style={styles.optionRow}>
                      <View
                        style={[
                          styles.chunkyLetterBadge,
                          isSelected ? styles.chunkyLetterSelected : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.alphabetText,
                            isSelected ? { color: '#FFFFFF' } : null,
                          ]}
                        >
                          {String.fromCharCode(65 + idx)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {option.optionText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Hộp thoại Milo Comic Balloon Giải Thích Cứu Mạng */}
          {isAnswered ? (
            <View style={styles.miloFeedbackSection}>
              <MiloAvatar2D
                emotion={
                  currentQuestion?.questionType === 'TIMED_REFLEX' && !selectedOptionId
                    ? 'DANGER_ALERT'
                    : 'THINKING'
                }
                size={82}
                speechText={
                  currentQuestion?.explanation ||
                  'Đội Trưởng Milo khuyên bé hãy luôn quan sát kỹ trước khi quyết định nhé!'
                }
              />

              {/* Nút Chuyển Tiếp */}
              <TouchableOpacity
                style={[
                  styles.chunkyNextButton,
                  {
                    backgroundColor: themeColor || COLORS.primaryOrange,
                    borderBottomColor: '#0F172A',
                  },
                ]}
                disabled={submitting}
                onPress={handleNextOrSubmit}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.nextButtonText}>
                    {currentIdx < totalQuestions - 1
                      ? 'CÂU TIẾP THEO ➔'
                      : 'XEM KẾT QUẢ THỬ THÁCH 🏆'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* ==================================================== */}
      {/* MODAL VINH DANH CHIẾN THẮNG & NHẬN HUY HIỆU 3D */}
      {/* ==================================================== */}
      <Modal
        visible={resultModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResultModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent3D,
              { transform: [{ scale: victoryScale }] },
            ]}
          >
            <View style={styles.victoryIconCircle3D}>
              {testResult?.isPassed ? (
                <Trophy size={60} color="#D97706" />
              ) : (
                <RotateCcw size={60} color={COLORS.primaryOrange} />
              )}
            </View>

            <Text style={styles.modalTitle3D}>
              {testResult?.isPassed
                ? 'HOÀN THÀNH XUẤT SẮC! 🎉'
                : 'CỐ GẮNG LÊN BÉ ƠI! 💪'}
            </Text>

            {/* 1-3 Ngôi Sao 3D Vàng Óng */}
            <Animated.View
              style={[
                styles.modalStarsRow,
                { transform: [{ scale: starBounce }] },
              ]}
            >
              {[1, 2, 3].map((starNum) => (
                <Star
                  key={starNum}
                  size={42}
                  color="#F59E0B"
                  fill={
                    (testResult?.starsEarned || 0) >= starNum
                      ? '#F59E0B'
                      : 'transparent'
                  }
                />
              ))}
            </Animated.View>

            {/* Khung Điểm Số 3D & Phần Thưởng */}
            <View style={styles.scoreBox3D}>
              <Text style={styles.scoreText}>{testResult?.score}% ĐIỂM</Text>
              <Text style={styles.scoreLabel}>
                Đúng {testResult?.correctCount} / {testResult?.totalQuestions} tình huống sinh tồn
              </Text>
              {testResult?.isPassed ? (
                <View style={styles.badgeShardRewardTag}>
                  <Award size={22} color="#D97706" />
                  <Text style={styles.badgeShardText}>Kết quả bài làm đã được lưu</Text>
                </View>
              ) : null}
            </View>

            {/* Milo Chúc Mừng 2.5D */}
            <MiloAvatar2D
              emotion={testResult?.miloResponse.emotion}
              size={84}
              speechText={testResult?.miloResponse.speech}
              actionRequired={testResult?.miloResponse.actionRequired}
            />

            {/* Nút Quay Về Bản Đồ 3D */}
            <TouchableOpacity
              style={[
                styles.modalCloseButton3D,
                { backgroundColor: themeColor || COLORS.primaryOrange },
              ]}
              onPress={() => {
                soundService.playPop();
                setResultModalVisible(false);
                navigation.navigate('WorldMap', { refresh: true });
              }}
            >
              <Text style={styles.modalCloseButtonText}>TRỞ VỀ BẢN ĐỒ THẾ GIỚI 🗺️</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerDeviceBackground: {
    flex: 1,
    backgroundColor: '#071936',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  appPhoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: APP_MAX_WIDTH,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F2C59',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: '#FFE66D',
    fontWeight: '900',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  backButton: {
    padding: 6,
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 10,
  },
  headerZoneText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  headerLessonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  progressPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  scenicDioramaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 16,
    borderWidth: 3.5,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 14,
  },
  dioramaArtHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  miloObserver: {
    marginRight: 4,
  },
  hazardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  srsReviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#00F0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  srsReviewText: {
    color: '#071936',
    fontSize: 10.5,
    fontWeight: '900',
  },
  hazardText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '900',
  },
  promptText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  timerWrapper: {
    marginBottom: 6,
  },
  chunkyOptionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  chunkyOptionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3.5,
    borderBottomWidth: 8,
    borderColor: '#0F172A',
    borderBottomColor: '#0F172A',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chunkyOptionSelected: {
    borderColor: '#FF6B35',
    borderBottomColor: '#C2410C',
    backgroundColor: '#FFF7ED',
  },
  chunkyOptionActiveBlue: {
    borderColor: '#004E89',
    borderBottomColor: '#002244',
    backgroundColor: '#EFF6FF',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chunkyLetterBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chunkyLetterSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#C2410C',
  },
  alphabetText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#EA580C',
    fontWeight: '900',
  },
  tapOrderInstruction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
  },
  orderNumberBadge3D: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNumberActive: {
    backgroundColor: '#004E89',
    borderColor: '#002244',
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  orderActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  resetOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  resetOrderText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '800',
  },
  confirmOrderButton3D: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#0F172A',
  },
  confirmOrderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  miloFeedbackSection: {
    marginTop: 10,
  },
  chunkyNextButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3.5,
    borderBottomWidth: 8,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
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
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  victoryIconCircle3D: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F59E0B',
    marginBottom: 10,
  },
  modalTitle3D: {
    fontSize: 19,
    fontWeight: '900',
    color: '#004E89',
    textAlign: 'center',
  },
  modalStarsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  scoreBox3D: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B35',
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  badgeShardRewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  badgeShardText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '900',
  },
  modalCloseButton3D: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3.5,
    borderBottomWidth: 7,
    borderColor: '#0F172A',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  badgeSpeakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  questionSpeakerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE66D',
  },
  minigameTriggerBtn3D: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#C4B5FD',
    borderBottomColor: '#5B21B6',
    gap: 8,
    marginBottom: 12,
  },
  minigameTriggerBtnActive: {
    backgroundColor: '#374151',
    borderColor: '#9CA3AF',
    borderBottomColor: '#1F2937',
  },
  minigameTriggerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
