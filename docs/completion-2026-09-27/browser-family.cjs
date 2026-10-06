// Requires fresh scripts/create-internal-fixture.cjs, local backend, web preview and CDP port 9223.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const page=await(await fetch('http://127.0.0.1:'+(process.env.CDP_PORT||'9223')+'/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let seq=0;const tasks=new Map(),errors=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const task=tasks.get(m.id);tasks.delete(m.id);m.error?task.j(m.error):task.r(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
 const send=(method,params={})=>new Promise((r,j)=>{const id=++seq;tasks.set(id,{r,j});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const until=async text=>{for(let i=0;i<100;i++){if((await ev('document.body.innerText')).includes(text))return;await wait(100);}throw Error('Not visible: '+text);};
 const click=async text=>{for(let i=0;i<100;i++){const ready=await ev('Array.from(document.querySelectorAll("[role]")).some(e=>e.getAttribute("role")==="button" && (e.textContent.trim()==='+JSON.stringify(text)+' || e.getAttribute("aria-label")==='+JSON.stringify(text)+') && e.getAttribute("aria-disabled")!=="true")');if(ready)break;await wait(100);}const ok=await ev(`(()=>{const e=[...document.querySelectorAll('[role="button"],[role="radio"],[role="checkbox"]')].find(e=>(e.textContent.trim()===${JSON.stringify(text)}||e.getAttribute('aria-label')===${JSON.stringify(text)})&&e.getClientRects().length);if(!e)return false;e.click();return true;})()`);assert.ok(ok,'button '+text);await wait(250);};
 const size=async(w,h)=>{await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});await wait(150);};
 const metrics=[];const shot=async name=>{metrics.push({name,...await ev('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.body.innerText})')});const img=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(__dirname,name+'.png'),Buffer.from(img.data,'base64'));};

 try{
 await send('Runtime.enable');await send('Page.enable');await size(320,568);await send('Page.navigate',{url:'http://localhost:8081'});await until('Tạo tài khoản mới');
 const fill=async(label,value)=>{await ev('(()=>{const e=[...document.querySelectorAll("input")].find(e=>e.getAttribute("aria-label") === '+JSON.stringify(label)+');if(!e)throw Error("input missing");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(e,'+JSON.stringify(value)+');e.dispatchEvent(new Event("input",{bubbles:true}));})()');await wait(100);};
 await click('Tạo tài khoản mới');await until('Tạo tài khoản gia đình');
 await fill('Tên đăng nhập (4–40 chữ, số, dấu . _ -)','browser_'+Date.now());await fill('Mật khẩu (ít nhất 12 ký tự)','Synthetic-browser-password-123');
 await click('Tôi là phụ huynh/người giám hộ và đồng ý lưu dữ liệu nêu trên');await click('Tạo tài khoản gia đình');await until('Giữ mã khôi phục ở nơi riêng');await click('Tôi đã lưu mã riêng');
 await until('Mật khẩu phụ huynh');await fill('Mật khẩu phụ huynh','Synthetic-browser-password-123');await fill('Biệt danh hồ sơ mới (không dùng họ tên thật)','Hồ sơ thử');await click('Thêm hồ sơ');await until('Học cùng Hồ sơ thử');
 for(const [w,h] of [[320,568],[390,844],[768,1024],[1440,900]]){await size(w,h);await shot('family-parent-'+w);}
 await size(320,568);await click('Học cùng Hồ sơ thử');await until('Chưa có nội dung học trong môi trường này.');await shot('family-empty-approved-content');
 assert.ok((await ev('document.body.innerText')).includes('0 XP học tập'));await click('Góc cha mẹ / đổi hồ sơ');await until('Mật khẩu phụ huynh');
 await fill('Mật khẩu phụ huynh','Synthetic-browser-password-123');await click('Xem 50 bài gần nhất của Hồ sơ thử');await until('Chưa có bài được máy chủ nhận.');
 await fill('Mô tả ngắn (5–1000 ký tự)','Synthetic browser feedback only');await click('Gửi phản hồi');await until('Máy chủ đã nhận phản hồi. Mã đối chiếu:');
 await click('Xóa hồ sơ Hồ sơ thử');await click('Xác nhận xóa vĩnh viễn');await until('Chưa có hồ sơ.');
 await click('Đăng xuất và xóa bản nháp trên máy');await until('Tạo tài khoản mới');
 for(const m of metrics)assert.ok(m.scrollWidth<=m.width,'overflow '+m.name);assert.equal(errors.length,0);
 fs.writeFileSync(path.join(__dirname,'browser-family-results.json'),JSON.stringify({passed:true,scope:'synthetic family on local web, no published safety content',metrics,runtimeErrors:errors},null,2));console.log('Family browser registration, child creation, private history, deletion and logout passed.');
 }finally{await send('Page.close').catch(()=>{});ws.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
