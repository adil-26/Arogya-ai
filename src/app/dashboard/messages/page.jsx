'use client';
import React, { useState, useEffect, useRef } from 'react';
import AppShell from '../../../components/layout/AppShell';
import { MessageSquare, Send, User, Phone, Video, MoreVertical } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function MessagesPage() {
    const { data: session } = useSession();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const lastMessageCount = useRef(0);
    const pollIntervalRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Fetch doctors
    useEffect(() => {
        async function fetchDoctors() {
            try {
                const res = await fetch('/api/doctors');
                if (res.ok) {
                    setDoctors(await res.json());
                }
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDoctors();
    }, []);

    // Poll for messages
    useEffect(() => {
        if (selectedDoctor) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

            pollIntervalRef.current = setInterval(async () => {
                try {
                    const res = await fetch(`/api/messages?doctorId=${selectedDoctor.id}`);
                    if (res.ok) {
                        const data = await res.json();

                        // Check for new doctor messages
                        if (data.length > lastMessageCount.current && lastMessageCount.current > 0) {
                            const newMsgs = data.slice(lastMessageCount.current);
                            const doctorMsgs = newMsgs.filter(m => m.sender === 'doctor');

                            if (doctorMsgs.length > 0 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                                new Notification('New Message from Doctor', {
                                    body: `${selectedDoctor.name}: ${doctorMsgs[0].content}`,
                                    icon: '/favicon.ico'
                                });
                            }
                        }

                        lastMessageCount.current = data.length;
                        setMessages(data);

                        // Mark as read when viewing
                        const storedCounts = localStorage.getItem('patient_read_counts');
                        const readCounts = storedCounts ? JSON.parse(storedCounts) : {};
                        readCounts[selectedDoctor.id] = data.length;
                        localStorage.setItem('patient_read_counts', JSON.stringify(readCounts));
                    }
                } catch (error) {
                    console.error('Poll failed:', error);
                }
            }, 3000);

            return () => {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            };
        }
    }, [selectedDoctor]);

    const openChat = async (doctor) => {
        setSelectedDoctor(doctor);
        lastMessageCount.current = 0;
        try {
            const res = await fetch(`/api/messages?doctorId=${doctor.id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                lastMessageCount.current = data.length;

                // Mark as read when opening chat
                const storedCounts = localStorage.getItem('patient_read_counts');
                const readCounts = storedCounts ? JSON.parse(storedCounts) : {};
                readCounts[doctor.id] = data.length;
                localStorage.setItem('patient_read_counts', JSON.stringify(readCounts));
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedDoctor) return;

        const msgContent = newMessage.trim();
        setNewMessage('');

        // Optimistic update
        setMessages(prev => [...prev, { sender: 'user', content: msgContent, createdAt: new Date() }]);

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: selectedDoctor.id,
                    content: msgContent,
                    sender: 'user'
                })
            });
        } catch (error) {
            console.error('Send failed:', error);
        }
    };

    return (
        <AppShell>
            <div style={{
                padding: '24px 30px',
                background: '#F8FAFC',
                minHeight: 'calc(100vh - 60px)'
            }}>
                {/* Page Header */}
                <div style={{
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.6rem',
                            fontWeight: '700',
                            color: '#1E293B',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <MessageSquare size={22} color="white" />
                            </div>
                            Messages
                        </h1>
                        <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>
                            Chat with your doctors in real-time
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '20px',
                    height: 'calc(100vh - 180px)',
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                }}>
                    {/* Doctor List Sidebar */}
                    <div style={{
                        width: '320px',
                        borderRight: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E2E8F0'
                        }}>
                            <h3 style={{
                                margin: 0,
                                color: '#1E293B',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}>
                                Conversations
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
                                {doctors.length} doctors available
                            </p>
                        </div>
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '12px'
                        }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '50%',
                                        border: '3px solid #E2E8F0',
                                        borderTopColor: '#3B82F6',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 12px'
                                    }} />
                                    Loading doctors...
                                </div>
                            ) : doctors.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                                    <User size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                    <p>No doctors available</p>
                                </div>
                            ) : (
                                doctors.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => openChat(doc)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            background: selectedDoctor?.id === doc.id ? '#EFF6FF' : 'transparent',
                                            border: 'none',
                                            borderRadius: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            cursor: 'pointer',
                                            marginBottom: '8px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                            borderLeft: selectedDoctor?.id === doc.id ? '4px solid #1E40AF' : '4px solid transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: '700', fontSize: '1.1rem',
                                            flexShrink: 0
                                        }}>
                                            {doc.name?.[4] || 'D'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                margin: 0,
                                                fontWeight: '600',
                                                color: '#1E293B',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {doc.name}
                                            </p>
                                            <p style={{
                                                margin: '2px 0 0 0',
                                                fontSize: '0.8rem',
                                                color: '#64748B'
                                            }}>
                                                {doc.specialty}
                                            </p>
                                        </div>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#22C55E'
                                        }} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {selectedDoctor ? (
                            <>
                                {/* Chat Header */}
                                <div style={{
                                    padding: '16px 24px',
                                    borderBottom: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'white'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: '700', fontSize: '1.2rem'
                                        }}>
                                            {selectedDoctor.name?.[4] || 'D'}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '700', color: '#1E293B', fontSize: '1.05rem' }}>
                                                {selectedDoctor.name}
                                            </p>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
                                                Online
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => {
                                                if (selectedDoctor.phone) {
                                                    window.open(`tel:${selectedDoctor.phone}`, '_self');
                                                } else {
                                                    alert('Phone number not available. Please contact via chat.');
                                                }
                                            }}
                                            title="Call Doctor"
                                            style={{
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                border: '1px solid #E2E8F0', background: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', color: '#64748B'
                                            }}>
                                            <Phone size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Generate a unique Meet room based on doctor ID
                                                const meetUrl = `https://meet.google.com/new`;
                                                window.open(meetUrl, '_blank');
                                            }}
                                            title="Start Video Call"
                                            style={{
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                border: '1px solid #E2E8F0', background: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', color: '#64748B'
                                            }}>
                                            <Video size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div style={{
                                    flex: 1,
                                    padding: '24px',
                                    overflowY: 'auto',
                                    background: '#F8FAFC'
                                }}>
                                    {messages.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '60px 20px',
                                            color: '#64748B'
                                        }}>
                                            <div style={{
                                                width: '70px', height: '70px',
                                                borderRadius: '50%',
                                                background: '#EFF6FF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 16px'
                                            }}>
                                                <MessageSquare size={32} color="#3B82F6" />
                                            </div>
                                            <p style={{ fontWeight: '600', color: '#1E293B', marginBottom: '4px' }}>
                                                Start a conversation
                                            </p>
                                            <p style={{ fontSize: '0.9rem' }}>
                                                Send a message to {selectedDoctor.name}
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                                marginBottom: '16px'
                                            }}>
                                                <div style={{
                                                    maxWidth: '65%',
                                                    padding: '14px 18px',
                                                    borderRadius: msg.sender === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                                                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : 'white',
                                                    color: msg.sender === 'user' ? 'white' : '#1E293B',
                                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                                                }}>
                                                    <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.content}</p>
                                                    <p style={{
                                                        margin: '8px 0 0 0',
                                                        fontSize: '0.7rem',
                                                        opacity: 0.7,
                                                        textAlign: 'right'
                                                    }}>
                                                        {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div style={{
                                    padding: '20px 24px',
                                    borderTop: '1px solid #E2E8F0',
                                    display: 'flex',
                                    gap: '14px',
                                    background: 'white'
                                }}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type your message..."
                                        style={{
                                            flex: 1,
                                            padding: '14px 20px',
                                            borderRadius: '14px',
                                            border: '1px solid #E2E8F0',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        style={{
                                            padding: '14px 28px',
                                            background: newMessage.trim() ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : '#E2E8F0',
                                            color: newMessage.trim() ? 'white' : '#94A3B8',
                                            border: 'none',
                                            borderRadius: '14px',
                                            fontWeight: '600',
                                            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: newMessage.trim() ? '0 4px 15px rgba(30, 64, 175, 0.3)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Send size={18} /> Send
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                background: '#F8FAFC'
                            }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: '#EFF6FF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '24px'
                                }}>
                                    <MessageSquare size={48} color="#1E40AF" />
                                </div>
                                <p style={{
                                    color: '#1E293B',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    Select a doctor to chat
                                </p>
                                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                                    Choose from the list on the left
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AppShell>
    );
}
