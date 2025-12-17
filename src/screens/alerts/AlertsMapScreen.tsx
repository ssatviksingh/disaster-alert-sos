import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch {}

import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import { colors } from "../../theme/colors";
import { useAlertsStore } from "../../store/alertsStore";
import { useAppTheme } from "../../theme/useTheme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "AlertsMap">;

const severityColor: Record<string, string> = {
  critical: colors.danger,
  high: "#eab308",
  medium: colors.accent,
  low: "#14b8a6",
};

/* ✅ memoized marker */
const AlertMarker = React.memo(
  ({
    alert,
    onPress,
  }: {
    alert: any;
    onPress: (id: string) => void;
  }) => (
    <Marker
      coordinate={{
        latitude: alert.latitude,
        longitude: alert.longitude,
      }}
      onPress={() => onPress(alert._id)}
    >
      <View
        style={[
          styles.marker,
          { backgroundColor: severityColor[alert.severity] },
        ]}
      >
        <AppText style={{ fontSize: 18 }}>⚠️</AppText>
      </View>
    </Marker>
  )
);

const AlertsMapScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();
  const alerts = useAlertsStore((s) => s.alerts);
  const [selected, setSelected] = useState<string | null>(null);

  /* ✅ memoized filtered alerts */
  const alertsWithCoords = useMemo(
    () =>
      alerts.filter(
        (a) =>
          typeof a.latitude === "number" &&
          typeof a.longitude === "number"
      ),
    [alerts]
  );

  /* ✅ memoized initial region */
  const initialRegion = useMemo(
    () => ({
      latitude: alertsWithCoords[0]?.latitude ?? 28.6139,
      longitude: alertsWithCoords[0]?.longitude ?? 77.209,
      latitudeDelta: 0.6,
      longitudeDelta: 0.6,
    }),
    [alertsWithCoords]
  );

  const selectedAlert = useMemo(
    () => alertsWithCoords.find((a) => a._id === selected) ?? null,
    [alertsWithCoords, selected]
  );

  const handleMarkerPress = useCallback((id: string) => {
    setSelected(id);
  }, []);

  if (!MapView || !Marker) {
    return (
      <Screen>
        <AppText variant="title">Alerts map</AppText>
        <AppText variant="small" muted>
          Map unavailable
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: 0 }}>
      <View style={styles.header}>
        <AppText variant="title">Alerts map</AppText>
        <AppText variant="small" muted>
          Tap markers to view details
        </AppText>
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
        >
          {alertsWithCoords.map((alert) => (
            <AlertMarker
              key={alert._id}
              alert={alert}
              onPress={handleMarkerPress}
            />
          ))}
        </MapView>
      </View>

      {selectedAlert && (
        <View style={[styles.bottomCard, { backgroundColor: theme.surface }]}>
          <AppText variant="subtitle">{selectedAlert.title}</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>
            {selectedAlert.location}
          </AppText>

          <AppButton
            title="Open alert"
            onPress={() =>
              navigation.navigate("AlertDetail", {
                alertId: selectedAlert._id,
              })
            }
            style={{ marginTop: 12 }}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  mapWrapper: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  bottomCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 10,
  },
});

export default AlertsMapScreen;
