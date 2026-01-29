'use client';
import React from 'react';

const ReportIcon = ({ type = 'default', className = '' }) => {
    const icons = {
        'Blood Work': (
            <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                </defs>
                {/* Blood drop shape */}
                <path d="M50 10 C35 30, 25 45, 25 60 C25 75, 37 90, 50 90 C63 90, 75 75, 75 60 C75 45, 65 30, 50 10 Z"
                    fill="url(#bloodGrad)" stroke="#991B1B" strokeWidth="2" />
                {/* Highlight */}
                <ellipse cx="42" cy="35" rx="8" ry="12" fill="white" opacity="0.3" />
                {/* Cross symbol */}
                <rect x="46" y="55" width="8" height="20" rx="2" fill="white" opacity="0.9" />
                <rect x="40" y="61" width="20" height="8" rx="2" fill="white" opacity="0.9" />
            </svg>
        ),
        'MRI': (
            <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="mriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                </defs>
                {/* Brain outline */}
                <path d="M50 20 C40 20, 30 25, 25 35 C20 45, 20 55, 25 65 C30 75, 40 80, 50 80 C60 80, 70 75, 75 65 C80 55, 80 45, 75 35 C70 25, 60 20, 50 20 Z"
                    fill="url(#mriGrad)" stroke="#6D28D9" strokeWidth="2" />
                {/* Brain details */}
                <path d="M35 40 Q40 35, 45 40 T55 40 Q60 35, 65 40" stroke="white" strokeWidth="2.5" fill="none" opacity="0.6" />
                <path d="M35 55 Q40 50, 45 55 T55 55 Q60 50, 65 55" stroke="white" strokeWidth="2.5" fill="none" opacity="0.6" />
                <circle cx="42" cy="48" r="3" fill="white" opacity="0.8" />
                <circle cx="58" cy="48" r="3" fill="white" opacity="0.8" />
            </svg>
        ),
        'CT Scan': (
            <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ctGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                </defs>
                {/* Scanner ring */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="url(#ctGrad)" strokeWidth="8" />
                <circle cx="50" cy="50" r="25" fill="url(#ctGrad)" opacity="0.2" />
                {/* Scan lines */}
                <line x1="50" y1="25" x2="50" y2="75" stroke="white" strokeWidth="3" opacity="0.7" />
                <line x1="25" y1="50" x2="75" y2="50" stroke="white" strokeWidth="3" opacity="0.7" />
                <circle cx="50" cy="50" r="5" fill="white" />
            </svg>
        ),
        'X-Ray': (
            <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="xrayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#64748B" />
                        <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                </defs>
                {/* Bone structure */}
                <rect x="42" y="20" width="16" height="60" rx="8" fill="url(#xrayGrad)" />
                <circle cx="50" cy="25" r="8" fill="url(#xrayGrad)" />
                <circle cx="50" cy="75" r="8" fill="url(#xrayGrad)" />
                {/* Highlights */}
                <rect x="45" y="30" width="10" height="40" rx="5" fill="white" opacity="0.2" />
            </svg>
        ),
        'Urine Test': (
            <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="urineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                </defs>
                {/* Test tube */}
                <rect x="35" y="25" width="30" height="55" rx="4" fill="url(#urineGrad)" stroke="#B45309" strokeWidth="2" />
                <rect x="35" y="50" width="30" height="30" fill="#FEF3C7" opacity="0.3" />
                {/* Cap */}
                <rect x="32" y="20" width="36" height="8" rx="2" fill="#92400E" />
                {/* Measurements */}
                <line x1="37" y1="40" x2="42" y2="40" stroke="white" strokeWidth="1.5" opacity="0.6" />
                <line x1="37" y1="50" x2="42" y2="50" stroke="white" strokeWidth="1.5" opacity="0.6" />
                <line x1="37" y1="60" x2="42" y2="60" stroke="white" strokeWidth="1.5" opacity="0.6" />
            </svg>
        ),
        'ECG': (
            <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#DB2777" />
                    </linearGradient>
                </defs>
                {/* Heart shape */}
                <path d="M50 75 L30 55 Q25 45, 30 35 Q35 25, 45 30 Q50 35, 50 35 Q50 35, 55 30 Q65 25, 70 35 Q75 45, 70 55 Z"
                    fill="url(#ecgGrad)" stroke="#BE185D" strokeWidth="2" />
                {/* ECG line */}
                <path d="M20 50 L30 50 L35 40 L40 60 L45 50 L80 50" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
        ),
        'default': (
            <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#0D9488" />
                    </linearGradient>
                </defs>
                {/* Document */}
                <rect x="25" y="15" width="50" height="70" rx="4" fill="url(#defaultGrad)" stroke="#0F766E" strokeWidth="2" />
                <rect x="25" y="15" width="50" height="15" fill="#0F766E" opacity="0.3" />
                {/* Lines */}
                <line x1="35" y1="40" x2="65" y2="40" stroke="white" strokeWidth="2.5" opacity="0.7" />
                <line x1="35" y1="50" x2="65" y2="50" stroke="white" strokeWidth="2.5" opacity="0.7" />
                <line x1="35" y1="60" x2="55" y2="60" stroke="white" strokeWidth="2.5" opacity="0.7" />
                {/* Checkmark */}
                <path d="M55 70 L60 75 L70 60" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    };

    return icons[type] || icons['default'];
};

export default ReportIcon;
