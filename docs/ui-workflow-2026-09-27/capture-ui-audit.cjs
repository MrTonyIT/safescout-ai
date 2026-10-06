// Read-only visual inspection in a new tab of the isolated development browser.
const fs=require('node:fs');
(async()=>{
 const page=await(await fetch('http://127.0.0.1:9223/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let seq=0;const tasks=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const t=tasks.get(m.id);tasks.delete(m.id);m.error?t.j(m.error):t.r(m.result);}};
 const send=(method,params={})=>new Promise((r,j)=>{const id=++seq;tasks.set(id,{r,j});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error('Page evaluation failed');return r.result.value;};
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),evidence=[];
 const until=async text=>{for(let i=0;i<100;i++){if((await ev('document.body.innerText')).includes(text))return;await wait(100);}throw Error('Missing '+text);};
 const capture=async(name)=>{
  const metrics=await ev(`(()=>{const b=[...document.querySelectorAll('[role="button"],input')].map(e=>{const r=e.getBoundingClientRect();return {label:e.getAttribute('aria-label')||e.textContent.trim(),x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height),disabled:e.getAttribute('aria-disabled')==='true'};});return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,controls:b,text:document.body.innerText};})()`);
  evidence.push({name,...metrics});const image=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(__dirname+'/'+name+'.png',Buffer.from(image.data,'base64'));
 };
 try{
  await send('Page.enable');await send('Page.navigate',{url:'http://localhost:8081'});await wait(900);
  await ev(`(()=>{const b=[...document.querySelectorAll('[role="button"]')].find(e=>e.textContent.trim()==='Vào bản học thử');b?.click();})()`);await until('Cốc nước vừa rót');
  for(const [w,h]of[[320,568],[390,844],[768,1024],[1440,900]]){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});await wait(200);await capture('current-map-'+w);}
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await ev(`document.querySelector('[aria-label="Khám phá: Cốc nước vừa rót"]')?.click()`);await until('Cùng đọc trước khi chọn');await capture('current-lesson-390');
  fs.writeFileSync(__dirname+'/ui-evidence.json',JSON.stringify({createdAt:new Date().toISOString(),scope:'Current local web build; synthetic profile; no answer submitted; not native performance evidence',screens:evidence},null,2));
  console.log(JSON.stringify(evidence.map(x=>({screen:x.name,width:x.width,overflow:x.scrollWidth>x.width,firstIsland:x.controls.find(c=>c.label.startsWith('Khám phá:'))?.y,search:x.controls.find(c=>c.label.startsWith('Tìm bài'))?.y,firstAnswer:x.controls.find(c=>c.label.startsWith('Đưa tay'))?.y})),null,2));
 }finally{await send('Page.close');ws.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
