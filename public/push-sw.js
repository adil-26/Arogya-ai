// Service Worker for Push Notifications
// This file runs in the background and can receive push messages

self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');

    let data = {
        title: 'Aarogya AI',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        url: '/dashboard/health'
    };

    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch (e) {
        console.log('Error parsing push data:', e);
    }

    const options = {
        body: data.body || data.message,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            url: data.url || data.link || '/dashboard/health'
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click:', event.notification.tag);
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/dashboard/health';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Check if there's already a window/tab open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open new window if none exists
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Service Worker install
self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing...');
    self.skipWaiting();
});

// Service Worker activate
self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating...');
    event.waitUntil(clients.claim());
});
