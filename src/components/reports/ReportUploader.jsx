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
        { name: 'Blood Work', color: 'bg-red-500', icon: '🩸' },
        { name: 'MRI', color: 'bg-purple-500', icon: '🧠' },
        { name: 'CT Scan', color: 'bg-blue-500', icon: '📊' },
        { name: 'X-Ray', color: 'bg-slate-500', icon: '🦴' },
        { name: 'Urine Test', color: 'bg-amber-500', icon: '🧪' },
        { name: 'ECG', color: 'bg-pink-500', icon: '💓' }
    ];

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
            <div className="p-8">
                <div className="text-center mb-8">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${uploadProgress === 'done'
                            ? 'bg-green-100'
                            : 'bg-teal-100'
                        }`}>
                        {uploadProgress === 'done' ? (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        ) : (
                            <Activity className="w-10 h-10 text-teal-600 animate-spin" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {uploadProgress === 'done' ? 'Upload Complete!' : 'Processing Your Report'}
                    </h3>
                    <p className="text-slate-500">
                        {uploadProgress === 'done'
                            ? 'Your report is ready for analysis'
                            : 'Please wait while we process your file'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-8">
                    {progressSteps.map((pStep, index) => (
                        <React.Fragment key={pStep.id}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${index <= currentIndex
                                        ? uploadProgress === 'done'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-teal-500 text-white'
                                        : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {index < currentIndex ? <Check className="w-5 h-5" /> : index + 1}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${index <= currentIndex ? 'text-slate-800' : 'text-slate-400'
                                    }`}>
                                    {pStep.label}
                                </span>
                            </div>
                            {index < progressSteps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 rounded ${index < currentIndex
                                        ? uploadProgress === 'done' ? 'bg-green-500' : 'bg-teal-500'
                                        : 'bg-slate-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* File Info */}
                <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileType className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{selectedFile?.name}</p>
                        <p className="text-sm text-slate-500">{reportType} • {testDate}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Upload Report</h2>
                    <p className="text-slate-500 text-sm mt-1">Step {step} of 2</p>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 1 ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-700'
                        }`}>
                        <Calendar className="w-4 h-4" />
                        Details
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                        <UploadCloud className="w-4 h-4" />
                        Upload
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
                {step === 1 ? (
                    /* Step 1: Metadata */
                    <div className="space-y-6">
                        {/* Date Picker */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                When was this test done?
                            </label>
                            <input
                                type="date"
                                value={testDate}
                                onChange={(e) => setTestDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-700 font-semibold text-lg"
                            />
                        </div>

                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Report Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {reportTypes.map(type => (
                                    <button
                                        key={type.name}
                                        onClick={() => setReportType(type.name)}
                                        className={`px-4 py-4 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-3 ${reportType === type.name
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/20'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                                            }`}
                                    >
                                        <span className="text-lg">{type.icon}</span>
                                        {type.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            Continue
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    /* Step 2: Upload */
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                            <span className="text-2xl">{reportTypes.find(t => t.name === reportType)?.icon}</span>
                            <div>
                                <p className="font-semibold text-slate-800">{reportType}</p>
                                <p className="text-sm text-slate-500">{new Date(testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="ml-auto text-teal-600 text-sm font-semibold hover:underline">
                                Edit
                            </button>
                        </div>

                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center ${selectedFile
                                    ? 'border-green-400 bg-green-50'
                                    : isDragActive
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-slate-300 bg-slate-50 hover:border-teal-400'
                                }`}
                        >
                            <input {...getInputProps()} />

                            {selectedFile ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                                        <Check className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="font-bold text-green-700 mb-1">{selectedFile.name}</p>
                                    <p className="text-green-600 text-sm">Click to change file</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-5">
                                        <UploadCloud className="w-10 h-10 text-teal-600" />
                                    </div>
                                    <p className="font-bold text-slate-700 text-lg mb-2">
                                        {isDragActive ? "Drop it here!" : "Click or drag file"}
                                    </p>
                                    <p className="text-slate-500">PNG, JPG or PDF • Max 10MB</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-200">
                                <AlertCircle size={20} />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 text-slate-600 font-semibold border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className={`flex-1 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${selectedFile && !uploading
                                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-teal-500/25'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                Analyze Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportUploader;
