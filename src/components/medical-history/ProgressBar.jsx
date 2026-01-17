import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './HistoryWizard.css';

const ProgressBar = ({ progress, stepTitle }) => {
    return (
        <div className="progress-header">
            <div className="progress-info">
                <span className="step-title">{stepTitle}</span>
                <span className="progress-percentage">{Math.round(progress)}% Complete</span>
            </div>
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
