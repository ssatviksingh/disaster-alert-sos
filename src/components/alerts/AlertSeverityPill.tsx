import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

type Severity = 'critical' | 'high' | 'medium' | 'low';

export const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case 'critical':
      return colors.severityCritical;
    case 'high':
      return colors.severityHigh;
    case 'medium':
      return colors.severityMedium;
    case 'low':
    default:
      return colors.severityLow;
  }
};

type Props = {
  severity: Severity;
};

const AlertSeverityPill: React.FC<Props> = ({ severity }) => {
  const label = severity.toUpperCase();
  const bg = getSeverityColor(severity);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
});

export default AlertSeverityPill;
