// src/screens/settings/SettingsScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  AccessibilityRole,
  ScrollView,
} from "react-native";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import { useSettingsStore, defaultSettings } from "../../store/settingsStore";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../theme/useTheme";
import { useAuthStore } from "../../store/authStore";
import AppButton from "../../components/common/AppButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();

  // auth
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => (s as any).initializing);

  // settings store
  const {
    settings: rawSettings,
    toggleLargeText,
    toggleHighContrast,
    toggleDarkMode,
    init, // alias provided by store
    initContacts,
  } = useSettingsStore();

  // Use fallback object so components won't crash
  const settings = rawSettings ?? defaultSettings;

  useEffect(() => {
    // call init if available; defensive
    if (typeof init === "function") {
      init().catch((e) => console.warn("[Settings] init failed", e));
    } else {
      // still try to initialize contacts separately
      if (typeof initContacts === "function") {
        initContacts().catch((e) => console.warn("[Settings] initContacts failed", e));
      }
    }
  }, [init, initContacts]);

  // --- Actions ---
  const confirmSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            console.log("[Settings] logout error", e);
          }
        },
      },
    ]);
  };

  const handleResetStorage = () => {
    Alert.alert(
      "Reset app storage",
      "This will clear local app data (tokens, caches, queued items). You will be signed out. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await logout();
              Alert.alert("Cleared", "App storage cleared. Restart the app if needed.");
            } catch (e) {
              console.error("[Settings] reset storage error:", e);
              Alert.alert("Error", "Failed to clear storage.");
            }
          },
        },
      ],
    );
  };

  const navTo = (screen: string) => {
    try {
      navigation.navigate(screen);
    } catch (e) {
      console.warn("[Settings] Navigation failed", e);
    }
  };

  return (
    <Screen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
      <AppText variant="title">Settings</AppText>

      {/* ACCOUNT */}
      <View style={{ marginTop: 8 }}>
        <AppText variant="subtitle">Account</AppText>
        <View
  style={[
    styles.floatingRow,
    {
      backgroundColor: theme.surface,
      borderColor: theme.cardBorder,
      alignItems: "center",
    },
  ]}
>
  {/* LEFT: avatar + text (constrained) */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
      minWidth: 0, // 🔥 IMPORTANT
    }}
  >

            <View
              accessible
              accessibilityRole={"image" as AccessibilityRole}
              accessibilityLabel={user ? `Avatar for ${user.email}` : "No user"}
              style={[
                styles.avatar,
                { backgroundColor: theme.primary + "22" /* subtle */ },
              ]}
            >
              <AppText style={{ fontWeight: "700", color: theme.primary }}>
                U
              </AppText>
            </View>

            <View style={{ flexShrink: 1 }}>
              <AppText variant="subtitle">User</AppText>
              <AppText variant="small" muted>
                {user ? `Signed in as ${user.email}` : "Not signed in"}
              </AppText>
            </View>
          </View>

          <View style={{ marginLeft: 12 }}>
  {user ? (
    <AppButton
      title="Sign out"
      variant="secondary"
      onPress={confirmSignOut}
      style={{ paddingHorizontal: 14 }}
    />
  ) : (
    <AppButton
      title="Sign in"
      onPress={() => navTo("Login" as any)}
      style={{ paddingHorizontal: 14 }}
    />
  )}
</View>

        </View>
      </View>

      {/* ACCESSIBILITY */}
      <View style={styles.sectionHeader}>
        <AppText variant="subtitle">Accessibility</AppText>
      </View>

      <View style={styles.sectionBody}>
        <Row
          label="Large text"
          description="Increase font sizes across the app."
          value={!!settings.largeText}
          onValueChange={() => toggleLargeText().catch((e) => console.warn(e))}
          theme={theme}
        />

        <Row
          label="High contrast mode"
          description="Stronger colors for better visibility."
          value={!!settings.highContrast}
          onValueChange={() => toggleHighContrast().catch((e) => console.warn(e))}
          theme={theme}
        />
      </View>

      {/* APPEARANCE */}
      <View style={styles.sectionHeader}>
        <AppText variant="subtitle">Appearance</AppText>
      </View>

      <View style={styles.sectionBody}>
        <Row
          label="Dark mode"
          description="Use a dark background to reduce glare."
          value={!!settings.darkMode}
          onValueChange={() => toggleDarkMode().catch((e) => console.warn(e))}
          theme={theme}
        />
      </View>

      {/* SAFETY */}
      <View style={styles.sectionHeader}>
        <AppText variant="subtitle">Safety</AppText>
      </View>

      <View style={styles.sectionBody}>
        <TouchableOpacity
          accessible
          accessibilityRole={"button"}
          accessibilityLabel="Emergency contacts"
          style={[styles.floatingRow, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          onPress={() => navTo("EmergencyContacts")}
        >
          <View>
            <AppText>📇 Emergency contacts</AppText>
            <AppText variant="small" muted>
              People who should be notified when you send SOS.
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          accessible
          accessibilityRole={"button"}
          accessibilityLabel="SOS history"
          style={[styles.floatingRow, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          onPress={() => navTo("SosHistory")}
        >
          <View>
            <AppText>🆘 SOS history</AppText>
            <AppText variant="small" muted>
              See all SOS attempts made from this device.
            </AppText>
          </View>
        </TouchableOpacity>
      </View>

      {/* ABOUT */}
      <View style={styles.sectionHeader}>
        <AppText variant="subtitle">About</AppText>
      </View>

      <View style={styles.sectionBody}>
        <TouchableOpacity
          style={[styles.floatingRow, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          onPress={() => navTo("About")}
        >
          <View>
            <AppText>ℹ️ About this app</AppText>
            <AppText variant="small" muted>
              Version, purpose, and data & safety information.
            </AppText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Developer tools / reset */}
      <View style={{ marginTop: 20 }}>
        <AppButton title="Reset app storage (dev)" variant="danger" onPress={handleResetStorage} />
      </View>
      </ScrollView>
    </Screen>
  );
};

function Row({
  label,
  description,
  value,
  onValueChange,
  theme,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  theme: any;
}) {
  return (
    <View style={[styles.floatingRow, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
      <View>
        <AppText>{label}</AppText>
        {description ? <AppText variant="small" muted>{description}</AppText> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        accessibilityHint={description}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 20,
    marginBottom: 4,
  },
  sectionBody: {
    gap: 10,
  },
  floatingRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
accountInfo: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  flexShrink: 1,
},
signOutBtn: {
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 16,
  backgroundColor: "#ef4444",
},
});

export default SettingsScreen;
