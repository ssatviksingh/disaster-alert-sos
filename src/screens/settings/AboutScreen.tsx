import React from 'react';
import { View, StyleSheet } from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import { useAppTheme } from '../../theme/useTheme';

const AboutScreen: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Disaster Alert & SOS</AppText>
        <AppText variant="small" muted style={{ marginTop: 4 }}>
          Version 1.0.0 · Frontend prototype
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Purpose</AppText>
        <AppText variant="small" style={{ marginTop: 6 }}>
          This app is designed to help people during disasters and emergencies by
          providing real-time alerts, SOS assistance, live location sharing, and a secure
          place to store critical documents.
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Key features</AppText>
        <AppText variant="small" style={{ marginTop: 6 }}>
          • Nearby disaster alerts with severity levels{'\n'}
          • SOS button with offline queueing{'\n'}
          • Live location sharing (mocked in Phase 1){'\n'}
          • AI safety assistant (mocked replies){'\n'}
          • Safety file library for documents & media{'\n'}
          • Full-app search across alerts, SOS, and files
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Technology</AppText>
        <AppText variant="small" style={{ marginTop: 6 }}>
          Frontend: React Native, Expo, TypeScript, Zustand, AsyncStorage.{'\n'}
          Planned backend: Node.js, Express, MongoDB, WebSockets, object storage, and
          AI integration.
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Important disclaimer</AppText>
        <AppText variant="small" style={{ marginTop: 6 }}>
          This app is a helper tool only. It does not replace 112 / 911 / 999 or any
          official emergency number. In any life-threatening situation, always contact
          local emergency services first.
        </AppText>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
  },
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
  },
});

export default AboutScreen;
