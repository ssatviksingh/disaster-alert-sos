import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";

export default function OfflineBanner() {
  return (
    <View style={styles.container}>
      <AppText variant="small" style={{ color: "#fff" }}>
        ⚠️ You’re offline. Showing cached data.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
