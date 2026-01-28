-- 1. Enable UUID Extension (Required for IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Table (Core Profile + Secure Sharing)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP,
    "role" TEXT DEFAULT 'patient',
    "status" TEXT DEFAULT 'approved',
    "isPremium" BOOLEAN DEFAULT false,
    -- Patient Details
    "dob" TEXT,
    "gender" TEXT,
    "bloodGroup" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "age" INTEGER,
    -- Doctor Consumables
    "specialty" TEXT,
    "licenseNo" TEXT,
    -- Referral
    "referralCode" TEXT UNIQUE,
    "referredBy" TEXT,
    -- Secure Sharing (NEW)
    "sharePin" TEXT,
    "sharePinExpiry" TIMESTAMP,
    -- Metadata
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 3. Patient Medical History (Main Linker)
CREATE TABLE IF NOT EXISTS "PatientMedicalHistory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "completionStatus" DOUBLE PRECISION DEFAULT 0,
    "lastUpdated" TIMESTAMP DEFAULT NOW()
);

-- 4. Surgery History (Enhanced)
CREATE TABLE IF NOT EXISTS "Surgery" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "historyId" TEXT NOT NULL REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "bodyPart" TEXT,
    "year" INTEGER,
    "surgeryDate" TIMESTAMP, -- NEW
    "hospital" TEXT,         -- NEW
    "surgeon" TEXT,          -- NEW
    "complications" TEXT,
    "notes" TEXT,            -- NEW
    "imageUrl" TEXT          -- NEW
);

-- 5. Allergy History (Enhanced)
CREATE TABLE IF NOT EXISTS "Allergy" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "historyId" TEXT NOT NULL REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT,
    "status" TEXT,     -- NEW
    "onset" TEXT,      -- NEW
    "duration" TEXT,   -- NEW
    "medication" TEXT, -- NEW
    "notes" TEXT,      -- NEW
    "imageUrl" TEXT    -- NEW
);

-- 6. Accident History (Enhanced - Note Table Name)
CREATE TABLE IF NOT EXISTS "AccidentHistory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "historyId" TEXT NOT NULL REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "year" INTEGER,
    "accidentDate" TIMESTAMP, -- NEW
    "age" INTEGER,
    "treatment" TEXT,         -- NEW
    "hospital" TEXT,          -- NEW
    "hospitalDays" INTEGER,
    "residualEffects" TEXT,   -- NEW
    "notes" TEXT,             -- NEW
    "lastingEffects" TEXT[]
);

-- 7. Accident Injuries (Sub-table)
CREATE TABLE IF NOT EXISTS "AccidentInjury" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "accidentId" TEXT NOT NULL REFERENCES "AccidentHistory"("id") ON DELETE CASCADE,
    "bodyPart" TEXT NOT NULL,
    "injuryType" TEXT NOT NULL
);

-- 8. Other History Tables (Standard)
CREATE TABLE IF NOT EXISTS "BirthHistory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "historyId" TEXT UNIQUE NOT NULL REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE,
    "birthTerm" TEXT,
    "birthWeight" TEXT,
    "deliveryType" TEXT,
    "complications" TEXT[]
);

CREATE TABLE IF NOT EXISTS "ChildhoodHistory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "historyId" TEXT UNIQUE NOT NULL REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE,
    "vaccinationStatus" TEXT,
    "childhoodIllnesses" TEXT[]
);

CREATE TABLE IF NOT EXISTS "FamilyMedicalHistory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "historyId" TEXT NOT NULL REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE,
    "relation" TEXT NOT NULL,
    "conditions" TEXT[],
    "ageDiagnosed" TEXT
);
