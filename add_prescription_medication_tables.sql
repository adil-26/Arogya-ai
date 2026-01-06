-- Prescription and Medication tables - Lowercase version for Supabase
-- Run this SQL in your Supabase SQL Editor

-- 1. Create Prescription table
CREATE TABLE IF NOT EXISTS prescription (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    doctor_id TEXT,
    doctor_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_data TEXT,
    file_type TEXT,
    file_name TEXT,
    issued_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Medication table
CREATE TABLE IF NOT EXISTS medication (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    prescription_id TEXT,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    timing TEXT[] DEFAULT ARRAY[]::TEXT[],
    instructions TEXT,
    start_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP(3),
    is_active BOOLEAN DEFAULT true,
    reminder_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS prescription_user_id_idx ON prescription(user_id);
CREATE INDEX IF NOT EXISTS medication_user_id_idx ON medication(user_id);

-- Done!
