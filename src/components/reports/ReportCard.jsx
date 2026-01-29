'use client';
import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Loader, Trash2 } from 'lucide-react';

const statusConfig = {
    processing: { icon: Loader, color: 'text-teal-500', bg: 'bg-teal-50', label: 'Processing' },
    ocr_complete: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Extracting' },
    analyzing: { icon: Loader, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Analyzing' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Ready' },
    failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' }
};

const typeColors = {
    'Blood Work': 'bg-red-100 text-red-700 border-red-200',
    'MRI': 'bg-purple-100 text-purple-700 border-purple-200',
    'CT Scan': 'bg-blue-100 text-blue-700 border-blue-200',
    'X-Ray': 'bg-slate-100 text-slate-700 border-slate-200',
    'Urine Test': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'ECG': 'bg-pink-100 text-pink-700 border-pink-200',
    'default': 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function ReportCard({ report, onClick, onDelete }) {
    const status = statusConfig[report.status] || statusConfig.processing;
    const StatusIcon = status.icon;
    const typeColor = typeColors[report.type] || typeColors.default;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this report?')) {
            onDelete(report.id);
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:border-teal-300 transition-all cursor-pointer group relative overflow-hidden"
            style={{ borderLeft: '4px solid #14b8a6' }}
        >
            {/* Status Indicator Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                    <FileText className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate group-hover:text-teal-600 transition-colors text-lg">
                        {report.title || 'Health Report'}
                    </h3>

                    <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeColor}`}>
                            {report.type}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                            {formatDate(report.reportDate || report.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Status Badge & Delete */}
                <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${status.color} ${(report.status === 'processing' || report.status === 'analyzing') ? 'animate-spin' : ''
                            }`} />
                        <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={handleDelete}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Report"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
