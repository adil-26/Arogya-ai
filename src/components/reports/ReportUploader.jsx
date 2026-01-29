'use client';
import React, { useCallback, useState } from 'react';
import { UploadCloud, Activity, AlertCircle, Check, ChevronRight, Calendar, FileType, X, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ReportUploader = ({ onUploadComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null); // 'uploading' | 'ocr' | 'analyzing' | 'done'
    const [reportType, setReportType] = useState('Blood Work');
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress('uploading');
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', reportType);
        formData.append('date', new Date(testDate).toISOString());

        try {
            const res = await fetch('/api/reports/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            setUploadProgress('done');

            // Short delay to show success state
            setTimeout(() => {
                onUploadComplete(data);
            }, 800);

        } catch (err) {
            setError(err.message);
            setUploadProgress(null);
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.jpg'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    const reportTypes = [
        { name: 'Blood Work', icon: Activity },
        { name: 'MRI', icon: Activity }, // Using generic for now or specific if available
        { name: 'CT Scan', icon: FileType },
        { name: 'X-Ray', icon: FileType },
        { name: 'Urine Test', icon: Activity },
        { name: 'ECG', icon: Activity }
    ];

    // Better icon mapping
    const getIcon = (name) => {
        switch (name) {
            case 'Blood Work': return <Activity className="w-5 h-5" />;
            case 'MRI': return <Activity className="w-5 h-5" />;
            case 'CT Scan': return <Activity className="w-5 h-5" />;
            case 'X-Ray': return <Activity className="w-5 h-5" />;
            case 'Urine Test': return <Activity className="w-5 h-5" />;
            case 'ECG': return <Activity className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const progressSteps = [
        { id: 'uploading', label: 'Uploading' },
        { id: 'ocr', label: 'Reading Text' },
        { id: 'analyzing', label: 'AI Analysis' },
        { id: 'done', label: 'Complete' }
    ];

    // Processing View
    if (uploadProgress) {
        const currentIndex = progressSteps.findIndex(s => s.id === uploadProgress);

        return (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center mb-10 w-full max-w-md">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-500 ${uploadProgress === 'done'
                        ? 'bg-green-50'
                        : 'bg-teal-50'
                        }`}>
                        {uploadProgress === 'done' ? (
                            <CheckCircle className="w-10 h-10 text-green-600 animate-in zoom-in" />
                        ) : (
                            <Activity className="w-10 h-10 text-teal-600 animate-pulse" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {uploadProgress === 'done' ? 'Analysis Complete' : 'Processing Report'}
                    </h3>
                    <p className="text-slate-500 text-sm">
                        {uploadProgress === 'done'
                            ? 'Your health insights are ready.'
                            : 'This usually takes about 10-20 seconds.'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="w-full max-w-md space-y-4">
                    {progressSteps.map((pStep, index) => {
                        const isActive = index === currentIndex;
                        const isCompleted = index < currentIndex;

                        return (
                            <div key={pStep.id} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-teal-600 border-teal-600 text-white' :
                                    isActive ? 'border-teal-600 text-teal-600' :
                                        'border-slate-200 text-slate-300'
                                    }`}>
                                    {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{pStep.label}</span>
                                {isActive && <Activity className="w-4 h-4 text-teal-600 animate-spin ml-auto" />}
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Upload New Report</h2>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Steps Visualizer */}
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                    <span className={`font-bold ${step === 1 ? 'text-teal-700' : 'text-slate-500'}`}>1. Details</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className={`font-bold ${step === 2 ? 'text-teal-700' : 'text-slate-500'}`}>2. Upload & Review</span>
                </div>
                <div className="h-1 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full bg-teal-500 transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                {step === 1 ? (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                What type of report is this?
                            </label>
                            <p className="text-xs text-slate-500 mb-4">This helps AI choose the correct analysis model.</p>
                            <div className="grid grid-cols-2 gap-3">
                                {reportTypes.map(type => (
                                    <button
                                        key={type.name}
                                        onClick={() => setReportType(type.name)}
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all border flex items-center gap-3 text-left ${reportType === type.name
                                            ? 'bg-teal-50 border-teal-200 text-teal-700 ring-1 ring-teal-200'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${reportType === type.name ? 'bg-teal-100' : 'bg-slate-100'}`}>
                                            {getIcon(type.name)}
                                        </div>
                                        <span>{type.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-4">
                                Date of Test
                            </label>
                            <input
                                type="date"
                                value={testDate}
                                onChange={(e) => setTestDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-medium outline-none transition-all"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                Continue to Upload
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <p className="text-[10px] font-medium uppercase tracking-wide">Your reports are encrypted & never shared.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {/* Selection Summary */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-600">
                                    {getIcon(reportType)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{reportType}</p>
                                    <p className="text-xs text-slate-500">{new Date(testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} className="text-xs font-bold text-teal-700 hover:underline">
                                Change
                            </button>
                        </div>

                        {/* Dropzone */}
                        {!selectedFile ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all min-h-[220px] flex flex-col items-center justify-center group ${isDragActive
                                    ? 'border-teal-500 bg-teal-50/50'
                                    : 'border-slate-200 bg-slate-50/30 hover:border-teal-400 hover:bg-slate-50'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-8 h-8 text-teal-600" />
                                </div>
                                <p className="font-bold text-slate-900 mb-1">
                                    Tap to upload report
                                </p>
                                <p className="text-slate-400 text-xs">
                                    PDF, JPG or PNG (Max 10MB)
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{selectedFile.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                                    </div>
                                    <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Activity className="w-5 h-5" />
                                    Analyze Report Now
                                </button>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button onClick={() => setStep(1)} className="text-sm font-semibold text-slate-400 hover:text-slate-600">
                                Go Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportUploader;
