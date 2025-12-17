// backend/src/services/ai/providers/AIProvider.ts
export interface AIProvider {
    chat(message: string): Promise<string>;
}
