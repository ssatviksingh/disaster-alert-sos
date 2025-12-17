import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/useTheme';
import { aiApi } from '../../api/ai';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatThread'>;

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    role: 'system',
    text:
      'Hi, I am your safety assistant. I can help with disaster preparedness, emergency checklists, and basic first-aid guidance.\n\nI do NOT replace doctors, ambulances, or official emergency services. In a real emergency, contact your local authorities immediately.',
  },
];

const ChatThreadScreen: React.FC<Props> = () => {
  const theme = useAppTheme();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const replyText = await aiApi.chat(userText);

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.text === replyText) {
          return prev;
        }

        return [
          ...prev,
          {
            id: `${Date.now()}-bot`,
            role: 'assistant',
            text: replyText,
          },
        ];
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: 'assistant',
          text:
            "⚠️ I’m temporarily unable to access AI assistance.\n\nIf there is immediate danger:\n• Move to safety\n• Contact emergency services\n• Follow official instructions",
        },
      ]);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.role === 'system') {
      return (
        <View
          style={[
            styles.systemCard,
            { backgroundColor: theme.surface, borderColor: theme.cardBorder },
          ]}
        >
          <AppText variant="small">{item.text}</AppText>
        </View>
      );
    }

    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isUser ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: theme.primary, borderTopRightRadius: 0 }
              : {
                  backgroundColor: theme.surface,
                  borderColor: theme.cardBorder,
                  borderWidth: 1,
                  borderTopLeftRadius: 0,
                },
          ]}
        >
          <AppText
            variant="small"
            style={{ color: isUser ? '#fff' : theme.textPrimary }}
          >
            {item.text}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View
          style={[
            styles.inputBar,
            { backgroundColor: theme.surface, borderColor: theme.cardBorder },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: theme.textPrimary }]}
            placeholder="Ask about safety, preparedness, or first-aid basics…"
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary }]}
            onPress={sendMessage}
          >
            <AppText style={{ color: '#fff' }}>Send</AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  systemCard: {
    marginHorizontal: 4,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderRadius: 26,
    marginHorizontal: 12,
    marginBottom: 10,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  sendButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 26,
  },
});

export default ChatThreadScreen;
