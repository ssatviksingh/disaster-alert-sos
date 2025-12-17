import { useColorScheme } from "react-native";
import { useSettingsStore } from "../store/settingsStore";
import { colors } from "./colors";

export const useAppTheme = () => {
    const { settings } = useSettingsStore();
    const system = useColorScheme();

    // Respect user toggle → fallback to system theme if toggle not present
    const isDark = settings.darkMode ?? (system === "dark");

    // ----------- BASE THEMES --------------
    const dark = {
        background: colors.background,     // #071126 or your custom dark
        surface: colors.surface,           // card surface
        surfaceVariant: "#111827",
        cardBorder: colors.cardBorder,
        textPrimary: colors.textPrimary,   // bright
        textSecondary: colors.textSecondary,
        textMuted: "#94a3b8",
        primary: colors.primary,
        accent: colors.accent,
        accentSoft: "#1e293b",
        borderSubtle: "#0b1220",
    };

    const light = {
        background: "#f3f4f6",
        surface: "#ffffff",
        surfaceVariant: "#f8fafc",
        cardBorder: "#e5e7eb",
        textPrimary: "#020617",
        textSecondary: "#4b5563",
        textMuted: "#6b7280",
        primary: "#0f172a",
        accent: "#0369a1",
        accentSoft: "#e0f2fe",
        borderSubtle: "#e5e7eb",
    };

    // ----------- SELECT BASE -------------
    let base = isDark ? dark : light;

    // ----------- HIGH CONTRAST MODE ------------
    if (settings.highContrast) {
        base = {
            ...base,
            background: isDark ? "#000" : "#fff",
            surface: isDark ? "#0d0d0d" : "#fafafa",
            textPrimary: "#000000",
            textSecondary: "#000000",
            textMuted: "#333333",
            primary: "#000000",
            accent: "#000000",
        };
    }

    // ----------- FONT SCALE ---------------
    const fontScale = settings.largeText ? 1.25 : 1;

    // ----------- SHADOW / ELEVATION --------
    const shadow = {
        low: {
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        },
        medium: {
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
        },
    };

    return {
        ...base,
        danger: colors.danger,
        warning: colors.warning,
        success: colors.success,
        fontScale,
        shadow,
        fonts: {
            regular: "System",
            medium: "System",
            bold: "System",
        },
        opacityMuted: 0.5,
        dark: isDark,
    };
};
