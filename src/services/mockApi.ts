// src/services/mockApi.ts
import type { AlertItem } from '../components/alerts/AlertCard';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchAlerts(): Promise<AlertItem[]> {
    // simulate network delay
    await delay(700);

    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return [
        {
            id: '1',
            type: 'earthquake',
            title: 'Earthquake tremors reported',
            location: 'Delhi NCR, India',
            distanceKm: 5,
            severity: 'high',
            time: `Updated at ${timeLabel}`,
        },
        {
            id: '2',
            type: 'flood',
            title: 'Urban flooding expected in low-lying areas',
            location: 'Mumbai, India',
            distanceKm: 12,
            severity: 'critical',
            time: `Updated at ${timeLabel}`,
        },
        {
            id: '3',
            type: 'fire',
            title: 'Industrial fire reported',
            location: 'Noida, India',
            distanceKm: 8,
            severity: 'medium',
            time: `Updated at ${timeLabel}`,
        },
    ];
}
