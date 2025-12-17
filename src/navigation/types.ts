export type RootStackParamList = {

    Login: undefined;
    Onboarding: undefined;
    Main: undefined;

    AlertDetail: { alertId: string };
    AlertsMap: undefined;

    LiveLocation: { sosId?: string } | undefined;
    ChatThread: { threadId: string };
    FileDetail: { fileId: string };

    SosHistory: undefined;
    EmergencyContacts: undefined;
    Search: undefined;
    About: undefined;
};


export type MainTabParamList = {
    Alerts: undefined;
    SOS: undefined;
    Chat: undefined;
    Files: undefined;
    Settings: undefined;
};
