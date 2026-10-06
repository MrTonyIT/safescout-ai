import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitTestAnswers } from './api';
import { AnswerItemPayload } from '../types/curriculum';

export interface PendingAttempt {
  contentVersion?: string;
  lastError?: string;
  blocked?: boolean;
  lastStatus?: number;
  title?: string;
  savedAt?: string;
  attemptId: string;
  checkpointId: string;
  userId: string;
  answers: AnswerItemPayload[];
  totalTimeTakenSeconds: number;
}
const key = (userId: string) => `milo_pending_v2:${userId}`;
let operation: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const locked = () => {
    const locks = typeof navigator !== 'undefined' ? (navigator as any).locks : undefined;
    return locks ? locks.request('milo-pending-writes', fn) : fn();
  };
  const next = operation.then(locked, locked); operation = next.catch(() => undefined); return next;
}
export function newAttemptId(): string {
  // Identifier for deduplication, never an authentication credential.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16); return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
}
export async function readPending(userId: string): Promise<PendingAttempt[]> {
  const raw = await AsyncStorage.getItem(key(userId));
  if (!raw) return [];
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) throw new Error('Không đọc được hàng đợi bài làm.');
  if (items.length > 500 || raw.length > 5000000 || items.some(a =>
    !a || a.userId !== userId || typeof a.attemptId !== 'string' ||
    typeof a.checkpointId !== 'string' || !Array.isArray(a.answers) || a.answers.length > 100 ||
    !Number.isInteger(a.totalTimeTakenSeconds) || a.totalTimeTakenSeconds < 1 ||
    a.answers.some((v: any) => !v || typeof v.questionId !== 'string' || !Number.isFinite(v.responseTimeMs))
  )) throw new Error('Dữ liệu bài chờ không hợp lệ. Bản gốc vẫn được giữ trên thiết bị.');
  return items;
}
export function savePending(attempt: PendingAttempt): Promise<void> {
  return serial(async () => {
    const items = await readPending(attempt.userId);
    const existing = items.find(a => a.attemptId === attempt.attemptId);
    const payload = ({lastError, blocked, lastStatus, title, savedAt, ...data}: PendingAttempt) => JSON.stringify(data);
    if (existing && payload(existing) !== payload(attempt)) throw new Error('Lần làm bài đã thay đổi.');
    if (!existing) {
      if (items.length >= 500) throw new Error('Hàng đợi đã đầy. Cần đồng bộ trước khi lưu thêm.');
      await AsyncStorage.setItem(key(attempt.userId), JSON.stringify([...items, {...attempt, savedAt: attempt.savedAt || new Date().toISOString()}]));
    }
  });
}
export function acknowledgePending(userId: string, attemptId: string): Promise<void> {
  return serial(async () => {
    const items = await readPending(userId);
    await AsyncStorage.setItem(key(userId), JSON.stringify(items.filter(a => a.attemptId !== attemptId)));
  });
}
export function syncPending(userId: string, retryAttemptId?: string): Promise<{ remaining: number; blocked: number }> {
  return serial(async () => {
    let items = await readPending(userId);
    for (const item of [...items]) {
      if (item.userId !== userId) throw new Error('Hàng đợi không thuộc hồ sơ này.');
      if (retryAttemptId && item.attemptId !== retryAttemptId) continue;
      // A prerequisite or session may recover. Old queues used blocked for 403, too.
      if (item.blocked && item.attemptId !== retryAttemptId && item.lastStatus !== 403 && !item.lastError?.includes('403')) continue;
      try {
        if (!item.contentVersion) { const error: any = new Error('Bài cũ thiếu phiên bản đề; cần xem lại.'); error.response = {status:409}; throw error; }
        const receipt = await submitTestAnswers(item.checkpointId, userId, item.answers, item.totalTimeTakenSeconds, item.attemptId, item.contentVersion);
        if (receipt.testResultId !== item.attemptId) throw new Error('Biên nhận không khớp bài làm.');
      } catch (error: any) {
        const status = error?.response?.status;
        item.lastStatus = status;
        item.blocked = [400,404,409,422].includes(status);
        item.lastError = item.blocked ? 'Cần xem lại bài: máy chủ chưa nhận (mã ' + status + '). Bài làm vẫn được giữ.' : 'Chưa gửi được. Bài làm vẫn được giữ để thử lại.';
        await AsyncStorage.setItem(key(userId), JSON.stringify(items));
        if (!item.blocked && status !== 403) break;
        continue;
      }
      items = items.filter(a => a.attemptId !== item.attemptId);
      await AsyncStorage.setItem(key(userId), JSON.stringify(items));
    }
    return { remaining: items.length, blocked: items.filter(i=>i.blocked).length };
  });
}
