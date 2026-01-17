# Arogya AI (Project P2C) - Comprehensive Technical & Codebase Documentation

## 1. Project Overview
**Arogya AI** is a comprehensive Digital Health Platform designed to bridge the gap between patients and healthcare providers. It features a robust **Patient Portal** for health tracking, medical history management, and appointments, alongside a **Doctor Portal** for patient management. The system leverages AI for health insights and aims to create a centralized "Medical ID" for every user.

## 2. Technical Stack
The application is built on a modern, high-performance web stack:

*   **Framework**: [Next.js 16.1](https://nextjs.org/) (React Framework)
    *   Uses **App Router** (`src/app`) for modern server-side rendering and layouts.
    *   Includes legacy components in `src/pages-old-react-router`.
*   **Language**: JavaScript (ES6+) / React 19.
*   **Styling**: API-based styling + Custom CSS (Legacy) + Tailwind CSS (Partial/Transitioning).
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/)).
*   **ORM**: [Prisma](https://www.prisma.io/) for type-safe database queries.
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v4) supporting Credentials and Google OAuth.
*   **Mobile**: [Capacitor](https://capacitorjs.com/) (Standard Web-to-Native wrapper) for Android deployment.
*   **Visuals**: `three.js` / `@react-three/fiber` for 3D Body Maps.

---

## 3. Database Schema (Complete Model List)
The application uses a relational database schema managed by Prisma. Below is the complete list of all **32 Tables (Models)** currently defined in the system:

### A. core Identity & Authentication
1.  **User**: The central entity. Stores profile, role (`patient`, `doctor`, `admin`), and critical health info.
2.  **Account**: Stores OAuth provider details (Google, etc.) for NextAuth.
3.  **Session**: Manages active user login sessions.
4.  **VerificationToken**: Handles email/password reset verification tokens.

### B. Medical History System (The "Wizard" Data)
5.  **PatientMedicalHistory**: The root record linking a user to all their specific history chapters.
6.  **BirthHistory**: Details of the user's own birth (weight, delivery type, complications).
7.  **ChildhoodHistory**: Early development, milestones, and vaccinations.
8.  **ChildhoodHospitalization**: Specific hospital visits during childhood.
9.  **FemaleReproductiveHistory**: Gynae/Ob history (Menarche, PCOS, etc.).
10. **Pregnancy**: Details of individual pregnancies.
11. **MaleReproductiveHistory**: Andrology history (Puberty, sexual health).
12. **FamilyMedicalHistory**: Genetic context (Conditions of parents/siblings).
13. **Surgery**: Records of past surgical procedures.
14. **Allergy**: Known allergies (Food, Drug, Environmental) and reactions.
15. **AccidentHistory**: Major accidents or traumas.
16. **AccidentInjury**: Specific injuries resulting from an accident.

### C. Clinical & Health Management
17. **MedicalCondition**: Confirmed chronic conditions (e.g., "Type 2 Diabetes").
18. **Medication**: Active medications, dosages, and reminders.
19. **Prescription**: Digital prescriptions linked to a doctor and medications.
20. **Appointment**: Scheduling records between Patients and Doctors.
21. **MedicalRecord**: Uploaded files (PDFs, Images, Lab Reports).
22. **BodyIssue**: Visual symptoms mapped to 3D body parts.
23. **HealthMetric**: Vitals tracking (BP, Sugar, HR, BMI).
24. **DailyLog**: Lifestyle habits (Water, Sleep, Exercise, Steps).

### D. Communication & Content
25. **Notification**: System alerts for appointments and health tasks.
26. **ChatMessage**: Secure messages between Doctor and Patient.
27. **AIChatMessage**: History of conversations with the Arogya AI assistant.
28. **LibraryItem**: Educational content (Books, Papers) available to users.

### E. Referral & Incentives
29. **Referral**: Tracks who referred whom (Patient-to-Patient, Doctor-to-Patient).
30. **Wallet**: User's earnings balance from referrals.
31. **Transaction**: detailed history of credits/debits.
32. **WithdrawalRequest**: User requests to cash out rewards.
33. **ReferralSettings**: Admin configuration for reward amounts.

---

## 4. Application Interface & Feature Map

The application is structured into distinct portals and pages, each serving a specific purpose in the user journey.

### A. Public Pages
1.  **Landing Page** (`/`): Currently redirects to login.
2.  **Login** (`/login`): Secure entry point. Supports Email/Password and Google OAuth.
3.  **Signup** (`/signup`): New user registration with role selection.
4.  **Shared Medical ID** (`/share/[id]`): **[NEW]** Public, read-only view of a patient's critical medical data (Allergies, Conditions, Emergency Contact). Accessible via QR code.

### B. Patient Portal (`/dashboard`)
 The core interface for authenticated patients.

5.  **Health Dashboard** (`/dashboard/health`)
    *   **Health Snapshot**: Real-time cards for Blood Pressure, Heart Rate, Sugar, and BMI.
    *   **3D Body Map**: Interactive visual interface to log symptoms by clicking on 3D organs.
    *   **Routine Tracker**: Daily logging for Water (glasses), Sleep (hours), and Steps.
    *   **Quick Actions**: One-tap buttons to Share QR, Book Appointment, or Chat.
    *   **Profile Completion Widget**: Progress bar prompting users to finish their history.

6.  **Medical History Wizard** (`/medical-history`)
    *   A comprehensive, multi-step form to digitize the user's entire health background.
    *   **Steps**: Birth > Childhood > Reproductive > Family > Surgery > Allergies.
    *   **Features**: Auto-save progress, intelligent skipping of irrelevant sections (e.g., Male history for females).

7.  **History Timeline** (`/history`)
    *   **Timeline View**: a chronological list of all medical events (Birth, Surgeries, Diagnoses).
    *   **Showcase Mode**: An automated "Story" mode that plays through the user's life health events.
    *   **Filters**: Sort by event type (Surgery, Condition, etc.).

8.  **Medical Records** (`/records`)
    *   **Digital Cabinet**: Upload and store PDF/Image files (Prescriptions, Lab Reports).
    *   **Categorization**: Tag files by type (X-Ray, Report, Prescription).

9.  **Appointments** (`/appointments`)
    *   **Booking**: Search for doctors and book slots.
    *   **Schedule**: View upcoming and past appointments.

10. **Profile Settings** (`/profile`)
    *   **Personal Info**: Edit Name, Phone, Address.
    *   **Account Security**: Change Password.

11. **Onboarding** (`/onboarding`)
    *   **Purpose**: Mandatory one-time setup for new users to collect essential data (DOB, Blood Group) before entering the dashboard.

### C. Doctor Portal (`/doctor`)
Dedicated interface for healthcare providers.

12. **Doctor Dashboard** (`/doctor`)
    *   **Patient Queue**: List of upcoming appointments.
    *   **Patient Lookup**: Access to search and view patient records.

13. **Doctors Directory** (`/doctors`)
    *   **Public Listing**: Searchable list of all doctors on the platform.

### D. Admin Portal (`/admin`)
Restricted backend for system management.

14. **Admin Dashboard** (`/admin`)
    *   **User Management**: View/Ban users.
    *   **Referral Settings**: Configure reward amounts.
    *   **Analytics**: System-wide usage stats.

### E. Communication
15. **Chat** (`/chat`)
    *   **Direct Messaging**: Real-time chat between Patient and Doctor.
    *   **AI Assistant**: Conversational interface to ask general health questions (Arogya AI).

---

## 5. Development Process
We are currently in the **Execution/Refinement Phase**:
1.  **Optimization**: Fixing persistent Database Connection Timeouts (caused by serverless environment limits).
    *   *Solution*: Optimized API routes to reduce redundant queries.
2.  **Mobile Polish**: Ensuring the Capacitor build works smoothly on Android.
3.  **Visuals**: Enhancing the "Wow Factor" with the 3D Body Map and glassmorphic UI.

## 6. Directory Structure Map
*   `src/app/api/`: Backend Serverless Functions (GET/POST logic for all data).
*   `src/components/`: Reusable UI blocks (Cards, Modals, Wizard Steps).
*   `src/lib/`: Core utilities (`prisma.js` database client, `auth.js` configuration).
*   `src/pages-old-react-router/`: Legacy views being migrated or maintained.
*   `prisma/`: Database definition source.

This document serves as the "Source of Truth" for the current state of the application.
