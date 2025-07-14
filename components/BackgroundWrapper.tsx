/**
 * @file components/BackgroundWrapper.tsx
 * @description Reusable background wrapper with image and overlay
 * @features - Background image, theme-based overlay, responsive design
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface BackgroundWrapperProps {
  children: React.ReactNode;
  source?: ImageSourcePropType;
  overlayOpacity?: number;
}

export default function BackgroundWrapper({ 
  children, 
  source = require('@/assets/images/background-.jpg'),
  overlayOpacity = 0.85 
}: BackgroundWrapperProps) {
  const { theme } = useTheme();

  return (
    <ImageBackground
      source={source}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[
        styles.overlay, 
        { 
          backgroundColor: theme.colors.background, 
          opacity: overlayOpacity 
        }
      ]} />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});