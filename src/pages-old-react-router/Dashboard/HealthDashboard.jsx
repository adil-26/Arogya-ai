'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLoader from '../../components/common/PageLoader';
import HealthMetricCard from '../../components/dashboard/HealthMetricCard';
import BodyMapContainer from '../../components/BodyMap/BodyMapContainer';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import QuickActions from '../../components/dashboard/QuickActions';
import RoutineTracker from '../../components/dashboard/RoutineTracker';
import HealthGraphs from '../../components/dashboard/HealthGraphs';
import VitalsInputModal from '../../components/dashboard/VitalsInputModal';
import UpcomingAppointmentCard from '../../components/dashboard/UpcomingAppointmentCard';
import './HealthDashboard.css';

const HealthDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter(); // Use Next.js Router
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [selectedVital, setSelectedVital] = useState(null); // For Input Modal

  // Issues State (Mock Data persistence simulated by passing ID)
  // In a real app, issues would be fetched from Context/API based on ID
  const [issues, setIssues] = useState({
    // chest: { severity: 'mild', domain: 'Lungs', issue: 'Shortness of Breath', painLevel: 3 }
  });

  /* 
   * Fetch Vitals from Backend
   */
  const [vitals, setVitals] = useState([
    { id: 'bp', title: 'Blood Pressure', value: '--/--', unit: 'mmHg', type: 'activity', status: 'normal' },
    { id: 'hr', title: 'Heart Rate', value: '--', unit: 'bpm', type: 'heart', status: 'normal' },
    { id: 'sugar', title: 'Blood Sugar', value: '--', unit: 'mg/dL', type: 'sugar', status: 'normal' },
    { id: 'bmi', title: 'BMI', value: '--', unit: '', type: 'temp', status: 'normal' },
  ]);

  // Fetch Latest Appointment
  const [latestAppointment, setLatestAppointment] = useState(null);

  React.useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/metrics');
        if (res.ok) {
          const data = await res.json();
          // Map DB records to Vitals (taking the latest for each type)
          if (data && data.length > 0) {
            setVitals(prev => prev.map(v => {
              // Find latest record for this type (assuming DB type matches or we map it)
              // type mapping: 'bp'->'activity'?, actually DB has 'type' field.
              // Let's assume frontend IDs match logical DB types.
              // Mapping: 
              // bp -> type: 'Blood Pressure' or 'bp'
              // hr -> type: 'Heart Rate' or 'hr'
              const match = data.find(d => d.type === v.title || d.type === v.id);
              if (match) {
                return { ...v, value: match.value, unit: match.unit || v.unit, status: match.status || v.status };
              }
              return v;
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load metrics", e);
      }
    }
    loadMetrics();
  }, []);

  React.useEffect(() => {
    async function fetchAppt() {
      try {
        const res = await fetch('/api/appointments');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setLatestAppointment(data[0]); // Get the first one (most recent due to sort)
          }
        }
      } catch (e) { console.error("Appt fetch failed", e); }
    }
    fetchAppt();
  }, []);

  if (status === 'loading') {
    return <PageLoader message="Loading your dashboard..." />;
  }

  // Redirect if not authenticated (should be handled by middleware, but extra safety)
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleVitalClick = (vital) => {
    setSelectedVital(vital);
  };

  const handleSaveVital = async (id, value, status = 'normal') => {
    // Optimistic Update
    setVitals(prev => prev.map(v => v.id === id ? { ...v, value: value, status: status } : v));
    setSelectedVital(null);

    // Save to Backend
    try {
      // Map ID to Type/Title for consistency
      const vitalObj = vitals.find(v => v.id === id);
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: id,
          value: value,
          unit: vitalObj.unit,
          status: status
        })
      });
    } catch (error) {
      console.error("Failed to save metric", error);
    }
  };

  const patient = {
    name: session?.user?.name || "Patient",
    gender: "Male", // This could also come from session or DB profile fetch
    avatar: session?.user?.image || null
  };

  const handleOrganSelect = (organId) => {
    setSelectedOrgan(organId);
    // Navigate to the new detailed page
    router.push(`/organ/${organId}`);
  };

  return (
    <div className="dashboard-container">
      {/* 1. Header Section */}
      <DashboardHeader patient={patient} />

      {/* 2. Quick Action Bar */}
      <QuickActions />

      <div className="dashboard-grid">
        {/* LEFT COLUMN (2fr) */}
        <div className="main-column">
          <RoutineTracker />

          <div className="visual-health-section">
            <div className="section-header-row">
              <h3>Body Health Map</h3>
              <span className="badge-live">Live Interaction</span>
            </div>

            {/* New Library Access Card */}
            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }}
              onClick={() => router.push('/library')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '8px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>Medical Library</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Access books & research papers</p>
                </div>
              </div>
              <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '50%' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </div>
            </div>

            <div className="body-map-wrapper">
              <BodyMapContainer
                onOrganSelect={handleOrganSelect}
                issues={issues}
              />
            </div>
          </div>

          <HealthGraphs />
        </div>

        {/* RIGHT COLUMN (1fr) */}
        <div className="side-column">
          {/* UPCOMING APPOINTMENT */}
          {latestAppointment && (
            <UpcomingAppointmentCard
              appointment={latestAppointment}
              onViewProfile={() => {
                alert("Navigating to Doctor Profile: " + latestAppointment.doctorName);
              }}
            />
          )}

          {/* HEALTH SNAPSHOT */}
          <div className="snapshot-section" id="vitals-section">
            <h3>Health Snapshot</h3>
            <div className="snapshot-grid" style={{ gridTemplateColumns: '1fr' }}> {/* Stack cards in sidebar */}
              {vitals.map(vital => (
                <HealthMetricCard
                  key={vital.id}
                  {...vital}
                  onClick={() => handleVitalClick(vital)}
                />
              ))}
              {/* Last Appointment Card - Dynamic */}
              <div className="health-metric-card summary-card">
                <div className="metric-info">
                  <h3 className="metric-title">Last Appointment</h3>
                  {latestAppointment ? (
                    <>
                      <span className="metric-value-text">{latestAppointment.doctorName}</span>
                      <span className="metric-subtext">
                        {new Date(latestAppointment.date).toLocaleDateString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="metric-value-text" style={{ fontSize: '0.9rem', color: '#6B7280' }}>No appointments yet</span>
                      <span className="metric-subtext" style={{ color: '#9CA3AF' }}>Book your first checkup</span>
                    </>
                  )}
                </div>
              </div>
              {/* AI Health Score Card - Dynamic */}
              <div className="health-metric-card summary-card">
                <div className="metric-info">
                  <h3 className="metric-title">AI Health Score</h3>
                  {(() => {
                    // Calculate health score based on logged vitals
                    const loggedVitals = vitals.filter(v => v.value !== '--' && v.value !== '--/--');
                    const score = loggedVitals.length > 0 ? Math.min(100, 50 + (loggedVitals.length * 12)) : 0;
                    const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Start logging';
                    const scoreClass = score >= 80 ? 'score-high' : score >= 60 ? 'score-medium' : 'score-low';
                    return (
                      <>
                        <span className={`metric-value-text ${scoreClass}`}>
                          {score > 0 ? `${score}/100` : '--'}
                        </span>
                        <span className="metric-subtext">{scoreLabel}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Medical History Tabs - Placeholder for future expansion */}
      <div className="history-tabs-section">
        <div className="tabs-header">
          <button className="tab-btn active">Reports</button>
          <button className="tab-btn">Appointments</button>
        </div>
        <div className="tab-content">
          <p className="tab-placeholder">Recent reports will appear here...</p>
        </div>
      </div>

      {selectedVital && (
        <VitalsInputModal
          metric={selectedVital}
          onClose={() => setSelectedVital(null)}
          onSave={handleSaveVital}
        />
      )}
    </div>
  );
};

export default HealthDashboard;
