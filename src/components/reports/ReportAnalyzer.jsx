'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Save, RefreshCw, Activity, ArrowRight, X, FileText } from 'lucide-react';

const ReportAnalyzer = ({ report, onCancel, onSaveComplete }) => {
    const [status, setStatus] = useState('idle'); // idle, extracting, analyzed_text, analyzing, review, saving
    const [extractedText, setExtractedText] = useState('');
    const [data, setData] = useState(null);
    const [newTestPopup, setNewTestPopup] = useState(null);

    const startExtraction = async () => {
        setStatus('extracting');
        try {
            const res = await fetch('/api/reports/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl: report.fileUrl })
            });

            if (!res.ok) throw new Error('OCR failed');
            const result = await res.json();

            setExtractedText(result.text);
            setStatus('analyzed_text');

        } catch (err) {
            console.error(err);
            setStatus('idle');
            alert("Extraction failed. Please try again.");
        }
    };

    const startAnalysis = async () => {
        setStatus('analyzing');
        try {
            const res = await fetch('/api/reports/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: extractedText,
                    category: report.type
                })
            });

            if (!res.ok) throw new Error('Analysis failed');

            const result = await res.json();
            setData(result);
            setStatus('review');

            const newTests = result.results?.filter(r => r.is_new_test);
            if (newTests && newTests.length > 0) {
                setNewTestPopup(newTests[0]);
            }

        } catch (err) {
            console.error(err);
            setStatus('analyzed_text'); // Go back to text view
            alert("Analysis failed. Please try again.");
        }
    };

    const handleSave = async () => {
        setStatus('saving');
        try {
            const res = await fetch('/api/reports/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: report.id,
                    data: data
                })
            });

            if (!res.ok) throw new Error('Failed to save');

            // Pass the saved data back up so ReportResults can render it
            onSaveComplete(data);

        } catch (err) {
            console.error(err);
            setStatus('review'); // Revert to review on error
            alert('Failed to save report. Please try again.');
        }
    };

    // 1. IDLE STATE
    if (status === 'idle') {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={32} className="text-slate-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Report Ready for Analysis</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    The report "{report.title}" has been uploaded.
                    First, we need to extract the text from the image.
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={startExtraction}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105"
                    >
                        <RefreshCw size={20} /> Start Text Extraction
                    </button>
                </div>
            </div>
        );
    }

    // 2. EXTRACTING STATE
    if (status === 'extracting') {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Extracting Text...</h2>
                <p className="text-slate-500">Reading your document (This may take 10-20s)...</p>
            </div>
        );
    }

    // 3. TEXT REVIEW STATE
    if (status === 'analyzed_text') {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={24} /> Text Extracted
                </h2>
                <p className="text-slate-500 mb-4 text-sm">
                    We retrieved this text. Verify it looks correct, then proceed to AI Analysis.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-64 overflow-y-auto mb-6 font-mono text-xs text-slate-600 whitespace-pre-wrap">
                    {extractedText}
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setStatus('idle')}
                        className="px-6 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                    >
                        Retry Extraction
                    </button>
                    <button
                        onClick={startAnalysis}
                        className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
                    >
                        <Activity size={20} /> Analyze & Create Graphs
                    </button>
                </div>
            </div>
        );
    }

    // 4. ANALYZING STATE
    if (status === 'analyzing') {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">AI Processing...</h2>
                <p className="text-slate-500">Generating health graphs and analysis...</p>
            </div>
        );
    }

    // 5. REVIEW & SAVE STATE
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} /> Analysis Complete
                    </h2>
                    <p className="text-sm text-slate-500">Please verify the extracted data before saving.</p>
                </div>
                <button onClick={handleSave} disabled={status === 'saving'} className="btn-primary flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {status === 'saving' ? 'Saving...' : <><Save size={18} /> Save to Profile</>}
                </button>
            </div>

            <div className="p-6">
                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Patient</span>
                        <div className="font-bold text-slate-800 text-lg">{data.metadata?.name || 'Unknown'}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Report Date</span>
                        <div className="font-bold text-slate-800 text-lg">{data.metadata?.date || 'Unknown'}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Category</span>
                        <div className="font-bold text-slate-800 text-lg">{data.metadata?.category || report.type}</div>
                    </div>
                </div>

                {/* Results Table (For Blood/Fluid) */}
                {data.results && data.results.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-3 px-4 font-semibold text-slate-600 text-sm bg-slate-50 rounded-tl-lg">Test Parameter</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600 text-sm bg-slate-50">Value</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600 text-sm bg-slate-50">Unit</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600 text-sm bg-slate-50">Reference</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600 text-sm bg-slate-50 rounded-tr-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.results.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-slate-800">{item.parameter}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900">{item.value}</td>
                                        <td className="py-3 px-4 text-slate-500 text-sm">{item.unit}</td>
                                        <td className="py-3 px-4 text-slate-500 text-sm">
                                            {item.ref_min} - {item.ref_max}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'High' ? 'bg-red-100 text-red-800' :
                                                item.status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Imaging Summary (For MRI/X-Ray) */}
                {data.imaging_summary && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={18} /> Imaging Findings
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Findings</span>
                                <p className="text-slate-800 mt-1">{data.imaging_summary.findings}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Conclusion</span>
                                <p className="font-bold text-slate-900 mt-1">{data.imaging_summary.conclusion}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Affected Locations (3D Map)</span>
                                <div className="flex gap-2 mt-2">
                                    {data.imaging_summary.affected_locations?.map((loc, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                            {loc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* New Test Popup (Simulated) */}
            {newTestPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <AlertTriangle className="text-yellow-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">New Test Detected</h3>
                                <p className="text-slate-600 mt-2 text-sm">
                                    I've found a new test called <strong>"{newTestPopup.parameter}"</strong>.
                                    Which body part should I link this to for your 3D model?
                                </p>

                                <select className="w-full mt-4 p-2 border border-slate-200 rounded-lg text-sm bg-white">
                                    <option value="">Select Body Part...</option>
                                    <option value="heart">Heart</option>
                                    <option value="liver">Liver</option>
                                    <option value="kidney">Kidney</option>
                                    <option value="blood">Bloodstream</option>
                                </select>

                                <div className="flex gap-3 mt-6 justify-end">
                                    <button
                                        onClick={() => setNewTestPopup(null)}
                                        className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={() => setNewTestPopup(null)}
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                                    >
                                        Link & Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportAnalyzer;
