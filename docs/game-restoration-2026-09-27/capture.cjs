const fs=require('node:fs');
(async()=>{
 const page=await(await fetch('http://127.0.0.1:9223/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let id=0;const tasks=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const t=tasks.get(m.id);tasks.delete(m.id);m.error?t.j(m.error):t.r(m.result);}};
 const send=(method,params={})=>new Promise((r,j)=>{const n=++id;tasks.set(n,{r,j});ws.send(JSON.stringify({id:n,method,params}));});
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 try{
  await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:true});await send('Page.navigate',{url:'http://localhost:8081'});
  for(let i=0;i<100;i++){const r=await send('Runtime.evaluate',{expression:'document.body?.innerText || ""',returnByValue:true});const t=r.result.value||'';if(t.includes('Vào bản học thử'))await send('Runtime.evaluate',{expression:"[...document.querySelectorAll('[role=button]')].find(e=>e.textContent.trim()==='Vào bản học thử')?.click()"});if(t.includes('Cốc nước vừa rót'))break;await wait(100);}
  await wait(300);const image=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(__dirname+'/game-map-390.png',Buffer.from(image.data,'base64'));
  const opened=await send('Runtime.evaluate',{expression:"(()=>{const e=document.querySelector('[aria-label=\"Khám phá: Cốc nước vừa rót\"]');if(!e)return false;e.click();return true;})()",returnByValue:true});if(!opened.result.value)throw Error('Island action missing');
  for(let i=0;i<100;i++){const r=await send('Runtime.evaluate',{expression:'document.body?.innerText || ""',returnByValue:true});if(r.result.value.includes('Cùng đọc trước khi chọn')){console.log('Island opens the correct lesson.');return;}await wait(100);}throw Error('Lesson did not open');
 }finally{await send('Page.close');ws.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
