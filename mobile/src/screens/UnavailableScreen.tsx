import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function UnavailableScreen({ navigation }: { navigation: any }) {
  return <View style={styles.page}>
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>Tính năng chưa mở</Text>
      <Text style={styles.body}>Milo đang được hoàn thiện để học cùng cha mẹ. Chức năng này chưa sẵn sàng trong bản thử nghiệm nội bộ.</Text>
      <Text style={styles.body}>Ứng dụng chưa cung cấp dịch vụ gửi cảnh báo, định vị hay cứu hộ từ xa.</Text>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('WorldMap')} style={styles.button}>
        <Text style={styles.label}>Về trang học</Text>
      </Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F1F5F9', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#0F172A' },
  body: { fontSize: 17, lineHeight: 26, color: '#334155' },
  button: { minHeight: 52, backgroundColor: '#004E89', borderRadius: 16, padding: 16 },
  label: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
});
