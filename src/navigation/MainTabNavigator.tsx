import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import AlertsHomeScreen from '../screens/alerts/AlertsHomeScreen';
import SosScreen from '../screens/sos/SosScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import FilesScreen from '../screens/files/FilesScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { useAppTheme } from '../theme/useTheme';
import { View, Text, StyleSheet, Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

const EmojiIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused && styles.iconFocused]}>{emoji}</Text>
    {focused && <View style={styles.indicator} />}
  </View>
);

const MainTabNavigator = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Alerts"
        component={AlertsHomeScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="🚨" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SosScreen}
        options={{
          tabBarLabel: 'SOS',
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="🆘" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="🤖" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Files"
        component={FilesScreen}
        options={{
          tabBarLabel: 'Files',
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="📁" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => (
            <EmojiIcon emoji="⚙️" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: 20,
    transition: 'transform 0.2s',
  },
  iconFocused: {
    fontSize: 24,
    transform: [{ scale: 1.1 }],
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
});

export default MainTabNavigator;
