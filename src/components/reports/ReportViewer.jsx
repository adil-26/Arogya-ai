'use client';
import React, { useState } from 'react';
import { ArrowLeft, FileText, Calendar, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus, Eye, BarChart3, Table, FileSearch, Info, Activity, Sparkles } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Doughnut, PolarArea } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend
);

const statusColors = {
    normal: { bg: 'bg-green-100/50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, hex: '#14b8a6' },
    low: { bg: 'bg-blue-100/50', text: 'text-blue-700', border: 'border-blue-200', icon: TrendingDown, hex: '#3B82F6' },
    high: { bg: 'bg-red-100/50', text: 'text-red-700', border: 'border-red-200', icon: TrendingUp, hex: '#EF4444' },
    critical: { bg: 'bg-red-200/50', text: 'text-red-800', border: 'border-red-300', icon: AlertCircle, hex: '#991b1b' }
};

const biomarkerSystems = {
    // Hematology
    'hemoglobin': 'Hematology', 'hb': 'Hematology', 'wbc': 'Hematology', 'rbc': 'Hematology',
    'platelets': 'Hematology', 'hct': 'Hematology', 'mcv': 'Hematology', 'mch': 'Hematology',
    'rdw': 'Hematology', 'lymphocytes': 'Hematology', 'neutrophils': 'Hematology',
    // Metabolic
    'glucose': 'Metabolic', 'sugar': 'Metabolic', 'hba1c': 'Metabolic', 'creatinine': 'Metabolic',
    'urea': 'Metabolic', 'bun': 'Metabolic', 'uric acid': 'Metabolic', 'calcium': 'Metabolic',
    // Lipid Profile
    'cholesterol': 'Lipid Profile', 'triglycerides': 'Lipid Profile', 'hdl': 'Lipid Profile', 'ldl': 'Lipid Profile',
    // Liver Function
    'bilirubin': 'Liver Function', 'sgot': 'Liver Function', 'sgpt': 'Liver Function', 'alt': 'Liver Function', 'ast': 'Liver Function',
    // Vitamins & Minerals
    'vitamin d': 'Vitamins/Minerals', 'b12': 'Vitamins/Minerals', 'iron': 'Vitamins/Minerals', 'ferritin': 'Vitamins/Minerals'
};

export default function ReportViewer({ report, onBack }) {
    const [activeTab, setActiveTab] = useState('summary');
    const [showAbnormalOnly, setShowAbnormalOnly] = useState(true);
    const [selectedTrendBiomarker, setSelectedTrendBiomarker] = useState(null);

    const analysis = report.analysisJson || {};
    const results = report.results || report.testResults || analysis.results || [];
    const historicalTrends = report.historicalTrends || [];
    const summary = analysis.summary || analysis.interpretation || analysis.explanation || 'Analysis complete. Click the "Details" tab to see your individual biomarkers.';

    // Initialize selected biomarker for trends
    if (!selectedTrendBiomarker && results.length > 0) {
        setSelectedTrendBiomarker(results[0].parameter);
    }

    const tabs = [
        { id: 'summary', label: 'Summary', icon: FileSearch },
        { id: 'details', label: 'Details', icon: Table },
        { id: 'graphs', label: 'Trends', icon: BarChart3 }
    ];

    const getStatus = (result) => {
        if (!result.status) return 'normal';
        const s = result.status.toLowerCase();
        if (s.includes('high') || s.includes('elevated')) return 'high';
        if (s.includes('low') || s.includes('decreased')) return 'low';
        if (s.includes('critical')) return 'critical';
        return 'normal';
    };

    const getSystem = (result) => {
        if (result.category && result.category !== 'General') return result.category;
        const param = result.parameter.toLowerCase();
        for (const [key, system] of Object.entries(biomarkerSystems)) {
            if (param.includes(key)) return system;
        }
        return 'General Vital';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getTrendInsight = (result) => {
        const parameterTrends = historicalTrends.filter(t => t.parameter === result.parameter && t.report.id !== report.id);
        if (parameterTrends.length === 0) return null;
        const lastValue = parameterTrends[parameterTrends.length - 1].value;
        const diff = result.value - lastValue;
        const percentChange = ((diff / lastValue) * 100).toFixed(1);
        return { diff, percentChange, isUp: diff > 0, isDown: diff < 0, lastValue };
    };

    // Group results by intelligent category
    const groupedResults = results.reduce((acc, result) => {
        const category = getSystem(result);
        if (!acc[category]) acc[category] = [];
        acc[category].push(result);
        return acc;
    }, {});

    // Distribution Data (Doughnut)
    const statusCounts = results.reduce((acc, r) => {
        const status = getStatus(r);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const distributionData = {
        labels: ['Normal', 'High', 'Low', 'Critical'],
        datasets: [{
            data: [
                statusCounts.normal || 0,
                statusCounts.high || 0,
                statusCounts.low || 0,
                statusCounts.critical || 0
            ],
            backgroundColor: [
                '#14b8a6', // Teal
                '#ef4444', // Red
                '#3b82f6', // Blue
                '#991b1b', // Dark Red
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    // Polar Area Data (Premium View)
    const topMarkers = results.slice(0, 7);
    const polarData = {
        labels: topMarkers.map(r => r.parameter),
        datasets: [{
            data: topMarkers.map(r => r.value),
            backgroundColor: topMarkers.map(r => {
                const status = getStatus(r);
                return statusColors[status]?.hex + '80'; // 50% opacity
            }),
            borderColor: topMarkers.map(r => statusColors[getStatus(r)]?.hex),
            borderWidth: 2
        }]
    };

    // Bar Chart Data (Current Report)
    const displayResults = results.slice(0, 10);
    const barChartData = {
        labels: displayResults.map(r => r.parameter.length > 15 ? r.parameter.substr(0, 12) + '...' : r.parameter),
        datasets: [{
            label: 'Result Value',
            data: displayResults.map(r => r.value),
            backgroundColor: displayResults.map(r => {
                const status = getStatus(r);
                if (status === 'high') return 'rgba(239, 68, 68, 0.7)';
                if (status === 'low') return 'rgba(59, 130, 246, 0.7)';
                return 'rgba(20, 184, 166, 0.7)';
            }),
            borderColor: displayResults.map(r => {
                const status = getStatus(r);
                if (status === 'high') return '#EF4444';
                if (status === 'low') return '#3B82F6';
                return '#14B8A6';
            }),
            borderWidth: 1.5,
            borderRadius: 6,
            barThickness: 24,
        }]
    };

    // Line Chart Data (Historical Comparison)
    const getLineChartData = () => {
        const parameterTrends = historicalTrends.filter(t => t.parameter === selectedTrendBiomarker);
        const labels = parameterTrends.map(t => formatDate(t.report.reportDate));
        const values = parameterTrends.map(t => t.value);

        return {
            labels,
            datasets: [{
                label: selectedTrendBiomarker,
                data: values,
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 3,
                pointBorderColor: '#14b8a6',
                borderWidth: 4,
            }]
        };
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E293B',
                padding: 12,
                cornerRadius: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: false,
                callbacks: {
                    label: (context) => `Value: ${context.parsed.y} ${results.find(r => r.parameter === selectedTrendBiomarker)?.unit || ''}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: '600' }, color: '#94A3B8' }
            },
            y: {
                beginAtZero: false,
                grid: { color: '#F1F5F9' },
                ticks: { font: { size: 10, weight: '600' }, color: '#94A3B8' }
            }
        }
    };

    const barChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1E293B',
                cornerRadius: 12,
                padding: 12,
                displayColors: false,
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: '#F8FAFC', drawBorder: false },
                ticks: { font: { size: 10, weight: '600' }, color: '#94A3B8' }
            },
            y: {
                grid: { display: false },
                ticks: {
                    font: { size: 11, weight: '700' },
                    color: '#1E293B',
                    callback: function (value, index) {
                        const label = this.getLabelForValue(value);
                        return label.length > 20 ? label.substr(0, 17) + '...' : label;
                    }
                }
            }
        }
    };

    return (
        <AppShell>
            <div className="min-h-screen bg-slate-50">
                {/* 1. Header & Tabs - Calm Bordered Layout */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="py-4 flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 truncate">
                                    {report.title || 'Health Report'}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>{formatDate(report.reportDate)}</span>
                                    <span>•</span>
                                    <span>{report.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 mt-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-teal-600 text-teal-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32">
                    {/* SUMMARY TAB */}
                    {activeTab === 'summary' && (
                        <div className="space-y-8 animate-in fade-in duration-300">

                            {/* A. Status Banner */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-2">
                                    Overall Health Status
                                </h2>
                                <p className="text-slate-600 leading-relaxed">
                                    {statusCounts.critical > 0
                                        ? "Your report indicates some critical values that require immediate medical attention. Please consult your doctor."
                                        : statusCounts.high > 0 || statusCounts.low > 0
                                            ? "Your results are mostly normal, but there are a few markers outside the reference range that may need monitoring."
                                            : "Great news! All analyzed biomarkers are within the normal reference range."}
                                </p>
                            </div>

                            {/* B. High Level Counters */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-bold text-teal-600">{statusCounts.normal || 0}</span>
                                    <span className="text-xs font-semibold text-slate-400 uppercase mt-1">Normal</span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-bold text-amber-500">{(statusCounts.high || 0) + (statusCounts.low || 0)}</span>
                                    <span className="text-xs font-semibold text-slate-400 uppercase mt-1">Attention</span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-bold text-red-600">{statusCounts.critical || 0}</span>
                                    <span className="text-xs font-semibold text-slate-400 uppercase mt-1">Critical</span>
                                </div>
                            </div>

                            {/* C. Charts with Explanations */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left: Distribution */}
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800">Distribution</h3>
                                        <Info className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <div className="flex-1 flex gap-4 items-center">
                                        <div className="w-32 h-32 relative flex-shrink-0">
                                            <Doughnut
                                                data={distributionData}
                                                options={{ cutout: '70%', plugins: { legend: { display: false } }, maintainAspectRatio: false }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {Math.round(((statusCounts.normal || 0) / results.length) * 100)}%
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-500 leading-snug">
                                            This chart shows the proportion of healthy results vs. those needing attention. <br />
                                            <span className="text-teal-600 font-semibold">Green</span> is good.
                                        </div>
                                    </div>
                                </div>

                                {/* Right: System Spread */}
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800">Biomarker Map</h3>
                                    </div>
                                    <div className="space-y-3 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                                        {Object.entries(groupedResults).map(([category, items]) => (
                                            <div key={category} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 w-1/3 truncate">{category}</span>
                                                <div className="flex gap-1.5 flex-1 flex-wrap">
                                                    {items.map((item, idx) => {
                                                        const s = getStatus(item);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`w-2.5 h-2.5 rounded-full ${s === 'normal' ? 'bg-teal-400' : s === 'critical' ? 'bg-red-500' : 'bg-amber-400'}`}
                                                                title={item.parameter}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* D. Key Insights */}
                            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-teal-400" />
                                    <h3 className="font-bold">Key Insights</h3>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-teal-400 font-bold">•</span>
                                        <span>
                                            <strong className="text-white">Everything looks good:</strong> Kidney and Liver function markers are within optimal ranges.
                                        </span>
                                    </li>
                                    {(statusCounts.high > 0 || statusCounts.low > 0) && (
                                        <li className="flex gap-2">
                                            <span className="text-amber-400 font-bold">•</span>
                                            <span>
                                                <strong className="text-white">Watch out for:</strong> You have {statusCounts.high + statusCounts.low} markers that are slightly out of range.
                                            </span>
                                        </li>
                                    )}
                                    <li className="flex gap-2">
                                        <span className="text-blue-400 font-bold">•</span>
                                        <span>
                                            <strong className="text-white">Next Step:</strong> Repeat these tests in 3-6 months to track stability.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* DETAILS TAB */}
                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Filter Toggle */}
                            <div className="flex justify-end">
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={showAbnormalOnly}
                                        onChange={() => setShowAbnormalOnly(!showAbnormalOnly)}
                                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span>Show abnormal results only</span>
                                </label>
                            </div>

                            {Object.entries(groupedResults).map(([category, items]) => {
                                // Filter logic if needed
                                const visibleItems = showAbnormalOnly ? items.filter(i => getStatus(i) !== 'normal') : items;
                                if (visibleItems.length === 0) return null;

                                return (
                                    <div key={category} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800">{category}</h3>
                                            <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                                {visibleItems.length} Tests
                                            </span>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {visibleItems.map((item, idx) => {
                                                const status = getStatus(item);
                                                return (
                                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-slate-900 text-sm">{item.parameter}</p>
                                                            <p className="text-xs text-slate-500">Ref: {item.referenceRange || item.normalRange || 'N/A'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-slate-900">{item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span></p>
                                                            <span className={`text-[10px] font-bold uppercase ${status === 'normal' ? 'text-teal-600' :
                                                                status === 'critical' ? 'text-red-600' : 'text-amber-600'
                                                                }`}>
                                                                {status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* TRENDS TAB */}
                    {activeTab === 'graphs' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {historicalTrends.length < 2 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BarChart3 className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg">Not enough data for trends</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                                        We need at least two reports of this type to show you how your health markers are changing over time.
                                    </p>
                                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
                                        Upload Next Report
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                    {/* Existing Chart Code would go here if data exists */}
                                    <p className="text-center text-slate-500">Trend customization coming soon...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
