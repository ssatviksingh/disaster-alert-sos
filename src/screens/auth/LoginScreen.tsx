import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import { useAppTheme } from "../../theme/useTheme";
import { useAuthStore } from "../../store/authStore";


const LoginScreen: React.FC = () => {
  const theme = useAppTheme();
  const { login, loading, error } = useAuthStore();

  // pre-fill with your demo user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email.trim(), password);
      // success -> RootNavigator will switch automatically
    } catch (e: any) {
      // show friendly error if login failed
      Alert.alert("Sign in failed", e?.message || "Unable to sign in. Please try again.");
    }
  };
  
  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <AppText variant="title">Disaster Alert & SOS</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>
            Sign in to sync alerts, SOS history, and safety files.
          </AppText>

          <View style={styles.form}>
            <AppText style={styles.label}>Email</AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.cardBorder,
                  color: theme.textPrimary,
                },
              ]}
            />

            <AppText style={[styles.label, { marginTop: 16 }]}>
              Password
            </AppText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.cardBorder,
                  color: theme.textPrimary,
                },
              ]}
            />

            {error ? (
              <AppText style={{ color: theme.danger, marginTop: 8 }}>
                {error}
              </AppText>
            ) : null}

            <View style={{ marginTop: 24 }}>
              <AppButton
                title={loading ? "Signing in…" : "Sign in"}
                onPress={handleLogin}
                disabled={loading}
              />
            </View>

            <AppText variant="small" muted style={{ marginTop: 16 }}>
              Demo credentials:
              {"\n"}Email: user@example.com
              {"\n"}Password: secret123
            </AppText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  form: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});

export default LoginScreen;
