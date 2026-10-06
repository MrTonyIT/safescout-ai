import React,{useState} from 'react';
import {View,Text,Image,StyleSheet,TouchableOpacity,useWindowDimensions} from 'react-native';
import Svg,{Path} from 'react-native-svg';
import {JourneyMapData} from '../types/curriculum';
import {CartoonIslandStageNode} from './CartoonIslandStageNode';
import {BiomeBackground} from './BiomeBackground';
import {Action} from './LearningUI';

export function QuestScene({index,total,finished=false}:{index:number;total:number;finished?:boolean}){
 return <View style={{backgroundColor:'#1D4566',borderRadius:24,padding:16,gap:14,borderWidth:2,borderColor:'#3E7089'}}><View style={{flexDirection:'row',alignItems:'center',gap:14}}><Image source={require('../../assets/milo_thinking.png')} style={{width:90,height:110,resizeMode:'contain'}} accessible={false}/><View style={{flex:1,gap:8}}><Text style={{color:'#FFE088',fontSize:13,fontWeight:'900',letterSpacing:1}}>NHIỆM VỤ CÙNG MILO</Text><Text style={{color:'#FFFFFF',fontSize:21,fontWeight:'800'}}>{finished?'Cùng xem lại hành trình':`Chặng thử thách ${index+1} / ${total}`}</Text></View></View><View accessibilityRole="progressbar" accessibilityValue={{min:0,max:total,now:finished?total:index}} style={{height:12,borderRadius:9,backgroundColor:'#102B44',overflow:'hidden'}}><View style={{height:12,width:`${total?(finished?100:index/total*100):0}%`,backgroundColor:'#FFD86D',borderRadius:9}}/></View></View>;
}

export function GameJourney({data,search,open}:{data:JourneyMapData;search:string;open:(id:string,title:string,zone:string)=>void}){
 const [chosen,setChosen]=useState<string|null>(null);
 const width=Math.min(useWindowDimensions().width-32,820);
 const zone=data.zones.find(z=>z.id===chosen)||data.zones[0];
 if(!zone)return null;
 const lessons=zone.stages.flatMap(st=>st.lessons).filter(l=>l.isAvailable!==false&&(!search.trim()||(l.title+' '+l.description+' '+zone.title).toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN'))));
 return <View style={{gap:16}}>
  <View style={g.tabs}>{data.zones.map((z,i)=><TouchableOpacity key={z.id} accessibilityRole="button" accessibilityState={{selected:z.id===zone.id}} onPress={()=>setChosen(z.id)} style={[g.tab,z.id===zone.id&&g.active]}><Text style={g.tabText}>{['🌿','🏰','⭐'][i%3]} {z.title}{!z.isUnlocked?' · 🔒':''}</Text></TouchableOpacity>)}</View>
  <View style={g.world}>
   <View pointerEvents="none" style={StyleSheet.absoluteFill}><BiomeBackground zoneNumber={zone.zoneNumber} width={width} height={Math.max(1100,lessons.length*290+260)}/></View>
   <View style={g.banner}><Text style={g.eyebrow}>HỌC VIỆN THÁM HIỂM</Text><Text accessibilityRole="header" style={g.worldTitle}>{zone.title}</Text><Text style={g.caption}>{lessons.filter(l=>l.status==='COMPLETED').length}/{lessons.length} chặng đã hoàn thành</Text></View>
   <View style={g.miloRow}><Image source={require('../../assets/milo_rescue_pup.png')} style={g.milo} accessible={false}/><View style={g.bubble}><Text style={g.bubbleText}>Cùng Milo khám phá nhé! Chọn một hòn đảo để bắt đầu.</Text></View></View>
   {!zone.isUnlocked?<Text style={g.lockNote}>Hoàn thành chủ đề trước để mở các chặng này.</Text>:null}
   {lessons.map((lesson,i)=>{
    const unlocked=zone.isUnlocked&&lesson.status!=='LOCKED';
    const ids=lesson.checkpointIds||[];
    const target=ids.find(id=>!lesson.completedCheckpointIds?.includes(id))||ids[0];
    return <View key={lesson.id} style={[g.stop,{alignItems:i%2?'flex-end':'flex-start'}]}>
     {i>0?<View pointerEvents="none" style={g.path}><Svg width="100%" height={76} viewBox="0 0 300 76" preserveAspectRatio="none"><Path d={i%2?'M 70 0 C 70 45 230 25 230 76':'M 230 0 C 230 45 70 25 70 76'} stroke="#B77923" strokeWidth={18} fill="none"/><Path d={i%2?'M 70 0 C 70 45 230 25 230 76':'M 230 0 C 230 45 70 25 70 76'} stroke="#FFE895" strokeWidth={12} strokeDasharray="10 5" fill="none"/></Svg></View>:null}
     <View style={g.island}><CartoonIslandStageNode stage={{id:lesson.id,stageNumber:i+1,title:lesson.title,description:lesson.description,lessons:[lesson]}} isUnlocked={unlocked} isCompleted={lesson.status==='COMPLETED'} isBossStage={false} onPress={()=>{if(unlocked&&target)open(target,lesson.title,zone.title);}}/></View>
     <View style={g.sign}><Text accessibilityRole="header" style={g.lessonTitle}>{lesson.title}</Text><Text style={g.detail}>{lesson.status==='COMPLETED'?'🚩 Đã hoàn thành':unlocked?'✦ Sẵn sàng khám phá':'🔒 Chưa mở'} · {lesson.completedCheckpointIds?.length||0}/{ids.length} phần đã đạt</Text>{ids.map((id,j)=><Action key={id} secondary={lesson.completedCheckpointIds?.includes(id)} disabled={!unlocked} label={`${lesson.completedCheckpointIds?.includes(id)?'Ôn lại':'Học'} phần ${j+1}`} onPress={()=>open(id,lesson.title,zone.title)}/>)}</View>
    </View>;
   })}
   {!lessons.length?<Text style={g.lockNote}>Không tìm thấy bài trong chủ đề này.</Text>:null}
   <View style={g.finish}><Text style={{fontSize:40}}>🏁</Text><Text style={g.bubbleText}>Mỗi chặng học, một điều để cùng thực hành.</Text></View>
  </View>
 </View>;
}
const g=StyleSheet.create({tabs:{flexDirection:'row',flexWrap:'wrap',gap:8},tab:{padding:12,minHeight:48,borderRadius:16,backgroundColor:'#E4EDF7',borderWidth:2,borderColor:'#93AFCE',flexGrow:1},active:{backgroundColor:'#FFF0A6',borderColor:'#C18215'},tabText:{fontSize:16,fontWeight:'800',color:'#203B54'},world:{borderRadius:28,overflow:'hidden',backgroundColor:'#79CEF0',borderWidth:3,borderColor:'#FFFFFF',paddingBottom:30},banner:{margin:16,padding:16,borderRadius:20,backgroundColor:'#123554',borderWidth:2,borderColor:'#FFE286',gap:6},eyebrow:{fontSize:12,fontWeight:'900',letterSpacing:2,color:'#FFE286'},worldTitle:{fontSize:25,fontWeight:'900',color:'#FFFFFF'},caption:{color:'#DCF4FF',fontSize:15},miloRow:{flexDirection:'row',alignItems:'center',paddingHorizontal:12},milo:{width:110,height:130,resizeMode:'contain'},bubble:{flex:1,backgroundColor:'#FFFFFF',padding:14,borderRadius:18,borderBottomWidth:4,borderColor:'#9AC9C6'},bubbleText:{fontSize:17,lineHeight:25,fontWeight:'700',color:'#173D4D'},stop:{paddingHorizontal:16,paddingTop:70},island:{marginHorizontal:22},path:{position:'absolute',top:0,left:0,right:0,height:76},sign:{width:'90%',maxWidth:330,padding:14,gap:10,backgroundColor:'#FFF9DF',borderRadius:18,borderWidth:2,borderBottomWidth:5,borderColor:'#B9853B'},lessonTitle:{fontSize:20,fontWeight:'800',color:'#3D321F'},detail:{fontSize:14,lineHeight:21,color:'#554326'},lockNote:{margin:16,padding:16,backgroundColor:'#FFFFFF',borderRadius:16,fontSize:17,color:'#243E50'},finish:{margin:24,alignItems:'center',gap:12,backgroundColor:'#E9F8D9',padding:20,borderRadius:24}});
