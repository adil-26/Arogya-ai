'use client';
import React, { useState } from 'react';
import { ArrowLeft, FileText, Calendar, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus, Eye, BarChart3, Table, FileSearch } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

const statusColors = {
    normal: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: TrendingDown },
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: TrendingUp },
    critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: AlertCircle }
};

export default function ReportViewer({ report, onBack }) {
    const [activeTab, setActiveTab] = useState('summary');
    const [showRawText, setShowRawText] = useState(false);

    const analysis = report.analysisJson || {};
    const results = analysis.results || report.results || [];
    const summary = analysis.summary || analysis.interpretation || 'No AI summary available yet.';

    const tabs = [
        { id: 'summary', label: 'Summary', icon: FileSearch },
        { id: 'details', label: 'Details', icon: Table },
        { id: 'graphs', label: 'Trends', icon: BarChart3 }
    ];

    const getStatus = (result) => {
        if (!result.status) {
            if (result.flag === 'H' || result.flag === 'high') return 'high';
            if (result.flag === 'L' || result.flag === 'low') return 'low';
            return 'normal';
        }
        return result.status.toLowerCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Group results by category if available
    const groupedResults = results.reduce((acc, result) => {
        const category = result.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(result);
        return acc;
    }, {});

    return (
        <AppShell>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                                    {report.title || 'Health Report'}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(report.reportDate)}
                                    </span>
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-md text-xs font-semibold">
                                        {report.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="flex gap-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === tab.id
                                            ? 'border-teal-600 text-teal-600 bg-teal-50/50'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                        <div className="space-y-6">
                            {/* AI Summary Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileSearch className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 mb-2">AI Analysis Summary</h3>
                                        <p className="text-slate-600 leading-relaxed">{summary}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Key Findings */}
                            {results.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-4">Key Findings</h3>
                                    <div className="grid gap-3">
                                        {results.filter(r => getStatus(r) !== 'normal').slice(0, 5).map((result, i) => {
                                            const status = getStatus(result);
                                            const StatusIcon = statusColors[status]?.icon || CheckCircle;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex items-center gap-3 p-4 rounded-xl ${statusColors[status]?.bg} border ${statusColors[status]?.border}`}
                                                >
                                                    <StatusIcon className={`w-5 h-5 ${statusColors[status]?.text}`} />
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-slate-800">{result.name || result.testName}</span>
                                                        <span className="mx-2 text-slate-400">•</span>
                                                        <span className={`font-bold ${statusColors[status]?.text}`}>
                                                            {result.value} {result.unit}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-semibold uppercase ${statusColors[status]?.text}`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {results.filter(r => getStatus(r) !== 'normal').length === 0 && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="font-semibold text-green-700">All values within normal range</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Raw Text Toggle */}
                            {report.rawOcrText && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => setShowRawText(!showRawText)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Eye className="w-5 h-5 text-slate-500" />
                                            <span className="font-semibold text-slate-700">View Raw OCR Text</span>
                                        </div>
                                        <span className="text-sm text-slate-500">{showRawText ? 'Hide' : 'Show'}</span>
                                    </button>
                                    {showRawText && (
                                        <div className="px-6 pb-6">
                                            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-sm overflow-x-auto font-mono whitespace-pre-wrap">
                                                {report.rawOcrText}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {Object.entries(groupedResults).length > 0 ? (
                                Object.entries(groupedResults).map(([category, categoryResults]) => (
                                    <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                            <h3 className="font-bold text-slate-800">{category}</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-100">
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Test Name</th>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Result</th>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Reference</th>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categoryResults.map((result, i) => {
                                                        const status = getStatus(result);
                                                        const StatusIcon = statusColors[status]?.icon || Minus;
                                                        return (
                                                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                                    {result.name || result.testName}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="font-bold text-slate-800">{result.value}</span>
                                                                    <span className="text-slate-500 ml-1">{result.unit}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
                                                                    {result.referenceRange || result.normalRange || '-'}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status]?.bg} ${statusColors[status]?.text}`}>
                                                                        <StatusIcon className="w-3 h-3" />
                                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                    <Table className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No detailed results available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Graphs Tab */}
                    {activeTab === 'graphs' && (
                        <div className="space-y-6">
                            {results.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-6">Test Results Overview</h3>
                                    <div className="space-y-4">
                                        {results.slice(0, 10).map((result, i) => {
                                            const status = getStatus(result);
                                            const value = parseFloat(result.value) || 0;
                                            const maxValue = value * 1.5; // Approximate max for visualization
                                            const percentage = Math.min((value / maxValue) * 100, 100);

                                            return (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-slate-700 text-sm">
                                                            {result.name || result.testName}
                                                        </span>
                                                        <span className={`font-bold text-sm ${statusColors[status]?.text}`}>
                                                            {result.value} {result.unit}
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${status === 'normal' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                                                    status === 'high' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                                                        status === 'low' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                                                            'bg-gradient-to-r from-amber-400 to-amber-500'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    {result.referenceRange && (
                                                        <p className="text-xs text-slate-400">Reference: {result.referenceRange}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No trend data available yet</p>
                                    <p className="text-slate-400 text-sm mt-1">Upload more reports to see trends over time</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
