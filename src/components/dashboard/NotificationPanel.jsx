'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Calendar, MessageSquare, Heart, Info, BellRing } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './NotificationPanel.css';

const NotificationPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pushPermission, setPushPermission] = useState('default');
    const [swRegistration, setSwRegistration] = useState(null);
    const panelRef = useRef(null);
    const router = useRouter();
    const previousUnreadRef = useRef(0);

    // Register service worker and check push permission
    useEffect(() => {
        if ('Notification' in window) {
            setPushPermission(Notification.permission);
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/push-sw.js')
                .then(reg => {
                    setSwRegistration(reg);
                    console.log('Push SW registered');
                })
                .catch(err => console.error('SW registration failed:', err));
        }
    }, []);

    // Request push notification permission
    const requestPushPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
            if (permission === 'granted') {
                // Show test notification
                showBrowserNotification('Notifications Enabled!', 'You will now receive push notifications.');
            }
        } catch (error) {
            console.error('Failed to request permission:', error);
        }
    };

    // Show browser notification
    const showBrowserNotification = (title, body, link = '/dashboard/health') => {
        if (pushPermission === 'granted' && swRegistration) {
            swRegistration.showNotification(title, {
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                vibrate: [100, 50, 100],
                data: { url: link }
            });
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                const newNotifications = data.notifications || [];
                const newUnreadCount = data.unreadCount || 0;

                // Check for new notifications and show browser notification
                if (newUnreadCount > previousUnreadRef.current && previousUnreadRef.current > 0) {
                    const latestUnread = newNotifications.find(n => !n.read);
                    if (latestUnread && pushPermission === 'granted') {
                        showBrowserNotification(latestUnread.title, latestUnread.message, latestUnread.link);
                    }
                }
                previousUnreadRef.current = newUnreadCount;

                setNotifications(newNotifications);
                setUnreadCount(newUnreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [pushPermission]);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark all as read
    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markRead' })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    // Click notification
    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.read) {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markRead', notificationId: notification.id })
            });
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        // Navigate if link exists
        if (notification.link) {
            setIsOpen(false);
            router.push(notification.link);
        }
    };

    // Get icon by type
    const getIcon = (type) => {
        switch (type) {
            case 'appointment': return <Calendar size={18} className="notif-icon appointment" />;
            case 'message': return <MessageSquare size={18} className="notif-icon message" />;
            case 'health': return <Heart size={18} className="notif-icon health" />;
            default: return <Info size={18} className="notif-icon system" />;
        }
    };

    // Format time
    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diff = now - notifDate;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return notifDate.toLocaleDateString();
    };

    return (
        <div className="notification-container" ref={panelRef}>
            {/* Bell Button */}
            <button
                className="btn-icon-only relative notification-bell"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="notification-panel">
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-read-btn" onClick={markAllRead}>
                                <Check size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Push Notification Permission Banner */}
                    {pushPermission !== 'granted' && (
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BellRing size={18} color="white" />
                                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '500' }}>
                                    Enable push notifications
                                </span>
                            </div>
                            <button
                                onClick={requestPushPermission}
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Enable
                            </button>
                        </div>
                    )}

                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <Bell size={40} strokeWidth={1} />
                                <p>No notifications yet</p>
                                <span>We'll notify you when something arrives</span>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notif-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className="notif-icon-wrapper">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="notif-content">
                                        <p className="notif-title">{notif.title}</p>
                                        <p className="notif-message">{notif.message}</p>
                                        <span className="notif-time">{formatTime(notif.createdAt)}</span>
                                    </div>
                                    <button
                                        className="notif-delete"
                                        onClick={(e) => deleteNotification(notif.id, e)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
