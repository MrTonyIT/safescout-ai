export type MiloEmotion = 'IDLE' | 'THINKING' | 'CHEERING' | 'DANGER_ALERT';

export type HazardLevel = 'SAFE' | 'CAUTION' | 'CRITICAL_EMERGENCY' | 'UNKNOWN';

export interface MiloAiResponse {
  speech: string;
  emotion: MiloEmotion;
  hazardLevel: HazardLevel;
  actionRequired: string | null;
  audioCue: string;
  badgeShard: string | null;
}

export interface EnvironmentScanContext {
  childAge?: number;
  currentZone?: string;
  currentLesson?: string;
  userNickname?: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}
