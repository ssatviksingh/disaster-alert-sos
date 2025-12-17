// App.tsx (root) — updated to safely initialize settings
import React, { useEffect, useCallback } from "react";
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./src/navigation/RootNavigator";
import LoginStack from "./src/navigation/LoginStack";
import { useAuthStore } from "./src/store/authStore";
import useAppTheme from "./src/theme/useTheme";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AppText from "./src/components/common/AppText";
import AppSync from "./src/AppSync";
import { useSettingsStore } from "./src/store/settingsStore";
import navigationRef from "./src/navigation/navigationRef";

export default function App() {
  const token = useAuthStore((s) => s.token);
  const initializing = useAuthStore((s) => s.initializing);
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const theme = useAppTheme();

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // Robust settings init: try multiple possible names (initSettings, init, load)
  const initSettings = useSettingsStore(
    (s) => (s && (s.initSettings || s.init || s.loadSettings)) ?? undefined
  );

  const safeInitSettings = useCallback(async () => {
    try {
      if (!initSettings) return;
      // initSettings might be a function that returns promise or void
      const res = initSettings();
      if (res && typeof (res as Promise<any>).then === "function") {
        await res;
      }
    } catch (e) {
      console.warn("[App] initSettings failed:", e);
    }
  }, [initSettings]);

  useEffect(() => {
    safeInitSettings();
  }, [safeInitSettings]);

  const navTheme = {
    ...(theme.background === "#020617" || theme.background === "#000000"
      ? NavigationDarkTheme
      : NavigationDefaultTheme),
    colors: {
      ...(theme.background === "#020617" || theme.background === "#000000"
        ? NavigationDarkTheme.colors
        : NavigationDefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      border: theme.cardBorder,
      primary: theme.primary,
      text: theme.textPrimary,
      notification: theme.danger,
    },
  };

  if (initializing) {
    return (
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.background,
          }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <AppText style={{ marginTop: 12, color: theme.textPrimary }}>
            Loading...
          </AppText>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        {token ? <RootNavigator /> : <LoginStack />}
      </NavigationContainer>
      <AppSync />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});
