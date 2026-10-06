import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { fetchJourneyMap, fetchCheckpointDetails, submitTestAnswers, CURRENT_USER_ID, INTERNAL_PREVIEW } from '../services/api';
import { readPending, savePending, syncPending, acknowledgePending, newAttemptId, PendingAttempt } from '../services/attemptQueue';
import { voiceService } from '../services/voice';
import { JourneyMapData, CheckpointDetailData, AnswerItemPayload, TestSubmissionResult } from '../types/curriculum';
import { OnboardingScreenProps, WorldMapScreenProps, QuestTestScreenProps } from '../types/navigation';
import { Action, Frame, Notice, s, errorMessage as message } from '../components/LearningUI';
import { readDraft, saveDraft, clearDraft, matchesDraft, LessonDraft, acquireDraftLease } from '../services/lessonDraft';
import { downloadJson } from '../services/exportFile';
import {JourneyMap} from '../components/game/JourneyMap';
import {GameShell,GameButton,ink,k} from '../components/game/GameKit';
import {LessonScene} from '../components/game/LessonScene';
import {MiloCompanion} from '../components/game/MiloCompanion';
import {ExperienceSettings} from '../components/game/ExperienceSettings';
import {ResultSummary} from '../components/game/ResultSummary';
import {GameDock} from '../components/game/GameDock';
import {GameOverlay} from '../components/game/GameOverlay';
import {ExplorerArcade} from '../components/game/ExplorerArcade';
import {InteractiveChallenge} from '../components/game/InteractiveChallenge';
import {MotionReveal} from '../components/game/GameMotion';
import {useGameFeedback} from '../services/gameFeedback';
import {Search,Settings2,RotateCw,Users,Check,Volume2,ChevronDown} from 'lucide-react-native';
const u=StyleSheet.create({toolbar:{flexDirection:'row',gap:6,alignItems:'center',justifyContent:'space-between'},preview:{fontSize:11,lineHeight:17,color:'#AFD2D8',flex:1},tools:{flexDirection:'row',gap:4},tool:{minWidth:44,minHeight:44,borderRadius:14,backgroundColor:'#24495E',alignItems:'center',justifyContent:'center'},footnote:{fontSize:12,lineHeight:19,color:'#A9CBD0'},progressTrack:{height:7,backgroundColor:'#355266',borderRadius:7,overflow:'hidden'},progressFill:{height:7,backgroundColor:ink.gold,borderRadius:7},genericScene:{padding:20,alignItems:'center',backgroundColor:'#E1F2E9'},sceneCard:{backgroundColor:ink.paper,borderRadius:23,overflow:'hidden',borderWidth:2,borderColor:'#D7ECE0'},questionHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:6},questionTag:{fontSize:11,fontWeight:'900',letterSpacing:1.4,color:ink.teal},voice:{flexDirection:'row',alignItems:'center',gap:6,minHeight:44,paddingHorizontal:8},choice:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderWidth:2,borderBottomWidth:4,borderColor:'#D8E1D7',borderRadius:18,backgroundColor:'#FFFFFF',minHeight:62},choiceSelected:{borderColor:'#27877B',backgroundColor:'#E5F5EB'},letter:{width:32,height:32,borderRadius:11,backgroundColor:'#EEF3EB',alignItems:'center',justifyContent:'center'},letterText:{fontSize:16,fontWeight:'900',color:'#668176'},skip:{minHeight:44,alignItems:'center',justifyContent:'center'},skipText:{fontSize:14,color:ink.muted,textDecorationLine:'underline'},feedback:{backgroundColor:'#E1F1E5',borderRadius:16,padding:16,gap:8}});
export const WelcomeScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
    const [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const start = async () => { setBusy(true); try {
        await AsyncStorage.setItem('milo_has_onboarded_v1', 'true');
        navigation.replace('WorldMap');
    }
    catch {
        setError('Chưa lưu được lựa chọn. Hãy thử lại.');
    }
    finally {
        setBusy(false);
    } };
    return <Frame game title="Cùng Milo bước vào hành trình khám phá"><Image source={require('../../assets/milo_rescue_pup.png')} style={s.milo} accessible={false}/><View style={s.card}><Text style={s.body}>Cùng Milo đọc tình huống, chọn cách xử lý và tìm hiểu lời giải.</Text><Text style={s.body}>Bản thử nội bộ dành cho người xây dựng sản phẩm. Nội dung chưa được chuyên gia duyệt để dùng với trẻ.</Text><Text style={s.small}>Bản này cần mạng để tải và chấm bài. Không có tính năng cứu hộ hoặc tự xác nhận môi trường an toàn.</Text></View>{error ? <Notice text={error}/> : null}<Action label={busy ? 'Đang mở…' : 'Vào bản học thử'} disabled={busy} onPress={start}/></Frame>;
};
export const LearningHomeScreen: React.FC<WorldMapScreenProps> = ({ navigation }) => {
    const focused=useIsFocused();
    const feedback=useGameFeedback(focused);
    const [showSearch,setShowSearch]=useState(false),[showSettings,setShowSettings]=useState(false),[overlay,setOverlay]=useState<'play'|'practice'|'tour'|null>(null);
    const [data, setData] = useState<JourneyMapData | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [pending, setPending] = useState<PendingAttempt[]>([]), [syncing, setSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const active = useRef(true), generation = useRef(0);
    const load = useCallback(async () => { const run = ++generation.current; setLoading(true); setError(''); try {
        const next = await fetchJourneyMap();
        if (active.current && run === generation.current)
            setData(next);
    }
    catch (e) {
        if (active.current && run === generation.current)
            setError(message(e));
    }
    finally {
        if (active.current && run === generation.current)
            setLoading(false);
    } }, []);
    const sync = async (attemptId?: string) => { setSyncing(true); try {
        await syncPending(CURRENT_USER_ID, attemptId);
        const p = await readPending(CURRENT_USER_ID);
        if (active.current)
            setPending(p);
        await load();
    }
    catch {
        if (active.current)
            setError('Chưa đọc được hàng đợi. Không tự xóa bài làm.');
    }
    finally {
        if (active.current)
            setSyncing(false);
    } };
    useFocusEffect(useCallback(() => { active.current = true; load(); readPending(CURRENT_USER_ID).then(p => { if (active.current)
        setPending(p); }).catch(() => { if (active.current)
        setError('Chưa đọc được bài chờ gửi.'); }); return () => { active.current = false; generation.current++; }; }, [load]));
    useFocusEffect(useCallback(()=>{
        let cancelled=false,delay=3000,timer:ReturnType<typeof setTimeout>;
        const userId=CURRENT_USER_ID;
        const tick=async()=>{
            try{
                const before=await readPending(userId);
                if(cancelled)return;
                if(before.some(p=>!p.blocked) && (typeof navigator==='undefined'||navigator.onLine!==false)){
                    await syncPending(userId);
                    const after=await readPending(userId);
                    if(!cancelled){setPending(after);if(after.length<before.length)await load();}
                }
            }catch{/* Keep storage intact; the manual action displays recovery errors. */}
            if(!cancelled){delay=Math.min(delay*2,60000);timer=setTimeout(tick,delay);}
        };
        const online=()=>{clearTimeout(timer);if(!cancelled){delay=3000;timer=setTimeout(tick,100);}};
        timer=setTimeout(tick,delay);
        if(typeof window!=='undefined')window.addEventListener('online',online);
        return()=>{cancelled=true;clearTimeout(timer);if(typeof window!=='undefined')window.removeEventListener('online',online);};
    },[load]));
    const open = (id: string, title: string, zone: string) => navigation.navigate('QuestTest', { checkpointId: id, lessonTitle: title, zoneTitle: zone, themeColor: '#174B70' });
    const next = data?.zones.flatMap(z => z.stages.flatMap(st => st.lessons.map(l => ({ z, l })))).find(({ z, l }) => z.isUnlocked && l.status !== 'LOCKED' && l.status !== 'COMPLETED' && l.checkpointIds?.length);
    const nextId = next?.l.checkpointIds?.find(id => !next.l.completedCheckpointIds?.includes(id));
    const reviewLessons=data?.zones.flatMap(z=>z.stages.flatMap(st=>st.lessons.filter(l=>l.status==='COMPLETED'&&l.isAvailable!==false).map(l=>({z,l}))))||[];
    return <GameShell onTap={()=>void feedback.tap()} dock={<GameDock onMap={()=>{setOverlay(null);setShowSettings(false);}} onCollection={()=>navigation.navigate('Inventory')} onPlay={()=>{setShowSettings(false);setOverlay('play');}} onSettings={()=>{setOverlay(null);setShowSettings(true);}}/>} title="Lên đường cùng Milo" subtitle="MỘT NGÀY · MỘT KHÁM PHÁ" right={data?<View style={k.pill}><Text style={k.pillText}>{data.user.totalSafetyScore} XP</Text></View>:undefined}>
      <View style={u.toolbar}><Text style={u.preview}>{INTERNAL_PREVIEW?'Bản nội bộ · Chờ duyệt nội dung':'Hành trình của gia đình'}</Text><View style={u.tools}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mở tìm kiếm bài" onPress={()=>{if(showSearch)setSearch('');setShowSearch(!showSearch);}} style={u.tool}><Search size={19} color="#CEEAE5"/></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tải lại danh sách bài" disabled={loading} onPress={load} style={u.tool}><RotateCw size={18} color="#CEEAE5"/></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tùy chọn trải nghiệm" onPress={()=>setShowSettings(!showSettings)} style={u.tool}><Settings2 size={19} color="#CEEAE5"/></TouchableOpacity>
        {!INTERNAL_PREVIEW?<TouchableOpacity accessibilityRole="button" accessibilityLabel="Góc cha mẹ / đổi hồ sơ" onPress={()=>navigation.replace('Family')} style={u.tool}><Users size={20} color="#CEEAE5"/></TouchableOpacity>:null}
      </View></View>
      {showSearch?<TextInput accessibilityLabel="Tìm bài theo tên hoặc chủ đề" placeholder="Tìm trong tất cả chủ đề…" value={search} onChangeText={setSearch} style={s.input}/>:null}
      <GameOverlay title="Tùy chọn trải nghiệm" visible={showSettings} onClose={()=>setShowSettings(false)}>{showSettings?<ExperienceSettings active={focused} onClose={()=>setShowSettings(false)}/>:null}</GameOverlay>
      <GameOverlay title={overlay==='play'?'Sân chơi':overlay==='practice'?'Ôn tập cùng Milo':'Cách chơi'} visible={overlay!==null} onClose={()=>setOverlay(null)}>
        {overlay==='play'?<ExplorerArcade active={focused} onClose={()=>setOverlay(null)} onFeedback={event=>{if(event==='complete')void feedback.confirm();else if(event==='move')void feedback.tap();}}/>:null}
        {overlay==='practice'?<><MiloCompanion state="thinking" size={105} active={focused}/><Text style={k.body}>Chọn một bài đã hoàn thành để ôn lại. Điểm thưởng của cùng bài không cộng thêm khi học lại.</Text>{reviewLessons.length?reviewLessons.map(({z,l})=><GameButton key={l.id} secondary label={'Ôn lại: '+l.title} onPress={()=>{setOverlay(null);open(l.checkpointIds![0],l.title,z.title);}}/>):<Text style={k.body}>Chưa có bài hoàn thành. Hãy bắt đầu một chặng trên bản đồ; bài đã học sẽ xuất hiện ở đây.</Text>}</>:null}
        {overlay==='tour'?<><MiloCompanion state="guiding" size={120} active={focused}/><Text style={k.heading}>1. Chạm đảo để bắt đầu</Text><Text style={k.body}>Đảo có màu là nhiệm vụ đã mở. Con có thể dừng và tiếp tục bài đang làm.</Text><Text style={k.heading}>2. Quan sát, chọn, hiểu vì sao</Text><Text style={k.body}>Chạm dấu + trong tranh, chọn hành động rồi xác nhận để xem lời giải.</Text><Text style={k.heading}>3. Ghé ba lô và sân chơi</Text><Text style={k.body}>Ba lô giữ dấu mốc học tập. Sân chơi có đường về trại để con thử quan sát, không tính điểm bài học.</Text><GameButton label="Mình đã sẵn sàng" onPress={()=>setOverlay(null)}/></>:null}
      </GameOverlay>
      {error?<Notice text={error}/>:null}{loading?<ActivityIndicator accessibilityLabel="Đang tải bài" color={ink.gold}/>:null}
      {next&&nextId?<GameButton label={'Tiếp tục: '+next.l.title} onPress={()=>open(nextId,next.l.title,next.z.title)}/>:null}
      {pending.length?<View style={k.card}><Text style={k.heading}>{pending.length} bài chờ xử lý</Text>{pending.map((p,i)=><View key={p.attemptId} style={{gap:8}}><Text style={k.body}>{p.title||('Bài '+(i+1))}: {p.lastError||'Đã lưu trên thiết bị, chưa xác nhận điểm.'}</Text><Text selectable style={k.small}>Mã đối chiếu: {p.attemptId}</Text><GameButton secondary label={'Kiểm tra và gửi lại bài '+(i+1)} disabled={syncing} onPress={()=>sync(p.attemptId)}/><GameButton secondary label={'Tải bản sao bài '+(i+1)} onPress={()=>{if(!downloadJson('milo-attempt-'+p.attemptId+'.json',p))setError('Tải bản sao hiện hỗ trợ trên web.');}}/></View>)}<GameButton label={syncing?'Đang gửi…':'Gửi lại các bài có thể đồng bộ'} disabled={syncing} onPress={()=>sync()}/></View>:null}
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><View style={{flex:1,minWidth:110}}><GameButton secondary compact silent label={feedback.soundEnabled?'Tắt âm thanh':'Bật âm thanh'} onPress={()=>void feedback.setSoundEnabled(!feedback.soundEnabled)}/></View><View style={{flex:1,minWidth:110}}><GameButton secondary compact label="Ôn tập" onPress={()=>setOverlay('practice')}/></View><GameButton secondary compact label="Cách chơi" onPress={()=>setOverlay('tour')}/></View>
      {feedback.soundEnabled&&feedback.needsGesture?<GameButton secondary silent label={feedback.preparing?'Đang chuẩn bị âm thanh…':'Nghe thử âm thanh'} disabled={!feedback.ready} onPress={()=>void feedback.testSound()}/>:null}
      {feedback.error?<Notice text={feedback.error}/>:null}
      {data?<JourneyMap data={data} search={search} open={open} active={focused&&!overlay&&!showSettings} onCollection={()=>navigation.navigate('Inventory')}/>:null}
      {data?.zones.length===0?<Notice text="Chưa có nội dung học trong môi trường này."/>:null}
      {data?<Text style={u.footnote}>{data.user.totalSafetyScore} XP học tập · {data.user.totalBadges} huy hiệu · {data.user.completionRate}% số bài hoàn thành</Text>:null}
      <Text style={u.footnote}>XP ghi nhận việc học, không xác nhận năng lực cứu hộ.{INTERNAL_PREVIEW?' Chỉ người lớn kiểm tra bản nội bộ; không nhập dữ liệu trẻ thật.':''}</Text>
    </GameShell>;
};
export const LessonScreen: React.FC<QuestTestScreenProps> = ({ navigation, route }) => {
    const focused=useIsFocused();
    const feedback=useGameFeedback(focused);
    const [sceneReady,setSceneReady]=useState(false),[showReview,setShowReview]=useState(false),[showPractice,setShowPractice]=useState(false),[showSources,setShowSources]=useState(false);
    const id = route.params.checkpointId;
    const lease=useRef<(()=>void)|null>(null);
    const [voiceAvailable,setVoiceAvailable]=useState(voiceService.isAvailable());
    useEffect(()=>voiceService.subscribeAvailability(()=>setVoiceAvailable(voiceService.isAvailable())),[]);
    const [data, setData] = useState<CheckpointDetailData | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [answers, setAnswers] = useState<AnswerItemPayload[]>([]), [index, setIndex] = useState(0), [selected, setSelected] = useState<string[]>([]), [confirmed, setConfirmed] = useState(false), [result, setResult] = useState<TestSubmissionResult | null>(null), [muted, setMuted] = useState(true);
    const attempt = useRef(newAttemptId()), frozen = useRef<PendingAttempt | null>(null), started = useRef(Date.now()), questionStarted = useRef(Date.now()), run = useRef(0), lock = useRef(false), answerLock = useRef(false);
    const [ready, setReady] = useState(false), [draftStatus, setDraftStatus] = useState(''), [oldDraft, setOldDraft] = useState<LessonDraft | null>(null), [reloadNeeded, setReloadNeeded] = useState(false);
    const load = useCallback(async () => {
        const version = ++run.current;
        setBusy(true);
        setReady(false);
        setSceneReady(false);
        setShowReview(false);
        setShowPractice(false);
        setShowSources(false);
        setError('');
        setData(null);
        setAnswers([]);
        setIndex(0);
        setSelected([]);
        setConfirmed(false);
        setResult(null);
        setOldDraft(null);
        setReloadNeeded(false);
        attempt.current = newAttemptId();
        frozen.current = null;
        lock.current = false;
        answerLock.current = false;
        try {
            if(!lease.current){
                const release=await acquireDraftLease(CURRENT_USER_ID,id);
                if(version!==run.current){release?.();return;}
                if(!release){setError('Bài này đang mở ở cửa sổ khác. Đóng bài bên đó rồi thử tải lại.');return;}
                lease.current=release;
            }
            const detail = await fetchCheckpointDetails(id);
            const draft = await readDraft(CURRENT_USER_ID, id);
            if (version !== run.current)
                return;
            if (!detail.questions.length)
                throw Error('empty');
            setData(detail);
            started.current = questionStarted.current = Date.now();
            if (draft) {
                if (!matchesDraft(draft, detail)) {
                    setOldDraft(draft);
                    setDraftStatus('Đề đã đổi. Tải bản sao bài cũ trước khi bắt đầu bản mới.');
                    return;
                }
                attempt.current = draft.attemptId;
                frozen.current = draft.frozen;
                started.current = draft.started;
                setAnswers(draft.answers);
                setIndex(draft.index);
                setSelected(draft.selected);
                setConfirmed(draft.confirmed);
                setSceneReady(draft.answers.length>0||draft.selected.length>0||draft.index>0);
                answerLock.current = draft.confirmed;
                setDraftStatus('Đã khôi phục bài đang làm trên thiết bị.');
            }
            setReady(true);
        }
        catch (e) {
            if (version === run.current)
                setError(message(e));
        }
        finally {
            if (version === run.current)
                setBusy(false);
        }
    }, [id]);
    const currentDraft = (): LessonDraft | null => data ? { userId: CURRENT_USER_ID, checkpointId: id, contentVersion: data.contentVersion, attemptId: attempt.current, answers, index, selected, confirmed, started: started.current, savedAt: Date.now(), frozen: frozen.current } : null;
    useEffect(() => {
        if (!ready || !data || result)
            return;
        let active = true;
        const draft = currentDraft();
        if (draft)
            saveDraft(draft).then(() => { if (active)
                setDraftStatus('Đã lưu bản nháp trên thiết bị.'); }).catch(() => { if (active)
                setError('Chưa lưu được bản nháp. Giữ màn hình và thử lại; không đóng trình duyệt.'); });
        return () => { active = false; };
    }, [ready, data, answers, index, selected, confirmed, result]);
    const leave = async () => {
        try {
            const draft = currentDraft();
            if (ready && !result && draft)
                await saveDraft(draft);
            voiceService.stop();
            navigation.navigate('WorldMap');
        }
        catch {
            setError('Chưa lưu được bài đang làm. Giữ màn hình và thử lại.');
        }
    };
    useEffect(() => { load(); return () => { run.current++; voiceService.stop();lease.current?.();lease.current=null; }; }, [load]);
    useEffect(() => { let active = true; AsyncStorage.getItem('milo_voice_muted_v1').then(v => { if (active) {
        const m = v !== 'false';
        setMuted(m);
        voiceService.setMuted(m);
    } }).catch(() => { }); return () => { active = false; }; }, []);
    useFocusEffect(useCallback(() => () => voiceService.stop(), []));
    const toggleVoice = async () => { try {
        await AsyncStorage.setItem('milo_voice_muted_v1', String(!muted));
        voiceService.setMuted(!muted);
        setMuted(!muted);
    }
    catch {
        setError('Chưa lưu được lựa chọn âm thanh.');
    } };
    const q = data?.questions[index];
    const confirm = (skip = false) => { if (!q || answerLock.current)
        return; answerLock.current = true; void feedback.confirm(); setAnswers(prev => [...prev, { questionId: q.id, ...(skip ? {} : q.questionType === 'DRAG_DROP_ORDER' ? { orderedOptionIds: selected } : { selectedOptionId: selected[0] }), responseTimeMs: Math.min(86400000, Date.now() - questionStarted.current) }]); setConfirmed(true); voiceService.stop(); };
    const submit = async () => { if (!data || lock.current)
        return; lock.current = true; setBusy(true); setError(''); const version = run.current; let stored = false; try {
        if (!frozen.current)
            frozen.current = { attemptId: attempt.current, checkpointId: id, userId: CURRENT_USER_ID, contentVersion: data.contentVersion, title: data.lessonTitle + ' — ' + data.title, answers, totalTimeTakenSeconds: Math.min(86400, Math.max(1, Math.round((Date.now() - started.current) / 1000))) };
        const p = frozen.current;
        await savePending(p);
        stored = true;
        const draft = currentDraft();
        if (draft)
            await saveDraft({ ...draft, frozen: p });
        const receipt = await submitTestAnswers(p.checkpointId, p.userId, p.answers, p.totalTimeTakenSeconds, p.attemptId, p.contentVersion);
        if (receipt.testResultId !== p.attemptId) throw new Error('Biên nhận không khớp.');
        try {
            await acknowledgePending(p.userId, p.attemptId);
        }
        catch { }
        if (version === run.current) {
            setResult(receipt);
            if(receipt.isPassed&&!receipt.contentRetired)void feedback.complete();
            setReady(false);
            try { await clearDraft(p.userId, id); }
            catch { setError('Điểm đã lưu trên máy chủ; chưa dọn được bản nháp trên máy. Gửi lại cùng bài không cộng thưởng lần nữa.'); }
        }
    }
    catch (e: any) {
        if (version === run.current && [404, 409].includes(e?.response?.status))
            setReloadNeeded(true);
        if (version === run.current)
            setError(stored ? message(e) + ' Bài làm đã lưu trên thiết bị, chưa có điểm được xác nhận.' : 'Chưa lưu được bài làm. Giữ màn hình này và thử lại.');
    }
    finally {
        if (version === run.current) {
            setBusy(false);
            lock.current = false;
        }
    } };
    const guide=data?.learningContent;
    const hasScene=guide?.presentation?.scene==='home-hot-cup';
    const observing=!!guide&&!sceneReady&&index===0&&!result;
    return <GameShell onTap={()=>void feedback.tap()} title={data?.lessonTitle||'Đang mở nhiệm vụ…'} subtitle={result?'DẤU MỐC MỚI':observing?'QUAN SÁT CÙNG MILO':'NHIỆM VỤ KHÁM PHÁ'} onBack={leave} focusKey={result?'result':observing?'observe':'question-'+index} right={data?<View style={k.pill}><Text style={k.pillText}>{result?'Đã lưu':(index+1)+' / '+data.questions.length}</Text></View>:undefined}>
      {error?<Notice text={error}/>:null}{busy?<ActivityIndicator accessibilityLabel="Đang xử lý" color={ink.gold}/>:null}
      {(!data||reloadNeeded)&&!busy?<GameButton label="Thử tải lại đề" onPress={load}/>:null}
      {oldDraft?<View style={k.card}><Text style={k.body}>{draftStatus}</Text><GameButton secondary label="Tải bản sao bài cũ" onPress={()=>downloadJson('milo-draft-'+oldDraft.attemptId+'.json',oldDraft)}/><GameButton label="Bỏ bản nháp cũ trên máy và bắt đầu đề mới" onPress={async()=>{try{await clearDraft(CURRENT_USER_ID,id);await load();}catch{setError('Chưa thay được bản nháp.');}}}/></View>:null}
      {result?<>
        <ResultSummary result={result} active={focused} onContinue={()=>navigation.navigate('WorldMap')}/>
        {!result.contentRetired?<GameButton secondary label={showReview?'Ẩn lời giải':'Xem lại các lựa chọn'} onPress={()=>setShowReview(!showReview)}/>:null}
        {showReview&&result.review?.map(question=><View key={question.questionId} style={k.card}><Text style={k.heading}>{question.prompt}</Text><Text style={k.body}>{question.isCorrect?'Lựa chọn đúng':'Cần xem lại'} · Bạn chọn: {question.selectedTexts.join(' → ')||'Chưa chọn'}</Text><Text style={k.body}>Đáp án: {question.correctTexts.join(' → ')}</Text><Text style={k.body}>{question.explanation}</Text></View>)}
        {guide&&!result.contentRetired?<><GameButton secondary label="Cùng cha mẹ thực hành" onPress={()=>setShowPractice(!showPractice)}/>{showPractice?<View style={k.card}><Text accessibilityRole="header" style={k.heading}>Một việc nhỏ sau bài học</Text><Text style={k.body}>{guide.activity}</Text><Text style={k.heading}>Kể lại theo cách của con</Text><Text style={k.body}>{guide.teachBack}</Text><Text style={k.small}>Không cần nhập chuyện riêng vào ứng dụng. Có thể dừng nếu không thoải mái.</Text></View>:null}</>:null}
        {guide&&!result.contentRetired?<><GameButton secondary label={showSources?'Ẩn nguồn dành cho người lớn':'Xem nguồn dành cho người lớn'} onPress={()=>setShowSources(!showSources)}/>{showSources?<View style={k.card}><Text accessibilityRole="header" style={k.heading}>Nguồn tham khảo</Text><Text style={k.small}>Dẫn nguồn không có nghĩa tổ chức đó chứng nhận Milo. Thông tin dưới đây để người lớn đối chiếu; màn này không mở trang ngoài.</Text>{guide.sources.map(source=><View key={source.url} style={{gap:5}}><Text style={[k.body,{fontWeight:'700'}]}>{source.publisher}</Text><Text style={k.body}>{source.title}</Text><Text selectable style={k.small}>{source.url}</Text></View>)}</View>:null}</>:null}
      </>:q&&ready?<>
        <View style={u.progressTrack} accessibilityRole="progressbar" accessibilityValue={{min:0,max:data!.questions.length,now:index}}><View style={[u.progressFill,{width:((index/data!.questions.length*100)+'%') as `${number}%`}]}/></View>
        {observing?<View style={[k.card,{padding:0,overflow:'hidden'}]}>
          {hasScene?<LessonScene interactive/>:<View style={u.genericScene}><MiloCompanion state="guiding" size={140} active={focused}/><Text style={[k.heading,{textAlign:'center'}]}>Cùng đọc tình huống</Text></View>}
          <View style={{padding:20,gap:15}}><Text accessibilityRole="header" style={k.heading}>Chuyện gì đang xảy ra?</Text><Text style={k.body}>{guide!.story}</Text><GameButton label="Sẵn sàng chọn" onPress={()=>{setSceneReady(true);questionStarted.current=Date.now();}}/></View>
        </View>:<>
          {hasScene?<View style={u.sceneCard}><LessonScene compact variant={confirmed?'help':'observe'}/></View>:null}
          <View style={k.card}><View style={u.questionHeading}><Text style={u.questionTag}>LỰA CHỌN {index+1}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={muted?'Bật đọc khi bấm Nghe':'Tắt giọng đọc'} accessibilityState={{disabled:!voiceAvailable}} disabled={!voiceAvailable} onPress={toggleVoice} style={u.voice}><Volume2 size={19} color={!muted&&voiceAvailable?ink.teal:ink.muted}/><Text style={k.small}>{muted?'Giọng đọc':'Đang bật'}</Text></TouchableOpacity></View>
            <Text accessibilityRole="header" style={k.heading}>{q.promptText}</Text>
            {!muted?<GameButton secondary label="Nghe câu hỏi" silent onPress={()=>{feedback.stop();voiceService.speakMilo(q.promptText,'THINKING');}}/>:null}
            {q.questionType==='DRAG_DROP_ORDER'?<Text style={k.small}>Chọn các bước theo thứ tự. Bấm lại để bỏ chọn.</Text>:null}
            <InteractiveChallenge question={q} contentVersion={data!.contentVersion} selected={selected} onChange={setSelected} disabled={confirmed} onFeedback={()=>void feedback.tap()}/>
            {!confirmed?<><GameButton label="Xác nhận lựa chọn" silent disabled={selected.length===0||(q.questionType==='DRAG_DROP_ORDER'&&selected.length!==q.options.length)} onPress={()=>confirm()}/><TouchableOpacity accessibilityRole="button" accessibilityLabel="Chưa biết — xem lời giải" onPress={()=>confirm(true)} style={u.skip}><Text style={u.skipText}>Chưa biết — xem lời giải</Text></TouchableOpacity></>:<><MotionReveal trigger={q.id+'-explanation'}><View style={u.feedback}><Text style={k.heading}>Vì sao?</Text><Text style={k.body}>{q.explanation||'Bài này chưa có lời giải.'}</Text></View></MotionReveal>{index<data!.questions.length-1?<GameButton label="Câu tiếp theo" onPress={()=>{setIndex(i=>i+1);setSelected([]);setConfirmed(false);answerLock.current=false;questionStarted.current=Date.now();}}/>:<GameButton label={busy?'Đang lưu…':'Gửi bài và xem kết quả'} disabled={busy} onPress={submit}/>}</>}
          </View>
        </>}
      </>:null}
      {draftStatus&&!result&&!oldDraft?<Text accessibilityLiveRegion="polite" style={u.footnote}>{draftStatus}</Text>:null}
      {!INTERNAL_PREVIEW&&data?<GameButton secondary label="Nhờ cha mẹ báo vấn đề ở bài này" onPress={async()=>{try{const draft=currentDraft();if(ready&&!result&&draft)await saveDraft(draft);navigation.replace('Family',{report:{checkpointId:id,contentVersion:data.contentVersion,title:data.lessonTitle}});}catch{setError('Chưa lưu được bài. Hãy thử lại.');}}}/>:null}
      {INTERNAL_PREVIEW?<Text style={u.footnote}>Bản thiết kế nội bộ · Nội dung và minh họa đang chờ chuyên gia duyệt.</Text>:null}
    </GameShell>;
};
