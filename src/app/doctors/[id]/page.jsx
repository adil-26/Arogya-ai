'use client';
import React from 'react';
import DoctorProfile from '../../../pages-old-react-router/Booking/DoctorProfile';

export default function Page({ params }) {
    // In Next.js 15, params is async, so we unwrap it if needed, or just pass prompt
    // Ideally we fetch doctor data here or in the component
    // For now, passing ID to the component
    const unwrappedParams = React.use(params);
    return <DoctorProfile doctorId={unwrappedParams.id} />;
}
