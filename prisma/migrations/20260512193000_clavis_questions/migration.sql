-- Add Clavis metadata while keeping existing questions in the general bank.
ALTER TABLE "Question" ADD COLUMN "origin" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "Question" ADD COLUMN "lessonNumber" INTEGER;

CREATE INDEX "Question_origin_lessonNumber_idx" ON "Question"("origin", "lessonNumber");
