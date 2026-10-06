const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function readPack(){
 const pack=JSON.parse(fs.readFileSync(path.join(root,'content/milo-12/lessons.json'),'utf8'));
 const registry=JSON.parse(fs.readFileSync(path.join(root,'content/milo-12/sources.json'),'utf8'));
 const sources=new Map(registry.sources.map(s=>[s.id,s]));
 if(pack.status!=='DRAFT'||pack.humanReviewed!==false||pack.reviewer!==null||pack.lessons.length!==12)throw Error('Expected 12 unreviewed drafts.');
 if(new Set(pack.lessons.map(l=>l.id)).size!==12||sources.size!==registry.sources.length)throw Error('Duplicate IDs.');
 for(const l of pack.lessons){
  if(!Number.isInteger(l.topic)||!pack.topics[l.topic]||!l.sourceIds.length||l.sourceIds.some(id=>!sources.has(id))||!l.questions.length)throw Error('Invalid mapping: '+l.id);
  for(const k of ['title','objective','story','activity','teachBack','reviewFocus'])if(!l[k]?.trim())throw Error('Missing '+k);
  for(const q of l.questions)if(!q.prompt?.trim()||!q.explanation?.trim()||q.options.length<2||!q.options.every(x=>typeof x==='string'&&x.trim())||!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.options.length)throw Error('Invalid question: '+l.id);
 }
 return {pack,registry,sources};
}
async function importDrafts(prisma){
 const {pack,sources}=readPack();
 const {LearningService}=require('../src/modules/learning/learning.service');
 const {parseLessonGuide}=require('../src/modules/learning/lesson-guide');
 // Transaction and empty-curriculum precondition prevent overwriting existing teaching/progress data.
 return prisma.$transaction(async p=>{
  if(await p.zone.count()||await p.lesson.count()||await p.checkpoint.count())throw Error('Curriculum import requires an empty curriculum database.');
  const service=new LearningService(p),ids=[];
  for(let t=0;t<pack.topics.length;t++){
   const zone=await p.zone.create({data:{id:'milo-topic-'+t,zoneNumber:t+1,title:pack.topics[t],description:'12 bài nháp — chờ chuyên gia duyệt',iconName:'book',unlockLevel:t+1}});
   const stage=await p.stage.create({data:{id:'milo-stage-'+t,zoneId:zone.id,stageNumber:1,title:'Cùng đọc và thực hành',description:'Dành cho người lớn kiểm tra trước khi dùng với trẻ'}});
   let number=0;
   for(const l of pack.lessons.filter(l=>l.topic===t)){
    const content={schemaVersion:1,objective:l.objective,story:l.story,keyPoints:l.keyPoints,activity:l.activity,teachBack:l.teachBack,
     ...(l.id==='H01'?{presentation:{scene:'home-hot-cup',revision:1}}:{}),
     sources:l.sourceIds.map(id=>{const s=sources.get(id);return {id,title:s.title,publisher:s.publisher,url:s.url};}),
     provenance:{packVersion:pack.version,status:'DRAFT',humanReviewed:false,reviewer:null,ageMin:7,ageMax:10,reviewFocus:l.reviewFocus}};
    if(!parseLessonGuide(JSON.stringify(content)))throw Error('Invalid lesson guide '+l.id);
    const lesson=await p.lesson.create({data:{id:'milo-'+l.id,stageId:stage.id,lessonNumber:++number,title:l.title,description:l.objective,contentJson:JSON.stringify(content),durationMinutes:5,rewardXp:20}});
    const cp=await p.checkpoint.create({data:{id:'milo-'+l.id+'-check',lessonId:lesson.id,checkpointNumber:1,title:'Cùng chọn cách xử lý',description:'Câu hỏi tình huống, không chứng nhận năng lực thực tế',passScoreThreshold:100,timeLimitSeconds:0}});
    for(let i=0;i<l.questions.length;i++){
     const q=l.questions[i];const id=cp.id+'-q'+(i+1);
     await p.testQuestion.create({data:{id,checkpointId:cp.id,questionNumber:i+1,orderIndex:i,promptText:q.prompt,explanation:q.explanation,questionType:'SINGLE_CHOICE',timeLimitSeconds:0,
      options:{create:q.options.map((text,j)=>({id:id+'-o'+(j+1),optionText:text,isCorrect:j===q.correct,displayOrder:j}))}}});
    }
    const snapshot=await p.checkpoint.findUniqueOrThrow({where:{id:cp.id},include:{lesson:true,questions:{include:{options:true}}}});
    if(!service.validCheckpoint(snapshot))throw Error('Invalid checkpoint '+cp.id);
    await p.contentApproval.create({data:{checkpointId:cp.id,contentVersion:service.fingerprint(snapshot),status:'DRAFT',snapshot:JSON.stringify(snapshot),ageMin:7,ageMax:10}});
    ids.push(cp.id);
   }
  }
  return ids;
 },{timeout:30000});
}
module.exports={readPack,importDrafts};
