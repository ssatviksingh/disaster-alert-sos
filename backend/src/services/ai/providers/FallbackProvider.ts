import { AIProvider } from "./AIProvider";

export class FallbackProvider implements AIProvider {
    async chat(): Promise<string> {
        return (
            "I'm currently unable to access AI assistance.\n\n" +
            "If there is immediate danger:\n" +
            "• Move to safety\n" +
            "• Contact emergency services\n" +
            "• Follow official instructions"
        );
    }
}
