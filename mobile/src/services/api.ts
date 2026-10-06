import axios from 'axios';
import { Platform } from 'react-native';
import { JourneyMapData, CheckpointDetailData, AnswerItemPayload, TestSubmissionResult, MiloFeedback } from '../types/curriculum';
import { RELEASE } from '../config/release';
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;
export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 8000, withCredentials:true });
export let CURRENT_USER_ID = '';
export let INTERNAL_PREVIEW = false;
export function setActiveChild(id: string) { CURRENT_USER_ID = id; }
export async function fetchMode(): Promise<{internal:boolean;families:boolean}> {
  const mode = unwrap<{internal:boolean;families:boolean}>(await apiClient.get('/family/mode'));
  INTERNAL_PREVIEW = mode.internal;
  if (mode.internal) CURRENT_USER_ID='user_milo_explorer_01';
  return mode;
}
export async function familyRequest<T = any>(action: string, body?: object): Promise<T> {
  return unwrap<T>(body === undefined ? await apiClient.get('/family/'+action) : await apiClient.post('/family/'+action,body));
}
function unwrap<T>(response: { data: { success?: boolean; data?: T } }): T {
  if (!response.data?.success || response.data.data == null) throw new Error('Máy chủ chưa trả dữ liệu hợp lệ.');
  return response.data.data;
}
export async function fetchJourneyMap(userId = CURRENT_USER_ID): Promise<JourneyMapData> {
  return unwrap<JourneyMapData>(await apiClient.get('/learning/journey-map', { params: { userId } }));
}
export async function fetchCheckpointDetails(checkpointId: string, userId = CURRENT_USER_ID): Promise<CheckpointDetailData> {
  return unwrap<CheckpointDetailData>(await apiClient.get(`/learning/checkpoints/${encodeURIComponent(checkpointId)}`, { params: { userId } }));
}
export async function submitTestAnswers(checkpointId: string, userId: string, answers: AnswerItemPayload[], totalTimeTakenSeconds: number, attemptId: string, contentVersion = ''): Promise<TestSubmissionResult> {
  return unwrap<TestSubmissionResult>(await apiClient.post(`/learning/checkpoints/${encodeURIComponent(checkpointId)}/submit`, { userId, answers, totalTimeTakenSeconds, attemptId, contentVersion }));
}
export async function scanEnvironmentImage(_formData: FormData): Promise<MiloFeedback> {
  return { speech: 'Milo chưa thể phân tích ảnh trong bản thử nghiệm này.', emotion: 'THINKING', hazardLevel: 'UNKNOWN', actionRequired: null, audioCue: '', badgeShard: null };
}
export async function chatWithMiloApi(_message: string, _userNickname = '', _childAge = 7): Promise<MiloFeedback> {
  return { speech: 'Trò chuyện AI chưa được mở trong bản thử nghiệm này.', emotion: 'THINKING', hazardLevel: 'UNKNOWN', actionRequired: null, audioCue: '', badgeShard: null };
}
export interface ParentSafetyReportData {
  childProfile: { id: string; nickname: string; age: number; ageGroup: string; explorerLevel: number; totalSafetyScore: number; totalBadges: number };
  parentSettings: { dailyTimeLimitMinutes: number; emergencyContactEnabled: boolean; weeklyReportEnabled: boolean; parentEmail: string | null; parentPhone: string | null };
  recentTestResults: Array<{id: string; checkpointTitle: string; score: number; isPassed: boolean; timeTakenSeconds: number; feedbackSpeech: string; createdAt: string}>;
  recentMistakes: Array<{id: string; questionText: string; hazardLevel: string; responseTimeMs: number; miloGuidance: string; lessonTitle: string; createdAt: string}>;
  unlockedBadges: Array<{name: string; code: string; iconUrl: string; unlockedAt: string}>;
  analytics: { hazardMistakeCounts: Record<string, number>; recommendations: string[] };
}
export const FALLBACK_SAFETY_REPORT: ParentSafetyReportData = {
  childProfile: {id: '', nickname: '', age: 7, ageGroup: '', explorerLevel: 1, totalSafetyScore: 0, totalBadges: 0},
  parentSettings: {dailyTimeLimitMinutes: 30, emergencyContactEnabled: false, weeklyReportEnabled: false, parentEmail: null, parentPhone: null},
  recentTestResults: [], recentMistakes: [], unlockedBadges: [], analytics: {hazardMistakeCounts: {}, recommendations: []},
};
export async function verifyParentPin(pin: string, userId = CURRENT_USER_ID): Promise<boolean> {
  if (!RELEASE.parentAccounts) return false;
  try { return unwrap<{verified: boolean}>(await apiClient.post('/parent/verify-pin', {userId, pin})).verified === true; }
  catch { return false; }
}
export async function updateParentPin(_currentPin: string, _newPin: string, _userId = CURRENT_USER_ID): Promise<{success: boolean; message: string}> {
  return {success: false, message: 'Chưa thể đổi PIN. Tài khoản phụ huynh chưa được mở.'};
}
export async function fetchSafetyReport(_pin: string, _userId = CURRENT_USER_ID): Promise<ParentSafetyReportData> {
  throw new Error('Tài khoản phụ huynh chưa được mở.');
}
export async function updateParentSettings(_pin: string, _settings: {dailyTimeLimitMinutes?: number; emergencyContactEnabled?: boolean; weeklyReportEnabled?: boolean; parentEmail?: string; parentPhone?: string}, _userId = CURRENT_USER_ID) {
  return {success: false, message: 'Chưa lưu cài đặt. Tài khoản phụ huynh chưa được mở.'};
}
