-- Add Notification table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);

-- Create a welcome notification for all existing users (optional)
-- INSERT INTO "Notification" ("id", "userId", "type", "title", "message", "link")
-- SELECT gen_random_uuid()::text, id, 'system', 'Welcome to Aarogya AI!', 'Your health dashboard is ready. Start by logging your vitals.', '/dashboard/health'
-- FROM "User" WHERE role = 'patient';

SELECT 'SUCCESS: Notification table created!' as result;
