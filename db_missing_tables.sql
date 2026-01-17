-- Create PatientMedicalHistory
CREATE TABLE IF NOT EXISTS "PatientMedicalHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completionStatus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientMedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PatientMedicalHistory_userId_key" ON "PatientMedicalHistory"("userId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PatientMedicalHistory_userId_fkey') THEN
        ALTER TABLE "PatientMedicalHistory" ADD CONSTRAINT "PatientMedicalHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create BirthHistory
CREATE TABLE IF NOT EXISTS "BirthHistory" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "birthTerm" TEXT,
    "prematureWeeks" INTEGER,
    "deliveryType" TEXT,
    "cSectionType" TEXT,
    "birthWeight" TEXT,
    "complications" TEXT[],
    "nicudays" INTEGER,
    "birthInjury" TEXT,
    "congenitalDefect" TEXT,
    "motherHealthIssues" TEXT[],
    "medications" TEXT,

    CONSTRAINT "BirthHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BirthHistory_historyId_key" ON "BirthHistory"("historyId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BirthHistory_historyId_fkey') THEN
        ALTER TABLE "BirthHistory" ADD CONSTRAINT "BirthHistory_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create ChildhoodHistory
CREATE TABLE IF NOT EXISTS "ChildhoodHistory" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "developmentalDelays" TEXT,
    "walkingAge" TEXT,
    "speakingAge" TEXT,
    "childhoodIllnesses" TEXT[],
    "vaccinationStatus" TEXT,
    "missingVaccines" TEXT[],
    "hasVaccineCard" BOOLEAN NOT NULL DEFAULT false,
    "vaccineReactions" TEXT,

    CONSTRAINT "ChildhoodHistory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ChildhoodHistory_historyId_key" ON "ChildhoodHistory"("historyId");
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChildhoodHistory_historyId_fkey') THEN
        ALTER TABLE "ChildhoodHistory" ADD CONSTRAINT "ChildhoodHistory_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create ChildhoodHospitalization
CREATE TABLE IF NOT EXISTS "ChildhoodHospitalization" (
    "id" TEXT NOT NULL,
    "childhoodId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "surgery" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChildhoodHospitalization_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChildhoodHospitalization_childhoodId_fkey') THEN
        ALTER TABLE "ChildhoodHospitalization" ADD CONSTRAINT "ChildhoodHospitalization_childhoodId_fkey" FOREIGN KEY ("childhoodId") REFERENCES "ChildhoodHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create FemaleReproductiveHistory
CREATE TABLE IF NOT EXISTS "FemaleReproductiveHistory" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "menarcheAge" INTEGER,
    "cycleRegularity" TEXT,
    "flowCharacteristics" TEXT,
    "pcosDiagnosed" BOOLEAN NOT NULL DEFAULT false,
    "endometriosis" BOOLEAN NOT NULL DEFAULT false,
    "contraception" TEXT,
    "breastConcern" TEXT,

    CONSTRAINT "FemaleReproductiveHistory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FemaleReproductiveHistory_historyId_key" ON "FemaleReproductiveHistory"("historyId");
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FemaleReproductiveHistory_historyId_fkey') THEN
        ALTER TABLE "FemaleReproductiveHistory" ADD CONSTRAINT "FemaleReproductiveHistory_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create Pregnancy
CREATE TABLE IF NOT EXISTS "Pregnancy" (
    "id" TEXT NOT NULL,
    "femaleHistoryId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "complications" TEXT[],

    CONSTRAINT "Pregnancy_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Pregnancy_femaleHistoryId_fkey') THEN
        ALTER TABLE "Pregnancy" ADD CONSTRAINT "Pregnancy_femaleHistoryId_fkey" FOREIGN KEY ("femaleHistoryId") REFERENCES "FemaleReproductiveHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create MaleReproductiveHistory
CREATE TABLE IF NOT EXISTS "MaleReproductiveHistory" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "pubertyAge" TEXT,
    "genitalIssues" TEXT[],
    "circumcision" BOOLEAN,
    "currentConcerns" TEXT[],
    "sexualHealth" TEXT[],

    CONSTRAINT "MaleReproductiveHistory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MaleReproductiveHistory_historyId_key" ON "MaleReproductiveHistory"("historyId");
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MaleReproductiveHistory_historyId_fkey') THEN
        ALTER TABLE "MaleReproductiveHistory" ADD CONSTRAINT "MaleReproductiveHistory_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create FamilyMedicalHistory
CREATE TABLE IF NOT EXISTS "FamilyMedicalHistory" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "conditions" TEXT[],
    "ageDiagnosed" TEXT,
    "status" TEXT,

    CONSTRAINT "FamilyMedicalHistory_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FamilyMedicalHistory_historyId_fkey') THEN
        ALTER TABLE "FamilyMedicalHistory" ADD CONSTRAINT "FamilyMedicalHistory_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create Surgery
CREATE TABLE IF NOT EXISTS "Surgery" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "hospital" TEXT,
    "complications" TEXT,

    CONSTRAINT "Surgery_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Surgery_historyId_fkey') THEN
        ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create Allergy
CREATE TABLE IF NOT EXISTS "Allergy" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Allergy_historyId_fkey') THEN
        ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create AccidentHistory
CREATE TABLE IF NOT EXISTS "AccidentHistory" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "treatment" TEXT,
    "hospitalDays" INTEGER,
    "lastingEffects" TEXT[],

    CONSTRAINT "AccidentHistory_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccidentHistory_historyId_fkey') THEN
        ALTER TABLE "AccidentHistory" ADD CONSTRAINT "AccidentHistory_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "PatientMedicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Create AccidentInjury
CREATE TABLE IF NOT EXISTS "AccidentInjury" (
    "id" TEXT NOT NULL,
    "accidentId" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "injuryType" TEXT NOT NULL,

    CONSTRAINT "AccidentInjury_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccidentInjury_accidentId_fkey') THEN
        ALTER TABLE "AccidentInjury" ADD CONSTRAINT "AccidentInjury_accidentId_fkey" FOREIGN KEY ("accidentId") REFERENCES "AccidentHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
