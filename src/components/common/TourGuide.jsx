'use client';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

/**
 * Renders nothing visually, but triggers the tour if not seen yet.
 */
export default function TourGuide() {
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('has_seen_tour_v1');

        if (!hasSeenTour) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                steps: [
                    {
                        element: '#root',
                        popover: {
                            title: 'Welcome to E2Care 👋',
                            description: 'Let us show you around your new personal health dashboard.',
                            side: "left",
                            align: 'start'
                        }
                    },
                    {
                        element: '.nav-menu',
                        popover: {
                            title: 'Navigation',
                            description: 'Use this sidebar to switch between your Dashboard, History, Appointments, and Medical Records.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#vitals-section',
                        popover: {
                            title: 'Health Snapshot',
                            description: 'View your vital signs here. Click on any card (like Blood Pressure) to update your reading.',
                            side: "left",
                            align: 'start'
                        }
                    },
                    {
                        element: '.body-map-wrapper',
                        popover: {
                            title: 'Interactive Body Map',
                            description: 'Click on body parts to log specific pain or issues directly.',
                            side: "top",
                            align: 'start'
                        }
                    },
                    {
                        element: '.quick-actions', // Need to add this class/id
                        popover: {
                            title: 'Quick Actions',
                            description: 'Upload reports or book appointments instantly.',
                            side: "bottom",
                            align: 'start'
                        }
                    },
                    {
                        element: '.bottom-nav-fab',
                        popover: {
                            title: 'AI Assistant',
                            description: 'Chat with our AI for immediate health insights and analysis.',
                            side: "top",
                            align: 'start'
                        }
                    }
                ],
                onDestroyStarted: () => {
                    localStorage.setItem('has_seen_tour_v1', 'true');
                    driverObj.destroy();
                },
            });

            // Small delay to ensure DOM is ready
            setTimeout(() => {
                driverObj.drive();
            }, 1000);
        }
    }, []);

    return null; // Component is invisible
}
