import React, { useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
export const Action = ({ label, onPress, disabled = false, secondary = false }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    secondary?: boolean;
}) => (<TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondary, disabled && s.disabled]}>
    <Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text>
  </TouchableOpacity>);
export function Frame({ title, children, focusKey, game=false }: {
    title: string;
    children: React.ReactNode;
    focusKey?: string;
    game?: boolean;
}) {
    const scroll = useRef<ScrollView>(null), heading = useRef<any>(null);
    useEffect(() => {
        scroll.current?.scrollTo({ y: 0, animated: false });
        if (Platform.OS === 'web' && focusKey !== undefined) {
            heading.current?.setAttribute?.('tabindex', '-1');
            heading.current?.focus?.();
        }
    }, [focusKey]);
    return <SafeAreaView style={[s.root,game&&{backgroundColor:'#102641'}]}><ScrollView ref={scroll} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled"><View style={s.content}>
    <Text style={[s.brand,game&&{color:'#FFD76C',letterSpacing:2}]}>MILO · {game?'HỌC VIỆN THÁM HIỂM':'HỌC CÙNG CHA MẸ'}</Text><Text ref={heading} accessibilityRole="header" style={[s.title,game&&{color:'#FFFFFF',fontWeight:'900'}]}>{title}</Text>{children}
  </View></ScrollView></SafeAreaView>;
}
export const Notice = ({ text }: {
    text: string;
}) => <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.notice}>{text}</Text>;
export function errorMessage(e: any): string {
    switch (e?.response?.status) {
        case 400:
        case 422: return 'Dữ liệu chưa hợp lệ. Kiểm tra thông tin hoặc tải lại bài.';
        case 401: return 'Phiên đăng nhập đã hết hoặc mật khẩu chưa đúng. Vui lòng đăng nhập lại.';
        case 403: return 'Chưa có quyền mở hồ sơ hoặc chưa hoàn thành bài trước.';
        case 404: return 'Bài hoặc hồ sơ không còn khả dụng. Hãy tải lại danh sách.';
        case 409: return 'Đề đã thay đổi hoặc chưa sẵn sàng. Giữ bài cũ để đối chiếu và tải đề mới.';
        case 429: return 'Đã có nhiều yêu cầu. Vui lòng đợi rồi thử lại.';
        case 503: return 'Chức năng chưa được mở trên máy chủ này.';
        default: return e?.response ? 'Máy chủ chưa xử lý được. Bài trên thiết bị vẫn được giữ.' : 'Chưa kết nối được hoặc chưa đọc được dữ liệu. Hãy thử lại.';
    }
}
export const s = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F5F7F4' }, scroll: { flexGrow: 1, padding: 16 }, content: { width: '100%', maxWidth: 860, alignSelf: 'center', gap: 16, paddingBottom: 32 }, brand: { fontSize: 14, fontWeight: '700', color: '#174B70' }, title: { fontSize: 28, fontWeight: '700', color: '#142B3D' }, heading: { fontSize: 20, fontWeight: '700', color: '#142B3D' }, body: { fontSize: 18, lineHeight: 28, color: '#243E50' }, small: { fontSize: 14, lineHeight: 22, color: '#40576A' }, card: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#CCD8DF', padding: 20, gap: 16 }, section: { gap: 16 }, button: { minHeight: 52, padding: 16, borderRadius: 14, backgroundColor: '#174B70', alignItems: 'center', justifyContent: 'center' }, buttonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' }, secondary: { backgroundColor: '#E8F0F5', borderWidth: 1, borderColor: '#A9BDC9' }, secondaryText: { color: '#174B70' }, disabled: { opacity: 0.55 }, notice: { fontSize: 17, lineHeight: 26, color: '#6A3600', backgroundColor: '#FFF1D6', padding: 16, borderRadius: 12 }, milo: { height: 160, width: 160, resizeMode: 'contain', alignSelf: 'center' }, option: { minHeight: 56, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: '#C4D2DA', backgroundColor: '#FFFFFF' }, chosen: { borderColor: '#174B70', backgroundColor: '#E8F3FA' }, explanation: { padding: 16, borderRadius: 12, backgroundColor: '#EDF5ED', gap: 8 }, score: { fontSize: 36, fontWeight: '700', color: '#174B70' }, input: { fontSize: 18, minHeight: 52, padding: 12, borderWidth: 1, borderColor: '#8199A9', borderRadius: 10, color: '#142B3D', backgroundColor: '#FFFFFF' } });
