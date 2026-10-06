export interface BlackoutState {
  isActive: boolean;
  batteryHoursRemaining: number;
  lastGpsPulseTime: string;
  totalPulsesSent: number;
  latitude: number;
  longitude: number;
}

class UltraSurvivalBlackoutEngine {
  private isActive: boolean = false;
  private pulseIntervalRef: any = null;
  private totalPulses: number = 0;
  private listeners: Array<(state: BlackoutState) => void> = [];

  public activateBlackout(lat: number = 10.7769, lng: number = 106.7009): BlackoutState {
    this.isActive = true;
    this.totalPulses = 1;

    const state = this.buildState(lat, lng);
    this.notify(state);

    if (this.pulseIntervalRef) {
      clearInterval(this.pulseIntervalRef);
    }

    // Gửi xung GPS định kỳ (3s mỗi 5 phút mô phỏng)
    this.pulseIntervalRef = setInterval(() => {
      this.totalPulses += 1;
      this.notify(this.buildState(lat, lng));
    }, 15000); // 15s mô phỏng cho trải nghiệm test

    return state;
  }

  public deactivateBlackout(): BlackoutState {
    this.isActive = false;
    if (this.pulseIntervalRef) {
      clearInterval(this.pulseIntervalRef);
      this.pulseIntervalRef = null;
    }
    const state = this.buildState(10.7769, 106.7009);
    this.notify(state);
    return state;
  }

  public getState(): BlackoutState {
    return this.buildState(10.7769, 106.7009);
  }

  private buildState(lat: number, lng: number): BlackoutState {
    return {
      isActive: this.isActive,
      batteryHoursRemaining: 48,
      lastGpsPulseTime: new Date().toLocaleTimeString(),
      totalPulsesSent: this.totalPulses,
      latitude: lat,
      longitude: lng,
    };
  }

  public subscribe(listener: (state: BlackoutState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(state: BlackoutState) {
    this.listeners.forEach((l) => l(state));
  }
}

export const survivalBlackout = new UltraSurvivalBlackoutEngine();
