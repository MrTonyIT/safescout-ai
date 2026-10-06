const fs=require('node:fs'),path=require('node:path'),{spawn,spawnSync}=require('node:child_process');
if(!fs.existsSync('dist/src/main.js')||!fs.existsSync('scratch/completion-web/index.html'))throw Error('Build first: npm run build; export the web app to scratch/completion-web.');
const curriculum=process.argv.includes('--curriculum');
const fixture=spawnSync(process.execPath,[curriculum?'scripts/create-curriculum-preview.cjs':'scripts/create-internal-fixture.cjs'],{stdio:'inherit',windowsHide:true});
if(fixture.status!==0)process.exit(fixture.status||1);
const databaseUrl=JSON.parse(fs.readFileSync(curriculum?'scratch/curriculum-preview.json':'scratch/internal-preview.json','utf8')).databaseUrl;
const family=process.argv.includes('--family');
const children=[spawn(process.execPath,['dist/src/main.js'],{stdio:'inherit',windowsHide:true,env:{...process.env,DATABASE_URL:databaseUrl,GEMINI_API_KEY:'',INTERNAL_LEARNING_PREVIEW:String(!family),FAMILY_LEARNING_ENABLED:String(family)}}),spawn(process.execPath,['scripts/serve-internal-web.cjs','scratch/completion-web'],{stdio:'inherit',windowsHide:true})];
let stopping=false;function stop(){if(stopping)return;stopping=true;children.forEach(p=>p.kill());}
children.forEach(p=>{p.on('error',stop);p.on('exit',stop);});process.on('SIGINT',stop);process.on('SIGTERM',stop);
console.log('Local preview: http://localhost:8081 — '+(family?'family accounts, no approved lessons':curriculum?'12 unreviewed lessons for adult inspection':'synthetic learning fixture')+'. Do not enter real child data.');
