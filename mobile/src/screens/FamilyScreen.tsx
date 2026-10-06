import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action, Frame, Notice, s, errorMessage } from '../components/LearningUI';
import { familyRequest, setActiveChild } from '../services/api';
import { downloadJson } from '../services/exportFile';
type Child = {
    id: string;
    nickname: string;
    age: number;
    totalSafetyScore: number;
    totalBadges: number;
};
type Family = {
    id: string;
    login: string;
    children: Child[];
};
function Field({ label, value, onChange, secret = false }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    secret?: boolean;
}) {
    return <View style={{ gap: 8 }}><Text style={s.body}>{label}</Text><TextInput accessibilityLabel={label} style={s.input} value={value} onChangeText={onChange} secureTextEntry={secret} autoCapitalize="none" autoCorrect={false}/></View>;
}
export function FamilyScreen({ navigation, route }: any) {
    const [family, setFamily] = useState<Family | null>(null), [busy, setBusy] = useState(true), [error, setError] = useState('');
    const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
    const [login, setLogin] = useState(''), [password, setPassword] = useState(''), [next, setNext] = useState(''), [code, setCode] = useState(''), [recovery, setRecovery] = useState('');
    const [nickname, setNickname] = useState(''), [age, setAge] = useState('7'), [consent, setConsent] = useState(false), [confirmDelete, setConfirmDelete] = useState('');
    const [history, setHistory] = useState<any[] | null>(null), [status, setStatus] = useState('');
    const [feedback,setFeedback]=useState(''),[category,setCategory]=useState('CONTENT');
    const report=route?.params?.report;
    useEffect(() => { familyRequest<Family>('me').then(setFamily).catch(e => { if (e?.response?.status !== 401)
        setError(errorMessage(e)); }).finally(() => setBusy(false)); }, []);
    async function run(action: () => Promise<void>) {
        if (busy)
            return;
        setBusy(true);
        setError('');
        setStatus('');
        try {
            await action();
        }
        catch (e) {
            setError(errorMessage(e));
        }
        finally {
            setBusy(false);
        }
    }
    async function clearLocal(children: Child[]) {
        const prefixes = children.flatMap(c => [`milo_draft_v1:${c.id}:`, `milo_pending_v2:${c.id}`]);
        const keys = await AsyncStorage.getAllKeys();
        await Promise.all(keys.filter(k => prefixes.some(p => k === p || (p.endsWith(':') && k.startsWith(p)))).map(k => AsyncStorage.removeItem(k)));
    }
    async function signOut() {
        await familyRequest('logout', {});
        setActiveChild('');
        setFamily(null);
        setPassword('');
        setHistory(null);
        setRecovery('');
        // Explicitly disclosed: local drafts disappear on sign out; server records remain.
        if (family)
            await clearLocal(family.children);
    }
    const auth = () => run(async () => {
        if (mode === 'register' && !consent) {
            setError('Cần phụ huynh đọc thông tin dữ liệu và đồng ý trước khi tạo tài khoản.');
            return;
        }
        const result = await familyRequest(mode, { login, password, ...(mode === 'recover' ? { code } : {}) });
        setPassword('');
        setCode('');
        if (result.recoveryCode)
            setRecovery(result.recoveryCode);
        if (mode === 'recover') {
            setMode('login');
            setStatus('Đã đổi mật khẩu và thu hồi các phiên cũ. Hãy giữ mã mới và đăng nhập.');
        }
        else
            setFamily(await familyRequest<Family>('me'));
    });
    return <Frame title={family ? 'Góc cha mẹ' : 'Gia đình cùng học với Milo'} focusKey={recovery?'recovery':confirmDelete||error||status||undefined}>
    {busy ? <ActivityIndicator accessibilityLabel="Đang xử lý"/> : null}{error ? <Notice text={error}/> : null}{status ? <Notice text={status}/> : null}
    {recovery ? <View style={s.card}><Text style={s.heading}>Giữ mã khôi phục ở nơi riêng</Text><Text style={s.body}>Mã chỉ hiện ở bước này. Ai có mã và tên đăng nhập có thể đổi mật khẩu. Không chia sẻ với trẻ hoặc gửi trong phản hồi.</Text><Text selectable style={s.body}>{recovery}</Text><Action secondary label="Tải mã khôi phục" onPress={() => { downloadJson('milo-recovery.json', { login: family?.login || login, recoveryCode: recovery }); }}/><Action label="Tôi đã lưu mã riêng" onPress={() => setRecovery('')}/></View> : null}
    {!family ? <View style={s.card}>
      <Text style={s.body}>Milo giúp trẻ 7–10 tuổi học qua tình huống ngắn cùng cha mẹ. Không cung cấp cứu hộ tự động.</Text>
      <Text style={s.small}>Dùng tên đăng nhập và biệt danh, không cần họ tên, email, ảnh hoặc vị trí của trẻ. Máy chủ lưu hồ sơ, bài làm và tiến độ tới khi bạn xóa. Bản nháp trên máy được xóa khi đăng xuất. Có thể tải hoặc xóa dữ liệu trong góc cha mẹ; bản sao lưu vận hành cần xử lý theo thông báo của đơn vị triển khai.</Text>
      <Field label="Tên đăng nhập (4–40 chữ, số, dấu . _ -)" value={login} onChange={setLogin}/>
      <Field label={mode === 'recover' ? 'Mật khẩu mới (ít nhất 12 ký tự)' : 'Mật khẩu (ít nhất 12 ký tự)'} value={password} onChange={setPassword} secret/>
      {mode === 'recover' ? <Field label="Mã khôi phục" value={code} onChange={setCode} secret/> : null}
      {mode === 'register' ? <Action secondary label={consent ? 'Đã đồng ý — tôi là phụ huynh/người giám hộ' : 'Tôi là phụ huynh/người giám hộ và đồng ý lưu dữ liệu nêu trên'} onPress={() => setConsent(!consent)}/> : null}
      <Action label={mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản gia đình' : 'Khôi phục tài khoản'} disabled={busy || !!recovery} onPress={auth}/>
      <Action secondary label={mode === 'register' ? 'Đã có tài khoản' : 'Tạo tài khoản mới'} disabled={busy} onPress={() => setMode(mode === 'register' ? 'login' : 'register')}/>
      <Action secondary label={mode === 'recover' ? 'Trở lại đăng nhập' : 'Quên mật khẩu — dùng mã khôi phục'} disabled={busy} onPress={() => setMode(mode === 'recover' ? 'login' : 'recover')}/>
    </View> : <>
      {confirmDelete ? <View style={s.card}><Notice text="Xóa vĩnh viễn hồ sơ và bài làm liên quan trên máy chủ. Cần mật khẩu phụ huynh trong phần thao tác bên dưới. Tải bản sao trước nếu muốn giữ."/><Action label="Xác nhận xóa vĩnh viễn" disabled={busy} onPress={() => run(async () => {
                    if (confirmDelete === 'family') {
                        await familyRequest('delete', { password });
                        await clearLocal(family.children);
                        setActiveChild('');
                        setFamily(null);
                        setPassword('');
                    }
                    else {
                        await familyRequest('delete-child', { password, childId: confirmDelete });
                        await clearLocal(family.children.filter(c => c.id === confirmDelete));
                        setFamily(await familyRequest('me'));
                    }
                    setConfirmDelete('');
                    setHistory(null);
                })}/><Action secondary label="Hủy xóa" onPress={() => setConfirmDelete('')}/></View> : null}

      <Text style={s.body}>Gia đình: {family.login}. Chọn một hồ sơ để học.</Text>
      {!family.children.length ? <Notice text="Chưa có hồ sơ. Phụ huynh tạo một biệt danh ở bên dưới."/> : null}
      {family.children.map(c => <View key={c.id} style={s.card}><Text style={s.heading}>{c.nickname} · {c.age} tuổi</Text><Text style={s.body}>{c.totalSafetyScore} XP học tập · {c.totalBadges} huy hiệu</Text>
        <Action label={'Học cùng ' + c.nickname} disabled={busy || !!recovery} onPress={() => { setPassword(''); setActiveChild(c.id); navigation.replace('WorldMap'); }}/>
        <Action secondary label={'Xem 50 bài gần nhất của ' + c.nickname} disabled={busy} onPress={() => run(async () => { setHistory(await familyRequest('history', { childId: c.id, password })); })}/>
        <Action secondary label={'Xóa hồ sơ ' + c.nickname} disabled={busy} onPress={() => setConfirmDelete(c.id)}/>
      </View>)}
      <View style={s.card}><Text style={s.heading}>Thao tác dành cho cha mẹ</Text><Text style={s.small}>Nhập lại mật khẩu để xem lịch sử, thêm/xóa hồ sơ hoặc xuất dữ liệu.</Text>
        <Field label="Mật khẩu phụ huynh" value={password} onChange={setPassword} secret/>
        <Text style={s.heading}>Báo lỗi hoặc góp ý</Text>
        <Text style={s.small}>Không ghi họ tên, địa chỉ, ảnh hoặc thông tin riêng của trẻ. Phản hồi được lưu cho người vận hành; đây không phải kênh cứu hộ.</Text>
        {report?<Text style={s.body}>Bài liên quan: {report.title}</Text>:null}
        <Action secondary label={category==='CONTENT'?'Đã chọn: Nội dung bài':'Nội dung bài'} onPress={()=>setCategory('CONTENT')}/>
        <Action secondary label={category==='TECHNICAL'?'Đã chọn: Lỗi ứng dụng':'Lỗi ứng dụng'} onPress={()=>setCategory('TECHNICAL')}/>
        <Action secondary label={category==='USABILITY'?'Đã chọn: Chỗ khó sử dụng':'Chỗ khó sử dụng'} onPress={()=>setCategory('USABILITY')}/>
        <Field label="Mô tả ngắn (5–1000 ký tự)" value={feedback} onChange={setFeedback}/>
        <Action secondary label="Gửi phản hồi" disabled={busy} onPress={()=>run(async()=>{const saved=await familyRequest('feedback',{password,category,message:feedback,...(report?{checkpointId:report.checkpointId,contentVersion:report.contentVersion}:{})});setFeedback('');setStatus('Máy chủ đã nhận phản hồi. Mã đối chiếu: '+saved.id);})}/>
        <Field label="Biệt danh hồ sơ mới (không dùng họ tên thật)" value={nickname} onChange={setNickname}/><Field label="Tuổi (7–10)" value={age} onChange={setAge}/>
        <Action label="Thêm hồ sơ" disabled={busy || family.children.length >= 5} onPress={() => run(async () => { await familyRequest('children', { nickname, age: Number(age), password }); setNickname(''); setFamily(await familyRequest('me')); })}/>
        <Action secondary label="Tải bản sao dữ liệu gia đình" disabled={busy} onPress={() => run(async () => { const data = await familyRequest('export', { password }); if (!downloadJson('milo-family-data.json', data))
            throw Error('Web only'); setStatus('Đã tạo tệp tải xuống. Giữ tệp riêng vì có bài làm của gia đình.'); })}/>
        <Field label="Mật khẩu mới (ít nhất 12 ký tự)" value={next} onChange={setNext} secret/>
        <Action secondary label="Đổi mật khẩu và đăng xuất mọi phiên" disabled={busy} onPress={() => run(async () => { await familyRequest('password', { password, next }); await clearLocal(family.children); setFamily(null); setActiveChild(''); setPassword(''); setNext(''); setStatus('Đã đổi mật khẩu. Hãy đăng nhập lại.'); })}/>
        <Text style={s.small}>Đăng xuất sẽ xóa bài nháp và bài chờ trên máy này. Hãy gửi hoặc tải bản sao bài chờ trước.</Text>
        <Action secondary label="Đăng xuất và xóa bản nháp trên máy" disabled={busy} onPress={() => run(signOut)}/>
        <Action secondary label="Xóa toàn bộ tài khoản gia đình" disabled={busy} onPress={() => setConfirmDelete('family')}/>
      </View>
      {history ? <View style={s.card}><Text style={s.heading}>Lịch sử bài làm</Text>{!history.length ? <Text style={s.body}>Chưa có bài được máy chủ nhận.</Text> : null}{history.map(r => {
                    let snapshot: any = null;
                    try {
                        snapshot = JSON.parse(r.contentSnapshot || 'null');
                    }
                    catch { }
                    return <View key={r.id} style={s.explanation}><Text style={s.heading}>{snapshot?.title || 'Bài học phiên bản cũ'}</Text><Text style={s.body}>{r.score}% · {r.isPassed ? 'Đạt' : 'Cần xem lại'} · {new Date(r.createdAt).toLocaleString('vi-VN')}</Text></View>;
                })}<Action secondary label="Đóng lịch sử" onPress={() => setHistory(null)}/></View> : null}
    </>}
    <Text style={s.small}>Chỉ bài có phiên bản được duyệt mới xuất hiện với hồ sơ gia đình. Nếu chưa có bài, nội dung vẫn đang chuẩn bị.</Text>
  </Frame>;
}
