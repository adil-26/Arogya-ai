'use client';
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Loader, Activity, TrendingUp } from 'lucide-react';
import ReportCard from '@/components/reports/ReportCard';
import ReportUploader from '@/components/reports/ReportUploader';
import ReportViewer from '@/components/reports/ReportViewer';
import AppShell from '@/components/layout/AppShell';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewingReport, setViewingReport] = useState(null);

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
        console.log('Upload complete:', reportData);
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
                console.error('OCR failed');
                await fetchReports();
                return;
            }

            const ocrData = await ocrRes.json();
            console.log('OCR complete');

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

    // Stats
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'completed').length;
    const processingReports = reports.filter(r => r.status !== 'completed' && r.status !== 'failed').length;

    return (
        <AppShell>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Health Reports</h1>
                            <p className="text-slate-500 mt-1">Upload, analyze, and track your medical reports</p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/20 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Upload Report
                        </button>
                    </div>

                    {/* Stats Cards */}
                    {reports.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Total Reports</p>
                                        <p className="text-2xl font-bold text-slate-800">{totalReports}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Analyzed</p>
                                        <p className="text-2xl font-bold text-green-600">{completedReports}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Processing</p>
                                        <p className="text-2xl font-bold text-amber-600">{processingReports}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reports List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">Loading reports...</p>
                            </div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">No Reports Yet</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                Upload your first medical report and our AI will analyze it for you
                            </p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/20 transition-all font-semibold text-lg"
                            >
                                <Plus className="w-6 h-6" />
                                Upload Your First Report
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
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
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">Upload New Report</h2>
                            <p className="text-slate-500 text-sm mt-1">Add a medical report for AI analysis</p>
                        </div>
                        <div className="p-6">
                            <ReportUploader
                                onUploadComplete={handleUploadComplete}
                                onCancel={() => setShowUploadModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
