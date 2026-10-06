import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Backpack, Gamepad2, Map, Settings2} from 'lucide-react-native';
import {useGameExperience} from './GameMotion';

export function GameDock({active='map',onMap,onCollection,onPlay,onSettings}: {
  active?: 'map'|'collection'|'play'; onMap:()=>void; onCollection:()=>void; onPlay?:()=>void; onSettings?:()=>void;
}) {
  const {tap}=useGameExperience();
  const tabs=[{id:'map',label:'Bản đồ',icon:Map,action:onMap},{id:'collection',label:'Ba lô',icon:Backpack,action:onCollection},{id:'play',label:'Sân chơi',icon:Gamepad2,action:onPlay},{id:'settings',label:'Âm & chuyển động',icon:Settings2,action:onSettings}].filter(t=>t.action);
  return <View style={styles.outer}><View style={styles.dock}>{tabs.map(tab=><TouchableOpacity key={tab.id} accessibilityRole="button" accessibilityLabel={tab.label} aria-pressed={active===tab.id} onPress={()=>{tap();tab.action?.();}} style={[styles.tab,active===tab.id&&styles.active]}><View style={[styles.icon,active===tab.id&&styles.activeIcon]}><tab.icon size={21} color={active===tab.id?'#143C48':'#B9DDDA'}/></View><Text style={[styles.text,active===tab.id&&{color:'#FFE092'}]}>{tab.id==='settings'?'Cài đặt':tab.label}</Text></TouchableOpacity>)}</View></View>;
}
const styles=StyleSheet.create({outer:{backgroundColor:'#0C273B',borderTopWidth:1,borderColor:'#315365',paddingHorizontal:12,paddingVertical:8},dock:{width:'100%',maxWidth:760,alignSelf:'center',flexDirection:'row',gap:5},tab:{flex:1,minHeight:62,padding:6,alignItems:'center',justifyContent:'center',gap:4,borderRadius:18},active:{backgroundColor:'#254B60'},icon:{width:38,height:31,alignItems:'center',justifyContent:'center',borderRadius:11},activeIcon:{backgroundColor:'#FFD36B'},text:{fontSize:12,lineHeight:16,color:'#C2DCD9',fontWeight:'800',textAlign:'center'}});
