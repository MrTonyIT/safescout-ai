import React, {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import {Animated, AppState, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Compass, Flag, Footprints, RotateCcw, Tent, TreePine, X} from 'lucide-react-native';
import {useExperiencePreferences} from '../../services/experiencePreferences';
import {ArcadeFeedback, EXPLORER_TRAILS, ExplorerState, moveExplorer, pointKey, startExplorer} from './explorerMaze';

type Action = {type: 'move'; dx: number; dy: number} | {type: 'restart'} | {type: 'next'};
function reducer(state: ExplorerState, action: Action): ExplorerState {
  if (action.type === 'move') return moveExplorer(state, action.dx, action.dy);
  return startExplorer(action.type === 'next' ? (state.level + 1) % EXPLORER_TRAILS.length : state.level, state.event + 1);
}
export type ExplorerArcadeProps = {active: boolean; onClose: () => void; onFeedback?: (event: ArcadeFeedback) => void};

/** A separate spatial puzzle. It cannot submit lessons, award XP, or teach emergency procedures. */
export function ExplorerArcade({active, onClose, onFeedback}: ExplorerArcadeProps) {
  const {height} = useWindowDimensions();
  const [state, dispatch] = useReducer(reducer, undefined, () => startExplorer());
  const {effectiveReducedMotion, loading} = useExperiencePreferences();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [pageVisible, setPageVisible] = useState(typeof document === 'undefined' || !document.hidden);
  const movement = useRef(new Animated.Value(0)).current;
  const previousEvent = useRef(0);
  const previousAnimatedEvent = useRef(0);
  const feedbackRef = useRef(onFeedback);
  feedbackRef.current = onFeedback;
  const enabled = active && foreground && pageVisible;
  const move = useCallback((dx: number, dy: number) => { if (enabled) dispatch({type: 'move', dx, dy}); }, [enabled]);
  const trail = EXPLORER_TRAILS[state.level];

  useEffect(() => {
    const listener = AppState.addEventListener('change', next => setForeground(next === 'active'));
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement | null)?.tagName || '')) return;
      const direction: Record<string, [number, number]> = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
      if (!direction[event.key]) return;
      event.preventDefault();
      if (!event.repeat) move(...direction[event.key]);
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [enabled, move]);
  useEffect(() => {
    if (previousEvent.current === state.event) return;
    previousEvent.current = state.event;
    if (enabled) feedbackRef.current?.(state.feedback);
  }, [state.event, state.feedback, enabled]);
  useEffect(() => {
    const newEvent = previousAnimatedEvent.current !== state.event;
    previousAnimatedEvent.current = state.event;
    movement.stopAnimation();
    movement.setValue(0);
    if (!newEvent || !enabled || loading || effectiveReducedMotion || state.event === 0 || (state.feedback !== 'move' && state.feedback !== 'complete')) return;
    const animation = Animated.sequence([
      Animated.timing(movement, {toValue: 1, duration: 85, useNativeDriver: Platform.OS !== 'web', isInteraction: false}),
      Animated.timing(movement, {toValue: 0, duration: 110, useNativeDriver: Platform.OS !== 'web', isInteraction: false}),
    ]);
    animation.start();
    return () => { animation.stop(); movement.stopAnimation(); movement.setValue(0); };
  }, [state.event, enabled, loading, effectiveReducedMotion, movement]);

  const directionButton = (label: string, dx: number, dy: number, Icon: typeof ArrowUp) => <TouchableOpacity
    accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled: !enabled || state.won}}
    disabled={!enabled || state.won} onPress={() => move(dx, dy)} style={[styles.direction, (!enabled || state.won) && styles.disabled]}
  ><Icon size={26} color="#183E4E" /></TouchableOpacity>;

  return <View style={[styles.panel, {maxHeight: Math.max(260, height - 48)}]} testID="explorer-arcade">
    <View style={styles.header}>
      <View style={styles.headerCopy}><Text style={styles.eyebrow}>SÂN CHƠI QUAN SÁT</Text><Text accessibilityRole="header" style={styles.title}>Đường về trại</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng sân chơi" onPress={onClose} style={styles.close}><X size={23} color="#173F4D" /></TouchableOpacity>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text style={styles.helper}>Không tính XP bài học. Đi từng ô đường để tìm chiếc lều; không cần chạy đua với thời gian.</Text>
      <View style={styles.trailHeading}><Compass size={20} color="#27766D" /><Text style={styles.trailName}>{state.level + 1}/{EXPLORER_TRAILS.length} · {trail.name}</Text></View>
      <View style={styles.board} accessibilityLabel="Bản đồ khu rừng có 5 hàng và 5 cột">
        {trail.rows.map((row, y) => <View key={y} style={styles.row}>{[...row].map((cell, x) => {
          const here = x === state.position.x && y === state.position.y;
          const adjacent = Math.abs(x - state.position.x) + Math.abs(y - state.position.y) === 1;
          const walkable = cell !== '#', canMove = enabled && !state.won && walkable && adjacent;
          const visited = state.visited.includes(pointKey({x, y}));
          return <TouchableOpacity key={x} accessible={canMove || here} accessibilityRole={canMove ? 'button' : 'image'}
            accessibilityLabel={here ? `Con ở hàng ${y + 1}, cột ${x + 1}${cell === 'C' ? ', đã tới trại' : ''}` : `Đi tới hàng ${y + 1}, cột ${x + 1}${cell === 'C' ? ', chiếc lều' : ''}`}
            accessibilityState={{disabled: !canMove}} disabled={!canMove} activeOpacity={0.8}
            onPress={() => move(x - state.position.x, y - state.position.y)}
            style={[styles.cell, !walkable && styles.treeCell, canMove && styles.reachableCell, cell === 'C' && styles.campCell, here && styles.hereCell]}
            testID={`arcade-cell-${x}-${y}`}
          >
            {!walkable ? <TreePine size={25} color="#397A51" fill="#7DB46C" /> : cell === 'C' ? <Tent size={26} color="#885722" fill="#F4C769" /> : visited && !here ? <Footprints size={18} color="#A79565" /> : <View style={styles.pathDot} />}
            {here && <Animated.View style={[styles.player, {transform: [{scale: movement.interpolate({inputRange: [0, 1], outputRange: [1, 1.09]})}]}]}><Compass size={25} color="#164D61" fill="#FFF5C5" /></Animated.View>}
          </TouchableOpacity>;
        })}</View>)}
      </View>
      <View style={styles.legend}><View style={styles.legendPart}><Compass size={17} color="#174D60" /><Text style={styles.legendText}>Con</Text></View><View style={styles.legendPart}><Tent size={17} color="#885722" /><Text style={styles.legendText}>Trại</Text></View><View style={styles.legendPart}><TreePine size={17} color="#397A51" /><Text style={styles.legendText}>Cây</Text></View></View>
      <View accessibilityLiveRegion="polite" style={[styles.status, state.won && styles.wonStatus]}>
        {state.won && <Flag size={23} color="#286B54" />}
        <Text style={styles.statusText}>{state.message}</Text>
      </View>
      {!state.won ? <>
        <View style={styles.dpad}>
          {directionButton('Đi lên', 0, -1, ArrowUp)}
          <View style={styles.directionRow}>{directionButton('Sang trái', -1, 0, ArrowLeft)}<View style={styles.dpadCenter}><Footprints size={23} color="#487E6C" /></View>{directionButton('Sang phải', 1, 0, ArrowRight)}</View>
          {directionButton('Đi xuống', 0, 1, ArrowDown)}
        </View>
        <Text style={styles.keyboardHint}>Chạm ô đường bên cạnh, dùng các nút mũi tên hoặc phím mũi tên trên bàn phím.</Text>
      </> : <TouchableOpacity accessibilityRole="button" accessibilityLabel={state.level < EXPLORER_TRAILS.length - 1 ? 'Khám phá đường tiếp theo' : 'Chơi lại từ đường đầu'} disabled={!enabled} onPress={() => dispatch({type: 'next'})} style={styles.next}><Text style={styles.nextText}>{state.level < EXPLORER_TRAILS.length - 1 ? 'Khám phá đường tiếp theo' : 'Chơi lại từ đường đầu'}</Text><ArrowRight size={22} color="#173F4D" /></TouchableOpacity>}
      <View style={styles.bottomRow}><Text style={styles.moves}>{state.moves} bước đã đi</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Bắt đầu lại đường này" disabled={!enabled} onPress={() => dispatch({type: 'restart'})} style={styles.restart}><RotateCcw size={18} color="#275F5C" /><Text style={styles.restartText}>Đi lại</Text></TouchableOpacity></View>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  panel: {width: '100%', maxWidth: 560, backgroundColor: '#FFF9E8', borderRadius: 26, overflow: 'hidden', borderWidth: 2, borderColor: '#FFE39B'},
  header: {flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: '#E1EFDF'},
  headerCopy: {flex: 1, gap: 4},
  eyebrow: {fontSize: 11, lineHeight: 16, letterSpacing: 1, fontWeight: '900', color: '#487364'},
  title: {fontSize: 26, lineHeight: 33, fontWeight: '900', color: '#173F4D'},
  close: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#F5F9E8', justifyContent: 'center', alignItems: 'center'},
  content: {padding: 14, gap: 12},
  helper: {fontSize: 15, lineHeight: 22, color: '#4D6963'},
  trailHeading: {flexDirection: 'row', gap: 7, alignItems: 'center', flexWrap: 'wrap'},
  trailName: {fontSize: 16, lineHeight: 23, fontWeight: '800', color: '#29574F', flexShrink: 1},
  board: {width: '100%', maxWidth: 350, alignSelf: 'center', backgroundColor: '#BCD6A9', borderWidth: 2, borderColor: '#91B37F', borderRadius: 18, padding: 6, gap: 3},
  row: {flexDirection: 'row', gap: 3},
  cell: {flex: 1, aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4E4B6', borderWidth: 1, borderColor: '#DBCF9B'},
  treeCell: {backgroundColor: '#A1C58D', borderColor: '#95B97F'},
  reachableCell: {borderWidth: 2, borderColor: '#668D65', backgroundColor: '#FFF0BD'},
  campCell: {backgroundColor: '#FFD98A', borderColor: '#CDA555'},
  hereCell: {backgroundColor: '#B9DDD1', borderColor: '#347A6A', borderWidth: 2},
  pathDot: {width: 5, height: 5, borderRadius: 3, backgroundColor: '#D0BC85'},
  player: {...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center'},
  legend: {flexDirection: 'row', justifyContent: 'center', gap: 13, flexWrap: 'wrap'},
  legendPart: {flexDirection: 'row', gap: 4, alignItems: 'center'},
  legendText: {fontSize: 13, lineHeight: 19, color: '#536E60'},
  status: {minHeight: 48, padding: 12, borderRadius: 14, backgroundColor: '#EEEFD9', flexDirection: 'row', alignItems: 'center', gap: 9},
  wonStatus: {backgroundColor: '#DDEFD5'},
  statusText: {fontSize: 16, lineHeight: 23, color: '#244C43', flex: 1},
  dpad: {alignItems: 'center', gap: 5},
  directionRow: {flexDirection: 'row', gap: 5},
  direction: {width: 54, height: 50, borderWidth: 1, borderBottomWidth: 4, borderColor: '#CFAD5D', borderRadius: 15, backgroundColor: '#FFDD87', justifyContent: 'center', alignItems: 'center'},
  dpadCenter: {width: 54, height: 50, alignItems: 'center', justifyContent: 'center'},
  disabled: {opacity: 0.45},
  keyboardHint: {fontSize: 13, lineHeight: 20, color: '#527162', textAlign: 'center'},
  bottomRow: {flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap'},
  moves: {fontSize: 14, lineHeight: 21, color: '#537363'},
  restart: {minHeight: 48, paddingHorizontal: 13, gap: 6, flexDirection: 'row', alignItems: 'center', borderRadius: 14, backgroundColor: '#E4EFDF'},
  restartText: {fontSize: 15, lineHeight: 22, color: '#275F5C', fontWeight: '700'},
  next: {minHeight: 54, padding: 14, borderRadius: 17, backgroundColor: '#FFDC82', flexDirection: 'row', alignItems: 'center', gap: 8},
  nextText: {fontSize: 18, lineHeight: 26, fontWeight: '800', color: '#173F4D', flex: 1},
});
