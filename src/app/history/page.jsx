'use client';

import React from 'react';
import AppShell from '../../components/layout/AppShell';
import MedicalHistoryPage from '../../pages-old-react-router/History/MedicalHistoryPage';

export default function History() {
    return (
        <AppShell>
            <MedicalHistoryPage />
        </AppShell>
    );
}
