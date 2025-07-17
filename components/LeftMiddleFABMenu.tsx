/**
 * @file components/LeftMiddleFABMenu.tsx
 * @description 70% visible circular menu button on left-middle side with blur effect
 * @features - Radial menu expansion, background blur, smooth animations, arc distribution
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
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Heart, User, Rss, X, Zap } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface MenuItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  route: string;
  color: string;
  emoji: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    route: '/',
    color: '#14b8a6',
    emoji: '🏠',
  },
  {
    id: 'favorites',
    icon: Heart,
    label: 'Favorites',
    route: '/favorites',
    color: '#ef4444',
    emoji: '❤️',
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    route: '/profile',
    color: '#8b5cf6',
    emoji: '👤',
  },
  {
    id: 'network',
    icon: Rss,
    label: 'Network',
    route: '/feed',
    color: '#60a5fa',
    emoji: '📡',
  },
];

export default function LeftMiddleFABMenu() {
  const { theme, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (isOpen) {
      // Close animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setIsOpen(false));
    } else {
      // Open animation
      setIsOpen(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 150,
          friction: 7,
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
        Animated.timing(blurAnim, {
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
    outputRange: ['0deg', '135deg'],
  });

  return (
    <>
      {/* Main FAB Button - 70% visible on left-middle */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              { translateY: -35 },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={toggleMenu}
          style={[
            styles.fab,
            {
              shadowColor: isOpen ? '#ec4899' : '#3b82f6',
            },
          ]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isOpen ? ['#ec4899', '#8b5cf6', '#3b82f6'] : ['#3b82f6', '#8b5cf6', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Animated.View
              style={{
                transform: [{ rotate: rotateInterpolation }],
              }}
            >
              {isOpen ? (
                <X size={28} color="white" strokeWidth={2.5} />
              ) : (
                <Zap size={28} color="white" strokeWidth={2.5} />
              )}
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Expanded Menu Modal with Blur */}
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
              opacity: blurAnim,
            },
          ]}
        >
          <BlurView
            style={StyleSheet.absoluteFillObject}
            intensity={95}
            tint={currentTheme === 'dark' ? 'dark' : 'light'}
          />
          <Pressable style={styles.backdrop} onPress={toggleMenu} />
        </Animated.View>

        {/* Radial Menu Items - Arc Distribution */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            
            // Arc distribution with more space and better positioning
            // Home more left, Network more right, equal distribution
            const startAngle = -75; // Starting angle for wider arc
            const angleSpacing = 50; // 50° between each item for more space
            const angle = startAngle + (index * angleSpacing);
            
            const radius = 140; // Increased radius for more space
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;

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
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0, 0, 1],
                    }),
                  },
                ]}
              >
                {/* Glassmorphism Menu Button with Inline Text */}
                <TouchableOpacity
                  onPress={() => handleNavigation(item.route)}
                  style={[
                    styles.menuButton,
                    {
                      shadowColor: item.color,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <BlurView
                    style={styles.menuButtonBlur}
                    intensity={60}
                    tint="light"
                  >
                    <LinearGradient
                      colors={[`${item.color}CC`, `${item.color}FF`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.menuButtonGradient}
                    >
                      <View style={styles.buttonContent}>
                        <View style={styles.iconContainer}>
                          <IconComponent size={16} color="white" style={styles.menuIcon} />
                          <Text style={styles.emoji}>{item.emoji}</Text>
                        </View>
                        <Text style={styles.inlineLabel}>{item.label}</Text>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Glassmorphism Close Button */}
        <Animated.View
          style={[
            styles.closeButtonContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={toggleMenu}
            style={styles.closeButton}
          >
            <BlurView
              style={styles.closeButtonBlur}
              intensity={50}
              tint="dark"
            >
              <X size={20} color="white" strokeWidth={2.5} />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    top: '50%',
    left: -21, // 70px button * 0.3 = ~21 hidden (70% visible)
    zIndex: 100,
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: '50%',
    left: -21 + 35, // Center of FAB button
    transform: [{ translateY: -35 }],
    width: 1,
    height: 1,
  },
  menuItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 120,
    height: 50,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  menuButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  menuButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 12,
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  menuIcon: {
    opacity: 0.8,
  },
  inlineLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});