import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveJson<T>(key: string, value: T): Promise<void> {
    try {
        const json = JSON.stringify(value);
        await AsyncStorage.setItem(key, json);
    } catch (e) {
        console.warn('Error saving', key, e);
    }
}

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
    try {
        const json = await AsyncStorage.getItem(key);
        if (!json) return fallback;
        return JSON.parse(json) as T;
    } catch (e) {
        console.warn('Error loading', key, e);
        return fallback;
    }
}
