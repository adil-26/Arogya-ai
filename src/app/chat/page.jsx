'use client';

import React from 'react';
import AppShell from '../../components/layout/AppShell';
import ChatPage from '../../pages-old-react-router/Chat/ChatPage';

export default function Chat() {
    return (
        <AppShell>
            <ChatPage />
        </AppShell>
    );
}
