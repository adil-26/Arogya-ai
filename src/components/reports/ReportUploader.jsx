'use client';
import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Activity, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ReportUploader = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [reportType, setReportType] = useState('Blood Work');
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', reportType);
        formData.append('date', new Date().toISOString());

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
    }, [reportType, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.jpg'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    return (
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <UploadCloud className="text-teal-600" size={28} /> Health Report Upload
            </h2>
            <p className="text-slate-500 mb-6">Select the report type and upload your file. Our AI will handle the rest.</p>

            {/* Type Selector */}
            <div className="flex flex-wrap gap-2 mb-8">
                {['Blood Work', 'MRI', 'CT Scan', 'X-Ray', 'Urine Test', 'Prescription'].map(type => (
                    <button
                        key={type}
                        onClick={() => setReportType(type)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${reportType === type
                            ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20 translate-y-[-1px]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group ${isDragActive ? 'border-teal-500 bg-teal-50/50 scale-[1.01]' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
                    }`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-teal-600 rounded-full p-4 animate-spin">
                                <Activity className="text-white" size={32} />
                            </div>
                        </div>
                        <p className="text-slate-800 font-bold text-lg">Encrypting & Uploading...</p>
                        <p className="text-slate-500 text-sm">Please wait while we secure your data</p>
                    </div>
                ) : (
                    <div className="py-6 flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${isDragActive ? 'bg-teal-100' : 'bg-slate-100 group-hover:bg-teal-50'
                            }`}>
                            {reportType === 'Prescription' ? <FileText className={`w-10 h-10 transition-colors ${isDragActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'}`} />
                                : <UploadCloud className={`w-10 h-10 transition-colors ${isDragActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'}`} />}
                        </div>
                        <p className="text-xl font-bold text-slate-800 mb-2">
                            {isDragActive ? "Drop it here!" : "Click or Drag File"}
                        </p>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
                            Support for PDF, JPG, PNG clarity is important for best AI results.
                        </p>
                        <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 shadow-sm group-hover:shadow-md transition-shadow">
                            Browse Files
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </div>
    );
};

export default ReportUploader;
