import React, { useState } from 'react';
import { Upload, Search, Filter, Plus, FileText, Download, Loader } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import RecordCard from '../../components/records/RecordCard';
import './RecordsPage.css';

const RecordsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [records, setRecords] = useState([
        { id: 1, name: "Complete Blood Count (CBC)", type: "Lab Report", date: "2023-10-15", doctor: "Dr. Ayesha Khan" },
        { id: 2, name: "Antibiotics Prescription", type: "Prescription", date: "2023-09-20", doctor: "Dr. Rahul Verma" },
        { id: 3, name: "Chest X-Ray", type: "Scan", date: "2023-08-10", doctor: "Dr. Emily Chen" },
    ]);

    const categories = ['All', 'Lab Report', 'Prescription', 'Scan'];

    const [isGenerating, setIsGenerating] = useState(false);
    const reportRef = React.useRef(null);

    const downloadSummary = async () => {
        setIsGenerating(true);
        try {
            // 1. Get AI HTML
            const res = await fetch('/api/summary', { method: 'POST' });
            if (!res.ok) throw new Error("Failed to generate");
            const data = await res.json();
            const reportHtml = data.report;

            // 2. Render HTML to hidden container
            const contentArea = document.getElementById('ai-content-area');
            if (reportRef.current && contentArea) {
                contentArea.innerHTML = reportHtml;

                // 3. Convert to PDF using jsPDF.html()
                const doc = new jsPDF('p', 'pt', 'a4');

                // Scale factor for 800px width -> A4 (595pt)
                await doc.html(reportRef.current, {
                    callback: function (pdf) {
                        pdf.save("E2Care_Medical_Report.pdf");
                        setIsGenerating(false);
                    },
                    x: 0,
                    y: 0,
                    width: 595, // A4 Width
                    windowWidth: 800 // Context Width
                });
            }

        } catch (error) {
            console.error("PDF Error", error);
            alert("Could not generate report.");
            setIsGenerating(false);
        }
    };

    const filteredRecords = selectedCategory === 'All'
        ? records
        : records.filter(r => r.type === selectedCategory);

    // Fetch Records on Mount
    React.useEffect(() => {
        async function fetchRecords() {
            try {
                const res = await fetch('/api/records');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setRecords(data.map(r => ({
                            id: r.id,
                            name: r.title,
                            type: r.type,
                            date: new Date(r.date || r.createdAt).toISOString().split('T')[0],
                            doctor: r.doctorName || 'Self Uploaded'
                        })));
                    }
                }
            } catch (e) {
                console.error("Failed to load records", e);
            }
        }
        fetchRecords();
    }, []);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "New Uploaded Document", // Todo: Add input for title
                    type: "Lab Report",             // Todo: Bind to select
                    doctorName: "Self Uploaded",
                    date: new Date().toISOString()
                })
            });

            if (res.ok) {
                const saved = await res.json();
                const newRecord = {
                    id: saved.id,
                    name: saved.title,
                    type: saved.type,
                    date: new Date(saved.date).toISOString().split('T')[0],
                    doctor: saved.doctorName
                };
                setRecords([newRecord, ...records]);
                setShowUploadModal(false);
            }
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    return (
        <div className="records-page">
            <header className="page-header">
                <div>
                    <h1>Medical Records</h1>
                    <p>Access all your prescriptions, reports, and scans</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn-secondary btn-download"
                        onClick={downloadSummary}
                        disabled={isGenerating}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}
                    >
                        {isGenerating ? <Loader size={18} className="spin" /> : <Download size={18} />}
                        {isGenerating ? "Generating..." : "Download AI Summary"}
                    </button>
                    <button className="btn-primary btn-upload" onClick={() => setShowUploadModal(true)}>
                        <Upload size={18} /> Upload New
                    </button>
                </div>
            </header>

            <div className="controls-row">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search records..." />
                </div>
                <div className="filter-chips">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="records-grid">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map(record => (
                        <RecordCard key={record.id} record={record} />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No records found in this category.</p>
                    </div>
                )}
            </div>

            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="upload-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Upload Record</h3>
                            <button className="close-btn" onClick={() => setShowUploadModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="upload-area">
                                <Plus size={32} />
                                <p>Drag & drop or Click to Browse</p>
                                <span>Supports PDF, JPG, PNG</span>
                            </div>
                            <div className="form-group">
                                <label>Document Type</label>
                                <select>
                                    <option>Lab Report</option>
                                    <option>Prescription</option>
                                    <option>Scan / X-Ray</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleUploadSubmit}>Upload</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Hidden Container for PDF Generation */}
            {/* We position it absolute but visible to the renderer (html2canvas) */}
            <div
                style={{
                    position: 'fixed',
                    top: '-10000px', // Move off-screen
                    left: 0,
                    width: '800px', // Standard A4 Width approx
                    minHeight: '1100px',
                    background: 'white',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
            >
                <div ref={reportRef} style={{ padding: '40px', color: '#111827' }}>
                    {/* 1. BRAND HEADER */}
                    <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', padding: '30px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ margin: 0, color: 'white', fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px' }}>E2CARE</h1>
                            <p style={{ margin: '4px 0 0 0', color: '#DBEAFE', fontSize: '14px' }}>Advanced Medical Intelligence</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'white', fontSize: '12px', opacity: 0.9 }}>REPORT GENERATED ON</div>
                            <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* 2. PATIENT DETAILS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', background: '#F3F4F6', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #E5E7EB' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Patient Name</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>Adil</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Patient ID</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>P-92834</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Category</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>General Follow-up</div>
                        </div>
                    </div>

                    {/* 3. AI CONTENT INJECTION */}
                    {/* This div will be populated via innerHTML in the function */}
                    <div id="ai-content-area" style={{ minHeight: '500px' }}>
                        {/* AI Content goes here */}
                    </div>

                    {/* 4. FOOTER */}
                    <div style={{ marginTop: '50px', borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', color: '#9CA3AF', fontSize: '11px' }}>
                        <div>Confidential Medical Document</div>
                        <div>Generated by E2Care Platform • Verified by User</div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default RecordsPage;
