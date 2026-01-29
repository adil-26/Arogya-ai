'use client';
import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Trash2, Activity, ChevronRight, RefreshCcw, Info, Sparkles, TrendingUp, Brain } from 'lucide-react';
import ReportIcon from './ReportIcon';

const statusConfig = {
    processing: {
        icon: Activity,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        label: 'Analyzing',
        pulse: true,
        gradient: 'from-amber-500 to-orange-500'
    },
    ocr_complete: {
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        label: 'Reading',
        pulse: true,
        gradient: 'from-blue-500 to-cyan-500'
    },
    completed: {
        icon: CheckCircle,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        label: 'Ready',
        pulse: false,
        gradient: 'from-teal-500 to-emerald-500'
    },
    failed: {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: 'Failed',
        pulse: false,
        gradient: 'from-red-500 to-rose-500'
    }
};

const typeMeta = {
    'Blood Work': { icon: '🩸', color: '#EF4444', gradient: 'from-red-50 to-rose-50' },
    'MRI': { icon: '🧠', color: '#8B5CF6', gradient: 'from-purple-50 to-violet-50' },
    'CT Scan': { icon: '📊', color: '#3B82F6', gradient: 'from-blue-50 to-cyan-50' },
    'X-Ray': { icon: '🦴', color: '#64748B', gradient: 'from-slate-50 to-gray-50' },
    'Urine Test': { icon: '🧪', color: '#F59E0B', gradient: 'from-amber-50 to-yellow-50' },
    'ECG': { icon: '💓', color: '#EC4899', gradient: 'from-pink-50 to-rose-50' },
    'default': { icon: '📄', color: '#14B8A6', gradient: 'from-teal-50 to-cyan-50' }
};

export default function ReportCard({ report, onClick, onDelete, onRetry }) {
    const status = statusConfig[report.status] || statusConfig.processing;
    const meta = typeMeta[report.type] || typeMeta.default;
    const StatusIcon = status.icon;

    const isProcessing = report.status === 'processing' || report.status === 'ocr_complete';

    // Format date: "Jan 29, 2026"
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

    const handleRetry = (e) => {
        e.stopPropagation();
        onRetry();
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
            {/* Left Side: Icon + Title + Meta */}
            <div className="flex items-center gap-4">
                {/* Minimal Icon Box */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isProcessing ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                    {isProcessing ? <Activity className="w-5 h-5 animate-pulse" /> : <ReportIcon type={report.type} className="w-5 h-5" />}
                </div>

                <div>
                    <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                        {report.title || 'Untitled Report'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {report.type}
                        </span>
                        <span className="text-xs text-slate-400">
                            {formatDate(report.reportDate || report.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Side: Status + Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
                {/* Status Badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${report.status === 'completed' ? 'bg-teal-50 text-teal-700' :
                        report.status === 'failed' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                    }`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{status.label}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Delete Action (Hidden by default, visible on hover) */}
                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Report"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Chevron / View Action */}
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 transition-colors" />
                </div>
            </div>

            {/* Retry Overlay if Failed */}
            {report.status === 'failed' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center sm:justify-end px-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm hover:bg-red-50"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
