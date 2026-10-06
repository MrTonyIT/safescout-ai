// Run only with a database explicitly selected by its operator. Never marks AI work as human review.
require('ts-node/register/transpile-only');
const fs=require('node:fs');
const {PrismaClient}=require('@prisma/client');
const {LearningService}=require('../src/modules/learning/learning.service');
const prisma=new PrismaClient();
async function main(){
  if(!process.env.DATABASE_URL) throw Error('Set DATABASE_URL explicitly.');
  const [command,id,manifestPath]=process.argv.slice(2);
  if(!['draft','review','publish','withdraw'].includes(command)||!id) throw Error('Usage: content-review.cjs draft|review|publish|withdraw checkpointId [review-manifest.json]');
  if(command==='withdraw'){
    const result=await prisma.contentApproval.updateMany({where:{checkpointId:id},data:{status:'WITHDRAWN'}});
    console.log(JSON.stringify({withdrawn:result.count}));return;
  }
  const content=await prisma.checkpoint.findUniqueOrThrow({where:{id},include:{lesson:true,questions:{include:{options:true}}}});
  const service=new LearningService(prisma),version=service.fingerprint(content);
  if(!service.validCheckpoint(content)) throw Error('Content schema invalid.');
  const where={checkpointId_contentVersion:{checkpointId:id,contentVersion:version}};
  if(command==='draft'){
    const draft=await prisma.contentApproval.upsert({where,update:{},create:{checkpointId:id,contentVersion:version,snapshot:JSON.stringify(content)}});
    if(manifestPath)fs.writeFileSync(manifestPath,JSON.stringify({humanReviewed:false,contentVersion:version,reviewer:'',source:'',reviewedAt:null,ageMin:7,ageMax:10,content},null,2),{flag:'wx'});
    console.log(JSON.stringify({id:draft.id,version,status:draft.status}));return;
  }
  const entry=await prisma.contentApproval.findUniqueOrThrow({where});
  if(command==='review'){
    if(entry.status!=='DRAFT') throw Error('Only a draft can be reviewed.');
    const evidence=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
    if(evidence.contentVersion!==version||evidence.humanReviewed!==true||!evidence.reviewer?.trim()||!evidence.source?.trim()||!evidence.reviewedAt||!Number.isInteger(evidence.ageMin)||!Number.isInteger(evidence.ageMax)||evidence.ageMin<7||evidence.ageMax>10||evidence.ageMin>evidence.ageMax) throw Error('Human review manifest incomplete or wrong version.');
    const date=new Date(evidence.reviewedAt);
    if(!Number.isFinite(date.getTime())||date>new Date()) throw Error('Invalid review date.');
    await prisma.contentApproval.update({where,data:{status:'REVIEWED',reviewer:evidence.reviewer,source:evidence.source,reviewedAt:date,ageMin:evidence.ageMin,ageMax:evidence.ageMax}});
  }else{
    if(entry.status!=='REVIEWED') throw Error('A human review must precede publishing.');
    await prisma.contentApproval.update({where,data:{status:'PUBLISHED'}});
  }
  console.log(JSON.stringify({checkpointId:id,version,status:command==='review'?'REVIEWED':'PUBLISHED'}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>prisma.$disconnect());
