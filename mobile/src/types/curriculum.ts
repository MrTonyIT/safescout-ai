export type MiloEmotion = 'IDLE' | 'THINKING' | 'CHEERING' | 'DANGER_ALERT';
export type HazardLevel = 'SAFE' | 'CAUTION' | 'CRITICAL_EMERGENCY' | 'UNKNOWN';
export type QuestionType = 'SINGLE_CHOICE' | 'TIMED_REFLEX' | 'DRAG_DROP_ORDER';
export type ProgressStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';

export interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  ageGroup: string;
  explorerLevel: number;
  totalSafetyScore: number;
  totalBadges: number;
  completionRate: number;
}

export interface ZoneBadge {
  name: string;
  code: string;
  iconUrl: string;
  requiredShards: number;
  collectedShards: number;
  isUnlocked: boolean;
}

export interface LessonSummary {
  isAvailable?: boolean;
  id: string;
  lessonNumber: number;
  title: string;
  description: string;
  lessonType: string;
  durationMinutes: number;
  rewardXp: number;
  badgeShardName: string | null;
  status: ProgressStatus;
  score: number;
  stars: number;
  checkpointsCount: number;
  checkpointIds?: string[];
  completedCheckpointIds?: string[];
}

export interface StageSummary {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  lessons: LessonSummary[];
}

export interface ZoneSummary {
  id: string;
  zoneNumber: number;
  title: string;
  description: string;
  iconName: string;
  themeColor: string;
  isUnlocked: boolean;
  badge: ZoneBadge | null;
  stages: StageSummary[];
}

export interface JourneyMapData {
  user: UserProfile;
  zones: ZoneSummary[];
}

export interface QuestionOptionItem {
  id: string;
  testQuestionId: string;
  optionText: string;
  displayOrder: number;
}

export interface TestQuestionItem {
  id: string;
  questionNumber: number;
  promptText: string;
  questionType: QuestionType;
  hazardLevel: HazardLevel;
  timeLimitSeconds: number;
  explanation?: string;
  options: QuestionOptionItem[];
}

export interface CheckpointDetailData {
  learningContent?: {
    presentation?: {scene:'home-hot-cup';revision:number};
    objective: string;
    story: string;
    keyPoints: string[];
    activity: string;
    teachBack: string;
    sources: {title: string; publisher: string; url: string}[];
  } | null;
  contentVersion: string;
  id: string;
  checkpointNumber: number;
  title: string;
  description: string;
  passScoreThreshold: number;
  timeLimitSeconds: number;
  badgeShardReward: string | null;
  zoneTitle: string;
  lessonTitle: string;
  totalQuestions: number;
  questions: TestQuestionItem[];
}

export interface AnswerItemPayload {
  questionId: string;
  selectedOptionId?: string;
  orderedOptionIds?: string[];
  responseTimeMs: number;
}

export interface MiloFeedback {
  speech: string;
  emotion: MiloEmotion;
  hazardLevel: HazardLevel;
  actionRequired: string | null;
  audioCue: string;
  badgeShard: string | null;
}

export interface TestSubmissionResult {
  contentRetired?: boolean;
  review?: Array<{questionId:string;prompt:string;selectedTexts:string[];correctTexts:string[];isCorrect:boolean;explanation:string}>;
  testResultId: string;
  score: number;
  isPassed: boolean;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  starsEarned: number;
  miloResponse: MiloFeedback;
  mistakes: Array<{
    questionId: string;
    guidance: string;
  }>;
}
