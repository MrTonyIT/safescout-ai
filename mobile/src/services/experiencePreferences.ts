import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';
import { useSyncExternalStore } from 'react';

/** Device preferences only. These contain no child, family, lesson or account data. */
export type ExperiencePreferences = Readonly<{
  reducedMotion: boolean;
  soundEffects: boolean;
  haptics: boolean;
}>;
export type ExperiencePreferenceKey = keyof ExperiencePreferences;

export const DEFAULT_EXPERIENCE_PREFERENCES: ExperiencePreferences = Object.freeze({
  reducedMotion: false,
  soundEffects: false,
  haptics: false,
});
export const EXPERIENCE_PREFERENCES_STORAGE_KEY = 'milo.experience-preferences.v1';

type Snapshot = {
  preferences: ExperiencePreferences;
  systemReducedMotion: boolean;
  effectiveReducedMotion: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadFailed: boolean;
};

let snapshot: Snapshot = {
  preferences: DEFAULT_EXPERIENCE_PREFERENCES,
  systemReducedMotion: true,
  effectiveReducedMotion: true,
  loading: true,
  saving: false,
  error: null,
  loadFailed: false,
};
const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;
let storageLoaded = false;
let writeQueue: Promise<boolean> = Promise.resolve(true);
let writeRevision = 0;
let pendingWrites = 0;
let systemGeneration = 0;
let systemSubscription: ReturnType<typeof AccessibilityInfo.addEventListener> | undefined;

function update(next: Partial<Snapshot>) {
  const merged = { ...snapshot, ...next };
  snapshot = {
    ...merged,
    effectiveReducedMotion: merged.loading || merged.loadFailed || merged.systemReducedMotion || merged.preferences.reducedMotion,
  };
  listeners.forEach(listener => listener());
}

function parseStored(raw: string | null): ExperiencePreferences {
  if (!raw) return DEFAULT_EXPERIENCE_PREFERENCES;
  const stored = JSON.parse(raw);
  const preferences = stored?.preferences;
  if (stored?.version !== 1 || !preferences ||
      typeof preferences.reducedMotion !== 'boolean' ||
      typeof preferences.soundEffects !== 'boolean' ||
      typeof preferences.haptics !== 'boolean') {
    throw new Error('Invalid preference record');
  }
  return Object.freeze({
    reducedMotion: preferences.reducedMotion,
    soundEffects: preferences.soundEffects,
    haptics: preferences.haptics,
  });
}

/** Hydration is shared across consumers; a setter waits for it before changing storage. */
async function loadPreferences(): Promise<void> {
  if (storageLoaded) return;
  if (loadPromise) return loadPromise;
  update({ loading: true, error: null, loadFailed: false });
  loadPromise = (async () => {
    try {
      const preferences = parseStored(await AsyncStorage.getItem(EXPERIENCE_PREFERENCES_STORAGE_KEY));
      storageLoaded = true;
      update({ preferences, loading: false, loadFailed: false });
    } catch {
      update({
        loading: false,
        loadFailed: true,
        error: 'Chưa đọc được tùy chọn đã lưu. Milo đang dùng chế độ yên tĩnh. Thử lại hoặc chọn mặc định.',
      });
    }
  })().finally(() => { loadPromise = null; });
  return loadPromise;
}

function observeSystemMotion() {
  const generation = ++systemGeneration;
  // The OS may have changed while no presentation component was mounted.
  update({ systemReducedMotion: true });
  // A system change received after the query starts must take precedence over its answer.
  let changedWhileReading = false;
  systemSubscription = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
    changedWhileReading = true;
    if (generation === systemGeneration) update({ systemReducedMotion: enabled });
  });
  void AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
    if (generation === systemGeneration && !changedWhileReading) update({ systemReducedMotion: enabled });
  }).catch(() => {
    if (generation === systemGeneration && !changedWhileReading) update({ systemReducedMotion: true });
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) observeSystemMotion();
  void loadPreferences();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      ++systemGeneration;
      systemSubscription?.remove();
      systemSubscription = undefined;
    }
  };
}

/** Non-React presentation adapters share exactly the same hydrated preferences as the UI. */
export const getExperiencePreferences = () => snapshot;
export const subscribeExperiencePreferences = subscribe;

/** Serial writes prevent an earlier switch toggle from overwriting a later one. */
function persistPreferences(): Promise<boolean> {
  const revision = ++writeRevision;
  const payload = JSON.stringify({ version: 1, preferences: snapshot.preferences });
  pendingWrites += 1;
  update({ saving: true, error: null });
  writeQueue = writeQueue.then(async () => {
    try {
      await AsyncStorage.setItem(EXPERIENCE_PREFERENCES_STORAGE_KEY, payload);
      if (revision === writeRevision) update({ error: null });
      return true;
    } catch {
      if (revision === writeRevision) {
        update({ error: 'Tùy chọn đã áp dụng cho lần mở này nhưng chưa lưu được. Hãy thử lưu lại.' });
      }
      return false;
    } finally {
      pendingWrites -= 1;
      update({ saving: pendingWrites > 0 });
    }
  });
  return writeQueue;
}

/** Resolves false on a read/write failure. A failed write keeps the visible choice active. */
export async function setExperiencePreference(key: ExperiencePreferenceKey, value: boolean): Promise<boolean> {
  if (typeof value !== 'boolean' || !Object.prototype.hasOwnProperty.call(DEFAULT_EXPERIENCE_PREFERENCES, key)) return false;
  await loadPreferences();
  // Do not replace an unread storage record automatically following a read error.
  if (!storageLoaded) return false;
  update({ preferences: Object.freeze({ ...snapshot.preferences, [key]: value }) });
  return persistPreferences();
}

async function retrySave(): Promise<boolean> {
  if (!storageLoaded) {
    await loadPreferences();
    return storageLoaded;
  }
  return persistPreferences();
}

/** Explicit recovery affects these three preferences only, never learning or account data. */
async function resetPreferences(): Promise<boolean> {
  if (loadPromise) await loadPromise;
  storageLoaded = true;
  update({ preferences: DEFAULT_EXPERIENCE_PREFERENCES, loading: false, loadFailed: false });
  return persistPreferences();
}

/**
 * One shared preference source for presentation components.
 * `effectiveReducedMotion` always respects the OS setting, even if the saved choice is off.
 * Sound/haptic adapters must check these preferences before emitting an effect.
 */
export function useExperiencePreferences() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
  return {
    ...state,
    setPreference: setExperiencePreference,
    retryLoad: loadPreferences,
    retrySave,
    resetPreferences,
  };
}
