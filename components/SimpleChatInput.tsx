/**
 * @file components/SimpleChatInput.tsx
 * @description Guaranteed visible chat input for all mobile devices with send animation
 * @features - Static positioning, maximum compatibility, smooth message animations
 */

import React, { useState, useRef } from 'react';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
}

export default function SimpleChatInput() {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (text.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        timestamp: new Date(),
        isUser: true,
      };

      // Start the animation sequence
      Animated.sequence([
        // Slide the message up from input
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Fade in the message
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset animations after completion
        slideAnimation.setValue(0);
        animatedValue.setValue(0);
      });

      // Add message to list
      setMessages(prev => [...prev, newMessage]);
      setText('');

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Simulate AI response after 1 second
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! I'm here to help you with anything you need.",
          timestamp: new Date(),
          isUser: false,
        };
        setMessages(prev => [...prev, aiResponse]);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
    }
  };

  const renderMessage = (message: Message) => (
    <Animated.View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          {
            color: message.isUser ? 'white' : theme.colors.text,
          },
        ]}
      >
        {message.text}
      </Text>
      <Text
        style={[
          styles.timestamp,
          {
            color: message.isUser ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary,
          },
        ]}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Animated.View>
  );

  return (
    <View style={[]}>
      
      
     

      {/* Input Area */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="Type your message here..."
          placeholderTextColor={theme.colors.textSecondary}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: text.trim() ? theme.colors.primary : theme.colors.button,
              opacity: text.trim() ? 1 : 0.6,
            },
          ]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Send size={16} color={text.trim() ? 'white' : theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginBottom: 100, // Space above tab bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  messagesContainer: {
    maxHeight: 200,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  messagesContent: {
    padding: 8,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});