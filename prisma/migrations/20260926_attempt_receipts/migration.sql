-- Additive only. Back up and restore-test the target database before applying.
ALTER TABLE "test_results" ADD COLUMN "requestHash" TEXT;
ALTER TABLE "test_results" ADD COLUMN "responseJson" TEXT;
