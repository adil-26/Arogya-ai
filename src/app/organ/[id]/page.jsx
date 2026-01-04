'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import OrganDetailPanel from '../../../components/BodyMap/OrganDetailPanel';

const OrganDetailsPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params; // Get organ ID from URL

    // Handle closing the page (return to dashboard)
    const handleClose = () => {
        router.back();
    };

    // Handle updates (mock implementation for now)
    const handleUpdate = (data) => {
        console.log("Updated Issue:", data);
        // In real app, save to Context or Backend here
        // router.back(); // Optional: Close after save
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'white' }}>
            {/* Reuse existing component */}
            <OrganDetailPanel
                organId={id}
                existingIssue={null} // TODO: Fetch existing issue if needed
                onUpdate={handleUpdate}
                onClose={handleClose}
            />
        </div>
    );
};

export default OrganDetailsPage;
