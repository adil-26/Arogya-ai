-- Health Reports Tables
-- Run this in your Supabase SQL Editor

-- 1. Main Report Table
CREATE TABLE IF NOT EXISTS "HealthReport" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "reportDate" TIMESTAMP NOT NULL,
    "status" TEXT DEFAULT 'processing',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 2. Numeric Test Results (Blood, Urine)
CREATE TABLE IF NOT EXISTS "TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "reportId" TEXT NOT NULL REFERENCES "HealthReport"("id") ON DELETE CASCADE,
    "category" TEXT,
    "parameter" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "refMin" DOUBLE PRECISION,
    "refMax" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "isNewTest" BOOLEAN DEFAULT false
);

-- 3. Imaging Findings (MRI, X-Ray)
CREATE TABLE IF NOT EXISTS "ImagingFinding" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "reportId" TEXT NOT NULL REFERENCES "HealthReport"("id") ON DELETE CASCADE,
    "impression" TEXT,
    "conclusion" TEXT,
    "bodyPart" TEXT NOT NULL,
    "locationId" TEXT
);

-- 4. Enable RLS for New Tables via security_fixes.sql logic (optional but good practice)
ALTER TABLE "HealthReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImagingFinding" ENABLE ROW LEVEL SECURITY;
