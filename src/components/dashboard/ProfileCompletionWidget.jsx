import React from 'react';
import { useRouter } from 'next/navigation';
import { Share2, ArrowRight, CheckCircle } from 'lucide-react';
import './ProfileCompletionWidget.css'; // We'll create this CSS

const ProfileCompletionWidget = ({ completionPercentage = 0 }) => {
    const router = useRouter();

    // Calculate colors based on progress
    const isComplete = completionPercentage === 100;
    const progressColor = isComplete ? '#22c55e' : '#3b82f6';

    const handleContinue = () => {
        router.push('/medical-history');
    };

    // New Verified State View
    if (isComplete) {
        return (
            <div className="profile-completion-widget result-verified">
                <div className="completion-header">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '50%' }}>
                            <CheckCircle size={24} color="#16a34a" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>Medical Profile Verified</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Your history is up to date.</p>
                        </div>
                    </div>
                    <button onClick={handleContinue} className="btn-review-profile">
                        View / Edit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-completion-widget">
            <div className="completion-header">
                <div>
                    <h3>Complete Your Medical Profile</h3>
                    <p>A complete profile helps doctors diagnose you 2x faster.</p>
                </div>
                <div className="completion-badge">
                    {Math.round(completionPercentage)}%
                </div>
            </div>

            <div className="completion-track">
                <div
                    className="completion-fill"
                    style={{ width: `${completionPercentage}%`, backgroundColor: progressColor }}
                ></div>
            </div>

            <div className="completion-actions">
                <div className="benefits-list">
                    <span><Share2 size={12} /> Shareable with doctors</span>
                    <span><CheckCircle size={12} /> Personalized insights</span>
                </div>
                <button onClick={handleContinue} className="btn-continue-profile">
                    Continue <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default ProfileCompletionWidget;
