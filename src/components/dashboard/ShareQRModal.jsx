import React from 'react';
import { X } from 'lucide-react';

const ShareQRModal = ({ onClose, userId }) => {
    // Force production URL for sharing
    const baseUrl = 'https://e2care.in';

    /* 
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, []); 
    */

    const shareUrl = userId ? `${baseUrl}/share/${userId}` : '';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                width: '350px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af'
                    }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Share Medical Profile</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '24px' }}>Scan to view read-only history summary.</p>

                <div style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #f1f5f9',
                    display: 'inline-block',
                    marginBottom: '16px'
                }}>
                    {/* Dynamic QR Code */}
                    {shareUrl ? (
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                            alt="Patient QR Code"
                            width={200}
                            height={200}
                        />
                    ) : (
                        <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                            Loading...
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: '#94a3b8',
                    backgroundColor: '#f8fafc',
                    padding: '10px',
                    borderRadius: '8px'
                }}>
                    ID: {userId ? userId.substring(0, 8).toUpperCase() : '...'} • <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span> Live Link
                </div>
            </div>
        </div>
    );
};

export default ShareQRModal;
