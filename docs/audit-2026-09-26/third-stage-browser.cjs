// Requires fresh scripts/create-internal-fixture.cjs, local backend, web preview and CDP port 9223.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const page=await(await fetch('http://127.0.0.1:9223/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let seq=0;const tasks=new Map(),errors=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const task=tasks.get(m.id);tasks.delete(m.id);m.error?task.j(m.error):task.r(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
 const send=(method,params={})=>new Promise((r,j)=>{const id=++seq;tasks.set(id,{r,j});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const until=async text=>{for(let i=0;i<100;i++){if((await ev('document.body.innerText')).includes(text))return;await wait(100);}throw Error('Not visible: '+text);};
 const click=async text=>{const ok=await ev(`(()=>{const e=[...document.querySelectorAll('[role="button"]')].find(e=>e.textContent.trim()===${JSON.stringify(text)}&&e.getClientRects().length);if(!e)return false;e.click();return true;})()`);assert.ok(ok,'button '+text);await wait(250);};
 const size=async(w,h)=>{await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});await wait(150);};
 const metrics=[];const shot=async name=>{metrics.push({name,...await ev('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.body.innerText})')});const img=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(__dirname,name+'.png'),Buffer.from(img.data,'base64'));};
 try{
 await send('Runtime.enable');await send('Page.enable');await size(320,568);await send('Page.navigate',{url:'http://localhost:8081'});await wait(1000);
 await ev("localStorage.removeItem('milo_has_onboarded_v1')");await send('Page.reload');await until('Vào bản học thử');await shot('third-welcome-320');
 await click('Vào bản học thử');await until('Tiếp tục: Quan sát hình và màu');
 for(const [w,h]of[[320,568],[390,844],[768,1024],[1440,900]]){await size(w,h);await shot('third-home-'+w);}
 await size(320,568);await click('Tiếp tục: Quan sát hình và màu');await until('Hình vuông');await shot('third-lesson-320');
 await click('Hình vuông');await click('Xác nhận lựa chọn');await click('Gửi bài và xem kết quả');await until('Đúng 0/1 câu');await shot('third-result-zero');
 await click('Về trang Học để tiếp tục');await until('Tiếp tục: Quan sát hình và màu');await click('Tiếp tục: Quan sát hình và màu');await until('Hình tròn');await click('Hình tròn');await click('Xác nhận lựa chọn');await click('Gửi bài và xem kết quả');await until('Đúng 1/1 câu');await click('Về trang Học để tiếp tục');await until('1/2 phần đã đạt');assert.ok((await ev('document.body.innerText')).includes('0 XP học tập'));
 await click('Tiếp tục: Quan sát hình và màu');await until('Màu xanh');await click('Màu xanh');await click('Xác nhận lựa chọn');await click('Gửi bài và xem kết quả');await until('Đúng 1/1 câu');await click('Về trang Học để tiếp tục');await until('40 XP học tập');await shot('third-two-parts-complete');
 await send('Page.reload');await until('40 XP học tập');
 // Text enlargement simulation, not a substitute for native OS font-size validation.
 await ev("(()=>{const list=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&e.textContent.trim()).map(e=>({e,size:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)}));list.forEach(({e,size,line})=>{e.style.fontSize=size*2+'px';if(line)e.style.lineHeight=line*2+'px';});})()");await shot('third-home-text200-320');
 await send('Page.reload');await until('40 XP học tập');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});const focus=await ev('({role:document.activeElement.getAttribute("role"),label:document.activeElement.getAttribute("aria-label")})');
 for(const m of metrics)assert.ok(m.scrollWidth<=m.width,'overflow '+m.name);assert.equal(errors.length,0);
 fs.writeFileSync(path.join(__dirname,'third-stage-browser-results.json'),JSON.stringify({passed:true,scope:'synthetic web release build, no real child data',metrics,keyboardFocus:focus,runtimeErrors:errors},null,2));console.log('Browser learning flow, viewport, text enlargement and reload checks passed.');
 }finally{await send('Page.close').catch(()=>{});ws.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
