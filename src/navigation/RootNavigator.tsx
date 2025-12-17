import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "./types";
import MainTabNavigator from "./MainTabNavigator";

import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import AlertDetailScreen from "../screens/alerts/AlertDetailScreen";
import AlertsMapScreen from "../screens/alerts/AlertsMapScreen";
import LiveLocationScreen from "../screens/sos/LiveLocationScreen";
import ChatThreadScreen from "../screens/chat/ChatThreadScreen";
import FileDetailScreen from "../screens/files/FileDetailScreen";
import SearchScreen from "../screens/search/SearchScreen";
import SosHistoryScreen from "../screens/sos/SosHistoryScreen";
import EmergencyContactsScreen from "../screens/sos/EmergencyContactsScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import AboutScreen from "../screens/settings/AboutScreen";

import { useAppTheme } from "../theme/useTheme";
import { useAuthStore } from "../store/authStore";
import { View, ActivityIndicator } from "react-native";
import AppText from "../components/common/AppText";

import { registerForPushNotificationsAsync } from "../services/notifications";
import { useNotificationStore } from "../store/notificationStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const theme = useAppTheme();
  const { user, initializing, bootstrap } = useAuthStore();
  const pushToken = useNotificationStore((s) => s.pushToken);
  const hydrateNotifications = useNotificationStore((s) => s.hydrate);
  const setAndSyncToken = useNotificationStore((s) => s.setAndSyncToken);

  useEffect(() => {
    hydrateNotifications();
  }, [hydrateNotifications]);

  // when logged in and no token, register for notifications
  useEffect(() => {
    if (!user || pushToken) return;

    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await setAndSyncToken(token);
      }
    })();
  }, [user, pushToken, setAndSyncToken]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator />
        <AppText style={{ marginTop: 8 }}>Preparing app…</AppText>
      </View>
    );
  }

  const isAuthed = !!user;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
      }}
    >
        {!isAuthed ? (
          // 🔐 Not logged in → show Login only
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // ✅ Logged in → full app
          <>
            <Stack.Screen
              name="Onboarding"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="AlertDetail"
              component={AlertDetailScreen}
              options={{ title: "Alert Details" }}
            />
            <Stack.Screen
              name="AlertsMap"
              component={AlertsMapScreen}
              options={{ title: "Alerts Map" }}
            />
            <Stack.Screen
              name="LiveLocation"
              component={LiveLocationScreen}
              options={{ title: "Live Location" }}
            />
            <Stack.Screen
              name="ChatThread"
              component={ChatThreadScreen}
              options={{ title: "AI Assistant" }}
            />
            <Stack.Screen
              name="FileDetail"
              component={FileDetailScreen}
              options={{ title: "File" }}
            />
            <Stack.Screen
              name="SosHistory"
              component={SosHistoryScreen}
              options={{ title: "SOS history" }}
            />
            <Stack.Screen
              name="EmergencyContacts"
              component={EmergencyContactsScreen}
              options={{ title: "Emergency contacts" }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ title: "Search" }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ title: "About" }}
            />
          </>
        )}
      </Stack.Navigator>
  );
};

export default RootNavigator;
