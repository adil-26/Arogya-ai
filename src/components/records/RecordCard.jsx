import React from 'react';
import { FileText, Download, Eye, Calendar, User } from 'lucide-react';
import './RecordCard.css';

const RecordCard = ({ record }) => {
    return (
        <div className="record-card">
            <div className={`file-icon-wrapper ${record.type.toLowerCase().replace(' ', '-')}`}>
                <FileText size={24} />
            </div>

            <div className="record-info">
                <h3 className="record-name">{record.name}</h3>
                <div className="record-meta">
                    <span className="meta-item">
                        <Calendar size={14} /> {new Date(record.date).toLocaleDateString('en-GB')}
                    </span>
                    <span className="meta-item">
                        <User size={14} /> {record.doctor}
                    </span>
                </div>
                <div className="record-tag">{record.type}</div>
            </div>

            <div className="record-actions">
                <button className="btn-action" title="View">
                    <Eye size={18} />
                </button>
                <button className="btn-action" title="Download">
                    <Download size={18} />
                </button>
            </div>
        </div>
    );
};

export default RecordCard;
