import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnswerItemPayload, CheckpointDetailData } from '../types/curriculum';
import { PendingAttempt } from './attemptQueue';
export interface LessonDraft {
    userId: string;
    checkpointId: string;
    contentVersion: string;
    attemptId: string;
    answers: AnswerItemPayload[];
    index: number;
    selected: string[];
    confirmed: boolean;
    started: number;
    savedAt: number;
    frozen: PendingAttempt | null;
}
const draftKey = (userId: string, id: string) => `milo_draft_v1:${userId}:${id}`;
let writes: Promise<unknown> = Promise.resolve();
export async function acquireDraftLease(userId:string,id:string):Promise<(()=>void)|null> {
    const locks=typeof navigator!=='undefined'?(navigator as any).locks:undefined;
    if(!locks)return ()=>{};
    return new Promise((resolve,reject)=>{
        locks.request('milo-draft-edit:'+userId+':'+id,{ifAvailable:true},async(lock:any)=>{
            if(!lock){resolve(null);return;}
            await new Promise<void>(release=>resolve(release));
        }).catch(reject);
    });
}
export function saveDraft(draft: LessonDraft): Promise<void> {
    const next = writes.then(() => AsyncStorage.setItem(draftKey(draft.userId, draft.checkpointId), JSON.stringify(draft)));
    writes = next.catch(() => undefined);
    return next;
}
export async function readDraft(userId: string, id: string): Promise<LessonDraft | null> {
    await writes;
    const raw = await AsyncStorage.getItem(draftKey(userId, id));
    if (!raw)
        return null;
    const d = JSON.parse(raw);
    if (raw.length>2000000 || !d || d.userId !== userId || d.checkpointId !== id || !Array.isArray(d.answers) || d.answers.length>100 || d.answers.some((a:any)=>!a||typeof a.questionId!=='string'||!Number.isFinite(a.responseTimeMs)) || !Array.isArray(d.selected) || d.selected.length>100 || d.selected.some((v:any)=>typeof v!=='string') || typeof d.confirmed!=='boolean' || !Number.isInteger(d.index) || d.index < 0 || typeof d.contentVersion !== 'string' || typeof d.attemptId !== 'string' || !Number.isFinite(d.started))
        throw Error('Bản nháp bị hỏng; bản gốc chưa bị xóa.');
    return d;
}
export function clearDraft(userId: string, id: string): Promise<void> {
    const next = writes.then(() => AsyncStorage.removeItem(draftKey(userId, id)));
    writes = next.catch(() => undefined);
    return next;
}
// Lessons must be revalidated online on opening. We deliberately do not cache
// child-safety instructions past withdrawal until an offline revocation policy exists.
export function matchesDraft(draft: LessonDraft, detail: CheckpointDetailData) {
    return draft.contentVersion === detail.contentVersion && draft.index < detail.questions.length &&
        draft.answers.every(a => detail.questions.some(q => q.id === a.questionId));
}
