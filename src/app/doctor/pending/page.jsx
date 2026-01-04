'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Clock, Stethoscope } from 'lucide-react';

export default function DoctorPendingPage() {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '50px 40px',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    background: '#FEF3C7',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 25px'
                }}>
                    <Clock size={40} color="#D97706" />
                </div>

                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#92400E', marginBottom: '15px' }}>
                    Pending Approval
                </h1>

                <p style={{ color: '#78350F', fontSize: '1.1rem', marginBottom: '20px', lineHeight: '1.6' }}>
                    Your doctor registration is being reviewed by our admin team.
                </p>

                <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                    <p style={{ color: '#92400E', margin: 0, fontSize: '0.95rem' }}>
                        <strong>What happens next?</strong><br />
                        Once approved, you'll get access to the Doctor Portal where you can:
                    </p>
                    <ul style={{ textAlign: 'left', color: '#78350F', marginTop: '15px', paddingLeft: '20px' }}>
                        <li>View and manage your patients</li>
                        <li>Create prescriptions (including acupuncture therapy)</li>
                        <li>Manage appointments</li>
                        <li>Access the medical library</li>
                    </ul>
                </div>

                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '25px' }}>
                    ⏳ Approval usually takes 24-48 hours
                </p>

                <button
                    onClick={() => router.push('/login')}
                    style={{
                        padding: '14px 30px',
                        background: '#D97706',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}
