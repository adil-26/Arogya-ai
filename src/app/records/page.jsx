'use client';

import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PrescriptionManager from '../../components/prescriptions/PrescriptionManager';
import MedicationReminders from '../../components/medications/MedicationReminders';
import { FileText, Pill, FolderOpen } from 'lucide-react';
import './records.css';

export default function Records() {
    const [activeTab, setActiveTab] = useState('prescriptions');

    return (
        <AppShell>
            <div className="records-page">
                {/* Tab Navigation */}
                <div className="records-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        <FileText size={18} />
                        <span>Prescriptions</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'medications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('medications')}
                    >
                        <Pill size={18} />
                        <span>Medications</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <FolderOpen size={18} />
                        <span>Reports</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="records-content">
                    {activeTab === 'prescriptions' && <PrescriptionManager />}
                    {activeTab === 'medications' && <MedicationReminders />}
                    {activeTab === 'reports' && (
                        <div className="coming-soon">
                            <FolderOpen size={48} />
                            <h3>Health Reports</h3>
                            <p>Generate and download your health reports here. Coming soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
