import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import './VitalsInputModal.css';

// Validation ranges for each vital type
const VITAL_RANGES = {
    bp: {
        label: 'Blood Pressure',
        placeholder: 'e.g., 120/80',
        pattern: /^\d{2,3}\/\d{2,3}$/,
        validate: (val) => {
            const parts = val.split('/');
            if (parts.length !== 2) return 'Enter as systolic/diastolic (e.g., 120/80)';
            const systolic = parseInt(parts[0]);
            const diastolic = parseInt(parts[1]);
            if (systolic < 70 || systolic > 250) return 'Systolic should be 70-250';
            if (diastolic < 40 || diastolic > 150) return 'Diastolic should be 40-150';
            if (systolic <= diastolic) return 'Systolic must be higher than diastolic';
            return null;
        },
        format: (val) => val,
        inputType: 'text'
    },
    hr: {
        label: 'Heart Rate',
        placeholder: 'e.g., 72',
        min: 30,
        max: 220,
        unit: 'bpm',
        validate: (val) => {
            const num = parseInt(val);
            if (isNaN(num)) return 'Enter a valid number';
            if (num < 30 || num > 220) return 'Heart rate should be 30-220 bpm';
            return null;
        },
        format: (val) => parseInt(val).toString(),
        inputType: 'number'
    },
    sugar: {
        label: 'Blood Sugar',
        placeholder: 'e.g., 100',
        min: 20,
        max: 600,
        unit: 'mg/dL',
        validate: (val) => {
            const num = parseInt(val);
            if (isNaN(num)) return 'Enter a valid number';
            if (num < 20 || num > 600) return 'Blood sugar should be 20-600 mg/dL';
            return null;
        },
        format: (val) => parseInt(val).toString(),
        inputType: 'number'
    },
    bmi: {
        label: 'BMI',
        placeholder: 'e.g., 22.5',
        min: 10,
        max: 60,
        validate: (val) => {
            const num = parseFloat(val);
            if (isNaN(num)) return 'Enter a valid number';
            if (num < 10 || num > 60) return 'BMI should be 10-60';
            return null;
        },
        format: (val) => parseFloat(val).toFixed(1),
        inputType: 'number'
    }
};

// Get health status based on value
const getHealthStatus = (id, value) => {
    if (!value || value === '--' || value === '--/--') return 'normal';

    switch (id) {
        case 'bp': {
            const parts = value.split('/');
            if (parts.length !== 2) return 'normal';
            const sys = parseInt(parts[0]);
            if (sys < 90) return 'low';
            if (sys >= 140) return 'high';
            return 'normal';
        }
        case 'hr': {
            const hr = parseInt(value);
            if (hr < 60) return 'low';
            if (hr > 100) return 'high';
            return 'normal';
        }
        case 'sugar': {
            const sugar = parseInt(value);
            if (sugar < 70) return 'low';
            if (sugar > 140) return 'high';
            return 'normal';
        }
        case 'bmi': {
            const bmi = parseFloat(value);
            if (bmi < 18.5) return 'low';
            if (bmi >= 25) return 'high';
            return 'normal';
        }
        default:
            return 'normal';
    }
};

const VitalsInputModal = ({ metric, onClose, onSave }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState(null);

    const config = VITAL_RANGES[metric?.id] || {};

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);

        // Clear error on typing
        if (error) setError(null);
    };

    const handleSubmit = () => {
        if (!value.trim()) {
            setError('Please enter a value');
            return;
        }

        // Validate
        const validationError = config.validate ? config.validate(value) : null;
        if (validationError) {
            setError(validationError);
            return;
        }

        // Format and save
        const formattedValue = config.format ? config.format(value) : value;
        const status = getHealthStatus(metric.id, formattedValue);

        onSave(metric.id, formattedValue, status);
    };

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="vitals-modal-overlay">
            <div className="vitals-modal-container">
                <div className="modal-header">
                    <h3>Update {metric?.title}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="input-group">
                        <label>New Reading ({metric?.unit})</label>
                        <input
                            type={config.inputType || 'text'}
                            placeholder={config.placeholder || `Enter ${metric?.title}`}
                            value={value}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            min={config.min}
                            max={config.max}
                            step={metric?.id === 'bmi' ? '0.1' : '1'}
                        />
                        {error && (
                            <div className="input-error">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="input-hint">
                            {metric?.id === 'bp' && 'Format: systolic/diastolic (e.g., 120/80)'}
                            {metric?.id === 'hr' && 'Normal range: 60-100 bpm'}
                            {metric?.id === 'sugar' && 'Fasting normal: 70-100 mg/dL'}
                            {metric?.id === 'bmi' && 'Normal range: 18.5-24.9'}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-save full-width" onClick={handleSubmit}>
                        <Save size={18} /> Save Reading
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VitalsInputModal;
