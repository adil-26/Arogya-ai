'use client'; // Client Component for Sidebar Interaction

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, FileText, MessageSquare, Settings, Menu, X, Bell, Gift, Wallet } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import './AppShell.css';

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Check for unread messages - MUST be before conditional return (React hooks rules)
  useEffect(() => {
    // Skip if still loading
    if (status === "loading") return;

    const checkUnread = async () => {
      try {
        // Get read counts from localStorage
        const storedCounts = localStorage.getItem('patient_read_counts');
        const readCounts = storedCounts ? JSON.parse(storedCounts) : {};

        const res = await fetch('/api/doctors');
        if (res.ok) {
          const doctors = await res.json();
          let count = 0;
          for (const doc of doctors) {
            try {
              const msgRes = await fetch(`/api/messages?doctorId=${doc.id}`);
              if (msgRes.ok) {
                const msgs = await msgRes.json();
                const totalMsgs = msgs.length;
                const readCount = readCounts[doc.id] || 0;
                const unread = Math.max(0, totalMsgs - readCount);
                count += unread;
              }
            } catch { }
          }
          setUnreadMessages(count);
        }
      } catch { }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [status]);

  // Don't render anything until session is checked (prevents flash)
  if (status === "loading") {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Helper to check active state
  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar desktop-only ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <h2>Aarogya AI</h2>
          <button className="mobile-close-btn" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className="nav-menu">
          <Link href="/dashboard/health" className={`nav-item ${isActive('/dashboard/health') ? 'active' : ''}`} onClick={closeSidebar}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/history" className={`nav-item ${isActive('/history') ? 'active' : ''}`} onClick={closeSidebar}>
            <FileText size={20} />
            <span>History</span>
          </Link>
          <Link href="/appointments" className={`nav-item ${isActive('/appointments') ? 'active' : ''}`} onClick={closeSidebar}>
            <Calendar size={20} />
            <span>Appointments</span>
          </Link>
          <Link href="/dashboard/messages" className={`nav-item ${isActive('/dashboard/messages') ? 'active' : ''}`} onClick={closeSidebar} style={{ position: 'relative' }}>
            <MessageSquare size={20} />
            <span>Messages</span>
            {unreadMessages > 0 && (
              <span style={{
                position: 'absolute',
                right: '15px',
                background: '#EF4444',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                padding: '2px 7px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {unreadMessages}
              </span>
            )}
          </Link>
          <Link href="/records" className={`nav-item ${isActive('/records') ? 'active' : ''}`} onClick={closeSidebar}>
            <FileText size={20} />
            <span>Records</span>
          </Link>
          <Link href="/chat" className={`nav-item ${isActive('/chat') ? 'active' : ''}`} onClick={closeSidebar}>
            <MessageSquare size={20} />
            <span>AI Assistant</span>
          </Link>
          <Link href="/library" className={`nav-item ${isActive('/library') ? 'active' : ''}`} onClick={closeSidebar}>
            <FileText size={20} />
            <span>Library</span>
          </Link>
          <Link href="/dashboard/referral" className={`nav-item ${isActive('/dashboard/referral') ? 'active' : ''}`} onClick={closeSidebar}>
            <Gift size={20} />
            <span>Refer & Earn</span>
          </Link>
          <Link href="/dashboard/wallet" className={`nav-item ${isActive('/dashboard/wallet') ? 'active' : ''}`} onClick={closeSidebar}>
            <Wallet size={20} />
            <span>My Wallet</span>
          </Link>
        </nav>

        <div className="user-profile-summary" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
          <div className="avatar">{session?.user?.name?.[0] || 'U'}</div>
          <div className="info">
            <span className="name">{session?.user?.name || 'User'}</span>
            <span className="role">{session?.user?.role || 'Patient'}</span>
          </div>

          {isProfileOpen && (
            <div className="profile-dropdown" style={{
              position: 'absolute', bottom: '100%', left: '0', right: '0',
              background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB',
              boxShadow: '0 -4px 15px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '8px'
            }}>
              <Link href="/profile" className="dropdown-item" style={{ display: 'block', padding: '10px 15px', color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}>
                My Profile
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ width: '100%', textAlign: 'left', padding: '10px 15px', background: 'none', border: 'none', color: '#EF4444', fontWeight: '500', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1 className="page-title">Medical Dashboard</h1>
          </div>
          <div className="actions">
            <button className="btn-icon"><Settings size={20} /></button>
          </div>
        </header>

        <div className="content-area">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav mobile-only">
          <Link href="/dashboard/health" className={`bottom-nav-item ${isActive('/dashboard/health') ? 'active' : ''}`}>
            <LayoutDashboard size={24} />
            <span>Home</span>
          </Link>
          <Link href="/history" className={`bottom-nav-item ${isActive('/history') ? 'active' : ''}`}>
            <FileText size={20} />
            <span>History</span>
          </Link>
          <div className="bottom-nav-fab-container">
            <Link href="/chat" className="bottom-nav-fab">
              <MessageSquare size={24} />
            </Link>
          </div>
          <Link href="/appointments" className={`bottom-nav-item ${isActive('/appointments') ? 'active' : ''}`}>
            <Calendar size={24} />
            <span>Book</span>
          </Link>
          <Link href="/library" className={`bottom-nav-item ${isActive('/library') ? 'active' : ''}`}>
            <FileText size={24} />
            <span>Lib</span>
          </Link>
        </nav>
      </main>
    </div>
  );
};

export default AppShell;
