import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import HealthDashboard from './pages/Dashboard/HealthDashboard';
import DoctorsPage from './pages/Booking/DoctorsPage';
import ChatPage from './pages/Chat/ChatPage';
import RecordsPage from './pages/Records/RecordsPage';
import MedicalHistoryPage from './pages/History/MedicalHistoryPage';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Routes>
      {/* Patient Routes */}
      <Route path="/" element={<AppShell />}>
        <Route index element={<HealthDashboard />} />
        <Route path="history" element={<MedicalHistoryPage />} />
        <Route path="appointments" element={<DoctorsPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
