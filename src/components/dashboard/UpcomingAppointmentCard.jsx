import React from 'react';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import './UpcomingAppointmentCard.css';

const UpcomingAppointmentCard = ({ appointment, onViewProfile }) => {
    if (!appointment) return null;

    return (
        <div className="upcoming-appointment-card">
            <div className="card-header">
                <h4>Next Appointment</h4>
                <div className="status-badge">{appointment.status || 'Scheduled'}</div>
            </div>

            <div className="doctor-info-row">
                <div className="doc-avatar">
                    <User size={24} />
                </div>
                <div className="doc-details">
                    <h5>{appointment.doctorName}</h5>
                    <p>{appointment.specialty}</p>
                </div>
            </div>

            <div className="schedule-info">
                <div className="schedule-item">
                    <Calendar size={16} />
                    <span>{appointment.date}</span>
                </div>
                <div className="schedule-item">
                    <Clock size={16} />
                    <span>{appointment.time}</span>
                </div>
            </div>

            <button className="btn-view-profile" onClick={onViewProfile}>
                View Doctor Profile <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default UpcomingAppointmentCard;
