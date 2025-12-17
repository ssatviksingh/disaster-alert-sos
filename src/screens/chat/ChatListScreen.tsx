import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/useTheme';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type ChatThread = {
  id: string;
  title: string;
  lastMessage: string;
};

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 't1',
    title: 'General safety tips',
    lastMessage: 'Basic preparedness for common disasters…',
  },
  {
    id: 't2',
    title: 'Earthquake guide',
    lastMessage: 'Steps to follow before, during, and after an earthquake…',
  },
];

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const theme = useAppTheme();
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);

  const openThread = (threadId: string) => {
    navigation.navigate('ChatThread', { threadId });
  };

  const createNewThread = () => {
    const id = Date.now().toString();
    const newThread: ChatThread = {
      id,
      title: 'New safety chat',
      lastMessage:
        'Ask anything about preparedness, checklists, or basic first-aid guidance.',
    };
    setThreads((prev) => [newThread, ...prev]);
    navigation.navigate('ChatThread', { threadId: id });
  };

  return (
    <Screen>
      <AppText variant="title">AI Safety Assistant</AppText>
      <AppText variant="small" muted>
        Ask about preparedness, checklists, and basic first-aid guidance. This assistant
        does not replace doctors or emergency services.
      </AppText>

      <AppButton
        title="New chat ✨"
        onPress={createNewThread}
        style={{ marginTop: 10 }}
      />

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.threadCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.cardBorder,
              },
            ]}
            onPress={() => openThread(item.id)}
          >
            <AppText variant="subtitle" numberOfLines={1}>
              {item.title}
            </AppText>
            <AppText variant="small" muted numberOfLines={2} style={{ marginTop: 2 }}>
              {item.lastMessage}
            </AppText>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText muted>No chats yet.</AppText>
            <AppText variant="small" muted style={{ marginTop: 4, textAlign: 'center' }}>
              Start a new chat to talk to your AI safety assistant.
            </AppText>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  threadCard: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
});

export default ChatListScreen;
