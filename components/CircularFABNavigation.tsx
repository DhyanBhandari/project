/**
 * @file components/CircularFABNavigation.tsx
 * @description Circular FAB button that replaces the bottom tab bar
 * @features - 75% visible, bottom-left position, radial menu on tap
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Text,
  Dimensions,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Menu, Home, Heart, User, Rss, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface NavigationItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  route: string;
  color: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    route: '/',
    color: '#14b8a6',
  },
  {
    id: 'favorites',
    icon: Heart,
    label: 'Favorites',
    route: '/favorites',
    color: '#ef4444',
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    route: '/profile',
    color: '#8b5cf6',
  },
  {
    id: 'feed',
    icon: Rss,
    label: 'Feed',
    route: '/feed',
    color: '#60a5fa',
  },
];

export default function CircularFABNavigation() {
  const { theme, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (isOpen) {
      // Close animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsOpen(false));
    } else {
      // Open animation
      setIsOpen(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNavigation = (route: string) => {
    toggleMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 100);
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Main FAB Button - 75% visible in bottom-left */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={toggleMenu}
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.text,
            },
          ]}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [{ rotate: rotateInterpolation }],
            }}
          >
            {isOpen ? (
              <X size={24} color={theme.colors.text} />
            ) : (
              <Menu size={24} color={theme.colors.text} />
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Radial Menu Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <BlurView
              style={StyleSheet.absoluteFillObject}
              intensity={20}
              tint={currentTheme === 'dark' ? 'dark' : 'light'}
            />
          </Animated.View>
        </Pressable>

        {/* Radial Menu Items */}
        <View style={styles.radialMenuContainer}>
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const angle = (index * 90) - 45; // Spread items in quarter circle
            const radius = 120;
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.radialItem,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                    opacity: fadeAnim,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleNavigation(item.route)}
                  style={[
                    styles.radialButton,
                    {
                      backgroundColor: item.color,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <IconComponent size={20} color="white" />
                </TouchableOpacity>
                <Text style={[styles.radialLabel, { color: theme.colors.text }]}>
                  {item.label}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    left: -17.5, // 75% visible: 70px button, so hide 25% = 17.5px
    zIndex: 1000,
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalOverlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  radialMenuContainer: {
    position: 'absolute',
    bottom: 30 + 35, // FAB center position
    left: -17.5 + 35, // FAB center position
    width: 1,
    height: 1,
  },
  radialItem: {
    position: 'absolute',
    alignItems: 'center',
  },
  radialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 4,
  },
  radialLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});