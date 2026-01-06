-- Test Doctor Prescription Data
-- Run this in Supabase SQL Editor to see doctor-prescribed medications

-- First, get your user ID by running: SELECT id, email FROM "User" WHERE role = 'patient' LIMIT 5;
-- Then replace 'YOUR_USER_ID' below with your actual user ID

-- Insert test prescriptions from doctor
INSERT INTO prescription (id, user_id, doctor_name, title, description, created_at, updated_at)
VALUES 
    (
        gen_random_uuid()::text,
        (SELECT id FROM "User" WHERE role = 'patient' LIMIT 1),
        'Dr. Sharma',
        'Blood Pressure Medication',
        'Amlodipine 5mg - Take once daily in the morning with water',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        (SELECT id FROM "User" WHERE role = 'patient' LIMIT 1),
        'Dr. Patel',
        'Diabetes Management',
        'Metformin 500mg - Take twice daily after meals',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        (SELECT id FROM "User" WHERE role = 'patient' LIMIT 1),
        'Dr. Kumar',
        'Pain Relief',
        'Paracetamol 650mg - Take as needed, max 3 times daily',
        NOW(),
        NOW()
    );

-- Verify: Check if prescriptions were inserted
SELECT id, user_id, doctor_name, title, description FROM prescription;
