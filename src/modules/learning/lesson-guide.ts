// Explicit public projection: never return arbitrary content JSON or review evidence.
export function parseLessonGuide(raw: string) {
  try {
    const c = JSON.parse(raw);
    const text = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0 && s.length <= 3000;
    if (c.schemaVersion !== 1 || !['objective','story','activity','teachBack'].every(k => text(c[k])) ||
        !Array.isArray(c.keyPoints) || !c.keyPoints.length || c.keyPoints.length > 8 || !c.keyPoints.every(text) ||
        !Array.isArray(c.sources) || !c.sources.length || c.sources.length > 10 || !c.sources.every((s: any) => {
          if (!s || !text(s.title) || !text(s.publisher) || !text(s.url)) return false;
          const u = new URL(s.url); return u.protocol === 'https:' && !u.username && !u.password;
        })) return null;
    return {objective:c.objective,story:c.story,keyPoints:c.keyPoints as string[],activity:c.activity,teachBack:c.teachBack,
      presentation:c.presentation?.scene==='home-hot-cup'&&c.presentation?.revision===1?{scene:'home-hot-cup' as const,revision:1}:undefined,
      sources:c.sources.map((s: any)=>({title:s.title,publisher:s.publisher,url:s.url}))};
  } catch { return null; }
}
