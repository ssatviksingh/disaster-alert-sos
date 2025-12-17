import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  onLongPress: () => void;
};

const SosButton: React.FC<Props> = ({ onLongPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.9}
      onLongPress={onLongPress}
    >
      <Text style={styles.text}>SOS</Text>
      <Text style={styles.subtext}>Long press to send</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.danger,
    borderWidth: 4,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  text: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
  },
  subtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#FECACA',
  },
});

export default SosButton;
