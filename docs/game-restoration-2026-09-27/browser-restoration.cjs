// Run only with the local synthetic curriculum fixture and an existing isolated CDP browser.
// Starts/stops no server. Exercises actual UI controls; it never fabricates a play() success.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const out = __dirname;
const webUrl = process.env.WEB_URL || 'http://localhost:8081';
const apiUrl = process.env.API_URL || 'http://127.0.0.1:3000';
const profileId = 'user_milo_explorer_01';
const preferenceKey = 'milo.experience-preferences.v1';

const mediaProbe = `(() => {
  const elements = new Set();
  const events = [];
  let calls = 0, resolved = 0, rejected = 0, pauses = 0;
  const originalPlay = HTMLMediaElement.prototype.play;
  const originalPause = HTMLMediaElement.prototype.pause;
  function track(element) {
    if (elements.has(element)) return;
    elements.add(element);
    for (const name of ['playing', 'pause', 'ended', 'timeupdate', 'error']) {
      element.addEventListener(name, () => {
        events.push({name, time: performance.now(), currentTime: element.currentTime, paused: element.paused});
      });
    }
  }
  HTMLMediaElement.prototype.play = function(...args) {
    track(this); calls++;
    let result;
    try { result = Reflect.apply(originalPlay, this, args); }
    catch (error) { rejected++; events.push({name: 'play-rejected', message: String(error)}); throw error; }
    if (result && typeof result.then === 'function') {
      result.then(() => { resolved++; }, error => { rejected++; events.push({name: 'play-rejected', message: String(error)}); });
    }
    return result;
  };
  HTMLMediaElement.prototype.pause = function(...args) {
    track(this); pauses++;
    return Reflect.apply(originalPause, this, args);
  };
  window.__miloMediaProbe = {
    summary: () => ({calls, resolved, rejected, pauses, events: events.slice(),
      active: [...elements].filter(e => !e.paused && !e.ended).length,
      elements: [...elements].map(e => ({paused: e.paused, ended: e.ended, currentTime: e.currentTime, readyState: e.readyState, duration: Number.isFinite(e.duration) ? e.duration : null}))})
  };
})();`;

async function mapSnapshot() {
  const response = await fetch(`${apiUrl}/learning/journey-map?userId=${encodeURIComponent(profileId)}`);
  assert.equal(response.status, 200, 'Synthetic journey map must be reachable');
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.user.id, profileId);
  const lessons = body.data.zones.flatMap(z => z.stages.flatMap(s => s.lessons)).filter(l => l.isAvailable !== false);
  return {xp: body.data.user.totalSafetyScore, badges: body.data.user.totalBadges,
    completed: lessons.filter(l => l.status === 'COMPLETED').length, lessons: lessons.length};
}

(async () => {
  fs.mkdirSync(out, {recursive: true});
  const modeResponse = await fetch(`${apiUrl}/family/mode`);
  const mode = await modeResponse.json();
  assert.equal(mode.data?.internal, true, 'Use INTERNAL preview; never test against family data');
  const before = await mapSnapshot();
  assert.equal(before.xp, 0, 'Start a NEW synthetic fixture: collection zero-state needs zero XP');
  assert.equal(before.badges, 0, 'Start a NEW synthetic fixture: no earned badges');
  assert.equal(before.completed, 0, 'Start a NEW synthetic fixture: no completed lessons');
  assert.ok(before.lessons > 1, 'Use the curriculum fixture with unlocked and locked lessons');

  const target = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT || '9223'}/json/new?about:blank`, {method: 'PUT'})).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {ws.onopen = resolve; ws.onerror = reject;});
  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [], screenshots = [], audio = {}, motion = {}, maze = {path: []};
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (!task) return;
      pending.delete(message.id); clearTimeout(task.timer);
      message.error ? task.reject(message.error) : task.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {pending.delete(id); reject(new Error(`CDP timeout: ${method}`));}, 15000);
    pending.set(id, {resolve, reject, timer});
    ws.send(JSON.stringify({id, method, params}));
  });
  const ev = async expression => {
    const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true, userGesture: true});
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const until = async (expression, label, attempts = 120) => {
    for (let i = 0; i < attempts; i++) {
      try { if (await ev(expression)) return; } catch {}
      await wait(75);
    }
    throw new Error(`UI wait timed out: ${label}`);
  };
  const visibleText = text => until(`(document.body?.innerText || "").includes(${JSON.stringify(text)})`, text);
  const visibleControl = label => `Array.from(document.querySelectorAll('[role="button"],[role="tab"],[role="switch"]')).find(e => (e.getAttribute('aria-label') === ${JSON.stringify(label)} || e.textContent.trim() === ${JSON.stringify(label)}) && e.getClientRects().length && e.getAttribute('aria-hidden') !== 'true')`;
  const click = async (label, settle = 150) => {
    assert.ok(await ev(`(() => {const e = ${visibleControl(label)}; if (!e || e.disabled || e.getAttribute('aria-disabled') === 'true') return false; e.scrollIntoView({block: 'nearest'}); e.click(); return true;})()`), `Enabled control: ${label}`);
    await wait(settle);
  };
  const size = async (width, height) => {await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: true}); await wait(180);};
  const top = async () => {await ev("document.querySelectorAll('*').forEach(e => {if(e.scrollTop) e.scrollTop=0;})"); await wait(80);};
  const controlsFit = async () => {
    const outside = await ev(`Array.from(document.querySelectorAll('[role="button"],[role="tab"],[role="switch"]')).filter(e=>e.getClientRects().length && !e.closest('[aria-hidden="true"]')).map(e=>({label:e.getAttribute('aria-label')||e.textContent,rect:e.getBoundingClientRect()})).filter(x=>x.rect.width>0&&(x.rect.left < -1 || x.rect.right > innerWidth+1)).map(x=>({label:x.label,left:x.rect.left,right:x.rect.right}))`);
    assert.deepEqual(outside, [], 'Visible controls must not overflow horizontally');
  };
  const shot = async (name, validate = true) => {
    const metrics = await ev('({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,text:document.body?.innerText || ""})');
    if (validate) {assert.ok(metrics.scrollWidth <= metrics.width + 1, `Document overflow: ${name}`); await controlsFit();}
    const image = await send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
    fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(image.data, 'base64'));
    screenshots.push({name, ...metrics});
  };
  const switchExpression = label => `document.querySelector('[role="switch"][aria-label=${JSON.stringify(label)}]')`;
  const switchState = async label => ev(`(() => {const e=${switchExpression(label)};return e ? (typeof e.checked==='boolean' ? e.checked : e.getAttribute('aria-checked')==='true') : null;})()`);
  const setSwitch = async (label, value) => {
    const current = await switchState(label);
    assert.notEqual(current, null, `Switch exists: ${label}`);
    if (current !== value) await click(label, 150);
    assert.equal(await switchState(label), value, `Switch applied: ${label}`);
    await until(`!(document.body?.innerText || "").includes('Đang lưu tùy chọn…')`, 'preference persisted');
  };
  const openSettings = async () => {
    if (await ev(`Boolean(${visibleControl('Tùy chọn trải nghiệm')})`)) await click('Tùy chọn trải nghiệm');
    else await click('Âm & chuyển động');
    await visibleText('Theo nhịp của bạn');
  };
  const cloudSamples = async () => {
    await ev(`(() => {const e=document.querySelector('[data-testid="world-cloud-0"]');if(!e)throw Error('world-cloud-0 missing');e.scrollIntoView({block:'center'});})()`);
    await wait(150);
    const values = [];
    for (let i = 0; i < 3; i++) {values.push(await ev(`getComputedStyle(document.querySelector('[data-testid="world-cloud-0"]')).transform`)); await wait(550);}
    return values;
  };

  try {
    await send('Page.enable'); await send('Runtime.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {source: mediaProbe});
    await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'no-preference'}]});
    await size(390, 844);
    await send('Page.navigate', {url: webUrl});
    await until(`location.origin === ${JSON.stringify(new URL(webUrl).origin)} && document.readyState === 'complete'`, 'first page ready');
    // Device-level test preferences only; no progress, account, drafts or submission queue is deleted.
    await ev(`localStorage.removeItem(${JSON.stringify(preferenceKey)})`);
    await send('Page.reload');
    await until(`(document.body?.innerText || "").includes('Vào bản học thử') || Boolean(${visibleControl('Ba lô')})`, 'welcome or game dock');
    if (await ev(`Boolean(${visibleControl('Vào bản học thử')})`)) await click('Vào bản học thử');
    await until(`Boolean(document.querySelector('[data-testid="world-cloud-0"]'))`, 'map atmosphere mounted');
    motion.normal = await cloudSamples();
    assert.ok(new Set(motion.normal).size > 1, 'Cloud transform must actually change while motion enabled');
    await top(); await shot('restored-map-390');
    await size(320, 740); await top(); await shot('restored-map-320');

    await click('Ba lô'); await visibleText('Chưa có dấu mốc hoàn thành.');
    const collectionSummary = await ev(`(() => {const result={};for(const label of ['XP đã ghi nhận','Dấu mốc hiện tại','Huy hiệu đã nhận']){const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()===label);result[label]=e?.parentElement.innerText||'';}return result;})()`);
    assert.match(collectionSummary['XP đã ghi nhận'], /^0\s/m);
    assert.match(collectionSummary['Huy hiệu đã nhận'], /^0\s/m);
    assert.match(collectionSummary['Dấu mốc hiện tại'], new RegExp(`0/${before.lessons}`));
    await top(); await shot('restored-collection-320'); await size(390, 844); await top(); await shot('restored-collection-390');
    const lockedLabel = await ev(`Array.from(document.querySelectorAll('[role="button"]')).find(e=>e.getAttribute('aria-label')?.includes('. Chưa mở. Xem chi tiết'))?.getAttribute('aria-label')`);
    assert.ok(lockedLabel, 'Collection contains a genuine locked milestone');
    await click(lockedLabel); await visibleText('Hoàn thành chặng trước trên bản đồ để mở bài này.');
    assert.equal(await ev(`(${visibleControl('Tiếp tục khám phá')})?.getAttribute('aria-disabled')`), 'true', 'Locked collection entry cannot open a lesson');
    await shot('restored-collection-locked-390');
    await click('Huy hiệu'); await visibleText('Huy hiệu học tập');
    assert.ok(!(await ev('document.body?.innerText || ""')).includes('ĐÃ NHẬN'), 'Fresh profile must have no earned badge cards');
    await top(); await shot('restored-badges-390');
    await click('Bản đồ'); await until(`Boolean(document.querySelector('[data-testid="world-cloud-0"]'))`, 'return to map');
    audio.beforeEnable = await ev('window.__miloMediaProbe.summary()');
    assert.equal(audio.beforeEnable.calls, 0, 'No sound should play before explicit enable');

    await openSettings(); assert.equal(await switchState('Âm thanh hiệu ứng'), false);
    await setSwitch('Âm thanh hiệu ứng', true); await visibleText('Thử âm thanh');
    await click('Thử âm thanh', 30);
    await until('window.__miloMediaProbe.summary().resolved > 0 && window.__miloMediaProbe.summary().events.some(e => e.name === "playing")', 'real browser audio play resolved and playing event');
    audio.firstPlay = await ev('window.__miloMediaProbe.summary()');
    assert.equal(audio.firstPlay.rejected, 0, 'Audio playback must not reject');
    await size(390, 844); await top(); await shot('restored-settings-390');
    await size(320, 740); await top(); await shot('restored-settings-320');

    // Verify enabled preference survives reload but causes no autoplay.
    await send('Page.reload'); await until(`Boolean(${visibleControl('Ba lô')})`, 'dock after reload');
    audio.reloadBeforeGesture = await ev('window.__miloMediaProbe.summary()');
    assert.equal(audio.reloadBeforeGesture.calls, 0, 'Enabled preference does not start audio automatically after reload');
    await openSettings(); assert.equal(await switchState('Âm thanh hiệu ứng'), true);
    await visibleText('Thử âm thanh');
    audio.reloadEnabled = await ev('window.__miloMediaProbe.summary()');
    // Opening settings itself is an explicit button gesture and may emit a tap.
    await wait(350);
    audio.muteWhilePlaying = await ev(`(async () => {
      const button=${visibleControl('Thử âm thanh')};
      if(!button)throw Error('Sound test missing');
      button.click();
      let before;
      for(let i=0;i<60;i++){before=window.__miloMediaProbe.summary();if(before.active>0)break;await new Promise(r=>setTimeout(r,5));}
      if(!before || before.active===0)throw Error('No active browser media observed before mute');
      const mute=${switchExpression('Âm thanh hiệu ứng')};mute.click();
      await new Promise(r=>setTimeout(r,120));
      return {before,after:window.__miloMediaProbe.summary()};
    })()`);
    assert.equal(audio.muteWhilePlaying.after.active, 0, 'Mute must stop currently playing media');
    assert.ok(audio.muteWhilePlaying.after.pauses > audio.muteWhilePlaying.before.pauses, 'Mute must call the browser pause path');
    assert.equal(await switchState('Âm thanh hiệu ứng'), false);
    await until(`JSON.parse(localStorage.getItem(${JSON.stringify(preferenceKey)})||'null')?.preferences.soundEffects === false`, 'muted preference stored');

    await setSwitch('Giảm chuyển động', true); await click('Đóng tùy chọn trải nghiệm');
    motion.reduced = await cloudSamples();
    assert.equal(new Set(motion.reduced).size, 1, 'Reduced-motion cloud transform must remain static');
    await send('Page.reload'); await until(`Boolean(${visibleControl('Ba lô')})`, 'dock after muted reload');
    await openSettings();
    assert.equal(await switchState('Âm thanh hiệu ứng'), false, 'Mute persists after reload');
    assert.equal(await switchState('Giảm chuyển động'), true, 'Reduced motion persists after reload');
    await click('Đóng tùy chọn trải nghiệm');
    motion.reloadedReduced = await cloudSamples();
    assert.equal(new Set(motion.reloadedReduced).size, 1);
    audio.reloadedMuted = await ev('window.__miloMediaProbe.summary()');
    assert.equal(audio.reloadedMuted.calls, 0, 'Muted map and settings produce no media playback');

    await click('Sân chơi'); await until("Boolean(document.querySelector('[data-testid=\"explorer-arcade\"]'))", 'arcade opened');
    await visibleText('Không tính XP bài học.');
    await size(390, 844); await top(); await shot('restored-arcade-390');
    await size(320, 740); await top(); await shot('restored-arcade-320');
    const currentCell = async () => ev(`(() => {const e=[...document.querySelectorAll('[data-testid^="arcade-cell-"]')].find(e=>e.getAttribute('aria-label')?.startsWith('Con ở'));return e?.getAttribute('data-testid');})()`);
    const initialCell = await currentCell();
    assert.ok(initialCell, 'Maze has a real player position');
    await click('Đi xuống'); await visibleText('Chỗ này không có lối đi.');
    assert.equal(await currentCell(), initialCell, 'Blocked move cannot cross a tree');
    const visited = new Set([initialCell]);
    const route = [initialCell];
    maze.path.push(initialCell);
    for (let step = 0; step < 100; step++) {
      if ((await ev('document.body?.innerText || ""')).includes('Con đã tìm được đường tới trại!')) break;
      const adjacent = await ev(`Array.from(document.querySelectorAll('[data-testid^="arcade-cell-"]')).filter(e=>e.getAttribute('role')==='button'&&e.getAttribute('aria-disabled')!=='true').map(e=>({id:e.getAttribute('data-testid'),label:e.getAttribute('aria-label')}))`);
      let next = adjacent.find(cell => !visited.has(cell.id));
      if (next) {visited.add(next.id); route.push(next.id);}
      else {route.pop(); const back = route.at(-1); assert.ok(back, 'Reachable UI maze has a route to camp'); next = adjacent.find(cell => cell.id === back);}
      assert.ok(next, 'Backtracking must also use an adjacent enabled control');
      await click(next.label, 40); maze.path.push(next.id);
      assert.equal(await currentCell(), next.id, 'Player moves into the clicked adjacent cell');
    }
    await visibleText('Con đã tìm được đường tới trại!');
    maze.finalCell = await currentCell();
    maze.moves = await ev(`document.querySelector('[data-testid="explorer-arcade"]').innerText.match(/\d+ bước đã đi/)?.[0]`);
    await shot('restored-arcade-win-320'); await size(390, 844); await shot('restored-arcade-win-390');
    await click('Khám phá đường tiếp theo'); await visibleText('2/3');
    assert.ok(!(await ev('document.body?.innerText || ""')).includes('Con đã tìm được đường tới trại!'), 'Next maze resets the win state');
    await click('Đóng sân chơi'); await until("!document.querySelector('[data-testid=\"explorer-arcade\"]')", 'arcade dismissed');
    const after = await mapSnapshot();
    assert.deepEqual(after, before, 'Arcade, browsing collection and settings must not change learning XP, badges or completion');
    audio.afterMutedArcade = await ev('window.__miloMediaProbe.summary()');
    assert.equal(audio.afterMutedArcade.calls, 0, 'Muted arcade interactions must stay silent');
    assert.deepEqual(runtimeErrors, [], 'No uncaught browser runtime exceptions');
    fs.writeFileSync(path.join(out, 'browser-restoration-results.json'), JSON.stringify({
      passed: true,
      scope: 'Synthetic local curriculum; desktop Edge emulation 320/390. Media API playback observed, not a human listening test. No native device or child testing.',
      before, after, collectionSummary, lockedLabel, motion, audio, maze, screenshots, runtimeErrors,
    }, null, 2));
    console.log('Restoration checks passed: collection, locked details, actual media playback/mute, cloud motion/reduction, playable maze, zero learning XP changes.');
  } catch (error) {
    fs.writeFileSync(path.join(out, 'browser-restoration-failure.txt'), `${error.stack || error}\n${await ev('document.body?.innerText || ""').catch(() => '')}`);
    fs.writeFileSync(path.join(out, 'browser-restoration-partial.json'), JSON.stringify({passed: false, motion, audio, maze, screenshots, runtimeErrors}, null, 2));
    await shot('restored-failure', false).catch(() => {});
    throw error;
  } finally {
    await send('Page.close').catch(() => {});
    for (const task of pending.values()) clearTimeout(task.timer);
    ws.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
