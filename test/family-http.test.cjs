const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {randomUUID}=require('node:crypto');
require('ts-node/register/transpile-only');
let app,prisma,base,a,b,childA,childB,recovery,checkpoint,question,option;
const password='Synthetic-parent-password-123';
async function request(route,body,cookie,origin='http://localhost:8081'){
  const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  return {status:response.status,body:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
before(async()=>{
  fs.mkdirSync('scratch',{recursive:true});const dir=fs.mkdtempSync(path.resolve('scratch/family-http-'));
  fs.writeFileSync(path.join(dir,'test.db'),'');
  process.env.DATABASE_URL='file:'+path.join(dir,'test.db').replaceAll('\\','/');
  process.env.FAMILY_LEARNING_ENABLED='true';delete process.env.INTERNAL_LEARNING_PREVIEW;process.env.GEMINI_API_KEY='';
  const setup=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy'],{env:process.env,encoding:'utf8'});assert.equal(setup.status,0,setup.stderr);
  const {NestFactory}=require('@nestjs/core'),{ValidationPipe}=require('@nestjs/common');
  const {AppModule}=require('../src/app.module'),{PrismaService}=require('../src/modules/prisma/prisma.service');
  app=await NestFactory.create(AppModule,{logger:false});app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true}));
  app.useGlobalFilters(new (require('../src/common/filters/http-exception.filter').AllExceptionsFilter)());
  await app.listen(0,'127.0.0.1');base=await app.getUrl();prisma=app.get(PrismaService);
});
after(async()=>{if(app)await app.close();});

test('HTTP: register/login, secure cookie attributes, invalid password and cross-family denial',async()=>{
  const first=await request('/family/register',{login:'test_family_a',password});assert.equal(first.status,201);a=first.cookie;recovery=first.body.data.recoveryCode;
  const second=await request('/family/register',{login:'test_family_b',password});assert.equal(second.status,201);b=second.cookie;
  childA=(await request('/family/children',{nickname:'Synthetic A',age:8,password},a)).body.data;
  childB=(await request('/family/children',{nickname:'Synthetic B',age:9,password},b)).body.data;
  assert.ok(childA.id);assert.ok(childB.id);
  assert.equal((await request('/learning/journey-map?userId='+childB.id,undefined,a)).status,403);
  assert.equal((await request('/learning/journey-map?userId='+childA.id)).status,401);
  assert.equal((await request('/family/login',{login:'test_family_a',password:'wrong-password-123'})).status,401);
  const login=await fetch(base+'/family/login',{method:'POST',headers:{Origin:'http://localhost:8081','Content-Type':'application/json'},body:JSON.stringify({login:'TEST_FAMILY_A',password})});
  assert.equal(login.status,201);assert.match(login.headers.get('set-cookie'),/HttpOnly/);assert.match(login.headers.get('set-cookie'),/SameSite=Strict/);
  assert.equal((await request('/family/children',{nickname:'Invalid',age:100,password},a)).status,400);
  assert.equal((await request('/family/children',{nickname:'CSRF',age:8,password},a,'https://untrusted.invalid')).status,403);
});

test('HTTP: only reviewed current versions enter family map; withdrawal rejects new attempts',async()=>{
  const zone=await prisma.zone.create({data:{zoneNumber:1,title:'Synthetic',description:'Not child guidance',iconName:'test'}});
  const stage=await prisma.stage.create({data:{zoneId:zone.id,stageNumber:1,title:'Synthetic',description:'Test'}});
  const lesson=await prisma.lesson.create({data:{stageId:stage.id,lessonNumber:1,title:'Synthetic',description:'Test',contentJson:'{}'}});
  checkpoint=await prisma.checkpoint.create({data:{lessonId:lesson.id,checkpointNumber:1,title:'Synthetic',description:'Test'}});
  question=await prisma.testQuestion.create({data:{checkpointId:checkpoint.id,questionNumber:1,promptText:'Synthetic?',explanation:'Test'}});
  option=await prisma.questionOption.create({data:{testQuestionId:question.id,optionText:'Synthetic',isCorrect:true}});
  const map=await request('/learning/journey-map?userId='+childA.id,undefined,a);assert.deepEqual(map.body.data.zones,[]);
  const {LearningService}=require('../src/modules/learning/learning.service');const service=new LearningService(prisma);
  const content=await prisma.checkpoint.findUnique({where:{id:checkpoint.id},include:{lesson:true,questions:{include:{options:true}}}});
  const version=service.fingerprint(content);
  await prisma.contentApproval.create({data:{checkpointId:checkpoint.id,contentVersion:version,status:'PUBLISHED',reviewer:'SYNTHETIC TEST ONLY',source:'Synthetic fixture, not review evidence',reviewedAt:new Date(),snapshot:JSON.stringify(content)}});
  const details=await request('/learning/checkpoints/'+checkpoint.id+'?userId='+childA.id,undefined,a);assert.equal(details.status,200);
  const body={userId:childA.id,attemptId:randomUUID(),contentVersion:version,answers:[{questionId:question.id,selectedOptionId:option.id,responseTimeMs:1}],totalTimeTakenSeconds:1};
  assert.equal((await request('/learning/checkpoints/'+checkpoint.id+'/submit',body,b)).status,403);
  const receipt=await request('/learning/checkpoints/'+checkpoint.id+'/submit',body,a);assert.equal(receipt.status,200);assert.equal(receipt.body.data.score,100);
  await prisma.contentApproval.updateMany({data:{status:'WITHDRAWN'}});
  assert.equal((await request('/learning/checkpoints/'+checkpoint.id+'?userId='+childA.id,undefined,a)).status,404);
  assert.equal((await request('/learning/checkpoints/'+checkpoint.id+'/submit',{...body,attemptId:randomUUID()},a)).status,404);
  const oldReceipt=(await request('/learning/checkpoints/'+checkpoint.id+'/submit',body,a)).body.data;
  assert.equal(oldReceipt.testResultId,body.attemptId);assert.equal(oldReceipt.contentRetired,true);assert.deepEqual(oldReceipt.review,[]);
});

test('HTTP: export excludes secrets; wrong password cannot delete; correct delete cascades',async()=>{
  const feedback=await request('/family/feedback',{password,category:'USABILITY',message:'Synthetic feedback only'},a);assert.equal(feedback.status,201);assert.ok(feedback.body.data.id);
  const exported=await request('/family/export',{password},a);assert.equal(exported.status,201);
  const text=JSON.stringify(exported.body);assert.ok(!text.includes('passwordHash'));assert.ok(!text.includes('recoveryHash'));assert.ok(!text.includes('tokenHash'));
  assert.equal((await request('/family/delete-child',{childId:childB.id,password},a)).status,403);
  assert.equal((await request('/family/delete-child',{childId:childA.id,password:'wrong'},a)).status,401);
  assert.equal((await request('/family/delete-child',{childId:childA.id,password},a)).status,201);
  assert.equal(await prisma.testResult.count({where:{userId:childA.id}}),0);
  assert.equal(await prisma.lessonReward.count({where:{userId:childA.id}}),0);
});

test('HTTP: recovery code is single-use, revokes sessions; expiry and logout deny reuse',async()=>{
  const result=await request('/family/recover',{login:'test_family_a',password,code:recovery});assert.equal(result.status,201);assert.notEqual(result.body.data.recoveryCode,recovery);
  assert.equal((await request('/family/me',undefined,a)).status,401);
  assert.equal((await request('/family/recover',{login:'test_family_a',password,code:recovery})).status,401);
  const logged=await request('/family/login',{login:'test_family_a',password});a=logged.cookie;
  await request('/family/logout',{},a);assert.equal((await request('/family/me',undefined,a)).status,401);
  await prisma.familySession.updateMany({data:{expiresAt:new Date(0)}});assert.equal((await request('/family/me',undefined,b)).status,401);
});

test('HTTP: repeated wrong login is rate limited and tokens are stored hashed',async()=>{
  let last;for(let i=0;i<9;i++)last=await request('/family/login',{login:'unknown_family',password});
  assert.equal(last.status,429);
  const {FamilyService,tokenHash}=require('../src/modules/family/family.service');
  const service=app.get(FamilyService),family=await prisma.family.findFirst();
  const token=await service.createSession(family.id);
  assert.equal(await prisma.familySession.count({where:{tokenHash:token}}),0);
  assert.equal(await prisma.familySession.count({where:{tokenHash:tokenHash(token)}}),1);
  const removal=await request('/family/delete',{password},'milo_session='+token);assert.equal(removal.status,201);
  assert.equal(await prisma.family.findUnique({where:{id:family.id}}),null);
  assert.equal(await prisma.familyFeedback.count({where:{familyId:family.id}}),0);
  assert.equal(await prisma.familySession.count({where:{familyId:family.id}}),0);
  assert.equal((await request('/family/me',undefined,'milo_session='+token)).status,401);
});

test('HTTP: changing password revokes every existing session',async()=>{
  const {FamilyService}=require('../src/modules/family/family.service');const service=app.get(FamilyService);
  const family=await prisma.family.findUnique({where:{login:'test_family_b'}});
  const token=await service.createSession(family.id),other=await service.createSession(family.id);
  const changed=await request('/family/password',{password,next:password+'-changed'},'milo_session='+token);
  assert.equal(changed.status,201);await assert.rejects(service.authenticate(token));await assert.rejects(service.authenticate(other));
  await assert.rejects(service.login('test_family_b',password));assert.equal(await service.login('test_family_b',password+'-changed'),family.id);
});
