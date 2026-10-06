import { useEffect, useRef, useSyncExternalStore } from 'react';
import { AppState, Platform } from 'react-native';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import {
  getExperiencePreferences, subscribeExperiencePreferences, setExperiencePreference,
} from './experiencePreferences';

export type GameFeedbackEffect = 'tap' | 'confirm' | 'complete';
type Owner = symbol;
type FeedbackSnapshot = {
  preparing: boolean;
  ready: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  hapticsAvailable: boolean;
  needsGesture: boolean;
  error: string | null;
};
const SOURCES = {
  tap: require('../../assets/audio/tap.wav'),
  confirm: require('../../assets/audio/confirm.wav'),
  complete: require('../../assets/audio/complete.wav'),
};

/** Shared renderer: one playing sound, distinct focused-screen owners, no automatic rewards. */
export class GameFeedbackEngine {
  private owners = new Map<Owner, boolean>();
  private sounds = new Map<GameFeedbackEffect, Audio.Sound>();
  private listeners = new Set<() => void>();
  private unsubscribePreferences?: () => void;
  private appSubscription?: ReturnType<typeof AppState.addEventListener>;
  private foreground = AppState.currentState === 'active';
  private generation = 0;
  private playToken = 0;
  private preparingPromise: Promise<void> | null = null;
  private current: { owner: Owner; sound: Audio.Sound; token: number } | null = null;
  private unlocked = Platform.OS !== 'web';
  private state: FeedbackSnapshot = {
    preparing: false, ready: false, soundEnabled: false, hapticsEnabled: false,
    hapticsAvailable: Platform.OS === 'ios' || Platform.OS === 'android',
    needsGesture: Platform.OS === 'web', error: null,
  };

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(next: Partial<FeedbackSnapshot>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach(listener => listener());
  }
  private hasActiveOwner() { return [...this.owners.values()].some(Boolean); }
  private allowed(owner: Owner) { return this.owners.get(owner) === true && this.foreground; }
  private audioAllowed() {
    const prefs = getExperiencePreferences();
    return this.foreground && this.hasActiveOwner() && !prefs.loading && !prefs.loadFailed && prefs.preferences.soundEffects;
  }

  register(owner: Owner, active: boolean) {
    this.owners.set(owner, active);
    if (this.owners.size === 1) {
      this.foreground = AppState.currentState === 'active';
      this.unsubscribePreferences = subscribeExperiencePreferences(() => this.preferencesChanged());
      this.appSubscription = AppState.addEventListener('change', next => {
        this.foreground = next === 'active';
        if (!this.foreground) this.releaseResources();
        else void this.prepare(); // Reload silently; never replay a prior event on resume.
      });
    }
    this.preferencesChanged();
  }
  setActive(owner: Owner, active: boolean) {
    if (!this.owners.has(owner)) return;
    this.owners.set(owner, active);
    if (!active && this.current?.owner === owner) this.stop(owner);
    if (!this.hasActiveOwner()) this.releaseResources();
    else void this.prepare();
  }
  release(owner: Owner) {
    if (this.current?.owner === owner) this.stop(owner);
    this.owners.delete(owner);
    if (!this.hasActiveOwner()) this.releaseResources();
    if (!this.owners.size) {
      this.unsubscribePreferences?.();
      this.unsubscribePreferences = undefined;
      this.appSubscription?.remove();
      this.appSubscription = undefined;
    }
  }
  private preferencesChanged() {
    const prefs = getExperiencePreferences();
    this.update({ soundEnabled: prefs.preferences.soundEffects, hapticsEnabled: prefs.preferences.haptics });
    if (!this.audioAllowed()) this.releaseResources();
    else void this.prepare();
  }
  private async dispose(sound: Audio.Sound) {
    sound.setOnPlaybackStatusUpdate(null);
    try { await sound.stopAsync(); } catch { /* A partially loaded sound may not support stop. */ }
    try { await sound.unloadAsync(); } catch { /* No continuing retry or background task. */ }
  }
  private releaseResources() {
    ++this.generation;
    ++this.playToken;
    this.current = null;
    this.preparingPromise = null;
    const sounds = [...this.sounds.values()];
    this.sounds.clear();
    // stopAsync is called synchronously before disposal's first await, including on web.
    sounds.forEach(sound => { void this.dispose(sound); });
    this.update({ preparing: false, ready: false });
  }

  /** Preload without playing. A browser gesture can then invoke replayAsync synchronously. */
  prepare(): Promise<void> {
    if (!this.audioAllowed() || this.sounds.size === 3) return Promise.resolve();
    if (this.preparingPromise) return this.preparingPromise;
    const generation = this.generation;
    this.update({ preparing: true, error: null });
    let task: Promise<void>;
    task = (async () => {
      try {
        if (Platform.OS !== 'web') await Audio.setAudioModeAsync({
          allowsRecordingIOS: false, playsInSilentModeIOS: false,
          staysActiveInBackground: false, shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        for (const effect of Object.keys(SOURCES) as GameFeedbackEffect[]) {
          if (generation !== this.generation || !this.audioAllowed()) return;
          const { sound, status } = await Audio.Sound.createAsync(SOURCES[effect], {
            shouldPlay: false, isLooping: false, volume: 0.65, progressUpdateIntervalMillis: 100,
          });
          if (generation !== this.generation || !this.audioAllowed()) {
            await this.dispose(sound);
            return;
          }
          if (!status.isLoaded) { await this.dispose(sound); throw new Error('Sound did not load'); }
          sound.setOnPlaybackStatusUpdate(status => this.playbackStatus(sound, status));
          this.sounds.set(effect, sound);
        }
        if (generation === this.generation) this.update({ ready: true });
      } catch {
        if (generation === this.generation) {
          this.releaseResources();
          this.update({ error: 'Chưa tải được âm thanh. Bạn vẫn chơi được; hãy thử lại trong tùy chọn.' });
        }
      } finally {
        if (this.preparingPromise === task!) {
          this.preparingPromise = null;
          this.update({ preparing: false });
        }
      }
    })();
    this.preparingPromise = task;
    return task;
  }
  private playbackStatus(sound: Audio.Sound, status: AVPlaybackStatus) {
    if (status.isLoaded && status.didJustFinish && this.current?.sound === sound) this.current = null;
    if (!status.isLoaded && status.error && [...this.sounds.values()].includes(sound)) {
      this.releaseResources();
      this.update({ error: 'Âm thanh chưa phát được. Hãy thử lại; bài học vẫn được giữ.' });
    }
  }
  /** Stop only this screen's sound: a blurred map must not silence a newly focused lesson. */
  stop(owner: Owner) {
    if (this.current?.owner !== owner) return;
    ++this.playToken;
    const sound = this.current.sound;
    this.current = null;
    void sound.stopAsync().catch(() => { void this.dispose(sound); });
  }
  private voiceIsPlaying() {
    return Platform.OS === 'web' && typeof window !== 'undefined' &&
      Boolean(window.speechSynthesis?.speaking || window.speechSynthesis?.pending);
  }
  private async haptic(owner: Owner, effect: GameFeedbackEffect): Promise<boolean> {
    const prefs = getExperiencePreferences();
    if (!this.allowed(owner) || prefs.loading || prefs.loadFailed || !prefs.preferences.haptics || !this.state.hapticsAvailable) return false;
    try {
      if (effect === 'tap') await Haptics.selectionAsync();
      else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    } catch {
      this.update({ error: 'Thiết bị chưa phản hồi rung. Bạn vẫn có thể dùng hình và âm thanh.' });
      return false;
    }
  }

  /** `gesture=true` is for a real onPress handler, never for a timer or network callback. */
  async play(owner: Owner, effect: GameFeedbackEffect, gesture = false, emitHaptic = true): Promise<boolean> {
    if (!this.allowed(owner)) return false;
    const haptic = emitHaptic ? this.haptic(owner, effect) : Promise.resolve(false);
    if (!this.audioAllowed() || this.voiceIsPlaying()) return haptic;
    const sound = this.sounds.get(effect);
    if (!sound) { void this.prepare(); return haptic; } // Drop, never replay late after a load.
    if (Platform.OS === 'web' && !this.unlocked && !gesture) return haptic;
    const token = ++this.playToken;
    const previous = this.current;
    this.current = { owner, sound, token };
    try {
      const stopped = previous?.sound.stopAsync();
      // Expo's web adapter pauses synchronously, so keep replay in the browser's gesture stack.
      // Native waits for its stop command to finish before starting a different sound.
      if (Platform.OS !== 'web' && stopped) await stopped;
      else if (stopped) void stopped.catch(() => { if (token === this.playToken) this.releaseResources(); });
      if (token !== this.playToken || !this.allowed(owner) || !this.audioAllowed()) return haptic;
      const played = await sound.replayAsync({ volume: 0.65, isLooping: false });
      if (token !== this.playToken || !this.allowed(owner) || !this.audioAllowed()) return false;
      if (!played.isLoaded) throw new Error('Sound unavailable');
      if (gesture) this.unlocked = true;
      this.update({ needsGesture: Platform.OS === 'web' && !this.unlocked, error: null });
      return true;
    } catch {
      if (token === this.playToken) {
        this.current = null;
        void sound.stopAsync().catch(() => { void this.dispose(sound); });
        this.update({
          needsGesture: Platform.OS === 'web',
          error: 'Âm thanh chưa phát được. Chạm “Thử âm thanh”; kiểm tra âm lượng và chế độ im lặng của thiết bị.',
        });
        if (Platform.OS === 'web') this.unlocked = false;
      }
      return haptic;
    }
  }

  testHaptic(owner: Owner) { return this.haptic(owner, 'confirm'); }
}

const engine = new GameFeedbackEngine();

/**
 * One hook per focused screen (not per button). Multiple mounted screens/settings can coexist.
 * Call tap/confirm/testSound directly from onPress. Call complete only after a genuine result.
 * Call stop before narration. Audio stays off until the user enables the saved preference.
 */
export function useGameFeedback(active = true) {
  const owner = useRef(Symbol('game-feedback-screen')).current;
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
  useEffect(() => {
    engine.register(owner, active);
    return () => engine.release(owner);
  }, [owner]);
  useEffect(() => { engine.setActive(owner, active); }, [owner, active]);
  return {
    ...snapshot,
    tap: () => engine.play(owner, 'tap', true),
    confirm: () => engine.play(owner, 'confirm', true),
    complete: () => engine.play(owner, 'complete', false),
    testSound: () => engine.play(owner, 'confirm', true, false),
    testHaptics: () => engine.testHaptic(owner),
    stop: () => engine.stop(owner),
    prepare: () => engine.prepare(),
    setSoundEnabled: (enabled: boolean) => setExperiencePreference('soundEffects', enabled),
    setHapticsEnabled: (enabled: boolean) => setExperiencePreference('haptics', enabled),
  };
}
