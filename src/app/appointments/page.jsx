'use client';

import React from 'react';
import AppShell from '../../components/layout/AppShell';
import DoctorsPage from '../../pages-old-react-router/Booking/DoctorsPage';

export default function Appointments() {
    return (
        <AppShell>
            <DoctorsPage />
        </AppShell>
    );
}
