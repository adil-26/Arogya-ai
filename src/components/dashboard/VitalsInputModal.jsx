import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import './VitalsInputModal.css';

const VitalsInputModal = ({ metric, onClose, onSave }) => {
    const [value, setValue] = useState('');

    const handleSubmit = () => {
        if (value) {
            onSave(metric.id, value);
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
                            type="text"
                            placeholder={`Enter ${metric?.title}`}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoFocus
                        />
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
