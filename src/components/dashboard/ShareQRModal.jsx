import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

const ShareQRModal = ({ onClose, userId }) => {
    const baseUrl = 'https://e2care.in';
    const shareUrl = userId ? `${baseUrl}/share/${userId}` : '';

    const [pin, setPin] = useState(null);
    const [loading, setLoading] = useState(true);

    const generatePin = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/share/generate', { method: 'POST' });
            const data = await res.json();
            if (data.pin) {
                setPin(data.pin);
            }
        } catch (error) {
            console.error("Failed to generate PIN", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generatePin();
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white', borderRadius: '24px', padding: '32px',
                width: '100%', maxWidth: '400px', textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b'
                }}>
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        background: '#eff6ff', color: '#2563eb', width: '60px', height: '60px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Secure Share</h3>
                    <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>
                        Scan QR code to view profile. <br />
                        <span style={{ color: '#ef4444', fontWeight: '500' }}>Visitor must enter the 6-digit PIN.</span>
                    </p>
                </div>

                {/* PIN Display */}
                <div style={{
                    background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px',
                    padding: '20px', marginBottom: '24px'
                }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Code</p>
                    {loading ? (
                        <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8' }}>
                            <RefreshCw className="animate-spin" size={20} /> Generating...
                        </div>
                    ) : (
                        <div style={{
                            fontSize: '2.5rem', fontWeight: '800', fontFamily: 'monospace',
                            color: '#0f172a', letterSpacing: '8px'
                        }}>
                            {pin}
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px', color: '#16a34a', fontSize: '0.8rem' }}>
                        <Clock size={14} /> Valid for 20 minutes
                    </div>
                </div>

                {/* QR Code */}
                <div style={{
                    backgroundColor: 'white', padding: '16px', borderRadius: '16px',
                    border: '1px solid #e2e8f0', display: 'inline-block',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {shareUrl ? (
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                            alt="Secure QR"
                            width={180} height={180}
                            style={{ display: 'block' }}
                        />
                    ) : (
                        <div style={{ width: 180, height: 180 }} />
                    )}
                </div>

                <div style={{ marginTop: '24px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <p>Share this screen with the doctor.</p>
                </div>
            </div>
        </div>
    );
};

export default ShareQRModal;
