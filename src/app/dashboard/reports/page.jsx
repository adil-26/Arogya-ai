'use client';
import React, { useState } from 'react';
import ReportUploader from '@/components/reports/ReportUploader';
import ReportAnalyzer from '@/components/reports/ReportAnalyzer';

import ReportResults from '@/components/reports/ReportResults';

import AppShell from '@/components/layout/AppShell';

export default function ReportsPage() {
    const [activeReport, setActiveReport] = useState(null);
    const [savedData, setSavedData] = useState(null); // Add state for saved results

    const handleUploadComplete = (reportData) => {
        console.log("Report Uploaded:", reportData);
        setActiveReport(reportData);
        setSavedData(null); // Reset prev results
    };

    const renderContent = () => {
        if (savedData) {
            return (
                <div className="max-w-7xl mx-auto">
                    <ReportResults
                        report={activeReport}
                        data={savedData}
                        onBack={() => {
                            setSavedData(null);
                            setActiveReport(null);
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="max-w-6xl mx-auto">
                {!activeReport ? (
                    <div className="max-w-2xl mx-auto">
                        <ReportUploader onUploadComplete={handleUploadComplete} />

                        {/* Placeholder for Recent Reports List */}
                        <div className="mt-12">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Uploads</h3>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                                <p>No reports uploaded yet.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ReportAnalyzer
                            report={activeReport}
                            onCancel={() => setActiveReport(null)}
                            onSaveComplete={(data) => {
                                console.log("Saved:", data);
                                setSavedData(data); // Move to Results view
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppShell>
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                {renderContent()}
            </div>
        </AppShell>
    );
}
