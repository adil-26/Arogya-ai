-- FIX: Drop and recreate Account table for NextAuth Google OAuth
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing Account table (if exists) and recreate properly
DROP TABLE IF EXISTS "Account" CASCADE;

-- Step 2: Create Account table with correct structure for NextAuth
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    PRIMARY KEY ("id"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 3: Create unique index (CRITICAL for OAuth lookup)
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- Step 4: Drop and recreate Session table
DROP TABLE IF EXISTS "Session" CASCADE;

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- Step 5: Drop and recreate VerificationToken table
DROP TABLE IF EXISTS "VerificationToken" CASCADE;

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Step 6: Ensure User table has required columns
DO $$ 
BEGIN
    -- Add emailVerified if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'emailVerified') THEN
        ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3);
    END IF;
    
    -- Ensure role has default value
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'role') THEN
        UPDATE "User" SET "role" = 'patient' WHERE "role" IS NULL;
    END IF;
END $$;

-- Done! Now Google OAuth should work
SELECT 'SUCCESS: OAuth tables recreated! Please test Google login now.' as result;
