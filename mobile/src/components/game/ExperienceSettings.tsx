import React from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useExperiencePreferences, type ExperiencePreferenceKey } from '../../services/experiencePreferences';
import { useGameFeedback } from '../../services/gameFeedback';

export type ExperienceSettingsProps = {
  /** Enable only when the screen's actual sound/haptic adapter honors these settings. */
  soundEffectsAvailable?: boolean;
  hapticsAvailable?: boolean;
  active?: boolean;
  onClose?: () => void;
};

/** Inline panel; its parent owns sheet/modal navigation and focus management. */
export function ExperienceSettings({ soundEffectsAvailable = true, hapticsAvailable = Platform.OS !== 'web', active = true, onClose }: ExperienceSettingsProps) {
  const settings = useExperiencePreferences();
  const feedback = useGameFeedback(active);
  const rows: { key: ExperiencePreferenceKey; title: string; description: string; available: boolean }[] = [
    {
      key: 'reducedMotion', title: 'Giảm chuyển động', available: true,
      description: settings.systemReducedMotion
        ? 'Thiết bị đang bật giảm chuyển động. Milo luôn tôn trọng lựa chọn đó.'
        : 'Giữ Milo và cảnh ở trạng thái tĩnh để dễ tập trung.',
    },
    {
      key: 'soundEffects', title: 'Âm thanh hiệu ứng', available: soundEffectsAvailable,
      description: soundEffectsAvailable ? 'Âm nhẹ khi thao tác; tách riêng với giọng đọc.' : 'Chưa dùng trong bản thử này.',
    },
    {
      key: 'haptics', title: 'Rung nhẹ', available: hapticsAvailable,
      description: hapticsAvailable ? 'Phản hồi nhẹ khi thao tác trên thiết bị hỗ trợ.' : 'Rung nhẹ dành cho bản iOS và Android.',
    },
  ];
  return <View style={styles.panel}>
    <View style={styles.headingRow}>
      <Text accessibilityRole="header" style={styles.heading}>Theo nhịp của bạn</Text>
      {onClose && <Pressable accessibilityRole="button" accessibilityLabel="Đóng tùy chọn trải nghiệm" onPress={onClose} style={styles.close}><Text style={styles.closeText}>Đóng</Text></Pressable>}
    </View>
    <Text style={styles.intro}>Tùy chọn trên thiết bị này. Việc học không phụ thuộc âm thanh hay chuyển động.</Text>
    {rows.map(row => {
      const systemRequiresReduction = row.key === 'reducedMotion' && settings.systemReducedMotion;
      const disabled = !row.available || settings.loading || settings.loadFailed || systemRequiresReduction;
      return <View key={row.key} style={styles.row}>
        <View style={styles.copy}><Text style={styles.title}>{row.title}</Text><Text style={styles.description}>{row.description}</Text></View>
        <View style={styles.switchTarget}><Switch
          accessibilityLabel={row.title}
          accessibilityHint={row.description}
          disabled={disabled}
          value={row.key === 'reducedMotion' ? settings.effectiveReducedMotion : settings.preferences[row.key]}
          onValueChange={value => {
            if (row.key === 'soundEffects') void feedback.setSoundEnabled(value);
            else if (row.key === 'haptics') void feedback.setHapticsEnabled(value);
            else void settings.setPreference(row.key, value);
          }}
          trackColor={{ false: '#AFBCC4', true: '#307564' }}
          thumbColor="#FFFFFF"
        /></View>
      </View>;
    })}
    {soundEffectsAvailable && settings.preferences.soundEffects && <View style={styles.testArea}>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: feedback.preparing || !active }} disabled={feedback.preparing || !active}
        onPress={() => { void (feedback.ready ? feedback.testSound() : feedback.prepare()); }} style={[styles.retry, (feedback.preparing || !active) && { opacity: 0.5 }]}>
        <Text style={styles.retryText}>{feedback.preparing ? 'Đang chuẩn bị âm thanh…' : feedback.ready ? 'Thử âm thanh' : 'Tải lại âm thanh'}</Text>
      </Pressable>
      <Text style={styles.description}>Âm ngắn khi chạm và hoàn thành. Không có nhạc tự phát. Thiết bị ở chế độ im lặng có thể không phát âm.</Text>
    </View>}
    {hapticsAvailable && settings.preferences.haptics && <Pressable accessibilityRole="button" disabled={!active} onPress={() => { void feedback.testHaptics(); }} style={styles.retry}><Text style={styles.retryText}>Thử rung nhẹ</Text></Pressable>}
    {feedback.error && <Text accessibilityRole="alert" style={styles.errorText}>{feedback.error}</Text>}
    {settings.loading && <Text accessibilityLiveRegion="polite" style={styles.description}>Đang đọc tùy chọn…</Text>}
    {settings.saving && <Text accessibilityLiveRegion="polite" style={styles.description}>Đang lưu tùy chọn…</Text>}
    {settings.error && <View style={styles.error}>
      <Text accessibilityRole="alert" style={styles.errorText}>{settings.error}</Text>
      <Pressable accessibilityRole="button" onPress={() => { void (settings.loadFailed ? settings.retryLoad() : settings.retrySave()); }} style={styles.retry}><Text style={styles.retryText}>Thử lại</Text></Pressable>
      {settings.loadFailed && <Pressable accessibilityRole="button" onPress={() => { void settings.resetPreferences(); }} style={styles.retry}><Text style={styles.retryText}>Dùng tùy chọn mặc định</Text></Pressable>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  panel: { backgroundColor: '#FFFBF0', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E4D8BF', gap: 12 },
  headingRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  heading: { fontSize: 22, lineHeight: 30, fontWeight: '800', color: '#213D48', flex: 1, minWidth: 120 },
  intro: { fontSize: 16, lineHeight: 24, color: '#4C6269' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E5DDC9' },
  copy: { flex: 1, gap: 5 },
  title: { fontSize: 18, lineHeight: 26, fontWeight: '700', color: '#213D48' },
  description: { fontSize: 15, lineHeight: 23, color: '#4C6269' },
  switchTarget: { minWidth: 52, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  close: { minHeight: 48, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: '700', color: '#2D6858' },
  error: { padding: 12, backgroundColor: '#FFF0CE', borderRadius: 12, gap: 8 },
  errorText: { fontSize: 16, lineHeight: 24, color: '#684522' },
  retry: { minHeight: 48, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#E6EEE4' },
  retryText: { fontSize: 16, fontWeight: '700', color: '#275543' },
  testArea: { gap: 8 },
});
