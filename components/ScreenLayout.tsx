/**
 * @file components/ScreenLayout.tsx
 * @description Base layout component for consistent screen structure
 * @features - SafeAreaView wrapper, theme support, flexible children
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export default function ScreenLayout({ 
  children, 
  style,
  backgroundColor 
}: ScreenLayoutProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: backgroundColor || theme.colors.background },
      style
    ]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});