import { Platform } from 'react-native';
import { MiloEmotion } from '../types/curriculum';
import { i18n } from './i18n';

class MiloVoiceService {
  private pendingSpeech: ReturnType<typeof setTimeout> | null = null;
  private generation = 0;
  private isMuted: boolean = false;
  private currentUtterance: any = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private availabilityListeners = new Set<() => void>();

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Nạp danh sách voices ngay khi khởi tạo
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
        this.availabilityListeners.forEach(listener=>listener());
      };
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public isAvailable(): boolean {
    return Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window && this.getBestVoiceForLanguage('vi','vi-VN')!==null;
  }
  public subscribeAvailability(listener:()=>void):()=>void {
    this.availabilityListeners.add(listener);
    return ()=>{this.availabilityListeners.delete(listener);};
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }

  public stop() {
    this.generation++;
    if (this.pendingSpeech !== null) clearTimeout(this.pendingSpeech);
    this.pendingSpeech = null;
    this.currentUtterance = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  /**
   * Làm sạch văn bản: Loại bỏ emoji, ký tự lạ, định dạng markdown
   * để giọng đọc tiếng Việt tròn vành, tự nhiên và liền mạch.
   */
  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~>\[\]()•-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tìm kiếm giọng đọc tiếng Việt tối ưu nhất trên hệ thống (Chrome / Edge / Safari / Android)
   */
  private getBestVoiceForLanguage(langCode: string, locale: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.cachedVoices = voices;
    }

    const availableVoices = this.cachedVoices.length > 0 ? this.cachedVoices : voices;
    if (availableVoices.length === 0) return null;

    if (langCode === 'vi') {
      // 1. Ưu tiên 1: Giọng tiếng Việt chất lượng cao (HoaiMy Natural của Edge, Google tiếng Việt của Chrome)
      const premiumVi = availableVoices.find(
        (v) =>
          v.name.includes('HoaiMy') ||
          v.name.includes('NamMinh') ||
          v.name.toLowerCase().includes('tiếng việt') ||
          v.name.toLowerCase().includes('vietnamese') ||
          v.name.toLowerCase().includes('vietnam'),
      );
      if (premiumVi) return premiumVi;

      // 2. Ưu tiên 2: Giọng có mã ngôn ngữ vi-VN hoặc vi
      const codeVi = availableVoices.find(
        (v) =>
          v.lang.toLowerCase().replace('_', '-').startsWith('vi') ||
          v.lang.toLowerCase().includes('vi-vn') ||
          v.lang.toLowerCase() === 'vi',
      );
      if (codeVi) return codeVi;
    } else {
      // Các ngôn ngữ khác (en, ja, ko, es)
      const matched = availableVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langCode) ||
          v.lang.toLowerCase().includes(locale.toLowerCase()),
      );
      if (matched) return matched;
    }

    return null;
  }

  /**
   * Phát âm giọng đọc của Đội Trưởng Milo chuẩn xác 100% không bị vấp
   */
  public speakMilo(text: string, emotion: MiloEmotion = 'IDLE', onEnd?: () => void) {
    if (this.isMuted || !text) return;
    this.stop();
    const generation = this.generation;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const cleanText = this.cleanTextForSpeech(text);
        if (!cleanText) return;

        // Dừng câu nói cũ & Giải phóng trạng thái pause của Chrome
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const meta = i18n.getLanguageMeta();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = meta.voiceLocale || 'vi-VN';

        // Lấy giọng đọc tốt nhất
        const bestVoice = this.getBestVoiceForLanguage(meta.code, meta.voiceLocale);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        // Tinh chỉnh âm sắc sinh động của chú gấu cứu hộ Milo
        switch (emotion) {
          case 'CHEERING':
            utterance.pitch = 1.15; // Tươi vui, hào hứng
            utterance.rate = 1.05;
            break;
          case 'DANGER_ALERT':
            utterance.pitch = 1.1; // Dứt khoát, cảnh báo
            utterance.rate = 1.08;
            break;
          case 'THINKING':
            utterance.pitch = 1.02; // Điềm đạm, ấm áp
            utterance.rate = 0.96;
            break;
          default:
            utterance.pitch = 1.08; // Giọng kể chuyện thân thiện
            utterance.rate = 1.0;
            break;
        }

        utterance.onend = () => {
          this.currentUtterance = null;
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          this.currentUtterance = null;
          if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;

        // Bắt buộc gọi speak sau một tick nhỏ để browser cập nhật audio context
        this.pendingSpeech = setTimeout(() => {
          this.pendingSpeech = null;
          if (this.isMuted || generation !== this.generation) return;
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        }, 30);
      } catch (e) {
        console.log('TTS speak error:', e);
      }
    }
  }
}

export const voiceService = new MiloVoiceService();
