-- Contact details and interests on group poll answers. Additive and safe to run more than once.
ALTER TABLE "GroupPollResponse" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "GroupPollResponse" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "GroupPollResponse" ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "GroupPollResponse" ADD COLUMN IF NOT EXISTS "experience" TEXT;
ALTER TABLE "GroupPollResponse" ADD COLUMN IF NOT EXISTS "note" TEXT;
