import React from 'react';
import { Activity, Heart, Thermometer, Droplets } from 'lucide-react';
import './HealthMetricCard.css';

const getIcon = (type) => {
    switch (type) {
        case 'heart': return <Heart size={24} />;
        case 'temp': return <Thermometer size={24} />;
        case 'sugar': return <Droplets size={24} />;
        default: return <Activity size={24} />;
    }
};

const HealthMetricCard = ({ title, value, unit, type, status = 'normal', trend, onClick }) => {
    return (
        <div className={`health-metric-card status-${status} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
            <div className="icon-wrapper">
                {getIcon(type)}
            </div>
            <div className="metric-info">
                <h3 className="metric-title">{title}</h3>
                <div className="metric-value-group">
                    <span className="metric-value">{value}</span>
                    <span className="metric-unit">{unit}</span>
                </div>
                {trend && <span className={`metric-trend ${trend.includes('+') ? 'up' : 'down'}`}>{trend}</span>}
            </div>
        </div>
    );
};

export default HealthMetricCard;
