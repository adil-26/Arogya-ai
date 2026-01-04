import './globals.css';

export const metadata = {
    title: 'Aarogya AI - Advanced Health Dashboard',
    description: 'AI-powered personal health management and visual medical records.',
};

import Providers from '../components/Providers';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Preconnect for Google Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
            </head>
            <body>
                <Providers>
                    <div id="root">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
