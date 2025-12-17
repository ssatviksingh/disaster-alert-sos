import { SosRequest, ISosRequest } from '../models/SosRequest';
import { ApiError } from '../utils/ApiError';

export const sosService = {
    async createSos(userId: string, data: Partial<ISosRequest>) {
        // message is optional, but we at least constrain inputs
        const sos = await SosRequest.create({
            user: userId,
            message: data.message?.trim(),
            latitude: data.latitude,
            longitude: data.longitude,
            status: data.status ?? 'pending_send',
            attachments: data.attachments ?? [],
        });

        return sos;
    },

    async listForUser(userId: string) {
        const sosList = await SosRequest.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(200);
        return sosList;
    },

    async getByIdForUser(userId: string, id: string) {
        const sos = await SosRequest.findOne({ _id: id, user: userId });
        if (!sos) {
            throw ApiError.notFound('SOS request not found.');
        }
        return sos;
    },
};
