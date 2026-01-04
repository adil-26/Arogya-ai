'use client';

import { useState, useEffect, useCallback } from 'react';

// Generate VAPID keys for production: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLBx-hf5w1AH_4sQx4DpZxB1JyJgQgJe3jMeRSQV2rWEYL8h1FXfW4Jj0L5TDpPC4vGpgJKNxLPpQs1VbCqAKmE';

export function usePushNotifications() {
    const [permission, setPermission] = useState('default');
    const [subscription, setSubscription] = useState(null);
    const [isSupported, setIsSupported] = useState(false);
    const [registration, setRegistration] = useState(null);

    useEffect(() => {
        // Check if push notifications are supported
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);

            // Register service worker
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const reg = await navigator.serviceWorker.register('/push-sw.js');
            console.log('Service Worker registered:', reg);
            setRegistration(reg);

            // Get existing subscription
            const existingSub = await reg.pushManager.getSubscription();
            if (existingSub) {
                setSubscription(existingSub);
            }
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    };

    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            console.log('Push notifications not supported');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                await subscribeUser();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error requesting permission:', error);
            return false;
        }
    }, [isSupported, registration]);

    const subscribeUser = async () => {
        if (!registration) {
            console.error('No service worker registration');
            return null;
        }

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            setSubscription(sub);

            // Save subscription to server
            await saveSubscriptionToServer(sub);

            return sub;
        } catch (error) {
            console.error('Failed to subscribe:', error);
            return null;
        }
    };

    const saveSubscriptionToServer = async (sub) => {
        try {
            await fetch('/api/push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub.toJSON() })
            });
        } catch (error) {
            console.error('Failed to save subscription:', error);
        }
    };

    // Send a local browser notification (for testing)
    const showLocalNotification = useCallback((title, options = {}) => {
        if (permission !== 'granted') {
            console.log('Notification permission not granted');
            return;
        }

        if (registration) {
            registration.showNotification(title, {
                body: options.body || '',
                icon: options.icon || '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                vibrate: [100, 50, 100],
                data: { url: options.link || '/dashboard/health' },
                ...options
            });
        }
    }, [permission, registration]);

    return {
        permission,
        subscription,
        isSupported,
        requestPermission,
        showLocalNotification
    };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
