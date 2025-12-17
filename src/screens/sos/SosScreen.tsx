// src/screens/sos/SosScreen.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
} from "react-native";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import { useAppTheme } from "../../theme/useTheme";
import { useSosStore } from "../../store/sosStore";
import { useLocationStore } from "../../store/locationStore";
import { useFilesStore } from "../../store/filesStore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import NetInfo from "@react-native-community/netinfo";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const IMPORTANT_TAGS = ["id", "medical", "insurance", "emergency"];

const SosScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();
  const sendSos = useSosStore((s) => s.sendSos);
  const loading = useSosStore((s) => s.loading);
  const locationStore = useLocationStore();

  const files = useFilesStore((s) => s.items);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  /* ---------------- animations ---------------- */

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  /* ---------------- auto-suggest files ---------------- */

  const suggestedFiles = useMemo(() => {
    return [...files]
      .filter((f) => f.type === "document" || f.type === "image")
      .sort((a, b) => {
        const aScore = a.tags.some((t) => IMPORTANT_TAGS.includes(t)) ? 0 : 1;
        const bScore = b.tags.some((t) => IMPORTANT_TAGS.includes(t)) ? 0 : 1;
        if (aScore !== bScore) return aScore - bScore;
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 5);
  }, [files]);

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ---------------- SOS send ---------------- */

  const performSos = async () => {
    setConfirmOpen(false);

    const net = await NetInfo.fetch();
    const lat = locationStore.latitude;
    const lng = locationStore.longitude;

    const attachments = selectedFiles
      .map((id) => files.find((f) => f._id === id))
      .filter(Boolean)
      .map((f) => ({
        fileId: f!._id,
        name: f!.name,
        type: f!.type,
      }));

    try {
      await sendSos({
        message: message.trim() || "SOS triggered",
        latitude: lat,
        longitude: lng,
        attachments,
      });

      setMessage("");
      setSelectedFiles([]);

      Alert.alert(
        net.isConnected ? "SOS sent" : "Offline",
        net.isConnected
          ? "Your SOS was sent successfully."
          : "SOS queued and will be sent when online."
      );
    } catch {
      Alert.alert(
        "Queued",
        "SOS could not be sent now and has been queued."
      );
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Screen>
      <View style={styles.container}>
        <AppText variant="title">SOS</AppText>

        <View style={styles.centerArea}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: theme.danger,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.sosButton}
              onLongPress={() => setConfirmOpen(true)}
            >
              <AppText style={styles.sosText}>SOS</AppText>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <AppButton
            title="Live location"
            variant="secondary"
            onPress={() => navigation.navigate("LiveLocation")}
          />
          <View style={{ height: 12 }} />
          <AppButton
            title="SOS history"
            variant="secondary"
            onPress={() => navigation.navigate("SosHistory")}
          />
        </View>
      </View>

      {/* ---------------- CONFIRM MODAL ---------------- */}

      <Modal visible={confirmOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <AppText variant="subtitle">Send SOS?</AppText>

            <TextInput
  placeholder="Optional message"
  placeholderTextColor={theme.textMuted}
  value={message}
  onChangeText={setMessage}
  style={[
    styles.messageInput,
    {
      color: theme.textPrimary,
      backgroundColor: theme.background,
      borderColor: theme.cardBorder,
    },
  ]}
  multiline
/>


            {/* 📎 Suggested files */}
            {suggestedFiles.length > 0 && (
              <>
                <AppText variant="small" style={{ marginTop: 12 }}>
                  Attach files
                </AppText>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {suggestedFiles.map((f) => {
                    const selected = selectedFiles.includes(f._id);
                    return (
                      <TouchableOpacity
                        key={f._id}
                        onPress={() => toggleFile(f._id)}
                        style={[
                          styles.fileChip,
                          selected && styles.fileChipSelected,
                        ]}
                      >
                        <AppText
                          variant="small"
                          style={{ color: selected ? "#fff" : theme.textPrimary }}
                          numberOfLines={1}
                        >
                          {selected ? "✔ " : ""}📎 {f.name}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={{ marginTop: 16 }}>
              <AppButton
                title={loading ? "Sending…" : "Send SOS"}
                onPress={performSos}
                disabled={loading}
              />
              <View style={{ height: 8 }} />
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setConfirmOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  centerArea: { alignItems: "center", marginVertical: 32 },
  pulseRing: { width: 200, height: 200, borderRadius: 100, position: "absolute" },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: { color: "#fff", fontSize: 48, fontWeight: "800" },
  footer: { paddingBottom: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { borderRadius: 20, padding: 16 },
  messageInput: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    minHeight: 70,
  },
  fileChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginTop: 8,
  },
  fileChipSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
});

export default SosScreen;
