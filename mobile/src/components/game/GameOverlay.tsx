import React from 'react';
import {Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {X} from 'lucide-react-native';
import {MotionReveal,useGameExperience} from './GameMotion';
import {ink,k} from './GameKit';

export function GameOverlay({title,visible,onClose,children}: {title:string;visible:boolean;onClose:()=>void;children:React.ReactNode}) {
 const {motion,tap}=useGameExperience();
 return <Modal visible={visible} transparent animationType={motion?'fade':'none'} onRequestClose={onClose}><View style={o.scrim}><View accessibilityViewIsModal style={o.sheet}><ScrollView contentContainerStyle={{padding:18,gap:16}}><View style={o.head}><Text accessibilityRole="header" style={[k.heading,{flex:1}]}>{title}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={'Đóng '+title.toLocaleLowerCase('vi-VN')} style={o.close} onPress={()=>{tap();onClose();}}><X size={22} color={ink.navy}/></TouchableOpacity></View><MotionReveal trigger={visible?title:'closed'} style={{gap:14}}>{children}</MotionReveal></ScrollView></View></View></Modal>;
}
const o=StyleSheet.create({scrim:{flex:1,backgroundColor:'rgba(4,24,39,.8)',padding:12,alignItems:'center',justifyContent:'center'},sheet:{width:'100%',maxWidth:620,maxHeight:'94%',backgroundColor:ink.paper,borderRadius:26,borderWidth:2,borderColor:'#F4D79F',overflow:'hidden'},head:{flexDirection:'row',gap:8,alignItems:'center'},close:{width:44,height:44,alignItems:'center',justifyContent:'center',backgroundColor:'#E0EEEA',borderRadius:16}});
