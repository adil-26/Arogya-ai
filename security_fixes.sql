-- =============================================================================
-- SECURITY FIXES: Enable Row Level Security (RLS) on Public Tables
-- =============================================================================
-- This script addresses "RLS Disabled in Public" and "Sensitive Columns Exposed" warnings.
-- Enabling RLS denies all access via the public Supabase API (PostgREST) by default,
-- which protects your data. Your Next.js app (Prisma) connects via the database connection
-- string which typically bypasses these restrictions (as 'postgres' or 'service_role').

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "PatientMedicalHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BirthHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChildhoodHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChildhoodHospitalization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FemaleReproductiveHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pregnancy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MaleReproductiveHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyMedicalHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Surgery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Allergy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccidentHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccidentInjury" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "MedicalCondition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BodyIssue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HealthMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LibraryItem" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Referral" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReferralSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WithdrawalRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prescription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "medication" ENABLE ROW LEVEL SECURITY;

-- 2. (Optional) Create a "Service Role Only" policy for all tables
-- This is a safeguard to explicitly allow the service_role (backend) to do everything,
-- while continuing to block anon (public) users.
-- Note: Superusers (like 'postgres' connection) bypass RLS automatically.

CREATE POLICY "Enable access to service_role" ON "User" TO service_role USING (true) WITH CHECK (true);
-- Repeat for other tables if you switch to using supabase-js client side, 
-- but for now, enabling RLS is sufficient to close the "Public" warnings.
