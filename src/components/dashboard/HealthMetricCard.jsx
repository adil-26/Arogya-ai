import React from 'react';
import { Activity, Heart, Thermometer, Droplets, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { HeartbeatPulse, BPPulse, SugarAnimation, CriticalGlow } from '../animations/VitalAnimations';
import './HealthMetricCard.css';

const getIcon = (type, status) => {
    switch (type) {
        case 'heart': case 'hr':
            return <HeartbeatPulse status={status} size={40} />;
        case 'temp': return <Thermometer size={24} />;
        case 'sugar': return <SugarAnimation status={status} />;
        case 'bp': return <HeartbeatPulse status={status} size={40} />;
        default: return <Activity size={24} />;
    }
};

// Calculate health status based on value and type
const getHealthStatus = (type, value) => {
    if (!value || value === '--' || value === '--/--') return { status: 'default', insight: 'No data yet', action: null };

    switch (type) {
        case 'bp': {
            const parts = value.split('/');
            if (parts.length !== 2) return { status: 'default', insight: 'Enter in format 120/80', action: null };
            const sys = parseInt(parts[0]);
            const dia = parseInt(parts[1]);

            if (sys < 90 || dia < 60) return {
                status: 'low',
                insight: 'Blood pressure is low',
                action: 'Stay hydrated, rest well'
            };
            if (sys >= 180 || dia >= 120) return {
                status: 'critical',
                insight: 'Hypertensive crisis!',
                action: 'Consult doctor immediately'
            };
            if (sys >= 140 || dia >= 90) return {
                status: 'high',
                insight: 'Blood pressure is elevated',
                action: 'Monitor closely, reduce salt'
            };
            if (sys >= 130 || dia >= 80) return {
                status: 'warning',
                insight: 'Slightly elevated',
                action: null
            };
            return { status: 'normal', insight: 'Blood pressure is normal', action: null };
        }

        case 'hr': {
            const hr = parseInt(value);
            if (hr < 50) return {
                status: 'low',
                insight: 'Heart rate is quite low',
                action: 'Consider consulting doctor'
            };
            if (hr > 120) return {
                status: 'high',
                insight: 'Heart rate is elevated',
                action: 'Rest and check again'
            };
            if (hr > 100) return {
                status: 'warning',
                insight: 'Slightly elevated heart rate',
                action: null
            };
            if (hr < 60) return {
                status: 'low',
                insight: 'Heart rate is on lower side',
                action: null
            };
            return { status: 'normal', insight: 'Heart rate is healthy', action: null };
        }

        case 'sugar': {
            const sugar = parseInt(value);
            if (sugar < 70) return {
                status: 'low',
                insight: 'Blood sugar is low (Hypoglycemia)',
                action: 'Eat something sweet now'
            };
            if (sugar > 300) return {
                status: 'critical',
                insight: 'Blood sugar is critically high!',
                action: 'Consult doctor immediately'
            };
            if (sugar > 180) return {
                status: 'high',
                insight: 'Blood sugar is significantly high',
                action: 'Consult doctor soon'
            };
            if (sugar > 140) return {
                status: 'warning',
                insight: 'Blood sugar is above normal',
                action: 'Monitor your diet'
            };
            return { status: 'normal', insight: 'Blood sugar is in healthy range', action: null };
        }

        case 'bmi': {
            const bmi = parseFloat(value);
            if (bmi < 16) return {
                status: 'critical',
                insight: 'Severely underweight',
                action: 'Consult nutritionist'
            };
            if (bmi < 18.5) return {
                status: 'warning',
                insight: 'Slightly underweight',
                action: null
            };
            if (bmi >= 30) return {
                status: 'high',
                insight: 'BMI indicates obesity',
                action: 'Consider lifestyle changes'
            };
            if (bmi >= 25) return {
                status: 'warning',
                insight: 'BMI indicates overweight',
                action: null
            };
            return { status: 'normal', insight: 'BMI is in healthy range', action: null };
        }

        default:
            return { status: 'default', insight: '', action: null };
    }
};

const HealthMetricCard = ({ title, value, unit, type, id, trend, onClick }) => {
    const healthInfo = getHealthStatus(id || type, value);

    return (
        <div className={`health-metric-card status-${healthInfo.status} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
            {/* Status indicator */}
            <div className="status-indicator">
                {healthInfo.status === 'critical' && <AlertTriangle size={16} className="pulse-warning" />}
                {healthInfo.status === 'high' && <TrendingUp size={16} />}
                {healthInfo.status === 'low' && <TrendingDown size={16} />}
                {healthInfo.status === 'normal' && <CheckCircle size={14} />}
            </div>

            <div className="icon-wrapper">
                {getIcon(type || id, healthInfo.status)}
            </div>

            <div className="metric-info">
                <h3 className="metric-title">{title}</h3>
                <div className="metric-value-group">
                    <span className="metric-value">{value}</span>
                    <span className="metric-unit">{unit}</span>
                </div>

                {/* Smart insight line */}
                <div className="metric-insight">
                    {healthInfo.insight}
                </div>

                {/* Action suggestion for critical/high values */}
                {healthInfo.action && (
                    <div className="metric-action">
                        <AlertTriangle size={12} />
                        <span>{healthInfo.action}</span>
                    </div>
                )}

                {trend && <span className={`metric-trend ${trend.includes('+') ? 'up' : 'down'}`}>{trend}</span>}
            </div>
        </div>
    );
};

export default HealthMetricCard;
