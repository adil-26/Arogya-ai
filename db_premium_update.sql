-- Add isPremium column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN DEFAULT false;
