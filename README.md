# 🏥 Arogya-AI (Patient 2 Clinic)

A comprehensive Telemedicine and Healthcare Management Platform connecting Patients and Doctors, featuring advanced Acupuncture prescriptions, real-time chat, and detailed health tracking.

![Status](https://img.shields.io/badge/Status-In%20Development-blue)
![Tech](https://img.shields.io/badge/Tech-Next.js%20%7C%20Prisma%20%7C%20Supabase-success)

## 🌟 Key Features

### 👩‍⚕️ Doctor Portal
*   **Dynamic Dashboard**: Overview of appointments, patients, and statistics.
*   **Patient Management**: View patient profiles, medical history, and chat.
*   **Smart Prescriptions**:
    *   **Medicine**: Standard pharmaceutical prescriptions.
    *   **Acupuncture**: Specialized prescription tool with **361 acupoints** database (14 Meridians).
*   **Referral System**: Earn rewards for referring other doctors or patients.

### 👤 Patient Portal
*   **Health Dashboard**: Track vitals (BP, Sugar, Heart Rate) and daily routines (Water, Sleep, Steps).
*   **Body Map**: Interactive visual tool to log specific body issues and pain levels.
*   **Medication Reminders**: View prescriptions and set reminders.
*   **Medical Records**: Securely store and view prescriptions, lab reports, and X-rays.
*   **Appointments**: Book and manage appointments with doctors.
*   **Wallet**: Manage referral earnings and withdrawals.

### 🛠️ Admin Portal
*   **User Management**: Oversee doctors and patients.
*   **Financials**: Process withdrawal requests and manage referral settings.

---

## 🛠️ Technology Stack
*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Database**: PostgreSQL (via [Supabase](https://supabase.com/))
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Google & Credentials)
*   **Mobile**: [Capacitor](https://capacitorjs.com/) (Android)
*   **UI/UX**: Lucide React, Vanilla CSS, Recharts

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   PostgreSQL / Supabase Project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/adil-26/Arogya-ai.git

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Database (Supabase)
# Use Pooler URL for transaction mode (port 6543)
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Google Auth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push Schema to Database
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/             # API Routes (Next.js)
│   ├── dashboard/       # Patient Portal Pages
│   ├── doctor/          # Doctor Portal Pages
│   ├── admin/           # Admin Portal Pages
│   ├── login/           # Authentication Pages
│   └── ...
├── components/          
│   ├── BodyMap/         # Interactive Body Map Component
│   ├── dashboard/       # Dashboard Widgets
│   ├── medications/     # Medication Reminders
│   └── ...
├── data/
│   └── meridians/       # 📌 Complete Acupoint Database (14 Files)
├── lib/
│   ├── prisma.js        # DB Client with Connection Pooling
│   └── auth.js          # Auth Configuration
└── ...
```

## 📱 Mobile Build (Android)
```bash
# Sync web assets to capacitor
npx cap sync

# Open Android Studio
npx cap open android
```

---

## 📝 License
This project is proprietary.
