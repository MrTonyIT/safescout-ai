-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "age" INTEGER NOT NULL DEFAULT 7,
    "ageGroup" TEXT NOT NULL DEFAULT 'EARLY_EXPLORER',
    "explorerLevel" INTEGER NOT NULL DEFAULT 1,
    "totalSafetyScore" INTEGER NOT NULL DEFAULT 0,
    "totalBadges" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "parent_gates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "parentEmail" TEXT,
    "parentPhone" TEXT,
    "dailyTimeLimitMinutes" INTEGER NOT NULL DEFAULT 30,
    "emergencyContactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReportEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "parent_gates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "themeColor" TEXT NOT NULL DEFAULT '#004E89',
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "stageNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stages_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stageId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lessonType" TEXT NOT NULL DEFAULT 'STORY_INTERACTIVE',
    "contentJson" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 5,
    "rewardXp" INTEGER NOT NULL DEFAULT 100,
    "badgeShardName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lessons_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "checkpointNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "passScoreThreshold" INTEGER NOT NULL DEFAULT 80,
    "timeLimitSeconds" INTEGER NOT NULL DEFAULT 60,
    "badgeShardReward" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "checkpoints_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkpointId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "promptText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'SINGLE_CHOICE',
    "hazardLevel" TEXT NOT NULL DEFAULT 'SAFE',
    "timeLimitSeconds" INTEGER NOT NULL DEFAULT 5,
    "explanation" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "test_questions_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "checkpoints" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testQuestionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "feedbackSpeech" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "question_options_testQuestionId_fkey" FOREIGN KEY ("testQuestionId") REFERENCES "test_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "wrongCount" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL,
    "timeTakenSeconds" INTEGER NOT NULL,
    "feedbackEmotion" TEXT NOT NULL DEFAULT 'CHEERING',
    "feedbackSpeech" TEXT NOT NULL,
    "badgeAwarded" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_results_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "checkpoints" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mistake_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testResultId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "userInputOrder" TEXT,
    "responseTimeMs" INTEGER NOT NULL,
    "miloGuidance" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mistake_logs_testResultId_fkey" FOREIGN KEY ("testResultId") REFERENCES "test_results" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mistake_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mistake_logs_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "test_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "requiredShardsCount" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "badges_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "collectedShards" INTEGER NOT NULL DEFAULT 0,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "parent_gates_userId_key" ON "parent_gates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "zones_zoneNumber_key" ON "zones"("zoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "stages_zoneId_stageNumber_key" ON "stages"("zoneId", "stageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_stageId_lessonNumber_key" ON "lessons"("stageId", "lessonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_lessonId_checkpointNumber_key" ON "checkpoints"("lessonId", "checkpointNumber");

-- CreateIndex
CREATE UNIQUE INDEX "test_questions_checkpointId_questionNumber_key" ON "test_questions"("checkpointId", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_userId_lessonId_key" ON "user_lesson_progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

