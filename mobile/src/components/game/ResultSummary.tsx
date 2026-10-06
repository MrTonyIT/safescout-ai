import React from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {Star, CheckCircle2, History} from 'lucide-react-native';
import {TestSubmissionResult} from '../../types/curriculum';
import {MiloCompanion} from './MiloCompanion';
import {RewardBurst} from './GameMotion';
import {GameButton, ink, k} from './GameKit';

export function ResultSummary({result, onContinue, active}: {
  result: TestSubmissionResult;
  onContinue: () => void;
  active: boolean;
}) {
  const {width, fontScale} = useWindowDimensions();
  const narrow = width < 360;
  // Native fontScale sets a minimum. Intrinsic text width also handles web text-only zoom.
  const scoreSize = Math.min(216, Math.round((narrow ? 120 : 136) * Math.max(1, fontScale)));
  const companionSize = narrow ? 105 : 125;
  const circumference = 2 * Math.PI * 55;
  const retired = result.contentRetired === true;

  return <View style={r.card}><RewardBurst receiptId={result.testResultId} enabled={active&&result.isPassed&&!retired}/>
    <Text style={r.eyebrow}>{retired ? 'HỒ SƠ BÀI LÀM' : 'HÀNH TRÌNH CỦA CON'}</Text>
    <View style={r.art}>
      <View testID="result-score" style={[r.scoreFrame, {minWidth: scoreSize, minHeight: scoreSize}]}>
        <Svg width="100%" height="100%" viewBox="0 0 136 136" style={StyleSheet.absoluteFill} accessible={false}>
          <Circle cx={68} cy={68} r={55} stroke="#E4EBDE" strokeWidth={11} fill="none" />
          <Circle cx={68} cy={68} r={55} stroke={retired ? ink.muted : ink.teal} strokeWidth={11} fill="none"
            strokeDasharray={`${circumference * result.score / 100} ${circumference}`}
            rotation={-90} origin="68,68" strokeLinecap="round" />
        </Svg>
        <Text testID="result-score-text" style={r.score}>{result.score}%</Text>
      </View>
      <View testID="result-mascot">
        <MiloCompanion
          size={companionSize}
          state={retired ? 'paused' : result.isPassed ? 'encouraging' : 'explaining'}
          active={active && !retired}
          reducedMotion={retired}
        />
      </View>
    </View>
    <Text accessibilityRole="header" style={r.title}>
      {retired ? 'Kết quả lịch sử' : result.isPassed ? 'Con đã hoàn thành phần học này' : 'Mình cùng hiểu thêm nhé'}
    </Text>
    <Text style={[k.body, r.center]}>
      Đúng {result.correctCount}/{result.totalQuestions} câu.{retired ? ' Kết quả của phiên bản trước.' : ' Kết quả đã lưu.'}
    </Text>
    {!retired && <View accessible accessibilityLabel={`${result.starsEarned} sao trong phần học`} style={r.stars}>
      {[1, 2, 3].map(n => <Star key={n} size={29} color={n <= result.starsEarned ? '#BA801B' : '#B9C9C4'} fill={n <= result.starsEarned ? ink.gold : 'transparent'} />)}
    </View>}
    <Text style={[k.body, r.center]}>{result.miloResponse.speech}</Text>
    <View style={r.saved}>
      {retired ? <History size={17} color={ink.muted} /> : <CheckCircle2 size={17} color={ink.teal} />}
      <Text style={[k.small, r.savedText]}>
        {retired ? 'Đã giữ kết quả cũ. Về trang Học để xem nội dung hiện có.' : 'Đã lưu kết quả phần học trên máy chủ.'}
      </Text>
    </View>
    <GameButton label="Về trang Học để tiếp tục" onPress={onContinue} />
  </View>;
}

const r = StyleSheet.create({
  card: {...k.card, alignItems: 'stretch', paddingVertical: 25},
  eyebrow: {fontSize: 11, fontWeight: '900', letterSpacing: 2, color: ink.teal, textAlign: 'center'},
  art: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 10},
  scoreFrame: {maxWidth: '100%', padding: 18, aspectRatio: 1, flexShrink: 0, justifyContent: 'center', alignItems: 'center'},
  score: {fontSize: 32, fontWeight: '900', color: ink.navy, textAlign: 'center'},
  title: {fontSize: 26, fontWeight: '900', lineHeight: 33, color: ink.navy, textAlign: 'center'},
  stars: {flexDirection: 'row', gap: 10, justifyContent: 'center'},
  saved: {flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center'},
  savedText: {flexShrink: 1},
  center: {textAlign: 'center'},
});
