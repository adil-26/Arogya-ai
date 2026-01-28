'use client'; // Client Component for Sidebar Interaction

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, FileText, MessageSquare, Settings, Menu, X, Bell, Gift, Wallet, User, LogOut, ChevronDown, MoreVertical, Pill, BookOpen, Activity } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import './AppShell.css';

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const closeMenus = () => {
    setIsProfileOpen(false);
    setIsMoreMenuOpen(false);
  };

  // All navigation items
  const navItems = [
    { path: '/dashboard/health', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'History', icon: FileText },
    { path: '/dashboard/reports', label: 'Health Reports', icon: Activity }, // Added
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { path: '/records', label: 'Records', icon: FileText },
    { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
    { path: '/library', label: 'Library', icon: BookOpen },
    { path: '/dashboard/referral', label: 'Refer & Earn', icon: Gift },
    { path: '/dashboard/wallet', label: 'My Wallet', icon: Wallet },
  ];

  // Get current page title
  const getPageTitle = () => {
    const current = navItems.find(item => pathname.startsWith(item.path));
    if (current) return current.label;
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  // Check for unread messages
  useEffect(() => {
    if (status === "loading") return;

    const checkUnread = async () => {
      try {
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => closeMenus();
    if (isProfileOpen || isMoreMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileOpen, isMoreMenuOpen]);

  // Loading state
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
          <h2>E2Care</h2>
          <button className="mobile-close-btn" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className="nav-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={closeSidebar}
              style={{ position: 'relative' }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.path === '/dashboard/messages' && unreadMessages > 0 && (
                <span className="nav-badge">{unreadMessages}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="user-profile-summary" onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }} style={{ cursor: 'pointer', position: 'relative' }}>
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
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>

          <div className="header-actions">
            {/* More Menu (for all tabs) */}
            <div className="header-dropdown-container">
              <button
                className="btn-icon"
                onClick={(e) => { e.stopPropagation(); setIsMoreMenuOpen(!isMoreMenuOpen); setIsProfileOpen(false); }}
              >
                <MoreVertical size={20} />
              </button>
              {isMoreMenuOpen && (
                <div className="header-dropdown more-menu">
                  {navItems.slice(0, 6).map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`dropdown-link ${isActive(item.path) ? 'active' : ''}`}
                      onClick={closeMenus}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="dropdown-divider" />
                  {navItems.slice(6).map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`dropdown-link ${isActive(item.path) ? 'active' : ''}`}
                      onClick={closeMenus}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="header-dropdown-container">
              <button
                className="btn-icon profile-btn"
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); setIsMoreMenuOpen(false); }}
              >
                <User size={20} />
              </button>
              {isProfileOpen && (
                <div className="header-dropdown profile-menu">
                  <div className="dropdown-user">
                    <div className="avatar-small">{session?.user?.name?.[0] || 'U'}</div>
                    <div className="user-info">
                      <span className="user-name">{session?.user?.name || 'User'}</span>
                      <span className="user-email">{session?.user?.email || ''}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link href="/profile" className="dropdown-link" onClick={closeMenus}>
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    className="dropdown-link logout"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
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
            <BookOpen size={24} />
            <span>Lib</span>
          </Link>
        </nav>
      </main>
    </div>
  );
};

export default AppShell;
