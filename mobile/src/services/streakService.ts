export interface DailyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  isTodayCompleted: boolean;
  freezeShieldsCount: number;
  streakMultiplier: number;
}

class DailySurvivalStreakService {
  private streakData: DailyStreakData = {
    currentStreak: 0, // 7 ngày liên tục
    longestStreak: 0,
    lastActiveDate: '',
    isTodayCompleted: false,
    freezeShieldsCount: 0,
    streakMultiplier: 1,
  };

  public getStreakData(): DailyStreakData {
    return this.streakData;
  }

  public completeDailyDrill(): DailyStreakData {
    const today = new Date().toLocaleDateString('en-CA');
    if (this.streakData.lastActiveDate === today) return this.streakData;
    this.streakData.lastActiveDate = today;
    this.streakData.isTodayCompleted = true;
    this.streakData.currentStreak += 1;
    this.streakData.streakMultiplier = 1.5;
    return this.streakData;
  }
}

export const streakService = new DailySurvivalStreakService();
