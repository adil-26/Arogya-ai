'use client';
import React from 'react';
import HealthCharts from './HealthCharts';
import BodyHighlighter from './BodyHighlighter';
import { FileText, ArrowLeft } from 'lucide-react';

const ReportResults = ({ report, data, onBack }) => {

    // Determine visualization type based on report category or existing data
    const isImaging = data?.imaging_summary != null;
    const isBloodWork = data?.results?.length > 0;

    // Prepare Chart Data if Blood Work
    const chartData = isBloodWork ? {
        labels: data.results.map(r => r.parameter),
        datasets: [
            {
                label: 'Result',
                data: data.results.map(r => r.value),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
            {
                label: 'Reference Min',
                data: data.results.map(r => r.ref_min || 0),
                borderColor: 'rgba(100, 116, 139, 0.5)',
                borderDash: [5, 5],
                pointRadius: 0
            },
            {
                label: 'Reference Max',
                data: data.results.map(r => r.ref_max || 100), // simplistic fallback
                borderColor: 'rgba(100, 116, 139, 0.5)',
                borderDash: [5, 5],
                pointRadius: 0
            }
        ]
    } : null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft size={16} /> Upload Another
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{data?.metadata?.name || 'Patient'} Report</h2>
                    <p className="text-slate-500">{data?.metadata?.category} • {data?.metadata?.date}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                    <FileText className="text-blue-600" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visualizations */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">
                        {isImaging ? '3D Localization' : 'Result Analysis'}
                    </h3>

                    {isImaging && (
                        <BodyHighlighter findings={data.imaging_summary.affected_locations} />
                    )}

                    {isBloodWork && chartData && (
                        <div className="h-[400px] flex items-center justify-center">
                            <HealthCharts data={chartData} type="bar" />
                        </div>
                    )}
                </div>

                {/* Summary / List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full overflow-y-auto max-h-[600px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Detailed Findings</h3>

                    {isBloodWork && (
                        <div className="space-y-3">
                            {data.results.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-50 bg-slate-50">
                                    <div>
                                        <div className="font-semibold text-slate-700">{item.parameter}</div>
                                        <div className="text-xs text-slate-500">Ref: {item.ref_min} - {item.ref_max} {item.unit}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">{item.value} {item.unit}</div>
                                        <span className={`text-xs font-bold ${item.status === 'Normal' ? 'text-green-600' :
                                                item.status === 'High' ? 'text-red-500' : 'text-amber-500'
                                            }`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isImaging && (
                        <div className="prose prose-sm prose-slate">
                            <p><strong>Findings:</strong> {data.imaging_summary.findings}</p>
                            <p><strong>Conclusion:</strong> {data.imaging_summary.conclusion}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportResults;
