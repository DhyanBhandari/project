// components/FABMenu.tsx

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Plus, Heart, User, Rss } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

const actions: ActionItem[] = [
  {
    icon: <Heart size={24} color="white" />,
    label: 'Favorites',
    onPress: () => console.log('Go to Favorites'),
  },
  {
    icon: <User size={24} color="white" />,
    label: 'Profile',
    onPress: () => console.log('Go to Profile'),
  },
  {
    icon: <Rss size={24} color="white" />,
    label: 'Feed',
    onPress: () => console.log('Go to Feed'),
  },
];

export default function FABMenu() {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const { currentTheme } = useTheme();

  const toggleMenu = () => {
    Animated.timing(animation, {
      toValue: open ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.95],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Blur backdrop */}
      {open && (
        <Pressable onPress={toggleMenu} style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <BlurView
              tint={currentTheme === 'dark' ? 'dark' : 'light'}
              intensity={100}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Pressable>
      )}

      {/* Floating Actions */}
      <View style={styles.fabContainer}>
        {actions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(index + 1) * 70],
          });

          return (
            <Animated.View key={index} style={[styles.actionButton, { transform: [{ translateY }] }]}>
              <BlurView style={styles.glassCard} intensity={100} tint={currentTheme === 'dark' ? 'dark' : 'light'}>
                <TouchableOpacity onPress={action.onPress} style={styles.innerAction}>
                  {action.icon}
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <TouchableOpacity onPress={toggleMenu} style={styles.fab}>
          <Plus size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: '#3b82f6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  glassCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  innerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});
