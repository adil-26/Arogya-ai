'use client';
import React from 'react';
import { FileText, CheckCircle, AlertCircle, Trash2, Clock, Activity } from 'lucide-react';

const statusConfig = {
    processing: {
        icon: Activity,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        label: 'Processing',
        pulse: true
    },
    ocr_complete: {
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        label: 'Extracting',
        pulse: true
    },
    analyzing: {
        icon: Activity,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        label: 'Analyzing',
        pulse: true
    },
    completed: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        label: 'Ready',
        pulse: false
    },
    failed: {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: 'Failed',
        pulse: false
    }
};

const typeConfig = {
    'Blood Work': { color: 'bg-red-100 text-red-700', icon: '🩸' },
    'MRI': { color: 'bg-purple-100 text-purple-700', icon: '🧠' },
    'CT Scan': { color: 'bg-blue-100 text-blue-700', icon: '📊' },
    'X-Ray': { color: 'bg-slate-100 text-slate-700', icon: '🦴' },
    'Urine Test': { color: 'bg-yellow-100 text-yellow-700', icon: '🧪' },
    'ECG': { color: 'bg-pink-100 text-pink-700', icon: '💓' },
    'default': { color: 'bg-slate-100 text-slate-700', icon: '📄' }
};

export default function ReportCard({ report, onClick, onDelete }) {
    const status = statusConfig[report.status] || statusConfig.processing;
    const StatusIcon = status.icon;
    const typeStyle = typeConfig[report.type] || typeConfig.default;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('Delete this report?')) {
            onDelete(report.id);
        }
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border p-4 sm:p-5 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${status.pulse ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-green-500'
                } border-slate-200`}
        >
            {/* Pulse animation for processing */}
            {status.pulse && (
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent animate-pulse pointer-events-none" />
            )}

            <div className="flex items-center gap-3 sm:gap-4 relative">
                {/* Icon with Type Emoji */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                    <span className="text-xl sm:text-2xl">{typeStyle.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate group-hover:text-teal-600 transition-colors text-sm sm:text-base">
                        {report.title || 'Health Report'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${typeStyle.color}`}>
                            {report.type}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500">
                            {formatDate(report.reportDate || report.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${status.bg} border ${status.border}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${status.color} ${status.pulse ? 'animate-spin' : ''}`} />
                        <span className={`text-xs font-semibold ${status.color} hidden sm:inline`}>
                            {status.label}
                        </span>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={handleDelete}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Report"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
