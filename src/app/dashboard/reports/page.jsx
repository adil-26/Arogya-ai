'use client';
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Upload, X, Loader } from 'lucide-react';
import ReportCard from '@/components/reports/ReportCard';
import ReportUploader from '@/components/reports/ReportUploader';
import ReportViewer from '@/components/reports/ReportViewer';
import AppShell from '@/components/layout/AppShell';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [viewingReport, setViewingReport] = useState(null);

    // Fetch reports on mount
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

        // Refresh the list
        await fetchReports();

        // Start auto-processing (OCR + AI)
        triggerProcessing(reportData.id, reportData.fileUrl);
    };

    const triggerProcessing = async (reportId, fileUrl) => {
        try {
            // Step 1: OCR
            const ocrRes = await fetch('/api/reports/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, fileUrl })
            });

            if (!ocrRes.ok) {
                console.error('OCR failed');
                return;
            }

            const ocrData = await ocrRes.json();
            console.log('OCR complete:', ocrData.text?.substring(0, 100));

            // Step 2: AI Analysis
            const analyzeRes = await fetch('/api/reports/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId,
                    text: ocrData.text,
                    category: reports.find(r => r.id === reportId)?.type || 'Blood Work'
                })
            });

            if (analyzeRes.ok) {
                console.log('Analysis complete!');
                // Refresh to show updated status
                await fetchReports();
            }
        } catch (error) {
            console.error('Processing error:', error);
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
            console.error('Error fetching report details:', error);
        }
    };

    // If viewing a report, show full page viewer
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
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Health Reports</h1>
                            <p className="text-slate-500 mt-1">Upload and analyze your medical reports</p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Upload Report
                        </button>
                    </div>

                    {/* Reports List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Reports Yet</h3>
                            <p className="text-slate-500 mb-6">Upload your first medical report to get started</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <Upload className="w-5 h-5" />
                                Upload Your First Report
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onClick={() => viewReport(report)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-800">Upload New Report</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-4">
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
