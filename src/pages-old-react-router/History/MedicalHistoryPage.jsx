'use client';
import React, { useState } from 'react';
import HumanBodySVG from '../../components/BodyMap/HumanBodySVG';
import OrganDetailPanel from '../../components/BodyMap/OrganDetailPanel'; // Reusing for consistency
import VisualHealthLogger from '../../components/HealthLog/VisualHealthLogger';
import MedicalConditionsModal, { COMMON_CONDITIONS } from '../../components/MedicalProfile/MedicalConditionsModal';
import { FileText, Calendar, Download, PlusCircle, UserCog, Activity } from 'lucide-react';
import './MedicalHistoryPage.css';

const MedicalHistoryPage = () => {
    const [selectedOrgan, setSelectedOrgan] = useState('head'); // Default to head for showcase
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false); // Mobile Bottom Sheet State

    // Real History Data State
    const [historyData, setHistoryData] = useState([]);

    // Fetch Data on Mount
    React.useEffect(() => {
        async function fetchHistory() {
            try {
                const [issuesRes, conditionsRes] = await Promise.all([
                    fetch('/api/body-issues'),
                    fetch('/api/conditions')
                ]);

                let combinedHistory = [];

                if (issuesRes.ok) {
                    const issues = await issuesRes.json();
                    const formattedIssues = issues.map(i => ({
                        id: `issue-${i.id}`,
                        organId: i.organId, // IMPORTANT: Used for filtering
                        domain: 'Body Issue', // or map organId to domain name
                        specificPart: i.specificPart || i.organId,
                        issue: i.issue,
                        severity: i.severity,
                        date: new Date(i.createdAt).toLocaleDateString(),
                        note: i.note,
                        type: 'issue'
                    }));
                    combinedHistory = [...combinedHistory, ...formattedIssues];
                }

                if (conditionsRes.ok) {
                    const conditions = await conditionsRes.json();
                    const formattedConditions = conditions.map(c => ({
                        id: `cond-${c.id}`,
                        domain: 'Medical Condition',
                        specificPart: 'General',
                        issue: c.name,
                        severity: 'chronic', // Default for conditions
                        date: `Since ${c.since}`,
                        note: `${c.type ? c.type + ' - ' : ''}Confirmed Condition`,
                        type: 'condition'
                    }));
                    combinedHistory = [...combinedHistory, ...formattedConditions];
                }

                // If empty, keep mock data for demo purposes or show empty
                if (combinedHistory.length > 0) {
                    setHistoryData(combinedHistory);
                } else {
                    // Fallback Mock Data if DB is empty
                    setHistoryData([
                        { id: 1, domain: 'Head & Neck', specificPart: 'Teeth', issue: 'No Records Yet', date: 'Today', note: 'Start adding issues in the Dashboard!' }
                    ]);
                }

            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        }
        fetchHistory();
    }, []);

    const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'timeline' | 'report'

    // Helper to group data for Report View
    const getGroupedData = () => {
        const groups = {};
        historyData.forEach(item => {
            if (!groups[item.domain]) groups[item.domain] = [];
            groups[item.domain].push(item);
        });
        return groups;
    };

    const renderReport = () => {
        const grouped = getGroupedData();
        return (
            <div className="report-view-container">
                {Object.keys(grouped).map(domain => (
                    <div key={domain} className="report-section">
                        <div className="report-header">
                            <h3>{domain}</h3>
                            <div className="header-line"></div>
                        </div>
                        <div className="report-items">
                            {grouped[domain].map(item => (
                                <div key={item.id} className="report-item">
                                    <div className="item-main">
                                        <span className="item-part">{item.specificPart}</span>
                                        <span className="item-issue">{item.issue}</span>
                                    </div>
                                    <div className="item-meta">
                                        {item.date && <span className="item-date">On {item.date}</span>}
                                        {item.severity && <span className={`severity-tag ${item.severity}`}>{item.severity}</span>}
                                    </div>
                                    {item.note && <p className="item-note">{item.note}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTimeline = () => (
        <div className="timeline-view-container">
            <div className="timeline-list">
                {historyData.map((item, index) => (
                    <div key={item.id} className="timeline-item">
                        <div className="timeline-date">
                            <Calendar size={14} />
                            <span>{item.date || 'Past'}</span>
                        </div>
                        <div className="timeline-connector">
                            <div className="timeline-dot"></div>
                            {index !== historyData.length - 1 && <div className="timeline-line"></div>}
                        </div>
                        <div className="timeline-card">
                            <div className="timeline-header">
                                <h4>{item.issue}</h4>
                                <span className={`severity-badge ${item.severity || 'mild'}`}>{item.severity || 'Completed'}</span>
                            </div>
                            <p className="timeline-loc">{item.domain} • {item.specificPart}</p>
                            <p className="timeline-note">{item.note || 'Recorded during regular checkup.'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const [showHealthLogger, setShowHealthLogger] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [medicalProfile, setMedicalProfile] = useState({}); // Stores Confirmed Conditions

    // Showcase Mode Logic
    const [showcaseIndex, setShowcaseIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Auto-Play Effect
    React.useEffect(() => {
        let timer;
        let progressTimer;

        if (viewMode === 'showcase') {
            setProgress(0);

            // Advance slide every 4 seconds
            timer = setInterval(() => {
                setShowcaseIndex(prev => (prev + 1) % historyData.length);
                setProgress(0);
            }, 4000);

            // Smooth progress bar update
            progressTimer = setInterval(() => {
                setProgress(p => Math.min(p + 2.5, 100)); // 100% in 40 steps (approx 4s)
            }, 100);
        }

        return () => {
            clearInterval(timer);
            clearInterval(progressTimer);
        };
    }, [viewMode, historyData.length]);

    const renderShowcase = () => {
        const item = historyData[showcaseIndex];
        // Map domain to body part ID for highlighting
        let highlightPart = item.domain.toLowerCase();
        if (highlightPart.includes('head')) highlightPart = 'head';

        return (
            <div className="showcase-view-container">
                <div className="showcase-content">
                    {/* Visual Side */}
                    <div className="showcase-visual">
                        <HumanBodySVG
                            view="front"
                            selectedPart={highlightPart}
                            onPartClick={() => { }}
                            height={450}
                        />
                    </div>

                    {/* Info Side */}
                    <div className="showcase-info-panel">
                        <div key={item.id} className="showcase-card">
                            <div className="showcase-header">
                                <h2>{item.issue}</h2>
                                <div className="showcase-badges">
                                    <span className={`severity-tag ${item.severity || 'mild'}`}>{item.severity || 'Recorded'}</span>
                                </div>
                            </div>

                            <p className="showcase-detail">
                                {item.note || "No additional notes provided for this record."}
                            </p>

                            <div className="showcase-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Date Recorded</span>
                                    <span className="meta-value">{item.date}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Affected Area</span>
                                    <span className="meta-value">{item.domain} • {item.specificPart}</span>
                                </div>
                            </div>

                            <div className="showcase-progress" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Helper: Render Confirmed Conditions Section
    const renderMedicalProfile = () => {
        const conditions = Object.keys(medicalProfile);

        if (conditions.length === 0) return (
            <div className="report-section empty-state" onClick={() => setShowProfileModal(true)}>
                <div className="empty-content">
                    <Activity size={24} className="icon-placeholder" />
                    <p>No confirmed medical conditions on file.</p>
                    <button className="btn-link">Update Medical Profile</button>
                </div>
            </div>
        );

        return (
            <div className="report-section highlight-section">
                <div className="report-header">
                    <h3>🩺 Confirmed Medical Conditions</h3>
                    <div className="header-line"></div>
                    <button className="btn-icon-small" onClick={() => setShowProfileModal(true)}>
                        <UserCog size={16} />
                    </button>
                </div>
                <div className="conditions-list">
                    {conditions.map(id => {
                        const data = medicalProfile[id];
                        return (
                            <div key={id} className="condition-tag">
                                <span className="cond-name">{COMMON_CONDITIONS.find(c => c.id === id)?.label || id}</span>
                                {data.type && <span className="cond-type">{data.type}</span>}
                                <span className="cond-year">Since {data.year}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="history-page-container">
            <header className="history-header">
                <div className="header-content">
                    <div>
                        <h2>Medical Case History</h2>
                        <p>Patient ID: P-1024 • Interactive Visual Report</p>
                    </div>
                    {/* View Toggles */}
                    <div className="view-toggles">
                        <button
                            className={`toggle-btn ${viewMode === 'visual' ? 'active' : ''}`}
                            onClick={() => setViewMode('visual')}
                        >
                            Visual Map
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                            onClick={() => setViewMode('timeline')}
                        >
                            Timeline
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'report' ? 'active' : ''}`}
                            onClick={() => setViewMode('report')}
                        >
                            Report
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'showcase' ? 'active' : ''}`}
                            onClick={() => setViewMode('showcase')}
                        >
                            <Activity size={14} style={{ marginRight: 6 }} /> Showcase
                        </button>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-action" onClick={() => setShowProfileModal(true)}>
                        <UserCog size={16} /> Profile
                    </button>
                    <button className="btn-secondary-action" onClick={() => setShowHealthLogger(true)}>
                        <PlusCircle size={16} /> Log Daily Health
                    </button>
                    <button className="btn-export">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </header>

            {viewMode === 'visual' ? (
                <div className="history-content-grid">
                    {/* Left: Interactive Model Navigation */}
                    <div className="history-sidebar">
                        <h4>Select Region</h4>
                        <div className="body-nav-container">
                            <HumanBodySVG
                                view="front"
                                selectedPart={selectedOrgan}
                                onPartClick={(id) => {
                                    // Normalize ID logic
                                    let domain = id;
                                    if (id === 'abdomen') domain = 'stomach';
                                    if (id.includes('arm')) domain = 'arms';
                                    if (id.includes('leg')) domain = 'legs';
                                    setSelectedOrgan(domain);
                                    setIsMobilePanelOpen(true); // Open Bottom Sheet on Mobile
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Detailed View (Read Only Mode) */}
                    <div className={`history-detail-view ${isMobilePanelOpen ? 'mobile-open' : ''}`}>
                        {/* Mobile Close Handle */}
                        <div className="mobile-drag-handle" onClick={() => setIsMobilePanelOpen(false)}></div>

                        <OrganDetailPanel
                            organId={selectedOrgan}
                            existingIssue={
                                historyData.filter(h => {
                                    // Robust matching: Check if organ ID or domain matches selected view
                                    if (!h.organId) return false;
                                    const hOrgan = h.organId.toLowerCase();
                                    const sOrgan = selectedOrgan.toLowerCase();

                                    // Head/Neck
                                    if (sOrgan === 'head' && (hOrgan === 'head' || hOrgan === 'neck' || hOrgan === 'brain' || hOrgan === 'eyes' || hOrgan === 'teeth')) return true;
                                    // Chest
                                    if (sOrgan === 'chest' && (hOrgan === 'chest' || hOrgan === 'heart' || hOrgan === 'lungs')) return true;
                                    // Stomach/Abdomen
                                    if (sOrgan === 'stomach' && (hOrgan === 'stomach' || hOrgan === 'abdomen' || hOrgan === 'liver' || hOrgan === 'kidneys' || hOrgan === 'plevis')) return true;
                                    // Limbs
                                    if (sOrgan.includes('arm') && hOrgan.includes('arm')) return true;
                                    if (sOrgan.includes('leg') && hOrgan.includes('leg')) return true;

                                    return hOrgan === sOrgan;
                                })
                            }
                            onClose={() => setIsMobilePanelOpen(false)}
                            onUpdate={(data) => console.log('History Update:', data)}
                        />
                    </div>
                </div>
            ) : viewMode === 'timeline' ? (
                renderTimeline()
            ) : viewMode === 'showcase' ? (
                renderShowcase()
            ) : (
                <div className="report-view-container">
                    {renderMedicalProfile()}
                    {renderReport().props.children} {/* Reuse the existing report list content */}
                </div>
            )}

            {/* Visual Health Logger Modal */}
            {showHealthLogger && (
                <VisualHealthLogger
                    onClose={() => setShowHealthLogger(false)}
                    onSave={(data) => {
                        console.log('Health Log Saved:', data);
                        setShowHealthLogger(false);
                    }}
                />
            )}

            {/* Medical Profile Modal */}
            {showProfileModal && (
                <MedicalConditionsModal
                    existingData={medicalProfile}
                    onClose={() => setShowProfileModal(false)}
                    onSave={(data) => {
                        setMedicalProfile(data);
                        setShowProfileModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default MedicalHistoryPage;
