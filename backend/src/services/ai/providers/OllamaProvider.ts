import { AIProvider } from "./AIProvider";

export class OllamaProvider implements AIProvider {
    async chat(message: string): Promise<string> {
        const res = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",
                prompt: this.prompt(message),
                stream: false,
            }),
        });

        if (!res.ok) {
            throw new Error("Ollama unavailable");
        }

        const data = await res.json();
        return data.response;
    }

    private prompt(userMessage: string) {
        return `
You are a disaster-safety AI assistant.
- Be calm
- Give step-by-step guidance
- Encourage emergency services if danger exists

User message:
${userMessage}
`.trim();
    }
}
