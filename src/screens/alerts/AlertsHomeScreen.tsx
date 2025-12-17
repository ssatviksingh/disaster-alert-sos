import React, { useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  AppState,
} from "react-native";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AlertCard from "../../components/alerts/AlertCard";
import { useAlertsStore } from "../../store/alertsStore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import AppButton from "../../components/common/AppButton";
import { useNetworkStore } from "../../store/networkStore";
import { colors } from "../../theme/colors";
import { timeAgo } from "../../utils/timeAgo";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

/* helpers unchanged */

const severityRank: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const sortAlerts = (alerts: any[]) =>
  [...alerts].sort((a, b) => {
    const sevDiff = severityRank[a.severity] - severityRank[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

const groupBySeverity = (alerts: any[]) => ({
  critical: alerts.filter(a => a.severity === "critical"),
  high: alerts.filter(a => a.severity === "high"),
  medium: alerts.filter(a => a.severity === "medium"),
  low: alerts.filter(a => a.severity === "low"),
});

const AlertsHomeScreen: React.FC<Props> = ({ navigation }) => {
  const rawAlerts = useAlertsStore(s => s.alerts);
  const lastUpdated = useAlertsStore(s => s.lastUpdated);
  const loading = useAlertsStore(s => s.loading);
  const init = useAlertsStore(s => s.init);
  const refreshStore = useAlertsStore(s => s.refresh);
  const error = useAlertsStore(s => s.error);

  const isOnline = useNetworkStore(s => s.isOnline);

  const appState = useRef(AppState.currentState);

  const sortedAlerts = useMemo(() => sortAlerts(rawAlerts), [rawAlerts]);
  const grouped = useMemo(() => groupBySeverity(sortedAlerts), [sortedAlerts]);

  const hasAlerts = sortedAlerts.length > 0;
  const isStale = !isOnline && hasAlerts && lastUpdated;
  const isEmpty = sortedAlerts.length === 0 && !loading;
  const isCalmState = isEmpty && isOnline && !error;

  useEffect(() => {
    init();
  }, [init]);

  /* 🔋 Phase 5 – Step 3: app-state aware refresh */
  useEffect(() => {
    if (!isOnline) return;

    let interval: NodeJS.Timeout | null = null;

    const start = () => {
      if (!interval) {
        interval = setInterval(() => {
          refreshStore({ silent: true });
        }, 60000); // 1 min, quieter
      }
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const sub = AppState.addEventListener("change", next => {
      if (next === "active") start();
      else stop();
      appState.current = next;
    });

    start();
    return () => {
      stop();
      sub.remove();
    };
  }, [isOnline, refreshStore]);

  const handleRefresh = async () => {
    if (!isOnline) {
      Alert.alert("Offline", "You are offline. Showing cached alerts.");
      return;
    }
    await refreshStore();
  };

  const renderSection = useCallback(
    ({ item }: any) => (
      <View style={{ marginTop: 20 }}>
        <AppText variant="subtitle" style={{ marginBottom: 8 }}>
          {item.title}
        </AppText>
        {item.data.map((alert: any) => (
          <AlertCard
            key={alert._id}
            alert={alert}
            onPress={() =>
              navigation.navigate("AlertDetail", { alertId: alert._id })
            }
          />
        ))}
      </View>
    ),
    [navigation]
  );

  const sections = useMemo(
    () =>
      [
        { key: "critical", title: "🚨 Critical alerts", data: grouped.critical },
        { key: "high", title: "⚠️ High alerts", data: grouped.high },
        { key: "medium", title: "ℹ️ Medium alerts", data: grouped.medium },
        { key: "low", title: "🟢 Low alerts", data: grouped.low },
      ].filter(s => s.data.length > 0),
    [grouped]
  );

  return (
    <Screen>
      <View style={styles.headerRow}>
        <AppText variant="title">Nearby alerts</AppText>
        <TouchableOpacity onPress={() => navigation.navigate("AlertsMap")}>
          <AppText variant="small">Map 🗺️</AppText>
        </TouchableOpacity>
      </View>

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <AppText style={styles.offlineText}>
            Offline mode: using cached alerts.
          </AppText>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <AppText style={styles.errorText}>⚠️ {error}</AppText>
        </View>
      )}

      {isStale && (
        <View style={styles.staleBox}>
          <AppText style={styles.staleText}>
            Showing cached alerts from {timeAgo(lastUpdated!)}
          </AppText>
        </View>
      )}

      {isCalmState && (
        <View style={styles.calmBox}>
          <AppText style={{ fontSize: 32 }}>🟢</AppText>
          <AppText style={styles.calmTitle}>All clear</AppText>
          <AppText variant="small" muted>
            No nearby alerts reported.
          </AppText>
        </View>
      )}

      <FlatList
        data={sections}
        keyExtractor={item => item.key}
        renderItem={renderSection}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={colors.textPrimary}
          />
        }
        ListFooterComponent={
          <View style={{ marginTop: 16 }}>
            <AppButton
              title="Search alerts & files 🔍"
              variant="secondary"
              onPress={() => navigation.navigate("Search")}
            />
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  offlineBanner: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(249,115,22,0.12)",
    borderColor: colors.warning,
    borderWidth: 1,
  },
  offlineText: {
    fontSize: 12,
    color: colors.warning,
  },
  errorBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(220,38,38,0.12)",
    borderColor: "#DC2626",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
  },
  staleBox: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(100,116,139,0.12)",
    borderColor: "#64748b",
    borderWidth: 1,
  },
  staleText: {
    fontSize: 12,
    color: "#64748b",
  },
  calmBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 18,
    borderColor: "#22C55E",
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  calmTitle: {
    marginTop: 8,
    fontWeight: "700",
    color: "#16A34A",
  },
});

export default AlertsHomeScreen;
