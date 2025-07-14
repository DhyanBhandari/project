/**
 * @file components/DraggableLeftFABMenu.tsx
 * @description Draggable FAB menu that snaps to edges with 60% visibility
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Text,
  Dimensions,
  Pressable,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Heart, User, Rss, X, Zap } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

export default function DraggableLeftFABMenu() {
  const { theme, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ x: -21, y: screenHeight / 2 - 35 });
  
  const pan = useRef(new Animated.ValueXY({ x: -21, y: screenHeight / 2 - 35 })).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  const buttonSize = 70;
  const hiddenAmount = buttonSize * 0.4; // 40% hidden, 60% visible

  // Subtle pulsing animation when at rest
  useEffect(() => {
    if (!isDragging && !isOpen) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [isDragging, isOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !isOpen && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: () => {
        if (!isOpen) {
          setIsDragging(true);
          
          const currentX = (pan.x as any)._value;
          const currentY = (pan.y as any)._value;
          setCurrentPosition({ x: currentX, y: currentY });
          
          pan.setOffset({
            x: currentX,
            y: currentY,
          });
          pan.setValue({ x: 0, y: 0 });
          
          // Animate to full visibility and slightly larger size with bounce
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1.2,
              useNativeDriver: false,
              tension: 120,
              friction: 6,
            }),
          ]).start();
        }
      },
      onPanResponderMove: !isOpen ? (evt, gestureState) => {
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
        const currentX = (pan.x as any)._offset + gestureState.dx;
        const currentY = (pan.y as any)._offset + gestureState.dy;
        setCurrentPosition({ x: currentX, y: currentY });
      } : undefined,
      onPanResponderRelease: (evt, gestureState) => {
        if (!isOpen) {
          setIsDragging(false);
          
          pan.flattenOffset();
          
          const currentX = (pan.x as any)._value;
          const currentY = (pan.y as any)._value;
          
          // Always snap to left side only
          const snapX = -hiddenAmount;
          
          // Constrain Y position within screen bounds
          const minY = 100; // Below header
          const maxY = screenHeight - buttonSize - 150; // Above bottom elements
          const constrainedY = Math.max(minY, Math.min(maxY, currentY));
          
          // Update position state
          setCurrentPosition({ x: snapX, y: constrainedY });
          
          // Animate to snap position with smooth bounce
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: snapX, y: constrainedY },
              useNativeDriver: false,
              tension: 80,
              friction: 10,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: false,
              tension: 120,
              friction: 8,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const toggleMenu = () => {
    if (isDragging) return;
    
    if (isOpen) {
      // Close animation with staggered timing
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 180,
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
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsOpen(false));
    } else {
      // Open animation with enhanced bounce
      setIsOpen(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 120,
          friction: 6,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 1,
          duration: 350,
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
      {/* Main Draggable FAB Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scaleAnim },
            ],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
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
        <View style={[styles.menuContainer, {
          left: currentPosition.x + 35, // Center of FAB button
          top: currentPosition.y + 35,
        }]}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            
            // Arc distribution
            const startAngle = -75;
            const angleSpacing = 50;
            const angle = startAngle + (index * angleSpacing);
            
            const radius = 140;
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
    width: 70,
    height: 70,
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