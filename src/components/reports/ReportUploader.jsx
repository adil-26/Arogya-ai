'use client';
import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Activity, AlertCircle, Calendar, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ReportUploader = ({ onUploadComplete, onCancel }) => {
    const [uploading, setUploading] = useState(false);
    const [reportType, setReportType] = useState('Blood Work');
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', reportType);
        formData.append('date', new Date(testDate).toISOString());

        try {
            const res = await fetch('/api/reports/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            onUploadComplete(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }, [reportType, testDate, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.jpg'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    const reportTypes = ['Blood Work', 'MRI', 'CT Scan', 'X-Ray', 'Urine Test', 'ECG'];

    return (
        <div className="space-y-6">
            {/* Date Picker */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    When was this test done?
                </label>
                <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-700 font-medium"
                />
            </div>

            {/* Type Selector */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Report Type</label>
                <div className="grid grid-cols-3 gap-2">
                    {reportTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setReportType(type)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${reportType === type
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group ${isDragActive
                        ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
                    }`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-14 h-14 mb-3">
                            <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-teal-600 rounded-full p-3 animate-spin">
                                <Activity className="text-white" size={28} />
                            </div>
                        </div>
                        <p className="text-slate-800 font-bold">Uploading...</p>
                        <p className="text-slate-500 text-sm">Please wait</p>
                    </div>
                ) : (
                    <div className="py-4 flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-teal-100' : 'bg-slate-100 group-hover:bg-teal-50'
                            }`}>
                            <UploadCloud className={`w-8 h-8 transition-colors ${isDragActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'
                                }`} />
                        </div>
                        <p className="text-lg font-bold text-slate-800 mb-1">
                            {isDragActive ? "Drop it here!" : "Click or Drag File"}
                        </p>
                        <p className="text-slate-500 text-sm mb-3">
                            PNG, JPG, or PDF • Max 10MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Cancel Button */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors"
                >
                    Cancel
                </button>
            )}
        </div>
    );
};

export default ReportUploader;
