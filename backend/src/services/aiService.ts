// backend/src/services/ai/aiService.ts
import { AIProvider } from "./ai/providers/AIProvider";
import { OpenRouterProvider } from "./ai/providers/OpenRouterProvider";
import { FallbackProvider } from "./ai/providers/FallbackProvider";

let providers: AIProvider[] | null = null;

function getProviders(): AIProvider[] {
    if (!providers) {
        providers = [
            new OpenRouterProvider(), // now created AFTER env is loaded
            new FallbackProvider(),
        ];
    }
    return providers;
}

export const aiChat = async (message: string): Promise<string> => {
    for (const provider of getProviders()) {
        try {
            return await provider.chat(message);
        } catch (e) {
            console.warn("[AI] provider failed:", e);
        }
    }

    throw new Error("All AI providers failed");
};
