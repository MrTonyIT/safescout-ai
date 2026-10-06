// Creates a NEW synthetic database only. Never reads or overwrites the application's database.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {PrismaClient}=require('@prisma/client');
(async()=>{
 const root=path.resolve(__dirname,'..');process.chdir(root);fs.mkdirSync('scratch',{recursive:true});
 const dir=fs.mkdtempSync(path.resolve('scratch/learning-preview-'));const file=path.join(dir,'preview.db');fs.writeFileSync(file,'');
 const url='file:'+file.replaceAll('\\','/');const result=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy'],{env:{...process.env,DATABASE_URL:url},encoding:'utf8'});if(result.status!==0)throw Error(result.stdout+result.stderr);
 const p=new PrismaClient({datasources:{db:{url}}});
 try{
 await p.user.create({data:{id:'user_milo_explorer_01',nickname:'Hồ sơ thử giao diện'}});
 for(let z=1;z<=2;z++){
 const zone=await p.zone.create({data:{zoneNumber:z,title:'Chủ đề thử '+z,description:'Dữ liệu tổng hợp để kiểm tra phần mềm',iconName:'test',unlockLevel:z}});
 const stage=await p.stage.create({data:{zoneId:zone.id,stageNumber:1,title:'Bài thử',description:'Không phải giáo trình an toàn'}});
 const lesson=await p.lesson.create({data:{stageId:stage.id,lessonNumber:1,title:z===1?'Quan sát hình và màu':'Bài tiếp theo',description:'Dữ liệu kiểm thử giao diện, không dùng để hướng dẫn an toàn cho trẻ.',contentJson:'{}',rewardXp:40}});
 for(let n=1;n<=(z===1?2:1);n++){
 const cp=await p.checkpoint.create({data:{lessonId:lesson.id,checkpointNumber:n,title:'Phần '+n,description:'Tình huống kiểm thử'}});
 const q=await p.testQuestion.create({data:{checkpointId:cp.id,questionNumber:1,promptText:n===1?'Trong các lựa chọn dưới đây, đâu là hình tròn?':'Trong các lựa chọn dưới đây, đâu là màu xanh?',explanation:n===1?'Hình tròn không có góc. Đây chỉ là câu hỏi kiểm thử phần mềm.':'Màu xanh được ghi rõ trong lựa chọn. Đây chỉ là câu hỏi kiểm thử phần mềm.'}});
 await p.questionOption.createMany({data:[{testQuestionId:q.id,optionText:n===1?'Hình vuông':'Màu đỏ',isCorrect:false,displayOrder:0},{testQuestionId:q.id,optionText:n===1?'Hình tròn':'Màu xanh',isCorrect:true,displayOrder:1}]});
 }
 }
 }finally{await p.$disconnect();}
 fs.writeFileSync('scratch/internal-preview.json',JSON.stringify({databaseUrl:url,createdAt:new Date().toISOString(),synthetic:true},null,2));console.log('Synthetic fixture ready: scratch/internal-preview.json');
})().catch(e=>{console.error(e);process.exitCode=1;});
