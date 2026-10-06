import { voiceService } from './voice';
import { spatialHaptics } from './spatialHaptics';

export type BreathPhase = 'INHALE' | 'HOLD_1' | 'EXHALE' | 'HOLD_2';

export interface BreathState {
  phase: BreathPhase;
  phaseLabel: string;
  secondsRemaining: number;
  cycleCount: number;
  guideText: string;
}

class PanicCalmerEngine {
  private isRunning: boolean = false;
  private intervalRef: any = null;
  private currentPhase: BreathPhase = 'INHALE';
  private secondsInPhase: number = 4;
  private cycleCount: number = 0;
  private listeners: Array<(state: BreathState) => void> = [];

  public startCalmSession(onUpdate?: (state: BreathState) => void) {
    this.isRunning = true;
    this.currentPhase = 'INHALE';
    this.secondsInPhase = 4;
    this.cycleCount = 0;

    voiceService.speakMilo(
      'Bé hãy bình tĩnh cùng Milo nhé. Hít vào thật sâu bằng mũi nào... 1... 2... 3... 4...',
      'THINKING',
    );
    spatialHaptics.playHealingSoothe();

    this.emitState();

    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }

    this.intervalRef = setInterval(() => {
      this.tick();
    }, 1000);
  }

  public stopCalmSession() {
    this.isRunning = false;
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private tick() {
    if (!this.isRunning) return;

    this.secondsInPhase -= 1;

    if (this.secondsInPhase <= 0) {
      this.advancePhase();
    }

    this.emitState();
  }

  private advancePhase() {
    this.secondsInPhase = 4;

    switch (this.currentPhase) {
      case 'INHALE':
        this.currentPhase = 'HOLD_1';
        voiceService.speakMilo('Giữ hơi thở nhẹ nhàng trong lồng ngực...', 'THINKING');
        break;
      case 'HOLD_1':
        this.currentPhase = 'EXHALE';
        voiceService.speakMilo('Thở ra từ từ bằng miệng... Bé làm rất tốt!', 'CHEERING');
        spatialHaptics.playHealingSoothe();
        break;
      case 'EXHALE':
        this.currentPhase = 'HOLD_2';
        voiceService.speakMilo('Thả lỏng toàn thân và giữ bình tĩnh...', 'THINKING');
        break;
      case 'HOLD_2':
        this.currentPhase = 'INHALE';
        this.cycleCount += 1;
        voiceService.speakMilo('Hít vào sâu một lần nữa cùng Milo nào...', 'THINKING');
        spatialHaptics.playHealingSoothe();
        break;
    }
  }

  private emitState() {
    const labels: Record<BreathPhase, string> = {
      INHALE: 'HÍT VÀO SÂU',
      HOLD_1: 'GIỮ HƠI',
      EXHALE: 'THỞ RA TỪ TỪ',
      HOLD_2: 'THẢ LỎNG BÌNH TĨNH',
    };

    const guides: Record<BreathPhase, string> = {
      INHALE: 'Hít sâu không khí trong lành bằng mũi 👃',
      HOLD_1: 'Giữ lồng ngực căng tràn oxy 🫁',
      EXHALE: 'Thổi nhẹ nhàng hết hơi ra ngoài 💨',
      HOLD_2: 'Cảm nhận cơ thể thư giãn an toàn 🛡️',
    };

    const state: BreathState = {
      phase: this.currentPhase,
      phaseLabel: labels[this.currentPhase],
      secondsRemaining: this.secondsInPhase,
      cycleCount: this.cycleCount,
      guideText: guides[this.currentPhase],
    };

    this.listeners.forEach((l) => l(state));
  }

  public subscribe(listener: (state: BreathState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const panicCalmer = new PanicCalmerEngine();
