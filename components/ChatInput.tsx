/**
 * @file components/ChatInput.tsx
 * @description Simple, always-visible mobile chat input
 * @features - Fixed positioning, responsive design, guaranteed visibility
 */

import React from 'react';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  View,
  Dimensions,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ChatInputProps {
  chatText: string;
  setChatText: (text: string) => void;
  onSubmit: () => void;
}

export default function ChatInput({
  chatText,
  setChatText,
  onSubmit,
}: ChatInputProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Type your message..."
          placeholderTextColor={theme.colors.textSecondary}
          value={chatText}
          onChangeText={setChatText}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={onSubmit}
        />
        
        <TouchableOpacity
          onPress={onSubmit}
          style={[
            styles.sendButton, 
            { 
              backgroundColor: chatText.trim() ? theme.colors.primary : theme.colors.button 
            }
          ]}
          disabled={!chatText.trim()}
        >
          <Send size={18} color={chatText.trim() ? "white" : theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Fixed position above tab bar
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});