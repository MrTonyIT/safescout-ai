const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),{randomUUID}=require('node:crypto');
require('ts-node/register/transpile-only');
const {PrismaClient}=require('@prisma/client');
const {LearningService}=require('../src/modules/learning/learning.service');
const {parseLessonGuide}=require('../src/modules/learning/lesson-guide');
const {readPack,importDrafts}=require('../scripts/curriculum-lib.cjs');
let p,service;
before(async()=>{
 fs.mkdirSync('scratch',{recursive:true});const dir=fs.mkdtempSync(path.resolve('scratch/curriculum-test-'));const file=path.join(dir,'test.db');fs.writeFileSync(file,'');
 const url='file:'+file.replaceAll('\\','/');
 const migration=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy'],{windowsHide:true,env:{...process.env,DATABASE_URL:url},encoding:'utf8'});assert.equal(migration.status,0,migration.stdout+migration.stderr);
 p=new PrismaClient({datasources:{db:{url}}});service=new LearningService(p);
 await p.user.create({data:{id:'user_milo_explorer_01',nickname:'Synthetic reviewer'}});await importDrafts(p);
});
after(async()=>{await p?.$disconnect();});
test('12 drafts / 3 topics / 24 questions; sources and schema resolve',async()=>{
 const {pack}=readPack();assert.deepEqual(pack.topics.map((_,i)=>pack.lessons.filter(l=>l.topic===i).length),[4,4,4]);
 assert.equal(await p.lesson.count(),12);assert.equal(await p.testQuestion.count(),24);
 for(const l of await p.lesson.findMany())assert.ok(parseLessonGuide(l.contentJson));
 const approvals=await p.contentApproval.findMany();assert.equal(approvals.length,12);
 assert.ok(approvals.every(a=>a.status==='DRAFT'&&!a.reviewer&&!a.reviewedAt));
});
test('reimport refuses existing curriculum without changing it',async()=>{
 await assert.rejects(()=>importDrafts(p),/empty curriculum/);assert.equal(await p.lesson.count(),12);
});
test('family profile cannot see or open unreviewed curriculum',async()=>{
 const family=await p.family.create({data:{login:'draft-test-family',passwordHash:'not-a-real-password',recoveryHash:'synthetic-recovery'}});
 const child=await p.user.create({data:{nickname:'Synthetic family child',familyId:family.id,age:8}});
 const map=await service.getJourneyMap(child.id);assert.equal(map.zones.length,0);
 await assert.rejects(()=>service.getCheckpointDetails('milo-H01-check',child.id));
});
test('all 12 lessons score wrong=0, correct=100; no duplicate rewards; public guide excludes review internals',async()=>{
 for(const l of readPack().pack.lessons){
  const cp='milo-'+l.id+'-check',userId='user_milo_explorer_01';
  const detail=await service.getCheckpointDetails(cp,userId);assert.ok(detail.learningContent.story);assert.equal(detail.learningContent.provenance,undefined);
  assert.ok(detail.questions.every(q=>q.options.every(o=>!('isCorrect'in o))));
  for(const correct of [false,true]){
   const answers=l.questions.map((q,i)=>({questionId:cp+'-q'+(i+1),selectedOptionId:cp+'-q'+(i+1)+'-o'+((correct?q.correct:1-q.correct)+1),responseTimeMs:1500}));
   const payload={userId,attemptId:randomUUID(),contentVersion:detail.contentVersion,answers,totalTimeTakenSeconds:3};
   const r=await service.submitCheckpointTest(userId,cp,payload);assert.equal(r.score,correct?100:0);assert.equal(r.isPassed,correct);
   const again=await service.submitCheckpointTest(userId,cp,payload);assert.equal(again.testResultId,r.testResultId);
  }
 }
 assert.equal((await p.user.findUniqueOrThrow({where:{id:'user_milo_explorer_01'}})).totalSafetyScore,240);
});
test('changing teaching text changes approval fingerprint',async()=>{
 const cp=await p.checkpoint.findUniqueOrThrow({where:{id:'milo-H01-check'},include:{lesson:true,questions:{include:{options:true}}}});
 const before=service.fingerprint(cp);cp.lesson.contentJson=JSON.stringify({...JSON.parse(cp.lesson.contentJson),story:'Một tình huống khác cần duyệt lại.'});assert.notEqual(service.fingerprint(cp),before);
});
test('scene meaning is versioned with content and only supported scene revisions render',async()=>{
 const cp=await p.checkpoint.findUniqueOrThrow({where:{id:'milo-H01-check'},include:{lesson:true,questions:{include:{options:true}}}});
 const content=JSON.parse(cp.lesson.contentJson);assert.deepEqual(parseLessonGuide(cp.lesson.contentJson).presentation,{scene:'home-hot-cup',revision:1});
 const before=service.fingerprint(cp);content.presentation.revision=2;cp.lesson.contentJson=JSON.stringify(content);
 assert.notEqual(service.fingerprint(cp),before);assert.equal(parseLessonGuide(cp.lesson.contentJson).presentation,undefined);
});
test('public guide rejects malformed content and unsafe URL schemes',()=>{
 assert.equal(parseLessonGuide('{}'),null);assert.equal(parseLessonGuide('not json'),null);
 const base={schemaVersion:1,objective:'a',story:'b',keyPoints:['c'],activity:'d',teachBack:'e',sources:[{title:'t',publisher:'p',url:'javascript:alert(1)'}]};
 assert.equal(parseLessonGuide(JSON.stringify(base)),null);base.sources[0].url='https://example.org/';assert.ok(parseLessonGuide(JSON.stringify(base)));
});
