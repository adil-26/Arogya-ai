-- Update DailyLog table with new columns
-- Run this in Supabase SQL Editor

-- Add new columns to DailyLog
ALTER TABLE "DailyLog" 
ADD COLUMN IF NOT EXISTS "steps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "exerciseStreak" INTEGER NOT NULL DEFAULT 0;

-- Create unique constraint for userId + date (one log per day per user)
-- First, we need to truncate date to just the date part
-- Note: This might fail if you have duplicate records, clean them first

-- Check for duplicate entries
SELECT "userId", DATE("date"), COUNT(*) 
FROM "DailyLog" 
GROUP BY "userId", DATE("date") 
HAVING COUNT(*) > 1;

-- If duplicates exist, delete older ones (keep latest)
-- DELETE FROM "DailyLog" a USING "DailyLog" b 
-- WHERE a.id < b.id AND a."userId" = b."userId" AND DATE(a.date) = DATE(b.date);

-- Add unique constraint (if no duplicates exist)
-- Note: SQLite/Postgres handle this differently, Supabase uses Postgres
-- ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_date_unique" UNIQUE ("userId", "date");

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "DailyLog_userId_date_idx" ON "DailyLog"("userId", "date" DESC);

SELECT 'SUCCESS: DailyLog table updated with steps and exerciseStreak!' as result;
