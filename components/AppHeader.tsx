/**
 * @file components/AppHeader.tsx
 * @description Reusable app header with logo and menu button
 * @features - Logo display, menu toggle, theme support
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Menu } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface AppHeaderProps {
  onMenuPress: () => void;
  logoSource?: any;
}

export default function AppHeader({ 
  onMenuPress, 
  logoSource = require('@/assets/images/logo-supe.png') 
}: AppHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: 'transparent' }]}>
      <View style={styles.logoSection}>
        <Image
          source={logoSource}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>
      
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Menu size={38} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 100,
    height: 100,
  },
  menuButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
  },
});