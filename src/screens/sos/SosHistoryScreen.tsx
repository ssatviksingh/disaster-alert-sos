// src/screens/sos/SosHistoryScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import { useAppTheme } from "../../theme/useTheme";
import { useSosStore } from "../../store/sosStore";
import { colors } from "../../theme/colors";
import { timeAgo } from "../../utils/timeAgo";
import { useNavigation } from "@react-navigation/native";

const SosHistoryScreen: React.FC = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const { items, loading, init, clearHistory } = useSosStore();

  useEffect(() => {
    init();
  }, [init]);

  const handleClear = () => {
    if (!items || items.length === 0) return;
    Alert.alert(
      "Clear history",
      "This will clear SOS history on this device (backend retention may still apply). Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearHistory(),
        },
      ]
    );
  };

  return (
    <Screen>
      <AppText variant="title">SOS history</AppText>
      <AppText variant="small" muted style={{ marginTop: 4 }}>
        View all SOS attempts made from this account.
      </AppText>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="small" muted style={{ marginTop: 8 }}>
            Loading SOS history…
          </AppText>
        </View>
      )}

      {!loading && (!items || items.length === 0) && (
        <View style={styles.center}>
          <AppText>No SOS yet</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>
            Long-press the SOS button to send your first help request.
          </AppText>
        </View>
      )}

      {!loading && items && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 16 }}
          renderItem={({ item }) => {
            const statusLabel =
              item.status === "sent"
                ? "Sent"
                : item.status === "sending"
                ? "Sending"
                : item.status === "failed"
                ? "Failed"
                : "Pending";

            const statusColor =
              item.status === "sent"
                ? colors.primary
                : item.status === "sending"
                ? colors.accent
                : item.status === "failed"
                ? colors.danger
                : colors.warning;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("LiveLocation", { sosId: item.id })
                }
              >
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.statusPill,
                        { borderColor: statusColor },
                      ]}
                    >
                      <AppText
                        variant="small"
                        style={{ color: statusColor, fontWeight: "600" }}
                      >
                        {statusLabel}
                      </AppText>
                    </View>

                    <AppText variant="small" muted>
                      {timeAgo(item.createdAt)}
                    </AppText>
                  </View>

                  <AppText style={{ marginTop: 8 }}>
                    {item.message || "SOS triggered from main button"}
                  </AppText>

                  <AppText
                    variant="small"
                    muted
                    style={{ marginTop: 6 }}
                    numberOfLines={1}
                  >
                    Location:{" "}
                    {item.latitude != null &&
                    item.longitude != null &&
                    !isNaN(item.latitude) &&
                    !isNaN(item.longitude)
                      ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(
                          4
                        )}`
                      : "Unknown"}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={{ marginTop: 16 }}>
        <AppButton
          title="Clear history"
          variant="secondary"
          onPress={handleClear}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    marginTop: 32,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
});

export default SosHistoryScreen;
