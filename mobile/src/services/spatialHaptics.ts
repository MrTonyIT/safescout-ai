import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class SpatialHapticsEngine {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Rung nhịp tim dồn dập (Heartbeat countdown haptic)
   */
  public async playHeartbeat() {
    if (!this.isEnabled || Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {}
      }, 140);
    } catch (e) {}
  }

  /**
   * Rung giật điện / Cảnh báo nguy hiểm cấp 3 (Electric shock / Triple hazard shock)
   */
  public async playElectricShock() {
    if (!this.isEnabled || Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {}
      }, 100);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {}
      }, 200);
    } catch (e) {}
  }

  /**
   * Rung êm dịu khi sơ cứu / xả nước mát (Healing soothe haptic)
   */
  public async playHealingSoothe() {
    if (!this.isEnabled || Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  }

  /**
   * Rung khải hoàn chiến thắng (Victory fanfare pattern)
   */
  public async playVictoryFanfare() {
    if (!this.isEnabled || Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {}
      }, 150);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {}
      }, 300);
    } catch (e) {}
  }
}

export const spatialHaptics = new SpatialHapticsEngine();
