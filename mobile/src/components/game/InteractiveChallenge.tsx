import React, {useEffect, useRef, useState} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ArrowDown, ArrowUp, Check, Layers3, Plus, Route, X} from 'lucide-react-native';
import {TestQuestionItem} from '../../types/curriculum';

export type ChallengeFeedback = 'select' | 'remove' | 'reorder';
export type InteractiveChallengeProps = {
  question: Pick<TestQuestionItem, 'id' | 'questionType' | 'options'>;
  contentVersion: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  onFeedback?: (event: ChallengeFeedback) => void;
};

const color = {ink: '#183C50', teal: '#26796E', gold: '#FFE096', cream: '#FFFBED', line: '#B6CDBE'};

/** Controlled interaction only. Correct answers, scoring and rewards stay with the parent/API. */
export function InteractiveChallenge({question, contentVersion, selected, onChange, disabled = false, onFeedback}: InteractiveChallengeProps) {
  const ordering = question.questionType === 'DRAG_DROP_ORDER';
  const options = question.options;
  const optionIds = new Set(options.map(option => option.id));
  const chosen = [...new Set(selected)].filter(id => optionIds.has(id));
  const [announcement, setAnnouncement] = useState('');
  const refs = useRef(new Map<string, any>());
  const focusAfterChange = useRef<string | null>(null);
  useEffect(() => { setAnnouncement(''); focusAfterChange.current = null; }, [question.id, contentVersion]);
  useEffect(() => {
    const key = focusAfterChange.current;
    if (key && Platform.OS === 'web') refs.current.get(key)?.focus?.();
    focusAfterChange.current = null;
  }, [selected]);

  const update = (next: string[], event: ChallengeFeedback, announcementText: string, focus?: string) => {
    if (disabled) return;
    focusAfterChange.current = focus || null;
    onChange(next);
    setAnnouncement(announcementText);
    onFeedback?.(event);
  };
  const remove = (id: string) => update(chosen.filter(value => value !== id), 'remove', 'Đã đưa thẻ về bàn lựa chọn.', `choice-${id}`);
  const pick = (id: string) => {
    if (disabled) return;
    if (ordering) {
      if (chosen.includes(id)) remove(id);
      else update([...chosen, id], 'select', `Đã thêm bước ${chosen.length + 1}. Có thể đổi thứ tự trước khi xác nhận.`, `step-${id}`);
    } else {
      update([id], 'select', 'Đã chọn một hành động. Chưa xác nhận đáp án.');
    }
  };
  const move = (id: string, direction: -1 | 1) => {
    const at = chosen.indexOf(id), destination = at + direction;
    if (disabled || at < 0 || destination < 0 || destination >= chosen.length) return;
    const next = chosen.slice();
    [next[at], next[destination]] = [next[destination], next[at]];
    update(next, 'reorder', `Đã chuyển thẻ sang bước ${destination + 1}.`, `step-${id}`);
  };
  const bindRef = (key: string) => (node: any) => {
    if (node) refs.current.set(key, node);
    else refs.current.delete(key);
  };

  return <View style={styles.root} testID="interactive-challenge">
    {ordering && <View style={styles.tray}>
      <View style={styles.headingRow}><Route size={23} color={color.teal} /><Text accessibilityRole="header" style={styles.title}>Lộ trình của con</Text></View>
      <Text style={styles.helper}>Chọn thẻ để thêm bước. Dùng nút lên, xuống để đổi chỗ.</Text>
      <View accessibilityRole="progressbar" accessibilityLabel="Số bước đã đặt, chưa chấm điểm" accessibilityValue={{min: 0, max: options.length, now: chosen.length}} style={styles.track}>
        <View style={[styles.fill, {width: `${options.length ? chosen.length / options.length * 100 : 0}%`}]} />
      </View>
      <Text style={styles.count}>{chosen.length}/{options.length} bước đã đặt</Text>
      {!chosen.length && <View style={styles.emptyTray}><Layers3 size={32} color="#8DA698" /><Text style={styles.emptyText}>Lộ trình bắt đầu từ thẻ con chọn</Text></View>}
      {chosen.map((id, index) => {
        const option = options.find(item => item.id === id)!;
        return <View key={id} style={styles.step}>
          <TouchableOpacity
            ref={bindRef(`step-${id}`)} accessibilityRole="checkbox" aria-checked={true}
            accessibilityState={{checked: true, disabled}} disabled={disabled}
            accessibilityLabel={`Bước ${index + 1}: ${option.optionText}`}
            accessibilityHint="Bấm để đưa thẻ về bàn lựa chọn. Các nút bên dưới đổi thứ tự."
            onPress={() => remove(id)} style={styles.stepContent} activeOpacity={0.9}
          >
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
            <Text style={styles.optionText}>{option.optionText}</Text>
          </TouchableOpacity>
          <View style={styles.controls}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Đưa ${option.optionText} lên bước trước`} accessibilityState={{disabled: disabled || index === 0}} disabled={disabled || index === 0} onPress={() => move(id, -1)} style={[styles.control, (disabled || index === 0) && styles.disabled]}><ArrowUp size={20} color={color.ink} /></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Đưa ${option.optionText} xuống bước sau`} accessibilityState={{disabled: disabled || index === chosen.length - 1}} disabled={disabled || index === chosen.length - 1} onPress={() => move(id, 1)} style={[styles.control, (disabled || index === chosen.length - 1) && styles.disabled]}><ArrowDown size={20} color={color.ink} /></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Bỏ bước ${index + 1}: ${option.optionText}`} accessibilityState={{disabled}} disabled={disabled} onPress={() => remove(id)} style={[styles.control, disabled && styles.disabled]}><X size={20} color={color.ink} /></TouchableOpacity>
          </View>
        </View>;
      })}
    </View>}
    {ordering && chosen.length < options.length && <Text style={styles.bankLabel}>BÀN LỰA CHỌN</Text>}
    <View accessibilityRole={ordering ? undefined : 'radiogroup'} accessibilityLabel={ordering ? 'Các thẻ chưa đặt' : 'Chọn một hành động'} style={styles.deck}>
      {options.filter(option => !ordering || !chosen.includes(option.id)).map(option => {
        const index = options.indexOf(option), checked = chosen.includes(option.id);
        const badge = index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
        return <TouchableOpacity
          key={option.id} ref={bindRef(`choice-${option.id}`)}
          accessibilityRole={ordering ? 'checkbox' : 'radio'} aria-checked={checked}
          accessibilityState={{checked, disabled}} disabled={disabled}
          accessibilityLabel={option.optionText}
          accessibilityHint={ordering ? 'Thêm thẻ này vào bước kế tiếp.' : 'Chọn rồi bấm xác nhận khi đã sẵn sàng.'}
          onPress={() => pick(option.id)} activeOpacity={0.9}
          style={[styles.tile, checked && styles.selectedTile, disabled && styles.lockedTile]}
        >
          <View style={[styles.badge, checked && styles.selectedBadge]}><Text style={[styles.badgeText, checked && styles.selectedBadgeText]}>{badge}</Text></View>
          <View style={styles.tileCopy}>
            <Text style={styles.optionText}>{option.optionText}</Text>
            {checked && <View style={styles.selectedCaption}><Check size={16} color={color.teal} /><Text style={styles.selectedCaptionText}>Đang chọn</Text></View>}
          </View>
          {ordering && <Plus size={19} color={color.teal} />}
        </TouchableOpacity>;
      })}
    </View>
    {!!announcement && <Text accessibilityLiveRegion="polite" style={styles.announcement}>{announcement}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  root: {gap: 12, width: '100%'},
  deck: {gap: 12},
  tile: {minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, padding: 14, borderWidth: 2, borderBottomWidth: 5, borderColor: '#C3D5C7', backgroundColor: '#FFFFFF'},
  selectedTile: {borderColor: '#287E70', backgroundColor: '#E8F5E7'},
  lockedTile: {borderBottomWidth: 2},
  badge: {minWidth: 39, minHeight: 39, borderRadius: 13, padding: 6, backgroundColor: color.gold, alignItems: 'center', justifyContent: 'center'},
  badgeText: {fontSize: 18, lineHeight: 24, fontWeight: '900', color: color.ink},
  selectedBadge: {backgroundColor: color.teal},
  selectedBadgeText: {color: '#FFFFFF'},
  tileCopy: {flex: 1, minWidth: 0, gap: 6},
  optionText: {fontSize: 18, lineHeight: 27, fontWeight: '600', color: color.ink, flex: 1},
  selectedCaption: {flexDirection: 'row', gap: 5, alignItems: 'center', flexWrap: 'wrap'},
  selectedCaptionText: {fontSize: 13, lineHeight: 19, fontWeight: '700', color: color.teal},
  tray: {backgroundColor: '#EAF3E7', borderWidth: 2, borderColor: '#B5CBAF', borderRadius: 22, padding: 12, gap: 10},
  headingRow: {flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap'},
  title: {fontSize: 20, lineHeight: 27, fontWeight: '800', color: color.ink, flexShrink: 1},
  helper: {fontSize: 15, lineHeight: 22, color: '#4D6D68'},
  track: {height: 8, borderRadius: 5, overflow: 'hidden', backgroundColor: '#CADBCC'},
  fill: {height: 8, backgroundColor: color.teal},
  count: {fontSize: 13, lineHeight: 19, color: '#48655C', fontWeight: '700'},
  emptyTray: {minHeight: 95, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B3C8AE', borderRadius: 16, padding: 14, alignItems: 'center', justifyContent: 'center', gap: 9},
  emptyText: {fontSize: 16, lineHeight: 24, textAlign: 'center', color: '#557065'},
  bankLabel: {fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1, color: '#557064'},
  step: {backgroundColor: color.cream, borderWidth: 1, borderBottomWidth: 3, borderColor: '#C4D5B9', borderRadius: 16, padding: 9, gap: 6},
  stepContent: {flexDirection: 'row', gap: 9, alignItems: 'center', minHeight: 48, paddingVertical: 4},
  stepNumber: {minWidth: 32, minHeight: 32, padding: 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: color.teal},
  stepNumberText: {fontSize: 15, lineHeight: 21, color: '#FFFFFF', fontWeight: '800'},
  controls: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6},
  control: {minHeight: 44, minWidth: 44, borderRadius: 12, backgroundColor: '#E2ECE0', alignItems: 'center', justifyContent: 'center'},
  disabled: {opacity: 0.4},
  announcement: {fontSize: 13, lineHeight: 20, color: '#4D6D68'},
});
