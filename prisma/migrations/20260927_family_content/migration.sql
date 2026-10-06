CREATE TABLE "families" ("id" TEXT NOT NULL PRIMARY KEY, "login" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "recoveryHash" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "families_login_key" ON "families"("login");
ALTER TABLE "users" ADD COLUMN "familyId" TEXT REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "family_sessions" ("tokenHash" TEXT NOT NULL PRIMARY KEY, "familyId" TEXT NOT NULL, "expiresAt" DATETIME NOT NULL, FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX "family_sessions_familyId_idx" ON "family_sessions"("familyId");
CREATE TABLE "auth_throttles" ("key" TEXT NOT NULL PRIMARY KEY, "count" INTEGER NOT NULL DEFAULT 1, "expiresAt" DATETIME NOT NULL);
CREATE TABLE "content_approvals" ("id" TEXT NOT NULL PRIMARY KEY, "checkpointId" TEXT NOT NULL, "contentVersion" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'DRAFT', "reviewer" TEXT, "source" TEXT, "reviewedAt" DATETIME, "ageMin" INTEGER NOT NULL DEFAULT 7, "ageMax" INTEGER NOT NULL DEFAULT 10, "snapshot" TEXT NOT NULL);
CREATE UNIQUE INDEX "content_approvals_checkpointId_contentVersion_key" ON "content_approvals"("checkpointId", "contentVersion");
CREATE INDEX "test_results_userId_checkpointId_isPassed_idx" ON "test_results"("userId", "checkpointId", "isPassed");
