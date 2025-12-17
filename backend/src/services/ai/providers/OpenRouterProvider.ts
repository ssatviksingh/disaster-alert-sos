// backend/src/services/ai/providers/OpenRouterProvider.ts
import { AIProvider } from "./AIProvider";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export class OpenRouterProvider implements AIProvider {
    private readonly apiKey: string;

    constructor() {
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("OPENROUTER_API_KEY missing");
        }
        this.apiKey = process.env.OPENROUTER_API_KEY;
    }

    async chat(message: string): Promise<string> {
        const res = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "Disaster Alert SOS",
            },
            body: JSON.stringify({
                model: "mistralai/devstral-2512:free", // ✅ correct free model
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a calm disaster-safety AI. Give step-by-step safety guidance. Be concise. Encourage contacting emergency services when danger exists. Do not give medical diagnoses.",
                    },
                    {
                        role: "user",
                        content: message,
                    },
                ],
                temperature: 0.4,
                max_tokens: 300,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`OpenRouter error: ${err}`);
        }

        const data: any = await res.json();
        return (
            data?.choices?.[0]?.message?.content?.trim() ??
            "I couldn't generate a response."
        );
    }
}
