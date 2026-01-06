-- Add Prescription and Medication tables for prescription uploads and medication reminders

-- 1. Create Prescription table
CREATE TABLE IF NOT EXISTS "Prescription" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "fileData" TEXT,
    "fileType" TEXT,
    "fileName" TEXT,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 2. Create Medication table
CREATE TABLE IF NOT EXISTS "Medication" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "timing" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructions" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Medication_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "Prescription_userId_idx" ON "Prescription"("userId");
CREATE INDEX IF NOT EXISTS "Medication_userId_idx" ON "Medication"("userId");
CREATE INDEX IF NOT EXISTS "Medication_prescriptionId_idx" ON "Medication"("prescriptionId");
CREATE INDEX IF NOT EXISTS "Medication_isActive_idx" ON "Medication"("isActive");

-- NOTE: Run this SQL in your Supabase SQL Editor to add these tables
