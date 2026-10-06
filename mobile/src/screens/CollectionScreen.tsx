import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {Award, Backpack, BookOpen, Check, Flag, Layers, Lock, RotateCw, Sparkles} from 'lucide-react-native';
import {GameButton, GameShell, ink, k} from '../components/game/GameKit';
import {GameDock} from '../components/game/GameDock';
import {Notice, errorMessage} from '../components/LearningUI';
import {CURRENT_USER_ID, INTERNAL_PREVIEW, fetchJourneyMap} from '../services/api';
import {JourneyMapData, LessonSummary, ZoneSummary} from '../types/curriculum';
import {InventoryScreenProps} from '../types/navigation';
import {useGameFeedback} from '../services/gameFeedback';

type CollectionTab = 'milestones' | 'badges';
type Milestone = {lesson: LessonSummary; zone: ZoneSummary};

/** Read-only collection: no local reward grants, inventory seeds or synthesis actions. */
export const CollectionScreen: React.FC<InventoryScreenProps> = ({navigation}) => {
  const {width, fontScale} = useWindowDimensions();
  const feedback = useGameFeedback(useIsFocused());
  const [storedData, setData] = useState<JourneyMapData | null>(null);
  const data = storedData?.user.id === CURRENT_USER_ID ? storedData : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<CollectionTab>('milestones');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = useRef(false);
  const request = useRef(0);

  const load = useCallback(async () => {
    const generation = ++request.current;
    const userId = CURRENT_USER_ID;
    setLoading(true);
    setError('');
    // Never leave another child's album visible while refreshing the current profile.
    setData(null);
    setSelectedId(null);
    try {
      if (!userId) throw new Error('NO_PROFILE');
      const next = await fetchJourneyMap(userId);
      if (next.user.id !== userId) throw new Error('PROFILE_MISMATCH');
      if (active.current && generation === request.current && userId === CURRENT_USER_ID) setData(next);
    } catch (cause) {
      if (active.current && generation === request.current && userId === CURRENT_USER_ID) {
        setError(!userId ? 'Cần chọn hồ sơ để mở bộ sưu tập.' : errorMessage(cause));
      }
    } finally {
      if (active.current && generation === request.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    active.current = true;
    setTab('milestones');
    void load();
    return () => {
      active.current = false;
      request.current++;
      setData(null);
      setSelectedId(null);
    };
  }, [load]));

  const milestones: Milestone[] = data?.zones.flatMap(zone => zone.stages.flatMap(stage =>
    stage.lessons.filter(lesson => lesson.isAvailable !== false).map(lesson => ({lesson, zone})))) || [];
  const earned = milestones.filter(({lesson}) => lesson.status === 'COMPLETED').length;
  const badges = data?.zones.filter(zone => zone.badge != null) || [];
  const unlockedBadges = badges.filter(zone => zone.badge?.isUnlocked).length;
  const columns = width >= 620 && fontScale < 1.6;

  const openLesson = ({lesson, zone}: Milestone) => {
    const checkpointId = lesson.checkpointIds?.find(id => !lesson.completedCheckpointIds?.includes(id))
      || lesson.checkpointIds?.[0];
    if (!checkpointId || !zone.isUnlocked || lesson.status === 'LOCKED') return;
    navigation.navigate('QuestTest', {checkpointId, lessonTitle: lesson.title, zoneTitle: zone.title, themeColor: zone.themeColor});
  };

  const details = (item: Milestone) => <View style={[k.card, {width: '100%'}]}>
    <Text style={c.eyebrow}>DẤU MỐC ĐANG XEM</Text><Text accessibilityRole="header" style={k.heading}>{item.lesson.title}</Text>
    <Text style={k.body}>{item.lesson.description}</Text>
    <Text style={k.small}>{item.lesson.completedCheckpointIds?.length || 0}/{item.lesson.checkpointIds?.length || item.lesson.checkpointsCount} phần đạt trong phiên bản hiện tại.</Text>
    {item.lesson.status === 'COMPLETED' ? <Text style={k.body}>Con đã hoàn thành bài này. Có thể mở lại để cùng cha mẹ ôn tập.</Text>
      : item.lesson.status === 'LOCKED' || !item.zone.isUnlocked ? <Text style={k.body}>Hoàn thành chặng trước trên bản đồ để mở bài này.</Text>
      : <Text style={k.body}>Hoàn thành các phần của bài để ghi dấu mốc này.</Text>}
    <GameButton label={item.lesson.status === 'COMPLETED' ? 'Ôn lại bài này' : 'Tiếp tục khám phá'}
      disabled={!item.zone.isUnlocked || item.lesson.status === 'LOCKED' || !item.lesson.checkpointIds?.length} onPress={() => openLesson(item)}/>
    <GameButton secondary label="Đóng chi tiết dấu mốc" onPress={() => setSelectedId(null)}/>
  </View>;

  return <GameShell title="Ba lô khám phá" subtitle="MỖI CHẶNG · MỘT DẤU MỐC"
    onBack={() => navigation.navigate('WorldMap')} backLabel="Về bản đồ"
    onTap={() => {void feedback.tap();}}
    dock={<GameDock active="collection" onMap={() => navigation.navigate('WorldMap')} onCollection={() => {void load();}}/>}
    focusKey={tab}
    right={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Tải lại bộ sưu tập"
      accessibilityState={{disabled: loading}} disabled={loading} onPress={() => {void feedback.tap(); void load();}} style={c.refresh}>
      <RotateCw size={20} color={ink.white}/>
    </TouchableOpacity>}>
    {loading ? <View style={c.loading}><ActivityIndicator color={ink.gold} size="large"/><Text accessibilityLiveRegion="polite" style={c.lightText}>Đang mở ba lô của con…</Text></View> : null}
    {error ? <View style={{gap: 12}}><Notice text={error}/><GameButton label="Thử tải lại" onPress={() => {void load();}}/>
      {!INTERNAL_PREVIEW ? <GameButton secondary label="Về góc cha mẹ để chọn hồ sơ" onPress={() => navigation.navigate('Family')}/> : null}
    </View> : null}
    {data ? <>
      <View style={c.hero}>
        <View style={c.heroHeading}><View style={c.backpack}><Backpack size={43} color={ink.navy}/></View>
          <View style={c.heroCopy}><Text style={c.eyebrow}>NHẬT KÝ HÀNH TRÌNH</Text><Text accessibilityRole="header" style={c.heroTitle}>Những điều con đã khám phá</Text><Text style={k.small}>Của {data.user.nickname}</Text></View>
        </View>
        <View style={c.stats}>
          <View style={c.stat}><Sparkles size={19} color="#946321"/><Text style={c.statValue}>{data.user.totalSafetyScore}</Text><Text style={c.statLabel}>XP đã ghi nhận</Text></View>
          <View style={c.stat}><Flag size={19} color={ink.teal}/><Text style={c.statValue}>{earned}/{milestones.length}</Text><Text style={c.statLabel}>Dấu mốc hiện tại</Text></View>
          <View style={c.stat}><Award size={19} color="#946321"/><Text style={c.statValue}>{data.user.totalBadges}</Text><Text style={c.statLabel}>Huy hiệu đã nhận</Text></View>
        </View>
      </View>

      <View style={c.tabs}>
        {([{id: 'milestones', label: 'Dấu mốc', Icon: Flag}, {id: 'badges', label: 'Huy hiệu', Icon: Award}] as const).map(item =>
          <TouchableOpacity key={item.id} accessibilityRole="tab" accessibilityState={{selected: tab === item.id}}
            onPress={() => {void feedback.tap(); setTab(item.id); setSelectedId(null);}} style={[c.tab, tab === item.id && c.tabSelected]}>
            <item.Icon size={19} color={tab === item.id ? ink.navy : '#D4E7E6'}/><Text style={[c.tabText, tab === item.id && c.tabTextSelected]}>{item.label}</Text>
          </TouchableOpacity>)}
      </View>

      {tab === 'milestones' ? <>
        <View style={c.sectionHeading}><Text accessibilityRole="header" style={c.sectionTitle}>Sổ dấu mốc</Text><Text style={c.lightText}>Hoàn thành một bài để ghi dấu tại đây.</Text></View>
        {milestones.length === 0 ? <View style={k.card}><BookOpen size={35} color={ink.teal}/><Text style={k.heading}>Sổ đang chờ những bài học đầu tiên</Text><Text style={k.body}>Hồ sơ này chưa có bài học khả dụng để sưu tập dấu mốc.</Text><GameButton label="Về bản đồ" onPress={() => navigation.navigate('WorldMap')}/></View> : <>
          {earned === 0 ? <View style={c.firstStep}><Flag size={23} color={ink.teal}/><Text style={[k.body, {flex: 1}]}>Chưa có dấu mốc hoàn thành. Chặng đầu tiên đang chờ con trên bản đồ.</Text></View> : null}
          {data.zones.map(zone => {
            const entries = milestones.filter(item => item.zone.id === zone.id);
            if (!entries.length) return null;
            return <View key={zone.id} style={{gap: 12}}><Text accessibilityRole="header" style={c.zoneTitle}>{zone.title}</Text><View style={c.grid}>
              {entries.map(item => {
                const {lesson} = item;
                const complete = lesson.status === 'COMPLETED';
                const locked = !zone.isUnlocked || lesson.status === 'LOCKED';
                const stateLabel = complete ? 'Đã ghi dấu' : lesson.status === 'IN_PROGRESS' ? 'Đang khám phá' : locked ? 'Chưa mở' : 'Sẵn sàng khám phá';
                return <React.Fragment key={lesson.id}><TouchableOpacity accessibilityRole="button" accessibilityLabel={`${lesson.title}. ${stateLabel}. Xem chi tiết`}
                  accessibilityState={{expanded: selectedId === lesson.id}} onPress={() => {void feedback.tap(); setSelectedId(selectedId === lesson.id ? null : lesson.id);}}
                  style={[c.stamp, columns && {width: '48%', flexGrow: 1}, complete && c.stampEarned, selectedId === lesson.id && c.stampSelected]}>
                  <View style={[c.seal, complete && c.sealEarned]}>{complete ? <Check size={29} color={ink.teal} strokeWidth={3}/> : locked ? <Lock size={24} color="#768981"/> : <Flag size={27} color={ink.teal}/>}</View>
                  <View style={c.stampCopy}><Text style={c.stampTitle}>{lesson.title}</Text><Text style={[c.status, complete && {color: '#206751'}]}>{stateLabel}</Text></View>
                </TouchableOpacity>{selectedId === lesson.id ? details(item) : null}</React.Fragment>;
              })}
            </View></View>;
          })}
        </>}
        {milestones.length > 0 ? <Text style={c.footnote}>Dấu mốc dựa trên bài đang khả dụng. Khi nội dung đổi phiên bản, bài có thể cần học lại; XP đã ghi nhận vẫn được giữ.</Text> : null}
      </> : <>
        <View style={c.sectionHeading}><Text accessibilityRole="header" style={c.sectionTitle}>Huy hiệu học tập</Text><Text style={c.lightText}>Mảnh và huy hiệu được lưu theo hồ sơ của con.</Text></View>
        {badges.length === 0 ? <View style={k.card}><Award size={38} color={ink.teal}/><Text style={k.heading}>Chưa có huy hiệu để trưng bày</Text><Text style={k.body}>Những bài đang mở chưa cung cấp chi tiết huy hiệu. Con vẫn có thể ghi dấu mốc khi hoàn thành bài.</Text></View> : badges.map(zone => {
          const badge = zone.badge!;
          const ratio = badge.requiredShards > 0 ? Math.min(1, Math.max(0, badge.collectedShards / badge.requiredShards)) : 0;
          return <View key={zone.id} style={[k.card, c.badgeCard]}><View style={c.badgeHeading}>
            <View style={[c.medal, badge.isUnlocked && c.medalEarned]}>{badge.isUnlocked ? <Award size={40} color="#8B5D18"/> : <Lock size={31} color="#637C72"/>}</View>
            <View style={{flex: 1, gap: 7}}><Text style={c.eyebrow}>{badge.isUnlocked ? 'ĐÃ NHẬN' : 'ĐANG SƯU TẬP'}</Text><Text accessibilityRole="header" style={k.heading}>{badge.name}</Text><Text style={k.small}>{zone.title}</Text></View>
          </View><View style={c.shards}><Layers size={19} color={ink.teal}/><Text style={[k.body, {flex: 1}]}>{badge.collectedShards}{badge.requiredShards > 0 ? `/${badge.requiredShards}` : ''} mảnh đã lưu</Text></View>
            {badge.requiredShards > 0 ? <View accessibilityRole="progressbar" accessibilityLabel={'Mảnh của huy hiệu ' + badge.name}
              accessibilityValue={{min: 0, max: badge.requiredShards, now: Math.min(badge.collectedShards, badge.requiredShards), text: `${badge.collectedShards} trên ${badge.requiredShards} mảnh`}} style={c.progress}>
              <View style={[c.progressFill, {width: `${ratio * 100}%`}]}/>
            </View> : null}
            <Text style={k.small}>{badge.isUnlocked ? 'Huy hiệu đã được ghi nhận trong hồ sơ học tập.' : 'Tiếp tục những bài chưa hoàn thành để thu thập mảnh. Ôn lại bài đã nhận thưởng không cộng thêm mảnh.'}</Text>
          </View>;
        })}
        {data.user.totalBadges !== unlockedBadges ? <View style={c.firstStep}><Text style={k.small}>Hồ sơ ghi nhận {data.user.totalBadges} huy hiệu; danh sách bài hiện tại cung cấp chi tiết {unlockedBadges} huy hiệu đã mở. Tổng hồ sơ có thể bao gồm nội dung không còn trong danh sách này.</Text></View> : null}
      </>}
      <Text style={c.footnote}>XP, dấu mốc và huy hiệu ghi nhận hành trình học tập; không phải chứng nhận năng lực cứu hộ.</Text>
      {INTERNAL_PREVIEW ? <Text style={c.footnote}>Bản nội bộ dùng hồ sơ mẫu; nội dung đang chờ người có chuyên môn duyệt.</Text> : null}
    </> : null}
  </GameShell>;
};

const c = StyleSheet.create({
  refresh: {minWidth: 48, minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24495E'},
  loading: {padding: 32, gap: 18, alignItems: 'center'},
  lightText: {color: '#D1E4E8', fontSize: 16, lineHeight: 24},
  hero: {backgroundColor: '#FFF1CA', borderRadius: 27, padding: 20, borderWidth: 2, borderColor: '#E2BE70', gap: 21},
  heroHeading: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16},
  backpack: {width: 83, height: 91, borderRadius: 25, borderWidth: 2, borderBottomWidth: 5, borderColor: '#D6A752', backgroundColor: '#FFD97A', alignItems: 'center', justifyContent: 'center'},
  heroCopy: {flex: 1, minWidth: 150, gap: 7},
  eyebrow: {fontSize: 11, lineHeight: 17, letterSpacing: 1.3, fontWeight: '900', color: '#496857'},
  heroTitle: {fontSize: 24, lineHeight: 31, fontWeight: '900', color: ink.navy},
  stats: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  stat: {flexGrow: 1, flexBasis: 84, paddingVertical: 14, paddingHorizontal: 7, alignItems: 'center', gap: 7, backgroundColor: '#FFFAE8', borderRadius: 16, borderWidth: 1, borderColor: '#EAD9AD'},
  statValue: {fontSize: 24, fontWeight: '900', color: ink.navy, textAlign: 'center'},
  statLabel: {fontSize: 12, lineHeight: 18, fontWeight: '700', color: '#58706D', textAlign: 'center'},
  tabs: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 5, backgroundColor: '#21465A', borderRadius: 20},
  tab: {flex: 1, minWidth: 118, minHeight: 52, padding: 12, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9},
  tabSelected: {backgroundColor: '#FFDA82'},
  tabText: {fontSize: 16, fontWeight: '800', color: '#D4E7E6', flexShrink: 1},
  tabTextSelected: {color: ink.navy},
  sectionHeading: {gap: 5},
  sectionTitle: {fontSize: 22, lineHeight: 29, fontWeight: '800', color: ink.white},
  firstStep: {padding: 17, backgroundColor: '#E7F3E9', borderRadius: 19, flexDirection: 'row', alignItems: 'center', gap: 12},
  zoneTitle: {fontSize: 17, lineHeight: 24, fontWeight: '800', color: '#D2E8E5', paddingTop: 9},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  stamp: {width: '100%', padding: 17, gap: 13, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4EA', borderRadius: 22, borderWidth: 2, borderColor: '#D5E0D5', borderBottomWidth: 4},
  stampEarned: {backgroundColor: '#F3FBEA', borderColor: '#A9CCAC'},
  stampSelected: {borderColor: '#E9B74E'},
  seal: {width: 57, height: 57, borderRadius: 21, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B8CBBF', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6EDE3'},
  sealEarned: {backgroundColor: '#D9EDD0', borderColor: '#6CA583', borderStyle: 'solid'},
  stampCopy: {flex: 1, gap: 6},
  stampTitle: {fontSize: 17, lineHeight: 24, color: ink.navy, fontWeight: '800'},
  status: {fontSize: 13, lineHeight: 20, fontWeight: '700', color: '#62796F'},
  badgeCard: {backgroundColor: '#FFF8E6', borderColor: '#E4D4A8', borderWidth: 2},
  badgeHeading: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16},
  medal: {width: 81, height: 87, backgroundColor: '#E3ECE0', borderRadius: 25, borderWidth: 2, borderBottomWidth: 5, borderColor: '#B3C5B7', alignItems: 'center', justifyContent: 'center'},
  medalEarned: {backgroundColor: '#FFE29B', borderColor: '#D3AC58'},
  shards: {flexDirection: 'row', alignItems: 'center', gap: 10},
  progress: {height: 12, borderRadius: 9, backgroundColor: '#DFE8D8', overflow: 'hidden'},
  progressFill: {height: 12, backgroundColor: '#418E78', borderRadius: 9},
  footnote: {fontSize: 13, lineHeight: 21, color: '#ADCBD0'},
});
