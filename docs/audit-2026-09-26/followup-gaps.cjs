// Audit only: uses a new SQLite file and mocked queue transport. Does not edit product code or the project DB.
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process'),{randomUUID}=require('crypto'),Module=require('module');
process.chdir(path.resolve(__dirname,'../..'));require('ts-node/register/transpile-only');
const original=Module._load,storage=new Map();Module._load=function(name,...args){if(name==='react-native')return {Platform:{OS:'web'}};if(name==='@react-native-async-storage/async-storage')return {__esModule:true,default:{getItem:async k=>storage.get(k)??null,setItem:async(k,v)=>storage.set(k,v)}};return original.call(this,name,...args);};
const {PrismaClient}=require('@prisma/client'),{LearningService}=require('../../src/modules/learning/learning.service'),api=require('../../mobile/src/services/api'),queue=require('../../mobile/src/services/attemptQueue');
let p;
(async()=>{const dir=fs.mkdtempSync(path.resolve('scratch/followup-gaps-'));const file=path.join(dir,'test.db');fs.writeFileSync(file,'');const url='file:'+file.replaceAll('\\','/');const migrated=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy'],{env:{...process.env,DATABASE_URL:url},encoding:'utf8'});if(migrated.status!==0)throw Error(migrated.stderr);
 p=new PrismaClient({datasources:{db:{url}}});const service=new LearningService(p);
 const user=await p.user.create({data:{nickname:'Audit only'}}),zone=await p.zone.create({data:{zoneNumber:1,title:'Audit',description:'Synthetic',iconName:'test'}}),stage=await p.stage.create({data:{zoneId:zone.id,stageNumber:1,title:'Audit',description:'Synthetic'}});
 const lesson=await p.lesson.create({data:{stageId:stage.id,lessonNumber:1,title:'Audit',description:'Synthetic',contentJson:'{}',rewardXp:40}});
 async function part(n){const c=await p.checkpoint.create({data:{lessonId:lesson.id,checkpointNumber:n,title:'Part',description:'Synthetic'}});const q=await p.testQuestion.create({data:{checkpointId:c.id,questionNumber:1,promptText:'Question',explanation:'Synthetic'}});const o=await p.questionOption.create({data:{testQuestionId:q.id,optionText:'Correct',isCorrect:true}});return {c,q,o};}
 async function pass(x){const d=await service.getCheckpointDetails(x.c.id,user.id);return service.submitCheckpointTest(user.id,x.c.id,{userId:user.id,attemptId:randomUUID(),contentVersion:d.contentVersion,answers:[{questionId:x.q.id,selectedOptionId:x.o.id,responseTimeMs:1}],totalTimeTakenSeconds:1});}
 const a=await part(1);await pass(a);const xpBefore=(await p.user.findUnique({where:{id:user.id}})).totalSafetyScore;
 await p.testQuestion.update({where:{id:a.q.id},data:{promptText:'Changed question content'}});
 const changedMap=await service.getJourneyMap(user.id);
 const result={generatedAt:new Date().toISOString(),oldPassAfterContentChange:{lessonStatus:changedMap.zones[0].stages[0].lessons[0].status,newVersionAttemptCount:0}};
 const b=await part(2),c=await part(3);await pass(b);const intermediate=await p.userLessonProgress.findUnique({where:{userId_lessonId:{userId:user.id,lessonId:lesson.id}}});await pass(c);
 result.rewardAfterAddingParts={xpBefore,xpAfter:(await p.user.findUnique({where:{id:user.id}})).totalSafetyScore,intermediateCompleted:intermediate.isCompleted};
 await p.lesson.create({data:{stageId:stage.id,lessonNumber:2,title:'Empty draft',description:'Synthetic',contentJson:'{}'}});
 const later=await p.lesson.create({data:{stageId:stage.id,lessonNumber:3,title:'Ready later',description:'Synthetic',contentJson:'{}'}});
 await p.checkpoint.create({data:{lessonId:later.id,checkpointNumber:1,title:'Later',description:'Synthetic'}});
 result.emptyDraftBlocksLater=(await service.getJourneyMap(user.id)).zones[0].stages[0].lessons.map(l=>({title:l.title,status:l.status,parts:l.checkpointsCount}));
 const item={attemptId:randomUUID(),userId:'queue-test',checkpointId:'cp',contentVersion:'v',answers:[],totalTimeTakenSeconds:1};await queue.savePending(item);
 api.apiClient.defaults.adapter=async()=>{const e=Error('Synthetic forbidden');e.response={status:403};throw e;};await queue.syncPending(item.userId);
 let callsAfterRecovery=0;api.apiClient.defaults.adapter=async config=>{callsAfterRecovery++;return {data:{success:true,data:{testResultId:item.attemptId}},status:200,headers:{},config};};
 result.queueAfterPermissionRecovered={...await queue.syncPending(item.userId),callsAfterRecovery};
 let spoken=0,cancelled=0;global.window={speechSynthesis:{getVoices:()=>[],cancel:()=>{cancelled++;},speak:()=>{spoken++;},paused:false}};
 global.SpeechSynthesisUtterance=function(text){this.text=text;};
 const {voiceService}=require('../../mobile/src/services/voice');voiceService.speakMilo('Synthetic speech');voiceService.stop();await new Promise(r=>setTimeout(r,60));
 result.speechAfterStop={speakCallsAfterStop:spoken,cancelCalls:cancelled,scope:'mock speech engine; confirms scheduled callback, not real audio'};
 fs.writeFileSync(path.join(__dirname,'followup-gaps-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(p)await p.$disconnect();Module._load=original;});
