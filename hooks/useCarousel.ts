/**
 * @file hooks/useCarousel.ts
 * @description Custom hooks for carousel, chat input, and menu modal
 */

import { useState, useRef, useEffect } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  EmitterSubscription,
} from 'react-native';
import { CarouselItem } from '../types/Carousel';

//
// ─── CAROUSEL HOOK ─────────────────────────────────────────────────────────────
//

export function useCarousel(data: CarouselItem[], interval: number = 4000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const autoScroll = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, interval);

    return () => clearInterval(autoScroll);
  }, [data.length, interval]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex, fadeAnim, scaleAnim]);

  return {
    currentIndex,
    setCurrentIndex,
    carouselRef,
    fadeAnim,
    scaleAnim,
  };
}

//
// ─── CHAT INPUT HOOK ──────────────────────────────────────────────────────────
//

export function useChatInput() {
  const [chatText, setChatText] = useState('');
  const [isChatFocused, setIsChatFocused] = useState(false);
  const chatInputHeight = useRef(new Animated.Value(50)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const handleChatFocus = () => {
    setIsChatFocused(true);
    Animated.timing(chatInputHeight, {
      toValue: 70,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleChatBlur = () => {
    setIsChatFocused(false);
    Animated.timing(chatInputHeight, {
      toValue: 50,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleChatSubmit = () => {
    if (chatText.trim()) {
      console.log('Sending message:', chatText);
      setChatText('');
      handleChatBlur();
    }
  };

  useEffect(() => {
    const showSub: EmitterSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      Animated.timing(keyboardOffset, {
        toValue: event.endCoordinates.height + 10,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    const hideSub: EmitterSubscription = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return {
    chatText,
    setChatText,
    isChatFocused,
    chatInputHeight,
    keyboardOffset,
    handleChatFocus,
    handleChatBlur,
    handleChatSubmit,
  };
}

//
// ─── MENU MODAL HOOK ───────────────────────────────────────────────────────────
//

export function useMenuModal() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userModeDropdown, setUserModeDropdown] = useState(false);
  const [currentMode, setCurrentMode] = useState<'Personnel' | 'Business'>('Personnel');
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;

  const handleMenuToggle = () => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(menuAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(menuAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleModeSwitch = (mode: 'Personnel' | 'Business') => {
    setCurrentMode(mode);
    setUserModeDropdown(false);
    setMenuVisible(false);
  };

  return {
    menuVisible,
    setMenuVisible,
    userModeDropdown,
    setUserModeDropdown,
    currentMode,
    menuAnimation,
    backdropAnimation,
    handleMenuToggle,
    handleModeSwitch,
  };
}
