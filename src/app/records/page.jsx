'use client';

import React from 'react';
import AppShell from '../../components/layout/AppShell';
import RecordsPage from '../../pages-old-react-router/Records/RecordsPage';

export default function Records() {
    return (
        <AppShell>
            <RecordsPage />
        </AppShell>
    );
}
