/**
 * @file hooks/useDrawer.ts
 * @description Custom hook for managing drawer state and animations
 * @integration - Integrated with PLINK app for Android back button support
 */

import { useState, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

interface UseDrawerReturn {
  isVisible: boolean;
  isAnimating: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setAnimating: (animating: boolean) => void;
}

export const useDrawer = (initialState: boolean = false): UseDrawerReturn => {
  const [isVisible, setIsVisible] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const open = useCallback(() => {
    if (!isAnimating) {
      setIsVisible(true);
    }
  }, [isAnimating]);

  const close = useCallback(() => {
    if (!isAnimating) {
      setIsVisible(false);
    }
  }, [isAnimating]);

  const toggle = useCallback(() => {
    if (!isAnimating) {
      setIsVisible(prev => !prev);
    }
  }, [isAnimating]);

  const setAnimating = useCallback((animating: boolean) => {
    setIsAnimating(animating);
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isVisible && !isAnimating) {
        close();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    });

    return () => backHandler.remove();
  }, [isVisible, isAnimating, close]);

  return {
    isVisible,
    isAnimating,
    open,
    close,
    toggle,
    setAnimating,
  };
};

/**
 * @file hooks/useNavbarDrawer.ts
 * @description Specialized hook for navbar drawer with PLINK app integration
 */

export const useNavbarDrawer = () => {
  const drawer = useDrawer();

  // Enhanced functionality specifically for navbar drawer
  const openWithHaptics = useCallback(() => {
    // Add haptic feedback if needed
    drawer.open();
  }, [drawer]);

  const closeWithHaptics = useCallback(() => {
    // Add haptic feedback if needed
    drawer.close();
  }, [drawer]);

  return {
    ...drawer,
    openWithHaptics,
    closeWithHaptics,
  };
};