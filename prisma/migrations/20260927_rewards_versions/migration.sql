ALTER TABLE "test_results" ADD COLUMN "contentVersion" TEXT;
ALTER TABLE "test_results" ADD COLUMN "contentSnapshot" TEXT;
CREATE TABLE "lesson_rewards" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "xp" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lesson_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lesson_rewards_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "lesson_rewards_userId_lessonId_key" ON "lesson_rewards"("userId", "lessonId");
-- Preserve the prior reward boundary without changing any existing user's XP.
INSERT INTO "lesson_rewards" ("id","userId","lessonId","xp")
SELECT 'legacy_' || p."id", p."userId", p."lessonId", l."rewardXp"
FROM "user_lesson_progress" p JOIN "lessons" l ON p."lessonId"=l."id"
WHERE p."isCompleted"=1;
