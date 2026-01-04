import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter } from 'lucide-react';
import DoctorCard from '../../components/booking/DoctorCard';
import './DoctorsPage.css';

const DoctorsPage = () => {
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedChatDoctor, setSelectedChatDoctor] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const lastMessageCount = useRef(0);
    const pollIntervalRef = useRef(null);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Fetch doctors from API
    useEffect(() => {
        async function fetchDoctors() {
            try {
                const res = await fetch('/api/doctors');
                if (res.ok) {
                    const data = await res.json();
                    setDoctors(data);
                }
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDoctors();
    }, []);

    // Poll for new messages when chatting
    useEffect(() => {
        if (selectedChatDoctor) {
            // Clear any existing interval
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }

            // Start polling
            pollIntervalRef.current = setInterval(async () => {
                try {
                    const res = await fetch(`/api/messages?doctorId=${selectedChatDoctor.id}`);
                    if (res.ok) {
                        const data = await res.json();

                        // Check for new messages from doctor
                        if (data.length > lastMessageCount.current) {
                            const newMsgs = data.slice(lastMessageCount.current);
                            const doctorMsgs = newMsgs.filter(m => m.sender === 'doctor');

                            // Show browser notification for doctor messages
                            if (doctorMsgs.length > 0 && Notification.permission === 'granted') {
                                new Notification('New Message from Doctor', {
                                    body: `${selectedChatDoctor.name}: ${doctorMsgs[0].content}`,
                                    icon: '/favicon.ico'
                                });
                            }
                        }

                        lastMessageCount.current = data.length;
                        setChatMessages(data);
                    }
                } catch (error) {
                    console.error('Poll failed:', error);
                }
            }, 3000); // Poll every 3 seconds

            return () => {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }
            };
        }
    }, [selectedChatDoctor]);

    // Chat Logic
    const handleChat = (doctor) => {
        setSelectedChatDoctor(doctor);
        lastMessageCount.current = 0;
        fetchMessages(doctor.id);
    };

    const fetchMessages = async (doctorId) => {
        try {
            const res = await fetch(`/api/messages?doctorId=${doctorId}`);
            if (res.ok) {
                const data = await res.json();
                setChatMessages(data);
                lastMessageCount.current = data.length;
            }
        } catch (error) {
            console.error("Failed to load chats", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChatDoctor) return;

        // Optimistic UI
        const tempMsg = { sender: 'user', content: newMessage, createdAt: new Date() };
        setChatMessages([...chatMessages, tempMsg]);
        setNewMessage("");

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: selectedChatDoctor.id,
                    content: tempMsg.content,
                    sender: 'user'
                })
            });
        } catch (error) {
            console.error("Send failed", error);
        }
    };

    // Get unique specialties from doctors
    const specialties = ['All', ...new Set(doctors.map(d => d.specialty).filter(Boolean))];

    const filteredDoctors = selectedSpecialty === 'All'
        ? doctors
        : doctors.filter(doc => doc.specialty === selectedSpecialty);

    // Booking State
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingTime, setBookingTime] = useState(null);

    const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

    const handleBook = (doctor) => {
        setSelectedDoctor(doctor);
        setBookingTime(null); // Reset time
        setShowBookingModal(true);
    };

    const confirmBooking = async () => {
        if (!bookingDate || !bookingTime) {
            alert("Please select both a Date and a Time.");
            return;
        }

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: selectedDoctor.id.toString(),
                    doctorName: selectedDoctor.name,
                    specialty: selectedDoctor.specialty,
                    date: bookingDate,
                    time: bookingTime
                })
            });

            if (res.ok) {
                alert(`Success! Booking Confirmed with ${selectedDoctor.name} on ${bookingDate} at ${bookingTime}`);
                setShowBookingModal(false);
                setSelectedDoctor(null);
            } else {
                const err = await res.json();
                console.error("Booking Error:", err);
                alert("Failed to book appointment: " + (err.error || "Unknown Error"));
            }
        } catch (error) {
            console.error("Booking Logic Failed", error);
            alert("Network error. Please try again.");
        }
    };

    return (
        <div className="doctors-page">
            <header className="page-header">
                <div>
                    <h1>Find a Doctor</h1>
                    <p>Book appointments with top specialists near you</p>
                </div>
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search doctors, clinics..." />
                </div>
            </header>

            <div className="filters-row">
                <span className="filter-label"><Filter size={16} /> Filter by:</span>
                <div className="filter-chips">
                    {specialties.map(spec => (
                        <button
                            key={spec}
                            className={`chip ${selectedSpecialty === spec ? 'active' : ''}`}
                            onClick={() => setSelectedSpecialty(spec)}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </div>

            <div className="doctors-grid">
                {filteredDoctors.map(doctor => (
                    <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onBook={handleBook}
                        onChat={handleChat} // Pass Chat Handler
                    />
                ))}
            </div>

            {showBookingModal && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Book Appointment</h3>
                            <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="doctor-info">Booking with <strong>{selectedDoctor?.name}</strong> <span className="spec-badge">{selectedDoctor?.specialty}</span></p>

                            <div className="form-section">
                                <label>Select Date</label>
                                <input
                                    type="date"
                                    className="date-picker-input"
                                    value={bookingDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                />
                            </div>

                            <div className="form-section">
                                <label>Available Slots</label>
                                <div className="slots-grid">
                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            className={`slot-chip ${bookingTime === time ? 'active' : ''}`}
                                            onClick={() => setBookingTime(time)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={confirmBooking} disabled={!bookingTime}>
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHAT MODAL */}
            {selectedChatDoctor && (
                <div className="modal-overlay" onClick={() => setSelectedChatDoctor(null)}>
                    <div className="chat-modal" onClick={e => e.stopPropagation()} style={{ width: '400px', height: '600px', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div className="modal-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold' }}>
                                    {selectedChatDoctor.name[4]}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedChatDoctor.name}</h3>
                                    <span style={{ fontSize: '0.8rem', color: '#10B981' }}>● Online</span>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedChatDoctor(null)}>×</button>
                        </div>

                        {/* Messages Area */}
                        <div className="chat-body" style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {chatMessages.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '50%', color: '#9CA3AF', fontSize: '0.9rem' }}>
                                    Start a conversation with {selectedChatDoctor.name}
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => (
                                    <div key={idx} style={{
                                        maxWidth: '80%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.sender === 'user' ? '#4F46E5' : 'white',
                                        color: msg.sender === 'user' ? 'white' : '#1F2937',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        border: msg.sender === 'user' ? 'none' : '1px solid #E5E7EB'
                                    }}>
                                        {msg.content}
                                        <div style={{ fontSize: '0.65rem', marginTop: '4px', opacity: 0.8, textAlign: 'right' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="chat-footer" style={{ padding: '15px', borderTop: '1px solid #eee', background: 'white', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #D1D5DB', outline: 'none' }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                style={{ background: '#4F46E5', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DoctorsPage;
