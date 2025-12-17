// FRONTEND: src/store/authToken.ts

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

export const getAuthToken = (): string | null => authToken;
