'use client';
import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const statusConfig = {
    processing: { icon: Loader, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Processing' },
    ocr_complete: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'OCR Done' },
    analyzing: { icon: Loader, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Analyzing' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Completed' },
    failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' }
};

const typeColors = {
    'Blood Work': 'bg-red-100 text-red-700',
    'MRI': 'bg-purple-100 text-purple-700',
    'CT Scan': 'bg-blue-100 text-blue-700',
    'X-Ray': 'bg-gray-100 text-gray-700',
    'default': 'bg-slate-100 text-slate-700'
};

export default function ReportCard({ report, onClick }) {
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

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {report.title || 'Untitled Report'}
                    </h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
                            {report.type}
                        </span>
                        <span className="text-sm text-slate-500">
                            {formatDate(report.reportDate || report.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon className={`w-3 h-3 ${status.color} ${report.status === 'processing' || report.status === 'analyzing' ? 'animate-spin' : ''}`} />
                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                </div>
            </div>
        </div>
    );
}
