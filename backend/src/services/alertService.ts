import { Alert, IAlert } from '../models/Alert';
import { ApiError } from '../utils/ApiError';

export const alertService = {
    async createAlert(data: Partial<IAlert>) {
        if (!data.title || !data.type || !data.location || !data.severity) {
            throw ApiError.badRequest('title, type, location and severity are required.');
        }

        const alert = await Alert.create({
            type: data.type,
            title: data.title,
            description: data.description,
            location: data.location,
            latitude: data.latitude,
            longitude: data.longitude,
            severity: data.severity,
            source: data.source ?? 'manual',
        });

        return alert;
    },

    async listAlerts() {
        // latest first
        return Alert.find().sort({ createdAt: -1 }).limit(200);
    },

    async getAlertById(id: string) {
        const alert = await Alert.findById(id);
        if (!alert) {
            throw ApiError.notFound('Alert not found.');
        }
        return alert;
    },
};
