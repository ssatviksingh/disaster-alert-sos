import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useLocationStore } from '../../store/locationStore';
import { useSettingsStore } from '../../store/settingsStore';
import { timeAgo } from '../../utils/timeAgo';
import { useAppTheme } from '../../theme/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveLocation'>;

const LiveLocationScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();

  const {
    isSharing,
    latitude,
    longitude,
    startedAt,
    startSharing,
    stopSharing,
    nearbyRisks,
    init,
  } = useLocationStore();

  // safe: settings.contacts may be undefined if store didn't initialise yet
  const contactsCount = useSettingsStore((s) =>
    Array.isArray(s.contacts) ? s.contacts.length : 0
  );

  useEffect(() => {
    if (typeof init === 'function') {
      init().catch((e) => console.log('[LiveLocation] init error', e));
    }
  }, [init]);

  const startedAgo =
    startedAt != null ? timeAgo(new Date(startedAt).getTime()) : null;

  // ✅ FIX: derive mock vs real location locally
  const isMockLocation =
    isSharing &&
    latitude === 28.6139 &&
    longitude === 77.209;

  // Ensure we always treat nearbyRisks as an array
  const risks = Array.isArray(nearbyRisks) ? nearbyRisks : [];

  const severityColors: Record<string, string> = {
    critical: '#DC2626',
    high: '#F97316',
    medium: '#EAB308',
    low: '#22C55E',
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.container}>
          <AppText variant="title">Live location</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>
            When enabled, your location will be shared with your SOS backend and
            emergency contacts (Phase 2).
          </AppText>

          {/* STATUS */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.cardBorder },
            ]}
          >
            <AppText variant="label" muted>
              STATUS
            </AppText>
            <AppText
              variant="subtitle"
              style={{
                marginTop: 6,
                color: isSharing ? '#16a34a' : theme.textPrimary,
              }}
            >
              {isSharing ? 'Sharing live location' : 'Not sharing'}
            </AppText>
            {isSharing && startedAgo && (
              <AppText variant="small" muted style={{ marginTop: 4 }}>
                Started {startedAgo}
              </AppText>
            )}
          </View>

          {/* CURRENT LOCATION */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.cardBorder },
            ]}
          >
            <AppText variant="label" muted>
              CURRENT LOCATION
            </AppText>

            {latitude != null && longitude != null ? (
              <>
                <AppText variant="small" style={{ marginTop: 6 }}>
                  Lat: {Number(latitude).toFixed(6)} • Lng:{' '}
                  {Number(longitude).toFixed(6)}
                </AppText>
                <AppText variant="small" muted style={{ marginTop: 4 }}>
                  {isSharing
                    ? 'Location is being tracked and shared in real-time.'
                    : 'Location will update when sharing starts.'}
                </AppText>
              </>
            ) : (
              <AppText variant="small" muted style={{ marginTop: 6 }}>
                Location will appear here once you start sharing.
              </AppText>
            )}

            <AppText variant="small" muted style={{ marginTop: 4 }}>
              Source: {isMockLocation ? 'Mock (emulator)' : 'GPS (real device)'}
            </AppText>
          </View>

          {/* NEARBY RISK ZONES */}
          {risks.length > 0 && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: risks.some((r) => r.severity === 'critical')
                    ? '#DC2626'
                    : theme.cardBorder,
                  borderWidth: risks.some((r) => r.severity === 'critical')
                    ? 2
                    : 1,
                },
              ]}
            >
              <AppText variant="label" muted>
                ⚠️ NEARBY RISK ZONES
              </AppText>

              {risks.map((risk: any) => (
                <View
                  key={risk.id ?? `${risk.latitude}-${risk.longitude}`}
                  style={[
                    styles.riskItem,
                    {
                      backgroundColor: `${
                        severityColors[risk.severity] ?? '#000'
                      }15`,
                      borderLeftColor:
                        severityColors[risk.severity] ?? theme.primary,
                    },
                  ]}
                >
                  <AppText
                    style={{
                      fontWeight: '600',
                      color:
                        severityColors[risk.severity] ?? theme.primary,
                    }}
                  >
                    {risk.name}
                  </AppText>
                  <AppText variant="small" muted style={{ marginTop: 2 }}>
                    {risk.type} • Within {Math.round(risk.radius ?? 0)}m
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {/* SHARING TARGETS */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.cardBorder },
            ]}
          >
            <AppText variant="label" muted>
              SHARING TARGETS
            </AppText>
            <AppText variant="small" style={{ marginTop: 6 }}>
              Emergency contacts: {contactsCount}
            </AppText>
            <AppText variant="small" muted style={{ marginTop: 4 }}>
              Once backend is connected, your location + SOS context will be sent
              to your trusted contacts and our safety service.
            </AppText>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            {isSharing ? (
              <AppButton
                title="Stop sharing"
                variant="outline"
                onPress={stopSharing}
              />
            ) : (
              <AppButton
                title="Start sharing live location"
                variant="primary"
                onPress={startSharing}
              />
            )}

            <AppButton
              title="View SOS history"
              variant="outline"
              onPress={() => navigation.navigate('SosHistory')}
            />
            <AppButton
              title="Manage emergency contacts"
              variant="outline"
              onPress={() => navigation.navigate('EmergencyContacts')}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  riskItem: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
});

export default LiveLocationScreen;
