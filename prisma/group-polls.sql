-- Group "find a time" polls (/meet/<slug>). Same as `prisma db push` would create for
-- GroupPoll, GroupPollOption and GroupPollResponse. Safe to run once; additive only.
CREATE TABLE IF NOT EXISTS "GroupPoll" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "note" TEXT,
  "durationMinutes" INTEGER NOT NULL DEFAULT 60,
  "timezone" TEXT NOT NULL,
  "meetingUrl" TEXT,
  "chosenOptionId" TEXT,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GroupPoll_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GroupPoll_slug_key" ON "GroupPoll"("slug");

CREATE TABLE IF NOT EXISTS "GroupPollOption" (
  "id" TEXT NOT NULL,
  "pollId" TEXT NOT NULL,
  "startsAt" TIMESTAMPTZ(3) NOT NULL,
  "endsAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "GroupPollOption_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GroupPollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "GroupPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "GroupPollOption_pollId_startsAt_key" ON "GroupPollOption"("pollId", "startsAt");

CREATE TABLE IF NOT EXISTS "GroupPollResponse" (
  "id" TEXT NOT NULL,
  "pollId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "timezone" TEXT,
  "yes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "maybe" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "editToken" TEXT NOT NULL,
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GroupPollResponse_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GroupPollResponse_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "GroupPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "GroupPollResponse_editToken_key" ON "GroupPollResponse"("editToken");
CREATE INDEX IF NOT EXISTS "GroupPollResponse_pollId_idx" ON "GroupPollResponse"("pollId");
