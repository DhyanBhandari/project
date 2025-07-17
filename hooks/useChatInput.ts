/**
 * @file hooks/useChatInput.ts (Enhanced version)
 * @description Enhanced chat input hook with smooth keyboard tracking
 */

import { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Keyboard,
  EmitterSubscription,
  Platform,
  Easing,
} from 'react-native';

export function useChatInput() {
  const [chatText, setChatText] = useState('');
  const [isChatFocused, setIsChatFocused] = useState(false);
  const chatInputHeight = useRef(new Animated.Value(60)).current; // Start with base height
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const isKeyboardVisible = useRef(false);

  const handleChatFocus = () => {
    setIsChatFocused(true);
    
    // Animate to expanded height
    Animated.spring(chatInputHeight, {
      toValue: 140, // Expanded height
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleChatBlur = () => {
    // Only blur if keyboard is not visible (to prevent auto-blur on Android)
    if (!isKeyboardVisible.current) {
      setIsChatFocused(false);
      
      // Animate back to collapsed height
      Animated.spring(chatInputHeight, {
        toValue: 60, // Collapsed height
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const handleChatSubmit = () => {
    if (chatText.trim()) {
      console.log('Sending message:', chatText);
      setChatText('');
      
      // Keep focus after sending to allow continuous typing
      // User can manually close by tapping the X button
    }
  };

  const forceClose = () => {
    setIsChatFocused(false);
    isKeyboardVisible.current = false;
    
    Keyboard.dismiss();
    
    Animated.parallel([
      Animated.spring(chatInputHeight, {
        toValue: 60,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(keyboardOffset, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  useEffect(() => {
    let showSub: EmitterSubscription;
    let hideSub: EmitterSubscription;

    if (Platform.OS === 'ios') {
      showSub = Keyboard.addListener('keyboardWillShow', (event) => {
        isKeyboardVisible.current = true;
        
        Animated.timing(keyboardOffset, {
          toValue: event.endCoordinates.height,
          duration: event.duration || 250,
          easing: Easing.bezier(0.17, 0.59, 0.4, 0.77),
          useNativeDriver: false,
        }).start();
      });

      hideSub = Keyboard.addListener('keyboardWillHide', (event) => {
        isKeyboardVisible.current = false;
        
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: event.duration || 250,
          easing: Easing.bezier(0.17, 0.59, 0.4, 0.77),
          useNativeDriver: false,
        }).start(() => {
          // After keyboard hides, collapse the input
          setIsChatFocused(false);
          Animated.spring(chatInputHeight, {
            toValue: 60,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        });
      });
    } else {
      // Android
      showSub = Keyboard.addListener('keyboardDidShow', (event) => {
        isKeyboardVisible.current = true;
        
        Animated.timing(keyboardOffset, {
          toValue: event.endCoordinates.height,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
      });

      hideSub = Keyboard.addListener('keyboardDidHide', () => {
        isKeyboardVisible.current = false;
        
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start(() => {
          // After keyboard hides, collapse the input
          setIsChatFocused(false);
          Animated.spring(chatInputHeight, {
            toValue: 60,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        });
      });
    }

    return () => {
      showSub?.remove();
      hideSub?.remove();
    };
  }, [keyboardOffset, chatInputHeight]);

  return {
    chatText,
    setChatText,
    isChatFocused,
    chatInputHeight,
    keyboardOffset,
    handleChatFocus,
    handleChatBlur,
    handleChatSubmit,
    forceClose, // New method to force close the chat input
  };
}