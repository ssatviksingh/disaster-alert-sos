// src/theme/useTheme.ts
import { useColorScheme } from "react-native";
import { useSettingsStore } from "../store/settingsStore";
import { colors } from "./colors";

/**
 * Safe theme hook — never crashes when settings are null/undefined.
 * Use this as the single theme hook across the app.
 */
export const useAppTheme = () => {
    // read raw settings object (may be null initially)
    const settings = useSettingsStore((s) => (s ? s.settings : null));
    const system = useColorScheme();

    const defaultSettings = {
        darkMode: undefined as boolean | undefined,
        largeText: false,
        highContrast: false,
    };

    const safeSettings = settings ?? defaultSettings;

    const isDark =
        typeof safeSettings.darkMode === "boolean"
            ? safeSettings.darkMode
            : system === "dark";

    const dark = {
        background: colors.background,
        surface: colors.surface,
        surfaceVariant: "#111827",
        cardBorder: colors.cardBorder,
        textPrimary: colors.textPrimary,
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

    let base = isDark ? dark : light;

    if (safeSettings.highContrast) {
        base = {
            ...base,
            background: isDark ? "#000000" : "#ffffff",
            surface: isDark ? "#0d0d0d" : "#fafafa",
            textPrimary: isDark ? "#ffffff" : "#000000",
            textSecondary: isDark ? "#e5e7eb" : "#111827",
            textMuted: isDark ? "#cbd5e1" : "#333333",
            primary: isDark ? "#ffffff" : "#000000",
            accent: isDark ? "#ffffff" : "#000000",
        };
    }

    const fontScale = safeSettings.largeText ? 1.25 : 1.0;

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

export default useAppTheme;
