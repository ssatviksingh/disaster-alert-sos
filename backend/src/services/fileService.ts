import { FileAsset, IFileAsset } from '../models/FileAsset';
import { ApiError } from '../utils/ApiError';

export const fileService = {
    async createFile(userId: string, data: Partial<IFileAsset>) {
        if (!data.name || !data.type || typeof data.sizeBytes !== 'number') {
            throw ApiError.badRequest('name, type and sizeBytes are required.');
        }

        const file = await FileAsset.create({
            user: userId,
            name: data.name,
            type: data.type,
            sizeBytes: data.sizeBytes,
            sizeLabel: data.sizeLabel ?? prettySize(data.sizeBytes),
            tags: data.tags ?? [],
            url: data.url,
        });

        return file;
    },

    async listFiles(userId: string) {
        return FileAsset.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(500);
    },

    async getFile(userId: string, id: string) {
        const file = await FileAsset.findOne({ _id: id, user: userId });
        if (!file) {
            throw ApiError.notFound('File not found.');
        }
        return file;
    },

    async deleteFile(userId: string, id: string) {
        const result = await FileAsset.findOneAndDelete({ _id: id, user: userId });
        if (!result) {
            throw ApiError.notFound('File not found or already deleted.');
        }
        return result;
    },
};

function prettySize(sizeBytes: number): string {
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    const kb = sizeBytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
}
