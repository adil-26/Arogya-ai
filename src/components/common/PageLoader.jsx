
import React from 'react';
import './PageLoader.css';
import { Activity } from 'lucide-react';

const PageLoader = ({ message = "Loading your health data..." }) => {
    return (
        <div className="page-loader-container">
            <div className="loader-content">
                <div className="pulse-circle">
                    <Activity size={48} color="#0D9488" />
                </div>
                <p className="loader-text">{message}</p>
                <div className="loader-bar">
                    <div className="loader-progress"></div>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
