'use client';
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Activity, TrendingUp, Search, X, Filter, ChevronRight, SlidersHorizontal, RefreshCw, Calendar, LayoutGrid, List, Sparkles, Brain, Target } from 'lucide-react';
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
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('list');

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
                const errData = await ocrRes.json().catch(() => ({}));
                console.error('OCR failed:', errData.error, errData.details);
                alert(`OCR Processing Error: ${errData.details || 'Unknown Error'}`);
                await fetchReports();
                return;
            }

            const ocrData = await ocrRes.json();
            console.log('OCR complete, starting analysis...');

            const analyzeRes = await fetch('/api/reports/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId,
                    text: ocrData.text,
                    category: reportType || 'Blood Work'
                })
            });

            if (!analyzeRes.ok) {
                const errData = await analyzeRes.json().catch(() => ({}));
                console.error('Analysis failed:', errData.error, errData.details);
            }

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
            setViewingReport(report);
            const res = await fetch(`/api/reports/${report.id}`);
            if (res.ok) {
                const fullReport = await res.json();
                console.log("Full Report Data Loaded:", fullReport);
                setViewingReport(fullReport);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    };

    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'completed').length;
    const processingReports = reports.filter(r => r.status !== 'completed' && r.status !== 'failed').length;
    const completionRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.type?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (viewingReport) {
        return (
            <ReportViewer
                report={viewingReport}
                onBack={() => setViewingReport(null)}
            />
        );
    }

    return (
        <AppShell>
            <div className="min-h-screen bg-slate-50/50">
                {/* 1. Header Section - Calm & Clear */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                    Medical Archives
                                </h1>
                                <p className="text-slate-500 mt-1 text-sm sm:text-base">
                                    Manage your health reports and view AI insights.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Desktop Upload Button */}
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Upload Report
                                </button>
                            </div>
                        </div>

                        {/* 2. Stats Row - Compact & Neutral */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {[
                                { label: 'Total Archives', value: totalReports },
                                { label: 'Analyzed', value: completedReports },
                                { label: 'Pending', value: processingReports },
                                { label: 'Health Score', value: '98%', highlight: true }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-start hover:border-slate-200 transition-colors">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${stat.highlight ? 'text-teal-600' : 'text-slate-900'}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile FAB */}
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                    <Plus className="w-6 h-6" />
                </button>

                {/* 3. Main Content - The List */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                        {/* Search Pills */}
                        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-lg w-full md:w-auto">
                            <Search className="w-4 h-4 text-slate-400 ml-3" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 border-none focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400 py-2 bg-transparent"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="p-1 mr-1 hover:bg-slate-100 rounded-md">
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggles */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                            {['all', 'completed', 'processing'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === status
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reports List */}
                    {loading && reports.length === 0 ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white h-20 rounded-xl border border-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No reports found</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-xs">
                                {searchQuery ? "Try adjusting your search terms." : "Upload your first medical report to get started."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onClick={() => viewReport(report)}
                                    // onDelete={handleDelete} // Consider making this secondary or hidden
                                    onDelete={handleDelete}
                                    onRetry={() => triggerProcessing(report.id, report.fileUrl, report.type)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. Intelligent Guide (Show when few reports) */}
                {reports.length > 0 && reports.length < 3 && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start sm:items-center gap-3">
                            <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sky-900 text-sm">Improve AI Accuracy</h4>
                                <p className="text-sky-700 text-xs sm:text-sm mt-0.5">Upload at least 3 reports to unlock detailed health trend analysis and personalized scoring.</p>
                            </div>
                            <button onClick={() => setShowUploadModal(true)} className="text-xs font-bold text-sky-700 hover:underline shrink-0 mt-1 sm:mt-0">
                                Upload Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal (Refined) */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
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
