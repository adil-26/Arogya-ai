-- Add emailVerified column to User table
-- Run this in Supabase SQL Editor

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);

SELECT 'SUCCESS: emailVerified column added to User table!' as result;
