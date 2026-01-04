-- Create Admin User for Aarogya AI
-- Run this in Supabase SQL Editor

-- =============================================
-- STEP 1: Create Notification table (if not exists)
-- =============================================
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

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");

-- =============================================
-- STEP 2: Create Admin User
-- =============================================
-- IMPORTANT: Change the email and password to your preferred values!

INSERT INTO "User" (
    "id",
    "name", 
    "email", 
    "password",
    "role",
    "status",
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'Admin User',
    'admin@aarogya.ai',  -- <<< CHANGE THIS to your email
    '$2a$10$8K1p8rqJg1GNK3Sd3K1QMu5M6K8I8M2HX3H7n8o5V4O1d3L4H7X7U',  -- Password: Admin@123
    'admin',
    'approved',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT ("email") DO UPDATE SET
    "role" = 'admin',
    "status" = 'approved';

-- =============================================
-- STEP 3: Verify Admin was created
-- =============================================
SELECT id, name, email, role, status FROM "User" WHERE role = 'admin';

-- =============================================
-- ADMIN LOGIN CREDENTIALS:
-- Email: admin@aarogya.ai
-- Password: Admin@123
-- =============================================
