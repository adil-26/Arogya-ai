'use client';

import React, { useState, useEffect } from 'react';
import { Pill, Plus, Edit2, Trash2, Bell, BellOff, Clock, Calendar, Check, X, Loader2, AlertCircle, Stethoscope, User } from 'lucide-react';
import './MedicationReminders.css';

const MedicationReminders = () => {
    const [myMedications, setMyMedications] = useState([]);
    const [doctorMedications, setDoctorMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMed, setEditingMed] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'mine', 'doctor'

    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        timing: [],
        instructions: '',
        reminderEnabled: true
    });

    const frequencyOptions = [
        'Once daily',
        'Twice daily',
        'Three times daily',
        'Every 8 hours',
        'Every 12 hours',
        'As needed',
        'Weekly'
    ];

    const timingOptions = [
        { id: 'morning', label: 'Morning', time: '08:00' },
        { id: 'afternoon', label: 'Afternoon', time: '14:00' },
        { id: 'evening', label: 'Evening', time: '20:00' },
        { id: 'bedtime', label: 'Bedtime', time: '22:00' }
    ];

    useEffect(() => {
        fetchAllMedications();
    }, []);

    const fetchAllMedications = async () => {
        try {
            // Fetch self-added medications
            const myRes = await fetch('/api/medications?active=true');
            if (myRes.ok) {
                const data = await myRes.json();
                setMyMedications(data.medications || []);
            }

            // Fetch doctor-prescribed medications
            const docRes = await fetch('/api/my-prescriptions');
            if (docRes.ok) {
                const data = await docRes.json();
                setDoctorMedications(data.medications || []);
            }
        } catch (error) {
            console.error('Failed to fetch medications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Combined and filtered medications
    const allMedications = [
        ...myMedications.map(m => ({ ...m, source: 'self' })),
        ...doctorMedications.map(m => ({ ...m, source: 'doctor' }))
    ];

    const filteredMedications = activeTab === 'all'
        ? allMedications
        : activeTab === 'mine'
            ? allMedications.filter(m => m.source === 'self')
            : allMedications.filter(m => m.source === 'doctor');

    const handleSubmit = async () => {
        if (!formData.name || !formData.dosage) {
            alert('Please provide medication name and dosage');
            return;
        }

        try {
            const method = editingMed ? 'PUT' : 'POST';
            const body = editingMed
                ? { ...formData, id: editingMed.id }
                : formData;

            const res = await fetch('/api/medications', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchAllMedications();
                closeModal();
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this medication?')) return;

        try {
            const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAllMedications();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const toggleReminder = async (med) => {
        try {
            await fetch('/api/medications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: med.id,
                    reminderEnabled: !med.reminderEnabled
                })
            });
            fetchMedications();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const openEdit = (med) => {
        setEditingMed(med);
        setFormData({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            timing: med.timing || [],
            instructions: med.instructions || '',
            reminderEnabled: med.reminderEnabled
        });
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingMed(null);
        setFormData({
            name: '',
            dosage: '',
            frequency: 'Once daily',
            timing: [],
            instructions: '',
            reminderEnabled: true
        });
    };

    const toggleTiming = (timingId) => {
        const current = formData.timing || [];
        if (current.includes(timingId)) {
            setFormData({ ...formData, timing: current.filter(t => t !== timingId) });
        } else {
            setFormData({ ...formData, timing: [...current, timingId] });
        }
    };

    // Get next dose time
    const getNextDose = (med) => {
        if (!med.timing || med.timing.length === 0) return 'As scheduled';
        const now = new Date();
        const hour = now.getHours();

        for (const t of med.timing) {
            const opt = timingOptions.find(o => o.id === t);
            if (opt) {
                const [h] = opt.time.split(':').map(Number);
                if (h > hour) return `Today at ${opt.label.toLowerCase()}`;
            }
        }
        return 'Tomorrow morning';
    };

    if (loading) {
        return (
            <div className="medication-loading">
                <Loader2 size={24} className="spin" />
                <p>Loading medications...</p>
            </div>
        );
    }

    return (
        <div className="medication-reminders">
            {/* Header */}
            <div className="med-header">
                <div>
                    <h2><Pill size={20} /> My Medications</h2>
                    <p className="subtitle">
                        {allMedications.length} medication(s)
                        {doctorMedications.length > 0 && ` • ${doctorMedications.length} from doctor`}
                    </p>
                </div>
                <button className="btn-add" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    <span>Add</span>
                </button>
            </div>

            {/* Filter Tabs */}
            {allMedications.length > 0 && (
                <div className="med-tabs">
                    <button
                        className={`med-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({allMedications.length})
                    </button>
                    <button
                        className={`med-tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >
                        <User size={14} /> Mine ({myMedications.length})
                    </button>
                    <button
                        className={`med-tab ${activeTab === 'doctor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('doctor')}
                    >
                        <Stethoscope size={14} /> Doctor ({doctorMedications.length})
                    </button>
                </div>
            )}

            {/* Medications List */}
            {filteredMedications.length === 0 ? (
                <div className="empty-state">
                    <Pill size={48} />
                    <h3>No medications {activeTab !== 'all' ? 'in this category' : 'added'}</h3>
                    <p>Add your medications to set up reminders</p>
                    <button className="btn-add" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Add Medication
                    </button>
                </div>
            ) : (
                <div className="medications-list">
                    {filteredMedications.map((med) => (
                        <div key={med.id} className={`medication-card ${!med.reminderEnabled && med.source === 'self' ? 'muted' : ''} ${med.source === 'doctor' ? 'doctor-rx' : ''}`}>
                            <div className={`med-icon ${med.source === 'doctor' ? 'doctor' : ''}`}>
                                {med.source === 'doctor' ? <Stethoscope size={20} /> : <Pill size={20} />}
                            </div>
                            <div className="med-content">
                                <div className="med-header-row">
                                    <h4>{med.name}</h4>
                                    <span className="dosage-badge">{med.dosage}</span>
                                    {med.source === 'doctor' && (
                                        <span className="doctor-badge">Rx</span>
                                    )}
                                </div>
                                <p className="frequency">
                                    <Clock size={12} /> {med.frequency}
                                </p>
                                {med.source === 'doctor' && med.doctorName && (
                                    <p className="doctor-name">
                                        <Stethoscope size={12} /> Dr. {med.doctorName}
                                    </p>
                                )}
                                {med.timing && med.timing.length > 0 && (
                                    <div className="timing-tags">
                                        {med.timing.map(t => (
                                            <span key={t} className="timing-tag">
                                                {timingOptions.find(o => o.id === t)?.label || t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {med.instructions && (
                                    <p className="instructions">
                                        <AlertCircle size={12} /> {med.instructions}
                                    </p>
                                )}
                                {med.source === 'self' && (
                                    <p className="next-dose">
                                        Next: {getNextDose(med)}
                                    </p>
                                )}
                            </div>
                            {med.source === 'self' && (
                                <div className="med-actions">
                                    <button
                                        className={`btn-reminder ${med.reminderEnabled ? 'active' : ''}`}
                                        onClick={() => toggleReminder(med)}
                                        title={med.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                                    >
                                        {med.reminderEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                                    </button>
                                    <button className="btn-edit" onClick={() => openEdit(med)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(med.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingMed ? 'Edit Medication' : 'Add Medication'}</h3>
                            <button onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group flex-2">
                                    <label>Medication Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Metformin"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dosage *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 500mg"
                                        value={formData.dosage}
                                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Frequency</label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    {frequencyOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Timing</label>
                                <div className="timing-grid">
                                    {timingOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={`timing-btn ${formData.timing?.includes(opt.id) ? 'selected' : ''}`}
                                            onClick={() => toggleTiming(opt.id)}
                                        >
                                            {formData.timing?.includes(opt.id) && <Check size={14} />}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Instructions</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Take with food"
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                />
                            </div>

                            <div className="form-group-inline">
                                <input
                                    type="checkbox"
                                    id="reminderEnabled"
                                    checked={formData.reminderEnabled}
                                    onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                                />
                                <label htmlFor="reminderEnabled">
                                    <Bell size={14} /> Enable reminders
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="btn-submit" onClick={handleSubmit}>
                                <Check size={16} />
                                {editingMed ? 'Update' : 'Add Medication'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicationReminders;
