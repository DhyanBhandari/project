/**
 * @file components/Header.tsx
 * @description Updated header component with animated drawer support
 * @features - Seamless design, animated menu button integration
 * @developer Dhyan Bhandari
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Menu } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import AnimatedMenuButton from './AnimatedMenuButton';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showAnimatedMenu?: boolean;
  isMenuOpen?: boolean;
  onMenuPress?: () => void;
  showMenuButton?: boolean; // Legacy support
}

export default function Header({ 
  title, 
  showBackButton = false, 
  showAnimatedMenu = false,
  isMenuOpen = false,
  onMenuPress,
  showMenuButton = false, // Legacy prop
}: HeaderProps) {
  const { theme, currentTheme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      {theme.blur ? (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          intensity={theme.blurIntensity}
          tint={currentTheme === 'dark' ? 'dark' : 'light'}
        />
      ) : null}
      
      {showBackButton ? (
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      
      <Text style={[
        styles.title, 
        { 
          color: theme.colors.text,
          textShadowColor: theme.blur ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: theme.blur ? 2 : 0,
        }
      ]}>
        {title}
      </Text>
      
      {showAnimatedMenu && onMenuPress ? (
        <AnimatedMenuButton
          isOpen={isMenuOpen}
          onPress={onMenuPress}
          size={40}
          style={styles.headerMenuButton}
        />
      ) : showMenuButton && onMenuPress ? (
        // Legacy menu button support
        <TouchableOpacity 
          onPress={onMenuPress}
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
        >
          <Menu size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10,
    // Remove all borders and shadows
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMenuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
});