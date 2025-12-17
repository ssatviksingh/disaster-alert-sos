import React from "react";
import { View, StyleSheet, Linking, TouchableOpacity, Alert, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import { useAlertsStore } from "../../store/alertsStore";
import { colors } from "../../theme/colors";
import { useAppTheme } from "../../theme/useTheme";
import { timeAgo } from "../../utils/timeAgo";

type Props = NativeStackScreenProps<RootStackParamList, "AlertDetail">;

const severityColors = {
  critical: { bg: colors.danger, text: "#fff" },
  high: { bg: colors.warning, text: "#000" },
  medium: { bg: "#facc15", text: "#000" },
  low: { bg: "#86efac", text: "#000" },
};

const disasterEmoji: Record<string, string> = {
  earthquake: "🌎",
  flood: "🌊",
  fire: "🔥",
  storm: "⛈️",
  cyclone: "🌀",
  default: "⚠️",
};

const defaultTips: Record<string, string[]> = {
  earthquake: [
    "Drop, cover, and hold on until shaking stops.",
    "Stay away from windows and heavy furniture.",
    "After shaking stops, evacuate safely.",
  ],
  flood: [
    "Avoid walking or driving through flood water.",
    "Move to higher ground immediately.",
    "Disconnect appliances if safe to do so.",
  ],
  fire: [
    "Stay low to avoid smoke.",
    "Use stairs, not elevators, when evacuating.",
    "If clothes catch fire: Stop, Drop, Roll.",
  ],
  storm: [
    "Stay indoors and away from windows.",
    "Unplug electronics if possible.",
    "Avoid wired devices during lightning.",
  ],
  default: [
    "Stay calm and follow authorities.",
    "Avoid unnecessary travel.",
    "Keep your phone charged.",
  ],
};

const AlertDetailScreen: React.FC<Props> = ({ route }) => {
  const theme = useAppTheme();
  const { alertId } = route.params;

  const alert = useAlertsStore((s) =>
    s.alerts.find((a) => a._id === alertId)
  );

  if (!alert) {
    return (
      <Screen>
        <AppText variant="title">Alert not found</AppText>
      </Screen>
    );
  }

  const sev = severityColors[alert.severity];
  const emoji = disasterEmoji[alert.type] || disasterEmoji.default;
  const tips = defaultTips[alert.type] ?? defaultTips.default;

  const hasCoords =
    typeof alert.latitude === "number" &&
    typeof alert.longitude === "number";

  const openInMaps = () => {
    if (!hasCoords) {
      Alert.alert("Location unavailable", "No coordinates for this alert.");
      return;
    }

    const url = `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open maps.")
    );
  };

  return (
    <Screen>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* HEADER */}
      <View style={[styles.severityBox, { backgroundColor: sev.bg }]}>
        <AppText style={{ color: sev.text, fontWeight: "700", fontSize: 18 }}>
          {alert.title}
        </AppText>
        <AppText style={{ color: sev.text, marginTop: 4, fontWeight: "600" }}>
          {alert.severity.toUpperCase()}
        </AppText>
      </View>

      {/* INFO CARD */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Event information</AppText>

        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <AppText style={{ fontSize: 28, marginRight: 10 }}>{emoji}</AppText>

          <View style={{ flexShrink: 1 }}>
            <AppText variant="small" muted>
              {alert.type}
            </AppText>
            <AppText style={{ marginTop: 2 }}>{alert.location}</AppText>
            <AppText variant="small" muted style={{ marginTop: 2 }}>
              {timeAgo(alert.createdAt)}
            </AppText>
          </View>
        </View>
      </View>

      {/* ALERT DESCRIPTION */}
{alert.description ? (
  <View
    style={[
      styles.card,
      { backgroundColor: theme.surface, borderColor: theme.cardBorder },
    ]}
  >
    <AppText variant="subtitle">Details</AppText>

    <AppText style={{ marginTop: 8 }}>
      {alert.description}
    </AppText>
  </View>
) : null}


      {/* SAFETY TIPS */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Safety tips</AppText>

        <View style={{ marginTop: 10 }}>
          {tips.map((tip, idx) => (
            <AppText key={idx} style={{ marginBottom: 6 }}>
              • {tip}
            </AppText>
          ))}
        </View>
      </View>

      {/* LOCATION MAP */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openInMaps}
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Location</AppText>

        <View
          style={[
            styles.mapBox,
            {
              backgroundColor: theme.background,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {hasCoords ? (
            <>
              <AppText variant="small">
                📍 Tap to open in Maps
              </AppText>
              <AppText variant="small" muted style={{ marginTop: 6 }}>
                Lat: {alert.latitude?.toFixed(5)} • Lng:{" "}
                {alert.longitude?.toFixed(5)}
              </AppText>
            </>
          ) : (
            <AppText variant="small" muted>
              Location coordinates unavailable.
            </AppText>
          )}
        </View>
      </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  severityBox: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  mapBox: {
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AlertDetailScreen;
