import React, {useState} from 'react';
import {View, Text, Linking} from 'react-native';
import {CheckpointDetailData} from '../types/curriculum';
import {Action, s} from './LearningUI';
import {INTERNAL_PREVIEW} from '../services/api';

export function LessonGuide({content, practice=false}: {content: NonNullable<CheckpointDetailData['learningContent']>; practice?: boolean}) {
  const [sources,setSources]=useState(false),[error,setError]=useState('');
  const open=async(url:string)=>{try{if(new URL(url).protocol!=='https:')throw Error();await Linking.openURL(url);setError('');}catch{setError('Chưa mở được nguồn. Có thể thử lại sau.');}};
  return <View style={s.card}>
    <Text accessibilityRole="header" style={s.heading}>{practice?'Cùng cha mẹ thực hành':'Cùng đọc trước khi chọn'}</Text>
    {INTERNAL_PREVIEW?<Text style={s.small}>Bài nháp có AI hỗ trợ · Chưa được chuyên gia duyệt · Chỉ để người lớn kiểm tra.</Text>:null}
    {practice?<><Text style={s.body}>{content.activity}</Text><Text style={s.heading}>Kể lại theo cách của con</Text><Text style={s.body}>{content.teachBack}</Text><Text style={s.small}>Không cần nhập câu trả lời hay chuyện riêng vào ứng dụng. Có thể dừng nếu không thoải mái.</Text></>:<><Text style={s.small}>{content.objective}</Text><Text style={s.body}>{content.story}</Text>{content.keyPoints.map((point,i)=><Text key={i} style={s.body}>{point}</Text>)}</>}
    <Action secondary label={sources?'Ẩn nguồn dành cho người lớn':'Xem nguồn dành cho người lớn'} onPress={()=>setSources(!sources)}/>
    {sources?<><Text style={s.small}>Liên kết mở trang ngoài, có thể bằng tiếng Anh. Dẫn nguồn không có nghĩa tổ chức đó chứng nhận Milo.</Text>{content.sources.map(source=><Action key={source.url} secondary label={source.publisher+' — '+source.title} onPress={()=>open(source.url)}/>)}</>:null}
    {error?<Text accessibilityLiveRegion="polite" style={s.small}>{error}</Text>:null}
  </View>;
}
