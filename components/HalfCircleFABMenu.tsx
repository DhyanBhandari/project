/**
 * @file components/HalfCircleFABMenu.tsx
 * @description Half-circle FAB menu in left corner with 4 equally distributed icons
 * @features - Reference design implementation, half-circle layout, blur background
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Menu, Home, Heart, User, Rss, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface MenuItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  route: string;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    route: '/',
    color: '#6366f1', // Purple-blue
  },
  {
    id: 'favorites',
    icon: Heart,
    label: 'Favorites',
    route: '/favorites',
    color: '#6366f1', // Purple-blue
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    route: '/profile',
    color: '#6366f1', // Purple-blue
  },
  {
    id: 'network',
    icon: Rss,
    label: 'Network',
    route: '/feed',
    color: '#6366f1', // Purple-blue
  },
];

export default function HalfCircleFABMenu() {
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
          tension: 150,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
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
          tension: 150,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
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
    }, 150);
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Main FAB Button - Corner positioned */}
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
              backgroundColor: isOpen ? '#ec4899' : 'rgba(255, 255, 255, 0.95)', // Pink when open, white when closed
              shadowColor: '#000',
            },
          ]}
          activeOpacity={0.9}
        >
          <Animated.View
            style={{
              transform: [{ rotate: rotateInterpolation }],
            }}
          >
            {isOpen ? (
              <X size={28} color="white" />
            ) : (
              <Menu size={28} color={theme.colors.text} />
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Half-Circle Menu Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleMenu}
      >
        {/* Blurred Background */}
        <Animated.View
          style={[
            styles.blurContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <BlurView
            style={StyleSheet.absoluteFillObject}
            intensity={30}
            tint={currentTheme === 'dark' ? 'dark' : 'light'}
          />
          <Pressable style={styles.backdrop} onPress={toggleMenu} />
        </Animated.View>

        {/* Half-Circle Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            
            // Half-circle distribution: 0°, 60°, 120°, 180° (covering 180° arc)
            const baseAngle = index * 60; // 60° spacing for 4 items in 180°
            const angle = baseAngle;
            const radius = 120;
            const radian = (angle * Math.PI) / 180;
            
            // Calculate positions for half circle from left corner
            const x = Math.cos(radian) * radius;
            const y = -Math.sin(radian) * radius; // Negative for upward arc

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.menuItem,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 0.6, 1],
                          outputRange: [0, 0.8, 1],
                        }),
                      },
                    ],
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 0.4, 1],
                      outputRange: [0, 0, 1],
                    }),
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleNavigation(item.route)}
                  style={[
                    styles.menuButton,
                    {
                      backgroundColor: item.color,
                      shadowColor: item.color,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <IconComponent size={24} color="white" />
                </TouchableOpacity>
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
    top: 60, // Distance from top
    left: 30, // Distance from left edge
    zIndex: 1000,
  },
  fab: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 60 + 40, // FAB center Y position
    left: 30 + 40, // FAB center X position
    width: 1,
    height: 1,
  },
  menuItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});