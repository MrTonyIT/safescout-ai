// Always creates a new local database; never imports into the operator's DATABASE_URL.
require('ts-node/register/transpile-only');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {PrismaClient}=require('@prisma/client');
const {importDrafts}=require('./curriculum-lib.cjs');
(async()=>{
 process.chdir(path.resolve(__dirname,'..'));fs.mkdirSync('scratch',{recursive:true});
 const dir=fs.mkdtempSync(path.resolve('scratch/curriculum-preview-')),file=path.join(dir,'preview.db');fs.writeFileSync(file,'');
 const url='file:'+file.replaceAll('\\','/');
 const migration=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy'],{windowsHide:true,env:{...process.env,DATABASE_URL:url},encoding:'utf8'});
 if(migration.status!==0)throw Error(migration.stdout+migration.stderr);
 const p=new PrismaClient({datasources:{db:{url}}});
 try{await p.user.create({data:{id:'user_milo_explorer_01',nickname:'Người lớn kiểm tra bài nháp'}});await importDrafts(p);}finally{await p.$disconnect();}
 fs.writeFileSync('scratch/curriculum-preview.json',JSON.stringify({databaseUrl:url,createdAt:new Date().toISOString(),synthetic:true,unreviewed:true},null,2));
 console.log('Created 12 DRAFT lessons in a NEW internal database. Manifest: scratch/curriculum-preview.json');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
