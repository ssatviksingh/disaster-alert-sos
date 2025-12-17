import { AlertItem } from '../../components/alerts/AlertCard';

export type SearchResultType = 'alert' | 'file' | 'sos' | 'chat';

export type SearchResult = {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle?: string;
};

type Params = {
    query: string;
    alerts: AlertItem[];
    files: { id: string; name: string; type: string }[];
};

export function localSearch({ query, alerts, files }: Params): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    // Alerts
    alerts.forEach((a) => {
        const text = `${a.title} ${a.location} ${a.type}`.toLowerCase();
        if (text.includes(q)) {
            results.push({
                id: a.id,
                type: 'alert',
                title: a.title,
                subtitle: a.location,
            });
        }
    });

    // Files
    files.forEach((f) => {
        const text = `${f.name} ${f.type}`.toLowerCase();
        if (text.includes(q)) {
            results.push({
                id: f.id,
                type: 'file',
                title: f.name,
                subtitle: f.type,
            });
        }
    });

    // Later: SOS & chat results

    return results;
}
