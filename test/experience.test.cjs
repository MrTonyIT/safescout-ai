const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the actual preference module with controlled storage and OS boundaries.
// These harnesses use mocked hooks and platform boundaries, not a React/native renderer.
// Animation checks verify lifecycle decisions; they cannot measure timing or device performance.
const sourcePath = path.resolve(__dirname, '../mobile/src/services/experiencePreferences.ts');
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: sourcePath,
}).outputText;

const nextTurn = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function stored(preferences = {}) {
  return JSON.stringify({
    version: 1,
    preferences: { reducedMotion: true, soundEffects: false, haptics: false, ...preferences },
  });
}

function harness(storage, queryMotion = async () => false) {
  const moduleExports = {};
  const systemListeners = new Set();
  let currentConsumer;
  vm.runInNewContext(compiled, {
    exports: moduleExports,
    require(name) {
      if (name === '@react-native-async-storage/async-storage') return { __esModule: true, default: storage };
      if (name === 'react-native') return {
        AccessibilityInfo: {
          addEventListener(name, listener) {
            assert.equal(name, 'reduceMotionChanged');
            systemListeners.add(listener);
            return { remove() { systemListeners.delete(listener); } };
          },
          isReduceMotionEnabled: queryMotion,
        },
      };
      if (name === 'react') return {
        useSyncExternalStore(subscribe, getSnapshot) {
          assert.ok(currentConsumer, 'hook must be read through a consumer');
          if (!currentConsumer.unsubscribe) currentConsumer.unsubscribe = subscribe(() => {});
          return getSnapshot();
        },
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: sourcePath });

  function consumer() {
    const instance = { unsubscribe: undefined, closed: false };
    return {
      read() {
        assert.equal(instance.closed, false);
        currentConsumer = instance;
        try { return moduleExports.useExperiencePreferences(); }
        finally { currentConsumer = undefined; }
      },
      close() {
        if (instance.closed) return;
        instance.closed = true;
        instance.unsubscribe?.();
      },
    };
  }
  const primary = consumer();
  return {
    api: moduleExports,
    read: primary.read,
    close: primary.close,
    consumer,
    motionChanged(value) { [...systemListeners].forEach(listener => listener(value)); },
    get systemListenerCount() { return systemListeners.size; },
  };
}

test('experience: concurrent changes wait for hydration and persist in order without losing unrelated choices', async t => {
  const read = deferred(), firstWrite = deferred();
  let reads = 0;
  const writes = [];
  const store = harness({
    getItem() { reads++; return read.promise; },
    async setItem(key, value) {
      writes.push({ key, value: JSON.parse(value) });
      if (writes.length === 1) await firstWrite.promise;
    },
  });
  t.after(store.close);
  const otherScreen = store.consumer();
  t.after(otherScreen.close);
  assert.equal(store.read().loading, true);
  otherScreen.read();
  const reduce = store.api.setExperiencePreference('reducedMotion', false);
  const sound = store.api.setExperiencePreference('soundEffects', true);
  assert.equal(reads, 1, 'consumers and pending setters must share the same read');
  assert.equal(writes.length, 0, 'pending hydration must not overwrite stored preferences');

  read.resolve(stored({ haptics: true }));
  await nextTurn();
  assert.equal(writes.length, 1, 'the second save must wait for the first save');
  assert.equal(store.read().preferences.soundEffects, true, 'a slow disk must not delay visible intent');
  assert.equal(store.read().saving, true);
  firstWrite.resolve();
  assert.deepEqual(await Promise.all([reduce, sound]), [true, true]);
  assert.equal(writes.length, 2);
  assert.deepEqual(writes.at(-1).value.preferences, { reducedMotion: false, soundEffects: true, haptics: true });
  assert.equal(writes.at(-1).key, store.api.EXPERIENCE_PREFERENCES_STORAGE_KEY);
  assert.equal(store.read().saving, false);
  assert.equal(store.read().error, null);
});

test('experience: unread preferences are preserved after a storage failure until explicit recovery', async t => {
  const values = new Map([['unrelated-learning-draft', 'keep-this-draft']]);
  const writes = [];
  const store = harness({
    async getItem() { throw new Error('Storage temporarily unavailable'); },
    async setItem(key, value) { writes.push(key); values.set(key, value); },
  });
  t.after(store.close);
  store.read();
  await nextTurn();
  assert.equal(await store.api.setExperiencePreference('reducedMotion', false), false);
  assert.equal(writes.length, 0, 'a failed read must not silently replace unknown stored choices');
  assert.equal(store.read().effectiveReducedMotion, true);
  assert.equal(store.read().preferences.soundEffects, false);
  assert.equal(store.read().loadFailed, true);
  assert.ok(store.read().error);

  assert.equal(await store.read().resetPreferences(), true);
  assert.deepEqual(writes, [store.api.EXPERIENCE_PREFERENCES_STORAGE_KEY]);
  assert.equal(values.get('unrelated-learning-draft'), 'keep-this-draft');
  assert.equal(store.read().loadFailed, false);
  assert.equal(store.read().error, null);
});

test('experience: malformed records do not enable effects or get rewritten automatically', async t => {
  let writes = 0;
  const store = harness({
    async getItem() { return '{"version":1,"preferences":{"reducedMotion":"false","soundEffects":true,"haptics":true}}'; },
    async setItem() { writes++; },
  });
  t.after(store.close);
  store.read();
  await nextTurn();
  assert.equal(store.read().loadFailed, true);
  assert.equal(store.read().effectiveReducedMotion, true);
  assert.equal(store.read().preferences.soundEffects, false);
  assert.equal(store.read().preferences.haptics, false);
  assert.equal(writes, 0);
});

test('experience: failed save stays visible, reports failure, and can be retried', async t => {
  let fail = true, persisted;
  const store = harness({
    async getItem() { return null; },
    async setItem(key, value) {
      if (fail) throw new Error('Device storage full');
      persisted = JSON.parse(value);
    },
  });
  t.after(store.close);
  store.read();
  await nextTurn();
  assert.equal(await store.api.setExperiencePreference('reducedMotion', false), false);
  assert.equal(store.read().preferences.reducedMotion, false);
  assert.equal(store.read().saving, false);
  assert.ok(store.read().error);
  fail = false;
  assert.equal(await store.read().retrySave(), true);
  assert.equal(persisted.preferences.reducedMotion, false);
  assert.equal(store.read().error, null);
});

test('experience: an earlier failed write cannot stop or overwrite a later successful choice', async t => {
  let calls = 0, persisted;
  const store = harness({
    async getItem() { return null; },
    async setItem(key, value) {
      calls++;
      if (calls === 1) throw new Error('Transient write error');
      persisted = JSON.parse(value);
    },
  });
  t.after(store.close);
  store.read();
  await nextTurn();
  const first = store.api.setExperiencePreference('reducedMotion', false);
  const second = store.api.setExperiencePreference('soundEffects', true);
  assert.deepEqual(await Promise.all([first, second]), [false, true]);
  assert.deepEqual(persisted.preferences, { reducedMotion: false, soundEffects: true, haptics: false });
  assert.equal(store.read().error, null);
  assert.equal(store.read().saving, false);
});

test('experience: OS reduced motion wins over saved preference and a stale asynchronous query', async t => {
  const query = deferred();
  const store = harness({
    async getItem() { return stored({ reducedMotion: false }); },
    async setItem() {},
  }, () => query.promise);
  t.after(store.close);
  store.read();
  store.motionChanged(true);
  query.resolve(false);
  await nextTurn();
  assert.equal(store.read().preferences.reducedMotion, false);
  assert.equal(store.read().systemReducedMotion, true);
  assert.equal(store.read().effectiveReducedMotion, true);
  assert.equal(await store.api.setExperiencePreference('reducedMotion', false), true);
  assert.equal(store.read().effectiveReducedMotion, true, 'app preference cannot defeat OS reduction');
  store.motionChanged(false);
  assert.equal(store.read().effectiveReducedMotion, false);
  await store.api.setExperiencePreference('reducedMotion', true);
  assert.equal(store.read().effectiveReducedMotion, true, 'explicit app reduction still applies when the OS allows motion');
});

test('experience: consumer lifecycle shares and releases OS listeners, with stale responses ignored', async t => {
  const queries = [];
  const store = harness({
    async getItem() { return stored({ reducedMotion: false }); },
    async setItem() {},
  }, () => { const query = deferred(); queries.push(query); return query.promise; });
  t.after(store.close);
  store.read();
  const second = store.consumer();
  t.after(second.close);
  second.read();
  assert.equal(store.systemListenerCount, 1);
  store.close();
  assert.equal(store.systemListenerCount, 1, 'an active consumer must retain the OS observer');
  second.close();
  assert.equal(store.systemListenerCount, 0);

  const remounted = store.consumer();
  t.after(remounted.close);
  remounted.read();
  queries[0].resolve(false);
  await nextTurn();
  assert.equal(remounted.read().effectiveReducedMotion, true, 'an old mount cannot answer for the new mount');
  queries[1].resolve(false);
  await nextTurn();
  assert.equal(remounted.read().effectiveReducedMotion, false);
  remounted.close();

  for (let i = 0; i < 20; i++) {
    const screen = store.consumer();
    screen.read();
    assert.equal(store.systemListenerCount, 1);
    screen.close();
    assert.equal(store.systemListenerCount, 0);
    queries.at(-1).resolve(false);
  }
  await nextTurn();
});

test('experience: a new device enables gentle motion only after storage and OS checks finish', async t => {
  const read = deferred(), query = deferred();
  const store = harness({ getItem: () => read.promise, async setItem() {} }, () => query.promise);
  t.after(store.close);
  assert.equal(store.read().effectiveReducedMotion, true);
  query.resolve(false);
  await nextTurn();
  assert.equal(store.read().effectiveReducedMotion, true, 'unknown stored preference must keep motion paused');
  read.resolve(null);
  await nextTurn();
  assert.equal(store.read().preferences.reducedMotion, false);
  assert.equal(store.read().effectiveReducedMotion, false);
  assert.equal(store.read().preferences.soundEffects, false);
  assert.equal(store.read().preferences.haptics, false);
});

const companionPath = path.resolve(__dirname, '../mobile/src/components/game/MiloCompanion.tsx');
const companionCompiled = ts.transpileModule(fs.readFileSync(companionPath, 'utf8'), {
  compilerOptions: {
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: companionPath,
}).outputText;

// Minimal state/effect harness for the real component. Only root animation start/stop is mocked;
// it does not simulate individual frames, native drivers, React scheduling or physical devices.
function companionHarness(initialPreferences = { loading: false, effectiveReducedMotion: false }, { viewportObserver = false } = {}) {
  const exports = {}, appListeners = new Set(), running = new Set(), instances = new Set();
  const observers = new Set();
  let current, preferences = initialPreferences, starts = 0;
  const appState = {
    currentState: 'active',
    addEventListener(event, listener) {
      assert.equal(event, 'change');
      appListeners.add(listener);
      return { remove() { appListeners.delete(listener); } };
    },
  };
  const react = {
    createElement(type, props, ...children) {
      if (props?.ref && current) props.ref.current = current.element ??= { type };
      return { type, props, children };
    },
    useRef(value) {
      const index = current.cursor++;
      return current.slots[index] ??= { current: value };
    },
    useState(initial) {
      const instance = current, index = instance.cursor++;
      const slot = instance.slots[index] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [slot.value, value => {
        const next = typeof value === 'function' ? value(slot.value) : value;
        if (!Object.is(next, slot.value)) { slot.value = next; instance.dirty = true; }
      }];
    },
    useEffect(effect, dependencies) {
      const instance = current, index = instance.cursor++;
      const slot = instance.slots[index] ??= { dependencies: undefined, cleanup: undefined };
      if (!slot.dependencies || dependencies.some((value, i) => !Object.is(value, slot.dependencies[i]))) {
        instance.effects.push(() => {
          slot.cleanup?.();
          slot.dependencies = dependencies;
          slot.cleanup = effect();
        });
      }
    },
  };
  function animation(kind) {
    const instance = {
      kind,
      start() { starts++; running.add(instance); },
      stop() { running.delete(instance); },
    };
    return instance;
  }
  const native = {
    AppState: appState,
    Animated: {
      Value: class { setValue() {} stopAnimation() {} interpolate(value) { return value; } },
      timing: () => animation('timing'), sequence: () => animation('sequence'),
      loop: () => animation('loop'), delay: () => animation('delay'), View: 'AnimatedView',
    },
    Easing: { inOut: value => value, quad: 0 },
    Image: 'Image', View: 'View', Text: 'Text', Platform: { OS: 'web' },
    StyleSheet: { create: value => value },
  };
  vm.runInNewContext(companionCompiled, {
    exports,
    ...(viewportObserver ? {
      IntersectionObserver: class {
        constructor(callback) { this.callback = callback; }
        observe(target) { this.target = target; observers.add(this); }
        disconnect() { observers.delete(this); }
      },
    } : {}),
    require(name) {
      if (name === 'react') return { __esModule: true, default: react, ...react };
      if (name === 'react-native') return native;
      if (name === '../../services/experiencePreferences') return { useExperiencePreferences: () => preferences };
      if (name.endsWith('.png')) return name;
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: companionPath });

  function render(instance) {
    assert.equal(instance.closed, false);
    let passes = 0;
    do {
      assert.ok(++passes < 10, 'component unexpectedly keeps scheduling state updates');
      instance.cursor = 0;
      instance.effects = [];
      instance.dirty = false;
      current = instance;
      try { exports.MiloCompanion(instance.props); }
      finally { current = undefined; }
      instance.effects.forEach(effect => effect());
    } while (instance.dirty);
  }
  return {
    mount(props = {}) {
      const instance = { props, slots: [], effects: [], cursor: 0, dirty: false, closed: false };
      instances.add(instance);
      render(instance);
      return {
        update(next) { instance.props = { ...instance.props, ...next }; render(instance); },
        close() {
          if (instance.closed) return;
          instance.slots.forEach(slot => slot?.cleanup?.());
          instance.closed = true;
          instances.delete(instance);
        },
      };
    },
    setPreferences(next) {
      preferences = { ...preferences, ...next };
      instances.forEach(render);
    },
    appChanged(next) {
      appState.currentState = next;
      [...appListeners].forEach(listener => listener(next));
      instances.forEach(render);
    },
    viewportChanged(visible) {
      for (const observer of observers) {
        observer.callback([{ target: observer.target, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]);
      }
      instances.forEach(render);
    },
    finishReactions() {
      for (const animation of running) if (animation.kind !== 'loop') running.delete(animation);
    },
    get activeAnimations() { return running.size; },
    get appListenerCount() { return appListeners.size; },
    get observerCount() { return observers.size; },
    get starts() { return starts; },
  };
}

test('Milo: idle loop stops on blur, background, invisibility and unmount over 20 cycles (mocked lifecycle)', () => {
  const scene = companionHarness();
  for (let cycle = 0; cycle < 20; cycle++) {
    const milo = scene.mount({ state: 'idle' });
    assert.equal(scene.activeAnimations, 1);
    assert.equal(scene.appListenerCount, 1);
    milo.update({ active: false });
    assert.equal(scene.activeAnimations, 0);
    milo.update({ active: true });
    assert.equal(scene.activeAnimations, 1);
    scene.appChanged('background');
    assert.equal(scene.activeAnimations, 0);
    scene.appChanged('active');
    assert.equal(scene.activeAnimations, 1);
    milo.update({ visible: false });
    assert.equal(scene.activeAnimations, 0);
    milo.update({ visible: true });
    assert.equal(scene.activeAnimations, 1);
    milo.close();
    assert.equal(scene.activeAnimations, 0);
    assert.equal(scene.appListenerCount, 0);
  }
});

test('Milo: a first reaction waits for preferences, then never replays on resume or preference toggles (mocked lifecycle)', t => {
  const scene = companionHarness({ loading: true, effectiveReducedMotion: true });
  const milo = scene.mount({ state: 'encouraging' });
  t.after(milo.close);
  assert.equal(scene.starts, 0);
  scene.setPreferences({ loading: false, effectiveReducedMotion: false });
  assert.equal(scene.starts, 1, 'hydration must not consume the first visible reaction');
  scene.finishReactions();
  assert.equal(scene.activeAnimations, 0);
  milo.update({ active: false });
  milo.update({ active: true });
  scene.appChanged('background');
  scene.appChanged('active');
  scene.setPreferences({ effectiveReducedMotion: true });
  scene.setPreferences({ effectiveReducedMotion: false });
  assert.equal(scene.starts, 1, 'a previously presented reaction must not replay');
  milo.update({ state: 'explaining' });
  assert.equal(scene.starts, 2, 'a distinct newly presented state can react once');
});

test('Milo: reduced motion interrupts an active loop and explicit inactive states do not start one (mocked lifecycle)', t => {
  const scene = companionHarness();
  const milo = scene.mount({ state: 'idle' });
  t.after(milo.close);
  assert.equal(scene.activeAnimations, 1);
  scene.setPreferences({ effectiveReducedMotion: true });
  assert.equal(scene.activeAnimations, 0);
  scene.setPreferences({ effectiveReducedMotion: false });
  assert.equal(scene.activeAnimations, 1);
  milo.update({ reducedMotion: true });
  assert.equal(scene.activeAnimations, 0);
  milo.update({ reducedMotion: false, state: 'paused' });
  assert.equal(scene.activeAnimations, 0);
  const starts = scene.starts;
  const inactive = scene.mount({ state: 'encouraging', active: false });
  t.after(inactive.close);
  assert.equal(scene.starts, starts);
});

test('Milo: web viewport observer pauses a scrolled-off mascot and disconnects on unmount (mocked observer)', () => {
  const scene = companionHarness(undefined, { viewportObserver: true });
  for (let i = 0; i < 20; i++) {
    const milo = scene.mount({ state: 'idle' });
    assert.equal(scene.observerCount, 1);
    assert.equal(scene.activeAnimations, 0, 'wait for initial viewport observation');
    scene.viewportChanged(true);
    assert.equal(scene.activeAnimations, 1);
    scene.viewportChanged(false);
    assert.equal(scene.activeAnimations, 0);
    scene.viewportChanged(true);
    assert.equal(scene.activeAnimations, 1);
    milo.update({ active: false });
    scene.viewportChanged(false);
    scene.viewportChanged(true);
    assert.equal(scene.activeAnimations, 0, 'intersection cannot override a blurred screen');
    milo.close();
    assert.equal(scene.activeAnimations, 0);
    assert.equal(scene.observerCount, 0);
    assert.equal(scene.appListenerCount, 0);
  }
});
