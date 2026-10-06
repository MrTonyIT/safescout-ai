import React, {useId, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

type LessonSceneProps = {
  variant?: 'observe' | 'help';
  compact?: boolean;
  interactive?: boolean;
};

const ink = '#243E52';
const outline = {stroke: ink, strokeWidth: 2.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
const inspections = [
  {id: 'cup', title: 'Cốc', caption: 'Chiếc cốc đang bốc hơi trên bàn.', x: 217, y: 137, targetX: 234, targetY: 180},
  {id: 'book', title: 'Sách', caption: 'Một quyển sách nằm trên bàn, gần chiếc cốc.', x: 307, y: 227, targetX: 305, targetY: 191},
  {id: 'adult', title: 'Người lớn', caption: 'Có một người lớn ở gần An, phía bên kia bàn.', x: 463, y: 108, targetX: 423, targetY: 105},
] as const;
type InspectionId = typeof inspections[number]['id'];

/**
 * Original H01 artwork. The child's position never moves towards the hot cup.
 * The adult reaches the book from its clear side; the cup remains untouched.
 * This is a draft illustration for the same human review as the lesson text.
 * No timers, sound, autoplay, network assets, or interpretation of answer IDs.
 */
export function LessonScene({variant = 'observe', compact = false, interactive = false}: LessonSceneProps) {
  const [inspection, setInspection] = useState<InspectionId | null>(null);
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const wallId = `sceneWall${uniqueId}`;
  const windowId = `sceneWindow${uniqueId}`;
  const helping = variant === 'help';
  const inspectable = interactive && !helping && !compact;
  const selectedInspection = inspections.find(item => item.id === inspection);
  const description = helping
    ? 'An đứng cách xa bàn và nhờ người lớn giúp. Người lớn lấy quyển sách từ phía không có cốc nóng. Cốc vẫn ở trên bàn.'
    : 'Phòng khách có một quyển sách nằm cạnh cốc đang bốc hơi trên bàn. An đứng cách xa bàn, người lớn đang ở gần để giúp.';

  return (
    <View style={styles.block}>
      {inspectable && <Text style={styles.instruction}>Chạm dấu + để quan sát</Text>}
      <View style={styles.frame}>
        {/* The artwork owns a fixed ratio even on wide screens. Hotspot percentages
            and the SVG therefore share the same coordinate space, without letterboxing. */}
        <View style={[styles.art, compact && styles.compact]}>
          <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={description}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 520 320"
        preserveAspectRatio="xMidYMid meet"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Defs>
          <LinearGradient id={wallId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF3D7" />
            <Stop offset="1" stopColor="#F7E5C5" />
          </LinearGradient>
          <ClipPath id={windowId}>
            <Rect x={39} y={27} width={151} height={135} rx={23} />
          </ClipPath>
        </Defs>

        {/* A warm, quiet room; all visual detail is contained in the scene. */}
        <Rect width={520} height={320} fill={`url(#${wallId})`} />
        <Path d="M0 221 Q244 213 520 219 V320 H0Z" fill="#E5C9A8" />
        <Path d="M0 221 Q244 213 520 219" stroke="#CAA980" strokeWidth={3} fill="none" />
        <Path d="M0 283 L150 232 M225 320 L274 222 M455 320 L398 220" stroke="#D5B694" strokeWidth={2} opacity={0.65} />
        <Ellipse cx={261} cy={278} rx={227} ry={33} fill="#C3B79A" opacity={0.35} />
        <Ellipse cx={260} cy={272} rx={201} ry={30} fill="#F0D99F" />
        <Ellipse cx={260} cy={272} rx={184} ry={23} fill="none" stroke="#D7B875" strokeWidth={2} strokeDasharray="5 5" />

        {/* Window and garden. */}
        <Rect x={32} y={21} width={165} height={148} rx={28} fill="#DECDAA" />
        <Rect x={39} y={27} width={151} height={135} rx={23} fill="#CDE9E5" {...outline} />
        <G clipPath={`url(#${windowId})`}>
          <Circle cx={155} cy={53} r={15} fill="#FFE190" />
          <Path d="M16 126 Q53 91 90 122 Q128 86 163 114 Q190 101 211 121 V175 H16Z" fill="#A4CDBC" />
          <Path d="M12 151 Q56 117 88 142 Q114 116 151 138 Q174 118 207 133 V175 H12Z" fill="#6FA996" />
          <Path d="M59 57 Q68 47 77 57 M134 83 Q141 76 148 83" fill="none" stroke="#79ACA8" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M114 27 V163 M39 96 H190" stroke="#FFF9E9" strokeWidth={7} />
        </G>
        <Rect x={30} y={157} width={168} height={12} rx={6} fill="#F9EDD5" {...outline} />
        <Path d="M35 25 Q25 79 35 133 L60 124 Q49 83 56 24Z" fill="#EFAD91" />
        <Path d="M192 25 Q204 80 193 133 L171 124 Q182 80 176 24Z" fill="#EFAD91" />
        <Path d="M33 119 L55 115 M176 115 L197 120" stroke="#C67862" strokeWidth={4} strokeLinecap="round" />

        {/* Small original landscape print and wall shelf. */}
        <Rect x={224} y={33} width={65} height={76} rx={8} fill="#D7AB78" {...outline} />
        <Rect x={231} y={40} width={51} height={62} rx={4} fill="#FFFCF0" />
        <Circle cx={266} cy={54} r={7} fill="#F0BA5C" />
        <Path d="M233 86 L247 63 L262 86 L272 72 L280 88 V100 H233Z" fill="#82B6A3" />
        <Path d="M245 68 L247 63 L251 70Z" fill="#FFFCF0" />
        <Rect x={319} y={85} width={126} height={8} rx={4} fill="#B58561" {...outline} />
        <Path d="M332 84 V57 Q332 54 335 54 H344 V84Z" fill="#E3A27D" {...outline} />
        <Path d="M346 84 V49 Q346 46 349 46 H360 V84Z" fill="#76AEA6" {...outline} />
        <Path d="M365 83 L360 56 L371 54 L377 81Z" fill="#EDC262" {...outline} />
        <Path d="M397 67 H426 L421 84 H402Z" fill="#D9896D" {...outline} />
        <Path d="M410 66 V38 M410 54 Q388 55 394 41 Q407 40 410 54 M410 47 Q411 27 426 33 Q428 46 410 47" fill="#78A58A" stroke={ink} strokeWidth={2.3} strokeLinejoin="round" />

        {/* Soft seating behind the table. */}
        <Path d="M168 208 V167 Q168 153 184 153 H331 Q346 153 346 169 V216Z" fill="#729F98" {...outline} />
        <Path d="M181 174 Q181 165 192 165 H317 Q333 165 333 179 V208 H181Z" fill="#91B8A8" />
        <Path d="M245 166 V208" stroke="#729F98" strokeWidth={2.5} />
        <Path d="M157 207 V188 Q157 180 167 180 Q178 180 178 189 V208 H334 V189 Q334 180 344 180 Q354 180 354 190 V220 H157Z" fill="#77A69D" {...outline} />
        <Path d="M174 220 V230 M338 220 V230" stroke={ink} strokeWidth={7} strokeLinecap="round" />
        <Path d="M198 176 Q209 170 222 177 L217 199 Q204 203 192 195Z" fill="#F5CF7C" {...outline} />
        <Path d="M203 181 L213 190 M211 182 L201 191" stroke="#CEAA57" strokeWidth={2} strokeLinecap="round" />

        {/* The adult stays on the clear side of the book. */}
        <G>
          <Ellipse cx={410} cy={280} rx={43} ry={8} fill="#A78F70" opacity={0.3} />
          <Path d="M389 214 L387 268 Q394 274 404 269 L413 228 L420 269 Q429 273 437 267 L430 211Z" fill="#31566B" {...outline} />
          <Path d="M387 264 L382 276 Q387 282 406 279 L406 268Z" fill="#FBF5DF" {...outline} />
          <Path d="M420 268 L420 278 Q433 283 447 277 Q445 273 436 267Z" fill="#FBF5DF" {...outline} />
          <Path d="M387 130 Q409 116 430 132 L440 211 Q415 226 382 212Z" fill="#DC997A" {...outline} />
          <Path d="M403 125 L412 144 L422 126" fill="#F8DFC1" {...outline} />
          <Path d="M412 145 V214" stroke="#BA755D" strokeWidth={2} />
          <Circle cx={420} cy={158} r={2} fill="#875F51" />
          <Circle cx={423} cy={183} r={2} fill="#875F51" />
          <Path d="M429 132 Q442 138 447 164 L443 194 Q442 204 434 201 Q429 199 432 190 L431 167 L421 147" fill="#F1C8A7" {...outline} />
          <Path d="M430 131 Q443 137 445 150 L430 157 L419 143Z" fill="#E4A383" {...outline} />
          <Path d="M399 107 L399 128 Q409 137 419 125 L419 106" fill="#EDBC9A" {...outline} />
          <Path d="M385 80 Q388 60 411 60 Q436 61 437 87 L432 109 Q425 126 409 123 Q392 122 387 106Z" fill="#F1C8A7" {...outline} />
          <Path d="M385 94 Q375 65 397 57 Q423 45 437 68 Q444 76 437 95 L430 92 L428 76 Q409 82 397 71 Q395 83 387 86Z" fill="#3D484F" {...outline} />
          <Path d="M390 99 Q384 94 382 101 Q381 108 390 109" fill="#F1C8A7" stroke={ink} strokeWidth={2.3} />
          <Ellipse cx={402} cy={96} rx={2.4} ry={3.1} fill={ink} />
          <Ellipse cx={420} cy={96} rx={2.4} ry={3.1} fill={ink} />
          <Path d="M397 88 Q401 85 406 88 M416 87 Q420 85 424 88" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
          <Path d="M411 98 L409 104 L413 104 M405 112 Q411 117 418 110" fill="none" stroke={ink} strokeWidth={1.9} strokeLinecap="round" />
          <Ellipse cx={396} cy={106} rx={4} ry={2.3} fill="#DBA18A" opacity={0.65} />
          <Ellipse cx={425} cy={105} rx={4} ry={2.3} fill="#DBA18A" opacity={0.65} />
          {helping ? (
            <>
              <Path d="M389 144 Q381 162 361 174 L334 189 Q327 193 324 188 Q320 183 329 178 L351 164 L374 135" fill="#F1C8A7" {...outline} />
              <Path d="M386 131 Q375 128 368 145 L384 156 L397 140" fill="#E4A383" {...outline} />
            </>
          ) : (
            <>
              <Path d="M385 144 L371 160 L355 157 Q346 151 343 157 Q341 164 352 168 L375 173 Q382 169 397 149" fill="#F1C8A7" {...outline} />
              <Path d="M384 131 Q375 131 368 146 L384 157 L397 141" fill="#E4A383" {...outline} />
            </>
          )}
        </G>

        {/* Table, cup and book: separated visually, with no interactive hotspot. */}
        <Path d="M203 218 L198 263 Q202 267 208 263 L218 220 M322 220 L331 263 Q337 267 340 261 L335 216" fill="#A47852" {...outline} />
        <Path d="M181 205 Q260 189 350 204 V218 Q263 237 181 220Z" fill="#BB895E" {...outline} />
        <Ellipse cx={265} cy={204} rx={84} ry={16} fill="#E7B986" {...outline} />
        <Path d="M195 205 Q219 211 245 211" stroke="#F6D2A5" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Ellipse cx={234} cy={202} rx={23} ry={5} fill="#A87956" opacity={0.35} />
        <Ellipse cx={234} cy={200} rx={21} ry={5} fill="#FFF3D7" stroke="#81654F" strokeWidth={2} />
        <Path d="M247 179 Q262 177 259 188 Q257 195 247 190" fill="none" stroke={ink} strokeWidth={5} />
        <Path d="M247 179 Q260 179 257 187 Q255 191 247 187" fill="none" stroke="#DF997F" strokeWidth={3} />
        <Path d="M219 175 H249 L246 195 Q234 202 222 195Z" fill="#DE957A" {...outline} />
        <Ellipse cx={234} cy={175} rx={15} ry={4.2} fill="#F8D8B8" {...outline} />
        <Ellipse cx={234} cy={175} rx={10} ry={2} fill="#9D6A4E" />
        <Path d="M227 163 C219 155 234 150 228 142 M240 162 C232 154 247 150 241 139" fill="none" stroke="#9D8970" strokeWidth={2.8} strokeLinecap="round" opacity={0.8} />
        <G transform={helping ? 'translate(11 -8) rotate(-7 303 193)' : undefined}>
          <Path d="M276 194 L308 184 L335 193 L303 205Z" fill="#FFF4D5" {...outline} />
          <Path d="M276 188 L307 178 L335 188 L303 199Z" fill="#EAC15F" {...outline} />
          <Path d="M276 188 V195 L303 205 V199Z" fill="#C59A46" {...outline} />
          <Path d="M291 187 L306 182 L318 187 L303 192Z" fill="#FFF3C4" />
          <Path d="M324 192 L322 198 L326 196 L329 197 L331 190" fill="#D98770" />
        </G>

        {/* An is deliberately separated from the table by a clear floor gap. */}
        <G>
          <Ellipse cx={99} cy={283} rx={35} ry={7} fill="#A78F70" opacity={0.28} />
          <Path d="M81 231 L80 271 L94 274 L101 243 L107 272 L122 269 L117 229Z" fill="#597EA4" {...outline} />
          <Path d="M80 268 L74 278 Q78 285 94 279 L95 271Z" fill="#FFF8E7" {...outline} />
          <Path d="M107 270 L107 280 Q125 285 130 277 L122 269Z" fill="#FFF8E7" {...outline} />
          <Path d="M77 181 Q98 170 119 181 L125 231 Q102 242 73 231Z" fill="#74B3A7" {...outline} />
          <Path d="M93 179 L100 190 L110 178" fill="#F4CAAB" {...outline} />
          <Path d="M89 229 H114" stroke="#5B9D92" strokeWidth={3} strokeLinecap="round" />
          <Path d="M95 206 L101 201 L107 207 L105 217 H97Z" fill="#FBE4A4" stroke={ink} strokeWidth={1.8} />
          <Path d="M82 193 L75 218 Q74 225 68 223 Q63 221 66 212 L68 188" fill="#F1C09C" {...outline} />
          <Path d="M77 180 Q69 179 64 193 L79 201 L89 183" fill="#74B3A7" {...outline} />
          {helping ? (
            <Path d="M118 192 L139 185 L143 175 Q142 167 148 166 Q153 166 152 175 L148 192 L124 207" fill="#F1C09C" {...outline} />
          ) : (
            <Path d="M119 193 L128 212 Q133 219 127 222 Q122 225 117 216 L108 200" fill="#F1C09C" {...outline} />
          )}
          <Path d="M119 180 Q124 183 128 193 L115 204 L107 185" fill="#74B3A7" {...outline} />
          <Path d="M91 160 V179 Q99 188 109 177 L109 160" fill="#EAB38F" {...outline} />
          <Path d="M72 141 Q74 116 99 115 Q122 116 127 137 L122 161 Q115 178 98 177 Q78 175 74 160Z" fill="#F4CAAB" {...outline} />
          <Path d="M74 154 Q60 143 69 124 Q76 107 98 109 Q114 103 124 122 Q132 129 127 146 L118 140 L113 126 Q96 137 80 132 L79 150Z" fill="#485258" {...outline} />
          <Path d="M76 153 Q69 146 66 152 Q64 160 75 163" fill="#F4CAAB" stroke={ink} strokeWidth={2.2} />
          <Ellipse cx={92} cy={147} rx={2.9} ry={3.4} fill={ink} />
          <Ellipse cx={111} cy={146} rx={2.9} ry={3.4} fill={ink} />
          <Path d="M87 139 Q91 137 96 139 M107 137 Q111 135 115 138" stroke={ink} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d="M102 149 L100 155 L104 155" fill="none" stroke="#B77A61" strokeWidth={1.8} strokeLinecap="round" />
          <Path d={helping ? 'M96 164 Q103 169 110 161' : 'M97 163 Q103 166 108 163'} fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
          <Ellipse cx={86} cy={158} rx={5} ry={2.6} fill="#E99E88" opacity={0.6} />
          <Ellipse cx={115} cy={156} rx={4.4} ry={2.4} fill="#E99E88" opacity={0.6} />
        </G>

        {/* Foreground foliage adds depth without covering the task. */}
        <Path d="M474 290 L474 251 M474 271 Q450 271 452 254 Q469 251 474 271 M474 262 Q475 237 493 239 Q496 256 474 262" fill="#7BA190" stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
        <Path d="M456 282 H492 L486 315 H462Z" fill="#D79879" {...outline} />
        <Path d="M453 282 Q474 278 495 282 V291 H453Z" fill="#E5AB8C" {...outline} />
        <Path d="M469 297 V308 M479 297 V308" stroke="#BC7F63" strokeWidth={2} strokeLinecap="round" />
        {inspectable && <G>
          {inspections.map(item => <G key={item.id}>
            <Path d={`M ${item.x} ${item.y} L ${item.targetX} ${item.targetY}`} fill="none" stroke="#FFFCED" strokeWidth={5} strokeLinecap="round" />
            <Path d={`M ${item.x} ${item.y} L ${item.targetX} ${item.targetY}`} fill="none" stroke="#267B70" strokeWidth={2} strokeLinecap="round" />
            <Circle cx={item.targetX} cy={item.targetY} r={3.5} fill="#267B70" stroke="#FFFCED" strokeWidth={1.5} />
          </G>)}
        </G>}
      </Svg>
          </View>
          {inspectable && inspections.map(item => <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Quan sát ${item.title.toLocaleLowerCase('vi-VN')}${inspection === item.id ? ', đang xem' : ''}`}
            accessibilityHint="Hiện mô tả chi tiết dưới hình. Không di chuyển đồ vật."
            activeOpacity={0.85}
            onPress={() => setInspection(item.id)}
            style={[styles.hotspot, {
              left: `${item.x / 520 * 100}%`,
              top: `${item.y / 320 * 100}%`,
            }, inspection === item.id && styles.hotspotSelected]}
          >
            <Svg width={22} height={22} viewBox="0 0 22 22" accessible={false}><Path d="M11 3V19M3 11H19" stroke={inspection === item.id?'#FFFFFF':ink} strokeWidth={3} strokeLinecap="round"/></Svg>
          </TouchableOpacity>)}
        </View>
      </View>
      {inspectable && <View style={styles.inspectPanel}>
        <View style={styles.inspectionChoices}>
          {inspections.map(item => <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}${inspection === item.id ? ', đang xem' : ''}`}
            accessibilityHint="Một cách khác để quan sát chi tiết trong hình."
            activeOpacity={0.85}
            onPress={() => setInspection(item.id)}
            style={[styles.inspectionChoice, inspection === item.id && styles.inspectionChoiceSelected]}
          >
            <Text style={[styles.inspectionLabel, inspection === item.id && styles.selectedPlus]}>{item.title}</Text>
          </TouchableOpacity>)}
        </View>
        {selectedInspection && <View accessible accessibilityLiveRegion="polite" style={styles.caption}>
          <Text style={styles.captionText}><Text style={styles.captionTitle}>{selectedInspection.title}: </Text>{selectedInspection.caption}</Text>
        </View>}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {width: '100%', gap: 8},
  instruction: {fontSize: 15, lineHeight: 22, color: ink, fontWeight: '700', paddingHorizontal: 14, paddingTop: 10},
  frame: {
    width: '100%',
    backgroundColor: '#FFF3D7',
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DCC9A9',
  },
  art: {
    width: '100%',
    maxWidth: 290 * 520 / 320,
    aspectRatio: 520 / 320,
    alignSelf: 'center',
  },
  compact: {
    maxWidth: 214 * 520 / 320,
  },
  hotspot: {position: 'absolute', width: 44, height: 44, minWidth: 44, minHeight: 44, marginLeft: -22, marginTop: -22, borderRadius: 22, borderWidth: 3, borderColor: '#FFFDF1', backgroundColor: '#FAD779', alignItems: 'center', justifyContent: 'center', shadowColor: '#1B4847', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3},
  hotspotSelected: {backgroundColor: '#236F66'},
  plus: {fontSize: 28, lineHeight: 31, fontWeight: '700', color: ink, textAlign: 'center'},
  selectedPlus: {color: '#FFFFFF'},
  inspectPanel: {paddingHorizontal: 12, paddingBottom: 4, gap: 8},
  inspectionChoices: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  inspectionChoice: {minHeight: 44, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#BAD3C8', backgroundColor: '#F1F7EE', justifyContent: 'center', alignItems: 'center', flexShrink: 1},
  inspectionChoiceSelected: {backgroundColor: '#236F66', borderColor: '#236F66'},
  inspectionLabel: {fontSize: 15, lineHeight: 22, fontWeight: '700', color: ink, textAlign: 'center'},
  caption: {padding: 12, borderRadius: 14, backgroundColor: '#EAF4E9'},
  captionTitle: {fontWeight: '800'},
  captionText: {fontSize: 16, lineHeight: 24, color: ink},
});
