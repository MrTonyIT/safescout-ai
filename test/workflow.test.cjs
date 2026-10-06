const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const Module = require('node:module');
require('ts-node/register/transpile-only');
process.env.GEMINI_API_KEY = '';
const values = new Map();
const storage = { getItem: async k => values.get(k) ?? null, setItem: async (k,v) => { values.set(k,v); }, removeItem: async k => values.delete(k) };
const originalLoad = Module._load;
Module._load = function(name, ...args) {
  if (name === 'react-native') return {Platform:{OS:'web'}};
  if (name === '@react-native-async-storage/async-storage') return {__esModule:true,default:storage};
  return originalLoad.call(this,name,...args);
};
const { PrismaClient } = require('@prisma/client');
const { LearningService } = require('../src/modules/learning/learning.service');
const { ParentService } = require('../src/modules/parent/parent.service');
const { AiService } = require('../src/modules/ai/ai.service');
const { ReleaseGuard } = require('../src/common/guards/release.guard');
const api = require('../mobile/src/services/api');
const { OfflineStorageEngine } = require('../mobile/src/services/offlineStorage');
const queue = require('../mobile/src/services/attemptQueue');
const { e2eeSecurity } = require('../mobile/src/services/e2eeSecurity');
let prisma, learning, cp, userId, questions, contentVersion;
before(async () => {
  fs.mkdirSync('scratch', {recursive:true});
  const dir = fs.mkdtempSync(path.resolve('scratch/workflow-test-'));
  fs.writeFileSync(path.join(dir, 'test.db'), '');
  const databaseUrl = 'file:' + path.join(dir,'test.db').replaceAll('\\','/');
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'),'migrate','deploy'], {cwd:path.resolve('.'),env:{...process.env,DATABASE_URL:databaseUrl},encoding:'utf8'});
  assert.equal(result.status,0,result.stdout + result.stderr);
  prisma = new PrismaClient({datasources:{db:{url:databaseUrl}}});
  learning = new LearningService(prisma);
  userId = (await prisma.user.create({data:{nickname:'Synthetic learner'}})).id;
  const zone = await prisma.zone.create({data:{zoneNumber:1,title:'Synthetic zone',description:'Test only',iconName:'test'}});
  const stage = await prisma.stage.create({data:{zoneId:zone.id,stageNumber:1,title:'Synthetic stage',description:'Test only'}});
  const lesson = await prisma.lesson.create({data:{stageId:stage.id,lessonNumber:1,title:'Synthetic lesson',description:'Test only',contentJson:'{}',rewardXp:100}});
  cp = await prisma.checkpoint.create({data:{lessonId:lesson.id,checkpointNumber:1,title:'Synthetic checkpoint',description:'Test only',passScoreThreshold:50}});
  questions=[];
  for(let i=0;i<2;i++) {
    const q=await prisma.testQuestion.create({data:{checkpointId:cp.id,questionNumber:i+1,promptText:'Synthetic question',explanation:'Synthetic explanation',orderIndex:i}});
    const wrong=await prisma.questionOption.create({data:{testQuestionId:q.id,optionText:'Wrong',isCorrect:false,displayOrder:0}});
    const right=await prisma.questionOption.create({data:{testQuestionId:q.id,optionText:'Right',isCorrect:true,displayOrder:1}});
    questions.push({q,wrong,right});
  }
  contentVersion=(await learning.getCheckpointDetails(cp.id,userId)).contentVersion;
  await prisma.badge.create({data:{zoneId:zone.id,name:'Synthetic badge',code:'test-badge',description:'Test only',iconUrl:'',requiredShardsCount:2}});
});
after(async () => {if(prisma)await prisma.$disconnect();Module._load=originalLoad;});
const payload = (correct, attemptId=randomUUID()) => ({userId,attemptId,contentVersion,answers:questions.map(({q,right,wrong},i)=>({questionId:q.id,selectedOptionId:(i<correct?right:wrong).id,responseTimeMs:1000})),totalTimeTakenSeconds:2});
test('Q02: all incorrect receives 0 and no reward', async () => {
  const result=await learning.submitCheckpointTest(userId,cp.id,payload(0));
  assert.equal(result.score,0);assert.equal(result.isPassed,false);assert.equal(result.starsEarned,0);
  assert.equal((await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore,0);
});
test('Q02: empty answers never pass', async () => {
  const p=payload(0);p.answers=[];
  const r=await learning.submitCheckpointTest(userId,cp.id,p);assert.equal(r.score,0);assert.equal(r.isPassed,false);
});
test('Q03: correctness uses data, not option suffix or display order', async () => {
  const r=await learning.submitCheckpointTest(userId,cp.id,payload(2));assert.equal(r.score,100);
});
test('Q04: retry returns the same receipt without another reward', async () => {
  const p=payload(2);const before=await prisma.user.findUnique({where:{id:userId}});
  const first=await learning.submitCheckpointTest(userId,cp.id,p);
  const second=await learning.submitCheckpointTest(userId,cp.id,p);
  assert.deepEqual(first,second);
  assert.equal((await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore,before.totalSafetyScore);
  assert.equal(await prisma.testResult.count({where:{id:p.attemptId}}),1);
});
test('Q04: reused attempt ID with different content is rejected', async () => {
  const p=payload(2);await learning.submitCheckpointTest(userId,cp.id,p);
  await assert.rejects(learning.submitCheckpointTest(userId,cp.id,{...p,answers:[]}),/dữ liệu khác/);
});
test('G1: a lower passing score never overwrites the best score', async () => {
  await learning.submitCheckpointTest(userId,cp.id,payload(1));
  const progress=await prisma.userLessonProgress.findFirst({where:{userId}});assert.equal(progress.score,100);assert.equal(progress.stars,3);
});
test('G1: duplicate and foreign questions are rejected before writing', async () => {
  const p=payload(1);p.answers=[p.answers[0],p.answers[0]];
  await assert.rejects(learning.submitCheckpointTest(userId,cp.id,p),/trùng/);
  p.answers=[{questionId:'foreign',responseTimeMs:1}];await assert.rejects(learning.submitCheckpointTest(userId,cp.id,p),/không thuộc/);
});
test('G1: map carries real checkpoint IDs', async () => {
  const map=await learning.getJourneyMap(userId);assert.equal(map.zones[0].stages[0].lessons[0].checkpointIds[0],cp.id);
});

test('Q02: an order question without configured correct options cannot pass', async () => {
  const lessonId=cp.lessonId;
  const checkpoint=await prisma.checkpoint.create({data:{lessonId,checkpointNumber:2,title:'Invalid draft',description:'Test only'}});
  const question=await prisma.testQuestion.create({data:{checkpointId:checkpoint.id,questionNumber:1,promptText:'Draft',questionType:'DRAG_DROP_ORDER',explanation:'Draft'}});
  await assert.rejects(learning.getCheckpointDetails(checkpoint.id,userId), /chưa có nội dung hợp lệ/);
  assert.equal(await prisma.testResult.count({where:{checkpointId:checkpoint.id}}),0);
});

test('N01/N02/N06: all checkpoints required, prerequisite enforced, next zone opens', async () => {
  // Complete the extra draft checkpoint for the original fixture so new lessons can be reached.
  const draft=await prisma.checkpoint.findFirst({where:{lessonId:cp.lessonId,checkpointNumber:2},include:{questions:true}});
  const opt=await prisma.questionOption.create({data:{testQuestionId:draft.questions[0].id,optionText:'Only step',isCorrect:true,displayOrder:0}});
  const draftVersion=(await learning.getCheckpointDetails(draft.id,userId)).contentVersion;
  await learning.submitCheckpointTest(userId,draft.id,{userId,attemptId:randomUUID(),contentVersion:draftVersion,answers:[{questionId:draft.questions[0].id,orderedOptionIds:[opt.id],responseTimeMs:1}],totalTimeTakenSeconds:1});
  const lesson0=await prisma.lesson.findUnique({where:{id:cp.lessonId}});
  const lesson=await prisma.lesson.create({data:{stageId:lesson0.stageId,lessonNumber:2,title:'Two parts',description:'Synthetic',contentJson:'{}',rewardXp:40}});
  async function part(n){const c=await prisma.checkpoint.create({data:{lessonId:lesson.id,checkpointNumber:n,title:'Part',description:'Synthetic'}});const q=await prisma.testQuestion.create({data:{checkpointId:c.id,questionNumber:1,promptText:'Test',explanation:'Test'}});const o=await prisma.questionOption.create({data:{testQuestionId:q.id,optionText:'Correct',isCorrect:true}});return {c,q,o};}
  const a=await part(1),b=await part(2);
  const zone=await prisma.zone.create({data:{zoneNumber:2,title:'Next zone',description:'Synthetic',iconName:'test',unlockLevel:99}});
  const stage=await prisma.stage.create({data:{zoneId:zone.id,stageNumber:1,title:'Next',description:'Synthetic'}});
  const lockedLesson=await prisma.lesson.create({data:{stageId:stage.id,lessonNumber:1,title:'Locked',description:'Synthetic',contentJson:'{}'}});
  const locked=await prisma.checkpoint.create({data:{lessonId:lockedLesson.id,checkpointNumber:1,title:'Locked',description:'Synthetic'}});
  await prisma.testQuestion.create({data:{checkpointId:locked.id,questionNumber:1,promptText:'Synthetic',explanation:'Synthetic',options:{create:{optionText:'One',isCorrect:true}}}});
  await assert.rejects(learning.getCheckpointDetails(locked.id,userId),/hoàn thành bài trước/);
  await assert.rejects(learning.submitCheckpointTest(userId,locked.id,{...payload(0),answers:[]}),/hoàn thành bài trước/);
  const beforeXp=(await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore;
  async function pass(p){const v=(await learning.getCheckpointDetails(p.c.id,userId)).contentVersion;return learning.submitCheckpointTest(userId,p.c.id,{userId,attemptId:randomUUID(),contentVersion:v,answers:[{questionId:p.q.id,selectedOptionId:p.o.id,responseTimeMs:1}],totalTimeTakenSeconds:1});}
  await pass(a);
  assert.equal((await prisma.userLessonProgress.findUnique({where:{userId_lessonId:{userId,lessonId:lesson.id}}})).isCompleted,false);
  assert.equal((await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore,beforeXp);
  assert.equal((await learning.getJourneyMap(userId)).zones[1].isUnlocked,false);
  await pass(b);
  assert.equal((await prisma.userLessonProgress.findUnique({where:{userId_lessonId:{userId,lessonId:lesson.id}}})).isCompleted,true);
  assert.equal((await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore,beforeXp+40);
  assert.equal((await learning.getJourneyMap(userId)).zones[1].isUnlocked,true);
  await pass(b);assert.equal((await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore,beforeXp+40);
});

test('N03: changed content rejects old version without writing a result', async()=>{
  const old=await learning.getCheckpointDetails(cp.id,userId);
  assert.equal(Object.hasOwn(old.questions[0].options[0],'isCorrect'),false);
  await prisma.testQuestion.update({where:{id:questions[0].q.id},data:{promptText:'Changed content'}});
  const p={...payload(2),contentVersion:old.contentVersion};
  await assert.rejects(learning.submitCheckpointTest(userId,cp.id,p),/Nội dung bài đã thay đổi/);
  assert.equal(await prisma.testResult.count({where:{id:p.attemptId}}),0);
});

test('N04: permanent failure preserves its attempt but does not block valid items',async()=>{
  const bad={attemptId:randomUUID(),userId:'poison',checkpointId:'deleted',contentVersion:'v',answers:[],totalTimeTakenSeconds:1};
  const good={...bad,attemptId:randomUUID(),checkpointId:'valid'};
  await queue.savePending(bad);await queue.savePending(good);
  api.apiClient.defaults.adapter=async config=>{if(config.url.includes('deleted')){const e=Error('Gone');e.response={status:404};throw e;}return {data:{success:true,data:{testResultId:good.attemptId}},status:200,headers:{},config};};
  const status=await queue.syncPending('poison');assert.equal(status.remaining,1);assert.equal(status.blocked,1);
  assert.equal((await queue.readPending('poison'))[0].attemptId,bad.attemptId);
});
test('Q06: master PIN does not bypass the actual stored PIN', async () => {
  const bcrypt=require('bcrypt');const pinHash=await bcrypt.hash('9876',4);
  const parent=new ParentService({parentGate:{findUnique:async()=>({pinHash})}});
  await assert.rejects(parent.verifyPin('synthetic','1234'));assert.equal(await parent.verifyPin('synthetic','9876'),true);
});
test('Q06: missing gate never permits 0000 or 1234', async () => {
  const parent=new ParentService({parentGate:{findUnique:async()=>null}});
  await assert.rejects(parent.verifyPin('synthetic','0000'));await assert.rejects(parent.verifyPin('synthetic','1234'));
});
test('G0: gated API routes remain blocked even when called directly', () => {
  const guard=new ReleaseGuard();
  for(const name of ['AiController','ParentController','LearningController']) {
    delete process.env.INTERNAL_LEARNING_PREVIEW;
    assert.throws(()=>guard.canActivate({getClass:()=>({name}),getHandler:()=>({name:'scan'})}));
  }
});
test('Q10: missing AI and invalid hazard never become SAFE', async () => {
  const ai=new AiService();assert.equal((await ai.scanEnvironment(Buffer.from('test'),'image/jpeg')).hazardLevel,'UNKNOWN');
  assert.equal(ai.parseAndValidateMiloResponse('{"speech":"test","hazardLevel":"oops"}','test').hazardLevel,'UNKNOWN');
});
test('Q01/Q05: fresh inventory is empty and persists across instances', async () => {
  const a=new OfflineStorageEngine('a');assert.equal((await a.getBadgeInventory()).reduce((n,b)=>n+b.shardsCollected,0),0);
  await a.addShardToBadge(8,1);assert.equal((await new OfflineStorageEngine('a').getBadgeInventory()).find(b=>b.zoneNumber===8).shardsCollected,1);
  assert.equal((await new OfflineStorageEngine('b').getBadgeInventory()).find(b=>b.zoneNumber===8).shardsCollected,0);
});
test('Q02: offline API rejects submission instead of fabricating a score', async () => {
  api.apiClient.defaults.adapter=async()=>{throw Error('SIMULATED_OFFLINE')};
  await assert.rejects(api.submitTestAnswers('cp','a',[],3,randomUUID()),/SIMULATED_OFFLINE/);
  await assert.rejects(api.fetchJourneyMap('a'),/SIMULATED_OFFLINE/);
  await assert.rejects(api.fetchCheckpointDetails('cp','a'),/SIMULATED_OFFLINE/);
});
test('Q13: disabled PIN/settings never report successful changes', async () => {
  assert.equal(await api.verifyParentPin('1234'),false);
  assert.equal((await api.updateParentPin('1234','9876')).success,false);
  assert.equal((await api.updateParentSettings('1234',{dailyTimeLimitMinutes:0})).success,false);
});
test('Q05: pending submission persists once and drains only after receipt', async () => {
  const item={attemptId:randomUUID(),contentVersion:'v1',checkpointId:'c',userId:'queue-a',answers:[],totalTimeTakenSeconds:3};
  await queue.savePending(item);await queue.savePending(item);assert.equal((await queue.readPending('queue-a')).length,1);
  assert.equal((await queue.syncPending('queue-a')).remaining,1);assert.equal((await queue.readPending('queue-a')).length,1);
  api.apiClient.defaults.adapter=async config=>({data:{success:true,data:{testResultId:item.attemptId}},status:200,statusText:'OK',headers:{},config});
  await queue.syncPending('queue-a');assert.equal((await queue.readPending('queue-a')).length,0);
  assert.equal((await queue.readPending('queue-b')).length,0);
});
test('G0: unavailable encryption never returns a verified location', () => {
  assert.throws(()=>e2eeSecurity.encryptCoordinates(1,2));assert.throws(()=>e2eeSecurity.decryptCoordinates({cipherText:'bad'}));
});

test('Q05: acknowledging a receipt only removes its own pending attempt', async () => {
  const a={attemptId:randomUUID(),checkpointId:'c',userId:'ack-user',answers:[],totalTimeTakenSeconds:1};
  const b={...a,attemptId:randomUUID()};
  await queue.savePending(a);await queue.savePending(b);
  await queue.acknowledgePending(a.userId,a.attemptId);
  assert.deepEqual((await queue.readPending(a.userId)).map(x=>x.attemptId),[b.attemptId]);
});
test('Q09: remote alert reports disabled, not delivered', async () => {
  const {dispatchSosBeaconToParent}=require('../mobile/src/services/geo');
  assert.equal((await dispatchSosBeaconToParent('MANUAL')).success,false);
});

test('N05/Q14: old schema upgrade preserves user data and a closed SQLite backup restores',async()=>{
  const dir=fs.mkdtempSync(path.resolve('scratch/upgrade-test-'));const file=path.join(dir,'old.db');fs.writeFileSync(file,'');const url='file:'+file.replaceAll('\\','/');
  const cli=args=>{const r=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),...args],{env:{...process.env,DATABASE_URL:url},encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);};
  cli(['db','execute','--file','prisma/migrations/20260925_initial/migration.sql','--url',url]);
  let old=new PrismaClient({datasources:{db:{url}}});const user=await old.user.create({data:{nickname:'Upgrade fixture',totalSafetyScore:37},select:{id:true}});await old.$disconnect();
  cli(['migrate','resolve','--applied','20260925_initial']);cli(['migrate','deploy']);
  old=new PrismaClient({datasources:{db:{url}}});assert.equal((await old.user.findUnique({where:{id:user.id}})).totalSafetyScore,37);await old.$disconnect();
  const backup=path.join(dir,'backup.db');fs.copyFileSync(file,backup);
  old=new PrismaClient({datasources:{db:{url}}});await old.user.update({where:{id:user.id},data:{totalSafetyScore:99}});await old.$disconnect();
  const restored=path.join(dir,'restored.db');fs.copyFileSync(backup,restored);
  const restoredClient=new PrismaClient({datasources:{db:{url:'file:'+restored.replaceAll('\\','/')}}});try{assert.equal((await restoredClient.user.findUnique({where:{id:user.id}})).totalSafetyScore,37);}finally{await restoredClient.$disconnect();}
});

test('N07: opt-in draft seed never overwrites learner XP or creates a default PIN',async()=>{
  const dir=fs.mkdtempSync(path.resolve('scratch/seed-test-'));const file=path.join(dir,'seed.db');fs.writeFileSync(file,'');const url='file:'+file.replaceAll('\\','/');
  const env={...process.env,DATABASE_URL:url,ALLOW_UNREVIEWED_CONTENT_SEED:'true'};
  const setup=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy'],{env,encoding:'utf8'});assert.equal(setup.status,0,setup.stderr);
  const client=new PrismaClient({datasources:{db:{url}}});
  try{await client.user.create({data:{id:'user_milo_explorer_01',nickname:'Preserve me',totalSafetyScore:37,explorerLevel:1}});
    for(let i=0;i<2;i++){const seeded=spawnSync(process.execPath,['-r','ts-node/register/transpile-only','prisma/seed.ts'],{env,encoding:'utf8'});assert.equal(seeded.status,0,seeded.stderr);}
    const user=await client.user.findUnique({where:{id:'user_milo_explorer_01'}});assert.equal(user.totalSafetyScore,37);assert.equal(user.explorerLevel,1);assert.equal(await client.parentGate.count(),0);
    assert.equal(await client.stage.count({where:{title:{contains:'Lightning Crouch'}}}),0);
  }finally{await client.$disconnect();}
});

test('Q04: concurrent duplicate submissions and subsequent retry keep a single receipt',async()=>{
  const p={...payload(2),contentVersion:(await learning.getCheckpointDetails(cp.id,userId)).contentVersion};
  const before=(await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore;
  await Promise.allSettled([learning.submitCheckpointTest(userId,cp.id,p),learning.submitCheckpointTest(userId,cp.id,p)]);
  const receipt=await learning.submitCheckpointTest(userId,cp.id,p);
  assert.equal(receipt.score,100);assert.equal(await prisma.testResult.count({where:{id:p.attemptId}}),1);
  assert.equal((await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore,before);
});

test('R01/R18: extending a completed lesson cannot award XP twice; attempts retain snapshots',async()=>{
  const before=(await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore;
  const parts=[];
  for(let n=3;n<=4;n++){
    const c=await prisma.checkpoint.create({data:{lessonId:cp.lessonId,checkpointNumber:n,title:'Extension',description:'Synthetic'}});
    const q=await prisma.testQuestion.create({data:{checkpointId:c.id,questionNumber:1,promptText:'Synthetic extension',explanation:'Test only',options:{create:{optionText:'One',isCorrect:true}}},include:{options:true}});
    parts.push({c,q});
  }
  for(const {c,q} of parts){
    const version=(await learning.getCheckpointDetails(c.id,userId)).contentVersion;
    const p={userId,attemptId:randomUUID(),contentVersion:version,answers:[{questionId:q.id,selectedOptionId:q.options[0].id,responseTimeMs:1}],totalTimeTakenSeconds:1};
    const result=await learning.submitCheckpointTest(userId,c.id,p);
    assert.equal(result.review[0].isCorrect,true);
    const record=await prisma.testResult.findUnique({where:{id:p.attemptId}});
    assert.equal(record.contentVersion,version);assert.equal(JSON.parse(record.contentSnapshot).questions[0].id,q.id);
  }
  assert.equal((await prisma.user.findUnique({where:{id:userId}})).totalSafetyScore,before);
  assert.equal(await prisma.lessonReward.count({where:{userId,lessonId:cp.lessonId}}),1);
});

test('R02: changed content requires a current-version pass',async()=>{
  await prisma.testQuestion.update({where:{id:questions[0].q.id},data:{promptText:'New version again'}});
  const map=await learning.getJourneyMap(userId);
  const lesson=map.zones.flatMap(z=>z.stages.flatMap(s=>s.lessons)).find(l=>l.id===cp.lessonId);
  assert.notEqual(lesson.status,'COMPLETED');assert.equal(lesson.completedCheckpointIds.includes(cp.id),false);
});

test('R03: unavailable draft does not lock a valid later lesson',async()=>{
  const zone=await prisma.zone.create({data:{zoneNumber:0,title:'Test start',description:'Test',iconName:'test'}});
  const stage=await prisma.stage.create({data:{zoneId:zone.id,stageNumber:1,title:'Test',description:'Test'}});
  await prisma.lesson.create({data:{stageId:stage.id,lessonNumber:1,title:'Empty draft',description:'Test',contentJson:'{}'}});
  const ready=await prisma.lesson.create({data:{stageId:stage.id,lessonNumber:2,title:'Ready',description:'Test',contentJson:'{}',checkpoints:{create:{checkpointNumber:1,title:'Test',description:'Test',questions:{create:{questionNumber:1,promptText:'Test',explanation:'Test',options:{create:{optionText:'Test',isCorrect:true}}}}}}}});
  const lessons=(await learning.getJourneyMap(userId)).zones[0].stages[0].lessons;
  assert.equal(lessons[0].isAvailable,false);assert.equal(lessons.find(l=>l.id===ready.id).status,'UNLOCKED');
});

test('R04/R15: permission recovery retries; corrupt storage is preserved',async()=>{
  const item={attemptId:randomUUID(),contentVersion:'version',userId:'recover-queue',checkpointId:'cp',answers:[],totalTimeTakenSeconds:1};
  await queue.savePending(item);
  api.apiClient.defaults.adapter=async()=>{const e=Error('Locked');e.response={status:403};throw e;};
  assert.equal((await queue.syncPending(item.userId)).remaining,1);
  api.apiClient.defaults.adapter=async config=>({data:{success:true,data:{testResultId:item.attemptId}},status:200,headers:{},config});
  assert.equal((await queue.syncPending(item.userId)).remaining,0);
  values.set('milo_pending_v2:broken','[null]');
  await assert.rejects(queue.readPending('broken'));await assert.rejects(queue.savePending({...item,userId:'broken'}));
  assert.equal(values.get('milo_pending_v2:broken'),'[null]');
});

test('R05: stop and mute cancel delayed speech',async()=>{
  let calls=0;
  global.window={speechSynthesis:{getVoices:()=>[],cancel(){},speak(){calls++;},paused:false}};
  global.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
  const {voiceService}=require('../mobile/src/services/voice');
  voiceService.setMuted(false);voiceService.speakMilo('Test');voiceService.stop();
  await new Promise(r=>setTimeout(r,60));assert.equal(calls,0);
  voiceService.speakMilo('Test');voiceService.setMuted(true);
  await new Promise(r=>setTimeout(r,60));assert.equal(calls,0);
  delete global.window;delete global.SpeechSynthesisUtterance;
});

test('R06: drafts survive reload, isolate profiles and detect changed content',async()=>{
  const drafts=require('../mobile/src/services/lessonDraft');
  const d={userId:'draft-a',checkpointId:'cp',contentVersion:'v1',attemptId:randomUUID(),answers:[{questionId:'q',responseTimeMs:1}],index:0,selected:['o'],confirmed:true,started:Date.now(),savedAt:Date.now(),frozen:null};
  await drafts.saveDraft(d);assert.deepEqual(await drafts.readDraft('draft-a','cp'),d);
  assert.equal(await drafts.readDraft('draft-b','cp'),null);
  assert.equal(drafts.matchesDraft(d,{contentVersion:'v2',questions:[{id:'q'}]}),false);
  await drafts.clearDraft('draft-a','cp');assert.equal(await drafts.readDraft('draft-a','cp'),null);
});

