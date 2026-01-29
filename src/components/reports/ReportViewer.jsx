'use client';
import React, { useState } from 'react';
import { ArrowLeft, FileText, Activity, BarChart3, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ReportViewer({ report, onBack }) {
    const [activeTab, setActiveTab] = useState('summary');

    // Parse analysis JSON
    const analysis = report.analysisJson || {};
    const results = analysis.results || report.results || [];
    const metadata = analysis.metadata || {};

    const getStatusIcon = (status) => {
        if (status === 'High') return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (status === 'Low') return <TrendingDown className="w-4 h-4 text-blue-500" />;
        return <Minus className="w-4 h-4 text-green-500" />;
    };

    const getStatusColor = (status) => {
        if (status === 'High') return 'bg-red-50 border-red-200 text-red-700';
        if (status === 'Low') return 'bg-blue-50 border-blue-200 text-blue-700';
        return 'bg-green-50 border-green-200 text-green-700';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calculate summary stats
    const normalCount = results.filter(r => r.status === 'Normal').length;
    const abnormalCount = results.filter(r => r.status === 'High' || r.status === 'Low').length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>

                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-slate-800">
                                {report.title || 'Health Report'}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {report.type} • {formatDate(report.reportDate)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {report.status === 'completed' ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Analysis Complete
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    {report.status}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4">
                        {['summary', 'details', 'graph'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {tab === 'summary' && <FileText className="w-4 h-4 inline mr-1" />}
                                {tab === 'details' && <Activity className="w-4 h-4 inline mr-1" />}
                                {tab === 'graph' && <BarChart3 className="w-4 h-4 inline mr-1" />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {activeTab === 'summary' && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <p className="text-sm text-slate-500">Total Parameters</p>
                                <p className="text-2xl font-bold text-slate-800">{results.length}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50">
                                <p className="text-sm text-green-600">Normal</p>
                                <p className="text-2xl font-bold text-green-700">{normalCount}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50">
                                <p className="text-sm text-red-600">Abnormal</p>
                                <p className="text-2xl font-bold text-red-700">{abnormalCount}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <p className="text-sm text-slate-500">Report Date</p>
                                <p className="text-lg font-semibold text-slate-800">{formatDate(report.reportDate)}</p>
                            </div>
                        </div>

                        {/* AI Summary */}
                        {analysis.summary && (
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    AI Analysis Summary
                                </h3>
                                <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
                            </div>
                        )}

                        {/* Key Findings */}
                        {abnormalCount > 0 && (
                            <div className="bg-white rounded-xl p-6 border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Findings</h3>
                                <div className="space-y-3">
                                    {results.filter(r => r.status !== 'Normal').map((result, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(result.status)}
                                                    <span className="font-medium">{result.parameter}</span>
                                                </div>
                                                <span className="font-bold">{result.value} {result.unit}</span>
                                            </div>
                                            {result.refMin && result.refMax && (
                                                <p className="text-sm mt-1 opacity-75">
                                                    Reference: {result.refMin} - {result.refMax} {result.unit}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Parameter</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Value</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Reference Range</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{result.parameter}</td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {result.value} <span className="text-slate-400">{result.unit}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {result.refMin && result.refMax ? `${result.refMin} - ${result.refMax}` : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                                                {getStatusIcon(result.status)}
                                                {result.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                                            No test results available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'graph' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">Test Results Visualization</h3>

                        {results.length > 0 ? (
                            <div className="space-y-4">
                                {results.slice(0, 10).map((result, idx) => {
                                    // Calculate percentage within reference range
                                    const min = result.refMin || 0;
                                    const max = result.refMax || result.value * 1.5;
                                    const range = max - min;
                                    let percentage = ((result.value - min) / range) * 100;
                                    percentage = Math.max(0, Math.min(100, percentage));

                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-slate-700">{result.parameter}</span>
                                                <span className={`font-semibold ${result.status === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {result.value} {result.unit}
                                                </span>
                                            </div>
                                            <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
                                                {/* Reference range background */}
                                                <div className="absolute inset-y-0 left-0 right-0 bg-green-100" style={{ left: '20%', right: '20%' }}></div>

                                                {/* Value indicator */}
                                                <div
                                                    className={`absolute top-1 bottom-1 w-2 rounded-full transition-all ${result.status === 'Normal' ? 'bg-green-500' : result.status === 'High' ? 'bg-red-500' : 'bg-blue-500'
                                                        }`}
                                                    style={{ left: `calc(${percentage}% - 4px)` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>{min}</span>
                                                <span>Normal Range</span>
                                                <span>{max}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No data available for visualization</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
