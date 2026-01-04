import React from 'react';
import { User, Droplet, Ruler, Weight } from 'lucide-react';
import './PatientProfileCard.css';

const PatientProfileCard = ({ patient }) => {
    if (!patient) return null;

    return (
        <div className="patient-profile-card">
            <div className="profile-header">
                <div className="avatar-large">
                    {patient.avatar ? <img src={patient.avatar} alt={patient.name} /> : <User size={40} />}
                </div>
                <div className="profile-info">
                    <h2 className="patient-name">{patient.name}</h2>
                    <p className="patient-meta">{patient.age} Years • {patient.gender}</p>
                </div>
                <button className="btn-edit">Edit Profile</button>
            </div>

            <div className="profile-stats">
                <div className="stat-item">
                    <Droplet size={16} className="stat-icon" />
                    <span className="stat-label">Blood</span>
                    <span className="stat-value">{patient.bloodGroup}</span>
                </div>
                <div className="stat-item">
                    <Ruler size={16} className="stat-icon" />
                    <span className="stat-label">Height</span>
                    <span className="stat-value">{patient.height}</span>
                </div>
                <div className="stat-item">
                    <Weight size={16} className="stat-icon" />
                    <span className="stat-label">Weight</span>
                    <span className="stat-value">{patient.weight}</span>
                </div>
            </div>
        </div>
    );
};

export default PatientProfileCard;
