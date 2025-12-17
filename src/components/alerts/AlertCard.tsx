import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '../common/AppText';
import { colors } from '../../theme/colors';
import { useAppTheme } from '../../theme/useTheme';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertItem = {
  id: string;
  type: 'earthquake' | 'flood' | 'fire' | 'storm' | 'cyclone' | string;
  title: string;
  location: string;
  distanceKm?: number;
  time: string; // already formatted
  severity: AlertSeverity;
};

type Props = {
  alert: AlertItem;
  onPress?: () => void;
};

const severityColors: Record<AlertSeverity, string> = {
  critical: colors.danger,
  high: '#eab308',
  medium: colors.accent,
  low: '#14b8a6',
};

const NEW_ALERT_MINUTES = 30;
const STALE_ALERT_HOURS = 24;

const AlertCard: React.FC<Props> = ({ alert, onPress }) => {
  const theme = useAppTheme();
  const sevColor = severityColors[alert.severity];
  const severityBg = `${sevColor}15`;

  // ⏱ Freshness logic (UI-only)
  const now = Date.now();
  const alertTime = new Date(alert.time).getTime();
  const ageMinutes = (now - alertTime) / (1000 * 60);
  const ageHours = ageMinutes / 60;

  const isNew = ageMinutes <= NEW_ALERT_MINUTES;
  const isStale = ageHours >= STALE_ALERT_HOURS;
  const isCritical = alert.severity === 'critical';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isCritical ? sevColor : theme.cardBorder,
          borderWidth: isCritical ? 2 : 1,
          opacity: isStale ? 0.6 : 1,
          shadowColor: isCritical ? sevColor : '#000',
        },
      ]}
    >
      <View style={styles.container}>
        {/* Severity bar */}
        <View style={[styles.severityBar, { backgroundColor: sevColor }]} />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: severityBg }]}>
              <AppText style={{ fontSize: 20 }}>
                {alert.type === 'earthquake'
                  ? '🌎'
                  : alert.type === 'flood'
                  ? '🌊'
                  : alert.type === 'fire'
                  ? '🔥'
                  : alert.type === 'storm'
                  ? '⛈️'
                  : alert.type === 'cyclone'
                  ? '🌀'
                  : '⚠️'}
              </AppText>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText style={{ fontWeight: '600' }} numberOfLines={1}>
                  {alert.title}
                </AppText>

                {isNew && (
                  <View style={styles.newBadge}>
                    <AppText style={styles.newText}>NEW</AppText>
                  </View>
                )}
              </View>

              <AppText variant="small" muted numberOfLines={1} style={{ marginTop: 2 }}>
                {alert.location}
                {alert.distanceKm != null ? ` • ${alert.distanceKm} km away` : ''}
              </AppText>

              <AppText variant="small" muted style={{ marginTop: 2 }}>
                {alert.time}
              </AppText>
            </View>

            <View style={[styles.severityPill, { backgroundColor: sevColor }]}>
              <AppText variant="small" style={styles.severityText}>
                {alert.severity.toUpperCase()}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  container: {
    flexDirection: 'row',
  },
  severityBar: {
    width: 6,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default AlertCard;
