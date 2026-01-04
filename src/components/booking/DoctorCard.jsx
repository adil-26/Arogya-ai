import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import './DoctorCard.css';

const DoctorCard = ({ doctor, onBook, onChat }) => {
    return (
        <div className="doctor-card">
            <div className="doctor-header">
                <div className="doctor-avatar">
                    {doctor.imageUrl ? (
                        <img src={doctor.imageUrl} alt={doctor.name} />
                    ) : (
                        <span className="avatar-placeholder">{doctor.name.charAt(0)}</span>
                    )}
                </div>
                <div className="doctor-info">
                    <h3 className="doctor-name">{doctor.name}</h3>
                    <p className="doctor-specialty">{doctor.specialty}</p>
                    <div className="doctor-rating">
                        <Star size={14} fill="#FFB74D" color="#FFB74D" />
                        <span>{doctor.rating} ({doctor.reviewCount} reviews)</span>
                    </div>
                </div>
            </div>

            <div className="doctor-details">
                <div className="detail-row">
                    <Clock size={16} />
                    <span>{doctor.experience} experience</span>
                </div>
                <div className="detail-row">
                    <MapPin size={16} />
                    <span>{doctor.location}</span>
                </div>
            </div>

            <div className="doctor-actions">
                <div className="consultation-fee">
                    <span className="fee-label">Consultation</span>
                    <span className="fee-amount">₹{doctor.fee}</span>
                </div>
                <button className="btn-book" onClick={() => onBook(doctor)} style={{ flex: 1 }}>
                    Book Now
                </button>
                <button
                    className="btn-chat"
                    onClick={() => onChat(doctor)}
                    style={{
                        marginLeft: '10px',
                        padding: '10px',
                        border: '1px solid #E0E7FF',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#4F46E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Message Doctor"
                >
                    💬
                </button>
            </div>
        </div>
    );
};

export default DoctorCard;
