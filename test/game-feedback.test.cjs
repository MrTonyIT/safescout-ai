const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { EFFECTS, makeWave, SAMPLE_RATE } = require('../scripts/create-game-audio.cjs');

const file = path.resolve(__dirname, '../mobile/src/services/gameFeedback.ts');
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  fileName: file,
}).outputText;
const turn = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

// The real controller with mocked Expo/platform boundaries. No speaker, vibrator, browser policy,
// codec or physical-device behavior is claimed by these tests.
function harness({ platform = 'web', soundEffects = true, haptics = false, holdFirstLoad = false, rejectPlayback = false } = {}) {
  const exports = {}, listeners = new Set(), appListeners = new Set(), sounds = [], events = [], modes = [], pulses = [];
  const firstLoad = deferred();
  let preference = { loading: false, loadFailed: false, preferences: { soundEffects, haptics, reducedMotion: false } };
  let rejectPlay = rejectPlayback;
  const app = {
    currentState: 'active',
    addEventListener(name, callback) { appListeners.add(callback); return { remove() { appListeners.delete(callback); } }; },
  };
  class Sound {
    constructor(source) { this.source = source; this.playing = false; this.unloaded = false; this.callback = null; sounds.push(this); }
    setOnPlaybackStatusUpdate(callback) { this.callback = callback; }
    async stopAsync() { this.playing = false; events.push(['stop', this.source]); return { isLoaded: !this.unloaded }; }
    async unloadAsync() { this.playing = false; this.unloaded = true; events.push(['unload', this.source]); return { isLoaded: false }; }
    async replayAsync() {
      events.push(['play-request', this.source]);
      if (rejectPlay) throw new Error('NotAllowedError');
      assert.equal(this.unloaded, false, 'an unloaded sound must never be played');
      assert.equal(sounds.filter(sound => sound.playing).length, 0, 'effects must not overlap');
      this.playing = true;
      events.push(['play', this.source]);
      return { isLoaded: true, isPlaying: true };
    }
    finish() { this.playing = false; this.callback?.({ isLoaded: true, didJustFinish: true }); }
  }
  Sound.createAsync = async (source, status) => {
    assert.equal(status.shouldPlay, false, 'preloading must not autoplay');
    assert.equal(status.isLooping, false);
    const sound = new Sound(source);
    if (holdFirstLoad && sounds.length === 1) await firstLoad.promise;
    return { sound, status: { isLoaded: true } };
  };
  vm.runInNewContext(compiled, {
    exports,
    window: { speechSynthesis: { speaking: false, pending: false } },
    require(name) {
      if (name === 'react') return {};
      if (name === 'react-native') return { AppState: app, Platform: { OS: platform } };
      if (name === 'expo-av') return { Audio: { Sound, async setAudioModeAsync(mode) { modes.push(mode); } } };
      if (name === 'expo-haptics') return {
        ImpactFeedbackStyle: { Light: 'light' },
        async selectionAsync() { pulses.push('selection'); },
        async impactAsync(style) { pulses.push(style); },
      };
      if (name === './experiencePreferences') return {
        getExperiencePreferences: () => preference,
        subscribeExperiencePreferences(callback) { listeners.add(callback); return () => listeners.delete(callback); },
        async setExperiencePreference(key, value) { preference = { ...preference, preferences: { ...preference.preferences, [key]: value } }; listeners.forEach(callback => callback()); return true; },
      };
      if (name.endsWith('.wav')) return path.basename(name);
      throw new Error(`Unexpected import ${name}`);
    },
  }, { filename: file });
  const engine = new exports.GameFeedbackEngine();
  return {
    engine, sounds, events, modes, pulses, firstLoad,
    preferences(next) { preference = { ...preference, preferences: { ...preference.preferences, ...next } }; listeners.forEach(callback => callback()); },
    appChanged(next) { app.currentState = next; [...appListeners].forEach(callback => callback(next)); },
    setPlaybackRejected(value) { rejectPlay = value; },
    get activeAppListeners() { return appListeners.size; },
    get preferenceListeners() { return listeners.size; },
    get playCount() { return events.filter(([kind]) => kind === 'play').length; },
  };
}

test('game audio: generated assets are reproducible local PCM with bounded duration and amplitude', () => {
  for (const [name, effect] of Object.entries(EFFECTS)) {
    const generated = makeWave(effect);
    assert.deepEqual(fs.readFileSync(path.resolve(__dirname, `../mobile/assets/audio/${name}.wav`)), generated);
    assert.equal(generated.toString('ascii', 0, 4), 'RIFF');
    assert.equal(generated.toString('ascii', 8, 12), 'WAVE');
    assert.equal(generated.readUInt16LE(20), 1);
    assert.equal(generated.readUInt16LE(22), 1);
    assert.equal(generated.readUInt32LE(24), SAMPLE_RATE);
    const duration = (generated.length - 44) / (SAMPLE_RATE * 2);
    assert.ok(duration > 0 && duration <= 0.52);
    let peak = 0;
    for (let i = 44; i < generated.length; i += 2) peak = Math.max(peak, Math.abs(generated.readInt16LE(i)));
    assert.ok(peak > 1000 && peak < 27000, 'samples must be audible data without clipping');
  }
});

test('game audio: opt-in loads silently, while default-off produces no audio or vibration', async t => {
  const app = harness({ platform: 'ios', soundEffects: false });
  const owner = Symbol('screen');
  t.after(() => app.engine.release(owner));
  app.engine.register(owner, true);
  assert.equal(await app.engine.play(owner, 'tap', true), false);
  assert.equal(app.sounds.length, 0);
  assert.equal(app.pulses.length, 0);
  app.preferences({ soundEffects: true });
  await app.engine.prepare();
  assert.equal(app.sounds.length, 3);
  assert.equal(app.playCount, 0);
  assert.equal(app.engine.getSnapshot().ready, true);
  assert.equal(app.modes[0].allowsRecordingIOS, false);
  assert.equal(app.modes[0].staysActiveInBackground, false);
  assert.equal(app.modes[0].playsInSilentModeIOS, false);
});

test('game audio: web completion waits for a gesture and consecutive effects never overlap', async t => {
  const app = harness();
  const owner = Symbol('screen');
  t.after(() => app.engine.release(owner));
  app.engine.register(owner, true);
  await app.engine.prepare();
  assert.equal(await app.engine.play(owner, 'complete'), false);
  assert.equal(app.playCount, 0);
  assert.equal(await app.engine.play(owner, 'tap', true), true);
  assert.equal(app.engine.getSnapshot().needsGesture, false);
  assert.equal(await app.engine.play(owner, 'confirm', true), true);
  assert.equal(await app.engine.play(owner, 'complete'), true);
  assert.equal(app.playCount, 3);
  assert.equal(app.sounds.filter(sound => sound.playing).length, 1);
});

test('game audio: an unfocused map cannot stop a focused lesson sound', async t => {
  const app = harness();
  const map = Symbol('map'), lesson = Symbol('lesson');
  t.after(() => { app.engine.release(map); app.engine.release(lesson); });
  app.engine.register(map, true);
  app.engine.register(lesson, true);
  await app.engine.prepare();
  await app.engine.play(lesson, 'confirm', true);
  const current = app.sounds.find(sound => sound.playing);
  app.engine.setActive(map, false);
  app.engine.release(map);
  assert.equal(current.playing, true);
  assert.equal(current.unloaded, false);
  app.engine.setActive(lesson, false);
  await turn();
  assert.equal(app.sounds.every(sound => sound.unloaded), true);
  assert.equal(app.sounds.some(sound => sound.playing), false);
});

test('game audio: muting during a load unloads the late result without delayed playback', async t => {
  const app = harness({ holdFirstLoad: true });
  const owner = Symbol('screen');
  t.after(() => app.engine.release(owner));
  app.engine.register(owner, true);
  const pending = app.engine.prepare();
  assert.equal(await app.engine.play(owner, 'tap', true), false);
  app.preferences({ soundEffects: false });
  app.firstLoad.resolve();
  await pending;
  await turn();
  assert.equal(app.playCount, 0);
  assert.equal(app.sounds.length, 1);
  assert.equal(app.sounds[0].unloaded, true);
  assert.equal(app.engine.getSnapshot().ready, false);
});

test('game audio: background and mute stop/unload; returning to foreground does not replay', async t => {
  const app = harness();
  const owner = Symbol('screen');
  t.after(() => app.engine.release(owner));
  app.engine.register(owner, true);
  await app.engine.prepare();
  await app.engine.play(owner, 'tap', true);
  app.appChanged('background');
  await turn();
  assert.equal(app.sounds.every(sound => sound.unloaded), true);
  assert.equal(await app.engine.play(owner, 'complete'), false);
  app.appChanged('active');
  await app.engine.prepare();
  assert.equal(app.playCount, 1);
  await app.engine.play(owner, 'confirm', true);
  app.preferences({ soundEffects: false });
  await turn();
  assert.equal(app.sounds.every(sound => sound.unloaded), true);
  assert.equal(app.sounds.some(sound => sound.playing), false);
});

test('game audio: rejected playback reports failure and can recover through an explicit gesture', async t => {
  const app = harness({ rejectPlayback: true });
  const owner = Symbol('screen');
  t.after(() => app.engine.release(owner));
  app.engine.register(owner, true);
  await app.engine.prepare();
  assert.equal(await app.engine.play(owner, 'confirm', true, false), false);
  assert.equal(app.engine.getSnapshot().needsGesture, true);
  assert.ok(app.engine.getSnapshot().error);
  assert.equal(app.playCount, 0);
  app.setPlaybackRejected(false);
  assert.equal(await app.engine.play(owner, 'confirm', true, false), true);
  assert.equal(app.engine.getSnapshot().error, null);
  assert.equal(app.playCount, 1);
});

test('game audio: haptics are native-only, opt-in, light and blocked for inactive screens', async t => {
  const app = harness({ platform: 'android', soundEffects: false });
  const owner = Symbol('screen');
  t.after(() => app.engine.release(owner));
  app.engine.register(owner, true);
  assert.equal(await app.engine.play(owner, 'tap', true), false);
  app.preferences({ haptics: true });
  assert.equal(await app.engine.play(owner, 'tap', true), true);
  assert.equal(await app.engine.testHaptic(owner), true);
  assert.deepEqual(app.pulses, ['selection', 'light']);
  app.engine.setActive(owner, false);
  assert.equal(await app.engine.testHaptic(owner), false);
  assert.equal(app.pulses.length, 2);
  const web = harness({ haptics: true, soundEffects: false });
  const webOwner = Symbol('web');
  t.after(() => web.engine.release(webOwner));
  web.engine.register(webOwner, true);
  assert.equal(await web.engine.testHaptic(webOwner), false);
  assert.equal(web.pulses.length, 0);
});

test('game audio: 20 screen mount/unmount cycles release observers and loaded sounds', async () => {
  const app = harness();
  for (let cycle = 0; cycle < 20; cycle++) {
    const owner = Symbol('screen');
    app.engine.register(owner, true);
    await app.engine.prepare();
    assert.equal(app.activeAppListeners, 1);
    assert.equal(app.preferenceListeners, 1);
    app.engine.release(owner);
    await turn();
    assert.equal(app.activeAppListeners, 0);
    assert.equal(app.preferenceListeners, 0);
    assert.equal(app.sounds.every(sound => sound.unloaded), true);
  }
});
