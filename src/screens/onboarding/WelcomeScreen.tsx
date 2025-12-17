import React from 'react';
import { View, StyleSheet } from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/useTheme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const theme = useAppTheme();

  const goNext = () => {
    navigation.navigate('Main');
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* HEADER */}
        <AppText variant="small" muted>
          Emergency-ready · Offline-friendly
        </AppText>

        <AppText variant="title" style={{ marginTop: 8 }}>
          Disaster Alert & SOS
        </AppText>

        <AppText variant="small" muted style={{ marginTop: 6 }}>
          Get real-time disaster alerts, send SOS with your live location, and keep your
          critical information ready when every second matters.
        </AppText>

        {/* FEATURE CARDS */}
        <View style={styles.cards}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.cardBorder },
            ]}
          >
            <AppText variant="small" muted>
              🔔 LIVE ALERTS
            </AppText>
            <AppText style={{ marginTop: 4 }}>
              Nearby disaster updates
            </AppText>
            <AppText variant="small" muted style={{ marginTop: 4 }}>
              See earthquakes, floods, fires and more with severity levels and map
              view.
            </AppText>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.cardBorder },
            ]}
          >
            <AppText variant="small" muted>
              🆘 SOS MODE
            </AppText>
            <AppText style={{ marginTop: 4 }}>One tap, even offline</AppText>
            <AppText variant="small" muted style={{ marginTop: 4 }}>
              Long-press the big SOS button to queue help requests and share your
              location.
            </AppText>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.cardBorder },
            ]}
          >
            <AppText variant="small" muted>
              🤖 SAFETY ASSIST
            </AppText>
            <AppText style={{ marginTop: 4 }}>
              Guidance & checklists
            </AppText>
            <AppText variant="small" muted style={{ marginTop: 4 }}>
              Ask about preparedness, go-bags, and basic first-aid. Store key files for
              emergencies.
            </AppText>
          </View>
        </View>

        {/* CTA BUTTON */}
        <View style={styles.bottom}>
          <AppButton title="Get started" onPress={goNext} />

          <View style={styles.disclaimerBox}>
            <AppText variant="small" muted style={{ textAlign: 'center' }}>
              This app is a helper tool only. It does not replace 112/911/999 or your
              local emergency services. In any life-threatening situation, call official
              authorities first.
            </AppText>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  cards: {
    marginTop: 20,
    gap: 12,
  },
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  bottom: {
    marginTop: 24,
    gap: 12,
  },
  disclaimerBox: {
    paddingHorizontal: 8,
  },
});

export default WelcomeScreen;
