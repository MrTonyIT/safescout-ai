// Local-only audit helper. Uses a separate headless browser profile on port 9223.
const fs = require('node:fs');
const path = require('node:path');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const pages = await (await fetch('http://127.0.0.1:9223/json/list')).json();
  let page = pages.find(p => p.type === 'page' && /^http:\/\/(localhost|127\.0\.0\.1):8081(?:\/|$)/.test(p.url));
  if (!page) page = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', {method:'PUT'})).json();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id) { const task = pending.get(msg.id); pending.delete(msg.id); msg.error ? task.reject(msg.error) : task.resolve(msg.result); }
    else if (msg.method === 'Runtime.exceptionThrown' || (msg.method === 'Log.entryAdded' && /^http:\/\/(localhost|127\.0\.0\.1):8081(?:\/|$)/.test(msg.params?.entry?.url || ''))) events.push(msg);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, {resolve,reject}); ws.send(JSON.stringify({id,method,params})); });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', {expression,returnByValue:true,awaitPromise:true,userGesture:true});
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
  const [action, value, extra] = process.argv.slice(2);
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  if (action === 'open') {
    const [width,height] = (extra || '390x844').split('x').map(Number);
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
    await send('Page.navigate',{url:'http://localhost:8081'}); await wait(20000);
  } else if (action === 'click') {
    console.log(await evaluate(`(() => {const matches=[...document.querySelectorAll('*')].filter(e=>e.textContent.trim()===${JSON.stringify(value)} && e.getClientRects().length); const e=matches.find(e=>!e.children.length)||matches[matches.length-1]; if(!e)return 'NOT_FOUND'; e.click();return 'CLICKED';})()`));
    await wait(Number(extra || 1200));
  } else if (action === 'tap') {
    const [x,y] = value.split(',').map(Number);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
    await wait(Number(extra || 1200));
  } else if (action === 'eval') console.log(JSON.stringify(await evaluate(value), null, 2));
  else if (action === 'size') {
    const [width,height] = value.split('x').map(Number);
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true}); await wait(1000);
  }
  if (action !== 'eval') {
    console.log(await evaluate('document.body.innerText'));
    console.log('METRICS',JSON.stringify(await evaluate('({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth})')));
    const shot = await send('Page.captureScreenshot',{format:'png'});
    const name = action === 'open' || action === 'snapshot' ? (value || 'onboarding') : action === 'size' ? (extra || `current-size-${value}`) : 'latest';
    fs.writeFileSync(path.join(__dirname,`${name}.png`),Buffer.from(shot.data,'base64'));
  }
  if (events.length) { fs.writeFileSync(path.join(__dirname,'browser-events.json'),JSON.stringify(events,null,2)); console.log('EVENTS',events.length); }
  ws.close();
})().catch(e => {console.error(e);process.exitCode=1;});
