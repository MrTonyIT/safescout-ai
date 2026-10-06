// Isolated local end-to-end run. Creates synthetic DBs and its own browser profile.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const children=[];const handles=[];
function start(command,args,env={}){
  const log=fs.openSync(path.join(work,'process-'+children.length+'.log'),'w');handles.push(log);
  const p=spawn(command,args,{env:{...process.env,...env},stdio:['ignore',log,log],windowsHide:true});
  p.on('error',()=>{});children.push(p);return p;
}
async function stop(p){if(p.exitCode!==null)return;p.kill();await Promise.race([new Promise(r=>p.once('exit',r)),wait(5000)]);}
async function command(script,env={}){
  const p=start(process.execPath,[script],env);
  const code=await new Promise((r,j)=>{p.once('error',j);p.once('exit',r);});
  if(code!==0)throw Error(script+' failed; see '+work);
}
async function ready(url){for(let i=0;i<150;i++){try{if((await fetch(url)).ok)return;}catch{}await wait(100);}throw Error('Service not ready: '+url);}
fs.mkdirSync('scratch',{recursive:true});const work=fs.mkdtempSync(path.resolve('scratch/browser-checks-'));
async function main(){
  for(const url of ['http://127.0.0.1:3000/health/live','http://127.0.0.1:8081','http://127.0.0.1:9224/json/version']){
    let running=false;try{running=(await fetch(url)).ok;}catch{}if(running)throw Error('Dedicated test port occupied: '+url);
  }
  await command('scripts/create-internal-fixture.cjs');
  const databaseUrl=JSON.parse(fs.readFileSync('scratch/internal-preview.json','utf8')).databaseUrl;
  const chrome=process.env.CHROME_BIN||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'google-chrome');
  start(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',...(process.env.CI?['--no-sandbox']:[]),'--remote-debugging-address=127.0.0.1','--remote-debugging-port=9224','--user-data-dir='+path.join(work,'browser'),'about:blank']);
  start(process.execPath,['scripts/serve-internal-web.cjs',process.env.WEB_BUILD_DIR||'scratch/completion-web']);
  const env={DATABASE_URL:databaseUrl,GEMINI_API_KEY:'',INTERNAL_LEARNING_PREVIEW:'true',FAMILY_LEARNING_ENABLED:'false'};
  let backend=start(process.execPath,['dist/src/main.js'],env);
  await ready('http://127.0.0.1:9224/json/version');await ready('http://127.0.0.1:8081');await ready('http://127.0.0.1:3000/health/live');
  await command('docs/completion-2026-09-27/browser-learning.cjs',{CDP_PORT:'9224'});
  await stop(backend);
  backend=start(process.execPath,['dist/src/main.js'],{...env,INTERNAL_LEARNING_PREVIEW:'false',FAMILY_LEARNING_ENABLED:'true'});
  await ready('http://127.0.0.1:3000/health/live');
  await command('docs/completion-2026-09-27/browser-family.cjs',{CDP_PORT:'9224'});
  await stop(backend);
  await command('scripts/create-curriculum-preview.cjs');
  const curriculumUrl=JSON.parse(fs.readFileSync('scratch/curriculum-preview.json','utf8')).databaseUrl;
  backend=start(process.execPath,['dist/src/main.js'],{...env,DATABASE_URL:curriculumUrl});
  await ready('http://127.0.0.1:3000/health/live');
  await command('docs/game-restoration-2026-09-27/browser-restoration.cjs',{CDP_PORT:'9224'});
  await command('docs/research-2026-09-27/browser-curriculum.cjs',{CDP_PORT:'9224'});
  console.log('Browser checks passed. Logs: '+work);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{for(const p of children.reverse())await stop(p);for(const fd of handles)fs.closeSync(fd);});
