'use client';
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Loader, Activity, TrendingUp, Search, X } from 'lucide-react';
import ReportCard from '@/components/reports/ReportCard';
import ReportUploader from '@/components/reports/ReportUploader';
import ReportViewer from '@/components/reports/ReportViewer';
import AppShell from '@/components/layout/AppShell';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewingReport, setViewingReport] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/reports/list');
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadComplete = async (reportData) => {
        setShowUploadModal(false);
        await fetchReports();
        triggerProcessing(reportData.id, reportData.fileUrl, reportData.type);
    };

    const triggerProcessing = async (reportId, fileUrl, reportType) => {
        try {
            const ocrRes = await fetch('/api/reports/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, fileUrl })
            });

            if (!ocrRes.ok) {
                await fetchReports();
                return;
            }

            const ocrData = await ocrRes.json();

            await fetch('/api/reports/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId,
                    text: ocrData.text,
                    category: reportType || 'Blood Work'
                })
            });

            await fetchReports();
        } catch (error) {
            console.error('Processing error:', error);
            await fetchReports();
        }
    };

    const handleDelete = async (reportId) => {
        try {
            const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== reportId));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const viewReport = async (report) => {
        try {
            const res = await fetch(`/api/reports/${report.id}`);
            if (res.ok) {
                const fullReport = await res.json();
                setViewingReport(fullReport);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    };

    if (viewingReport) {
        return (
            <ReportViewer
                report={viewingReport}
                onBack={() => setViewingReport(null)}
            />
        );
    }

    // Stats & Filtering
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'completed').length;
    const processingReports = reports.filter(r => r.status !== 'completed' && r.status !== 'failed').length;
    const hasReports = reports.length > 0;

    const filteredReports = reports.filter(r =>
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppShell>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24 sm:pb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                            Health Reports
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm sm:text-base">
                            Upload, analyze, and track your medical reports
                        </p>
                    </div>

                    {/* Stats - Horizontally Scrollable */}
                    {hasReports && (
                        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {/* Total */}
                                <div className="flex-shrink-0 w-32 sm:w-auto sm:flex-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase">Total</p>
                                            <p className="text-2xl font-extrabold text-slate-800">{totalReports}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Analyzed */}
                                <div className="flex-shrink-0 w-32 sm:w-auto sm:flex-1 bg-white rounded-2xl p-4 sm:p-5 border border-green-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase">Analyzed</p>
                                            <p className="text-2xl font-extrabold text-green-600">{completedReports}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Processing */}
                                <div className="flex-shrink-0 w-32 sm:w-auto sm:flex-1 bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                                            <Activity className="w-6 h-6 text-amber-600 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase">Processing</p>
                                            <p className="text-2xl font-extrabold text-amber-600">{processingReports}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search & Desktop Upload Button */}
                    {hasReports && (
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/25 transition-all font-semibold whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                Upload
                            </button>
                        </div>
                    )}

                    {/* Main Content */}
                    {loading ? (
                        /* Skeleton Loading */
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-slate-200 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-slate-200 rounded w-48 mb-3"></div>
                                            <div className="h-4 bg-slate-100 rounded w-32"></div>
                                        </div>
                                        <div className="h-8 bg-slate-100 rounded-full w-24"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !hasReports ? (
                        /* Empty State */
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col items-center justify-center text-center py-20 px-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-teal-100">
                                    <FileText className="w-12 h-12 text-teal-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">No Reports Yet</h3>
                                <p className="text-slate-500 max-w-md mb-10 leading-relaxed">
                                    Upload your first medical report and our AI will automatically
                                    extract and analyze the data for you.
                                </p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-2xl hover:shadow-teal-500/30 transition-all font-bold text-lg"
                                >
                                    <Plus className="w-6 h-6" />
                                    Upload Your First Report
                                </button>
                            </div>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        /* No Search Results */
                        <div className="text-center py-16">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No reports matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        /* Reports List */
                        <div className="space-y-3">
                            {filteredReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onClick={() => viewReport(report)}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating Action Button (Mobile) */}
                {hasReports && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full shadow-xl shadow-teal-500/30 flex items-center justify-center z-40 hover:scale-110 transition-transform"
                    >
                        <Plus className="w-7 h-7" />
                    </button>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
                        <ReportUploader
                            onUploadComplete={handleUploadComplete}
                            onCancel={() => setShowUploadModal(false)}
                        />
                    </div>
                </div>
            )}
        </AppShell>
    );
}
