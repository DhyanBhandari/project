/**
 * @file components/DraggableLeftFABMenu.tsx
 * @description Fixed draggable FAB menu with proper positioning and reduced conflicts
 * @fixes - Better positioning, reduced z-index conflicts, improved responsiveness
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
  StatusBar,
  Platform,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Home,
  Heart,
  Rss,
  User,
  Grid3X3,
  X
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router, usePathname } from 'expo-router';

// Get screen dimensions
const { width: initialScreenWidth, height: initialScreenHeight } = Dimensions.get('window');
const statusBarHeight = StatusBar.currentHeight || 0;
const safeAreaTop = Platform.OS === 'ios' ? 44 : statusBarHeight;

interface MenuItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  route: string;
  color: string;
}

// 4 menu items: Home, Favorites, Feed, Profile
const menuItems: MenuItem[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    route: '/(tabs)',
    color: '#667eea',
  },
  {
    id: 'favorites',
    icon: Heart,
    label: 'Favorites',
    route: '/(tabs)/favorites',
    color: '#f093fb',
  },
  {
    id: 'feed',
    icon: Rss,
    label: 'Feed',
    route: '/(tabs)/feed',
    color: '#43e97b',
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    route: '/(tabs)/profile',
    color: '#4facfe',
  },
];

export default function FixedLeftFABMenu() {
  const { theme, currentTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnLeft, setIsOnLeft] = useState(true);
  const [screenDimensions, setScreenDimensions] = useState({
    width: initialScreenWidth,
    height: initialScreenHeight,
  });

  // FAB's position with better initial positioning
  const fabTranslateX = useRef(new Animated.Value(-20)).current; // Less hidden
  const fabTranslateY = useRef(new Animated.Value(initialScreenHeight / 2 - 35)).current;

  // Store the absolute pixel coordinates of the FAB
  const [fabCurrentAbsPos, setFabCurrentAbsPos] = useState({
    x: -20,
    y: initialScreenHeight / 2 - 35
  });

  // Track the drag offset manually
  const dragOffset = useRef({ x: 0, y: 0 });

  // Animation values
  const fabOpacity = useRef(new Animated.Value(0.9)).current; // More visible by default
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  // Blur Overlay Opacity (reduced z-index conflicts)
  const blurOpacity = useRef(new Animated.Value(0)).current;

  // Menu item animations
  const menuItemAnimations = useRef(
    menuItems.map(() => ({
      scale: new Animated.Value(0.3),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  const buttonSize = 60; // Slightly smaller
  const hiddenAmount = buttonSize * 0.3; // Less hidden (30% instead of 40%)

  // Handle screen orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });

      const screenCenter = window.width / 2;
      const newIsOnLeft = fabCurrentAbsPos.x < screenCenter;
      const newSnapX = newIsOnLeft ? -hiddenAmount : window.width - buttonSize + hiddenAmount;
      const minY = safeAreaTop + 50;
      const maxY = window.height - buttonSize - 120; // More space from bottom
      const newSnapY = Math.max(minY, Math.min(maxY, fabCurrentAbsPos.y));

      setFabCurrentAbsPos({ x: newSnapX, y: newSnapY });

      Animated.spring(fabTranslateX, {
        toValue: newSnapX,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();

      Animated.spring(fabTranslateY, {
        toValue: newSnapY,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    });

    return () => subscription?.remove();
  }, [fabCurrentAbsPos.x, fabCurrentAbsPos.y, hiddenAmount, buttonSize, safeAreaTop]);

  // Calculate arc positions with better spacing
  const calculateArcPosition = useCallback((index: number) => {
    const radius = 100; // Reduced radius for smaller drawer
    const itemSpacing = 60; // Reduced spacing

    let xOffset, yOffset;

    if (isOnLeft) {
      xOffset = radius + (index * 12); // Reduced spread
      yOffset = -(index * itemSpacing) + (menuItems.length - 1) * itemSpacing / 2;
    } else {
      xOffset = -radius - 120 - (index * 12); // Adjusted for smaller pills
      yOffset = -(index * itemSpacing) + (menuItems.length - 1) * itemSpacing / 2;
    }
    return { x: xOffset, y: yOffset };
  }, [isOnLeft]);

  // Improved dragging logic
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !isOpen && (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6);
      },
      onPanResponderGrant: () => {
        if (!isOpen) {
          setIsDragging(true);
          fabScale.stopAnimation();

          dragOffset.current = { x: fabCurrentAbsPos.x, y: fabCurrentAbsPos.y };
          
          fabTranslateX.setOffset(fabCurrentAbsPos.x);
          fabTranslateY.setOffset(fabCurrentAbsPos.y);
          fabTranslateX.setValue(0);
          fabTranslateY.setValue(0);

          Animated.parallel([
            Animated.timing(fabOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.spring(fabScale, {
              toValue: 1.2,
              useNativeDriver: true,
              tension: 100,
              friction: 5,
            }),
          ]).start();
        }
      },
      onPanResponderMove: !isOpen ? (evt, gestureState) => {
        fabTranslateX.setValue(gestureState.dx);
        fabTranslateY.setValue(gestureState.dy);
      } : undefined,
      onPanResponderRelease: (evt, gestureState) => {
        if (!isOpen) {
          setIsDragging(false);

          const finalX = dragOffset.current.x + gestureState.dx;
          const finalY = dragOffset.current.y + gestureState.dy;

          fabTranslateX.flattenOffset();
          fabTranslateY.flattenOffset();

          const screenCenter = screenDimensions.width / 2;
          const newIsOnLeft = finalX < screenCenter;
          setIsOnLeft(newIsOnLeft);

          const snapX = newIsOnLeft ? -hiddenAmount : screenDimensions.width - buttonSize + hiddenAmount;
          const minY = safeAreaTop + 50;
          const maxY = screenDimensions.height - buttonSize - 120;
          const constrainedY = Math.max(minY, Math.min(maxY, finalY));

          setFabCurrentAbsPos({ x: snapX, y: constrainedY });

          Animated.parallel([
            Animated.spring(fabTranslateX, {
              toValue: snapX,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.spring(fabTranslateY, {
              toValue: constrainedY,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.timing(fabOpacity, {
              toValue: 0.9,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.spring(fabScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 120,
              friction: 8,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Check if a menu item is currently active
  const isActiveRoute = useCallback((route: string): boolean => {
    if (route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)' || pathname === '/index')) return true;
    if (route === '/(tabs)/favorites' && (pathname === '/favorites' || pathname === '/(tabs)/favorites')) return true;
    if (route === '/(tabs)/feed' && (pathname === '/feed' || pathname === '/(tabs)/feed')) return true;
    if (route === '/(tabs)/profile' && (pathname === '/profile' || pathname === '/(tabs)/profile')) return true;
    return pathname === route;
  }, [pathname]);

  // Breathing animation for FAB
  useEffect(() => {
    let breatheAnimation: Animated.CompositeAnimation | null = null;
    if (!isDragging && !isOpen) {
      breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fabScale, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(fabScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      breatheAnimation.start();
    } else {
      fabScale.stopAnimation();
    }
    return () => {
      if (breatheAnimation) {
        breatheAnimation.stop();
      }
    };
  }, [isDragging, isOpen, fabScale]);

  // Open menu with improved animation
  const openMenu = () => {
    setIsOpen(true);

    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    menuItems.forEach((_, index) => {
      const animation = menuItemAnimations[index];
      const position = calculateArcPosition(index);

      Animated.parallel([
        Animated.timing(animation.translateX, {
          toValue: position.x,
          duration: 300,
          delay: index * 60, // Faster stagger
          useNativeDriver: true,
        }),
        Animated.timing(animation.translateY, {
          toValue: position.y,
          duration: 300,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.spring(animation.scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(animation.opacity, {
          toValue: 1,
          duration: 250,
          delay: index * 60,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Close menu with improved animation
  const closeMenu = () => {
    const reverseIndices = [...Array(menuItems.length).keys()].reverse();

    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();

    reverseIndices.forEach((index, reverseIndex) => {
      const animation = menuItemAnimations[index];

      Animated.parallel([
        Animated.timing(animation.translateX, {
          toValue: 0,
          duration: 250,
          delay: reverseIndex * 50,
          useNativeDriver: true,
        }),
        Animated.timing(animation.translateY, {
          toValue: 0,
          duration: 250,
          delay: reverseIndex * 50,
          useNativeDriver: true,
        }),
        Animated.timing(animation.scale, {
          toValue: 0.3,
          duration: 250,
          delay: reverseIndex * 50,
          useNativeDriver: true,
        }),
        Animated.timing(animation.opacity, {
          toValue: 0,
          duration: 200,
          delay: reverseIndex * 50,
          useNativeDriver: true,
        }),
      ]).start();
    });

    setTimeout(() => {
      setIsOpen(false);
    }, 250 + (menuItems.length * 50));
  };

  const toggleMenu = () => {
    if (isDragging) return;

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleNavigation = (route: string) => {
    closeMenu();
    setTimeout(() => {
      try {
        router.push(route as any);
      } catch (error) {
        console.log('Navigation error:', error);
        router.push('/(tabs)' as any);
      }
    }, 150);
  };

  const fabRotationInterpolation = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <>
      {/* Reduced Background Overlay */}
      {isOpen && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { 
              opacity: blurOpacity,
              zIndex: 800, // Reduced z-index to avoid conflicts
            },
          ]}
          pointerEvents="none"
        >
          <BlurView
            style={StyleSheet.absoluteFillObject}
            intensity={15} // Reduced intensity
            tint={currentTheme === 'dark' ? 'dark' : 'light'}
          />
          
          <View style={[
            styles.darkOverlay,
            {
              backgroundColor: currentTheme === 'dark' 
                ? 'rgba(0, 0, 0, 0.4)' // Lighter overlay
                : 'rgba(0, 0, 0, 0.3)',
            }
          ]} />
        </Animated.View>
      )}

      {/* Menu Items Container */}
      <View style={[styles.menuContainer, { zIndex: 850 }]} pointerEvents="box-none">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = isActiveRoute(item.route);
          const animation = menuItemAnimations[index];

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItem,
                {
                  transform: [
                    { translateX: Animated.add(fabTranslateX, animation.translateX) },
                    { translateY: Animated.add(fabTranslateY, animation.translateY) },
                    { scale: animation.scale },
                  ],
                  opacity: animation.opacity,
                  zIndex: 900 - index,
                },
              ]}
              pointerEvents={isOpen ? 'auto' : 'none'}
            >
              <TouchableOpacity
                onPress={() => handleNavigation(item.route)}
                style={[
                  styles.pillContainer,
                  isActive && styles.activePillContainer,
                  {
                    shadowColor: item.color,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.pillContent,
                  !isOnLeft && styles.pillContentReverse
                ]}>
                  <View style={styles.textSection}>
                    <Text
                      style={[
                        styles.pillLabel,
                        isActive && styles.activePillLabel,
                        !isOnLeft && styles.pillLabelRight
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <View style={[
                    styles.iconCircle,
                    isActive && styles.activeIconCircle,
                    { backgroundColor: item.color }
                  ]}>
                    <IconComponent
                      size={18} // Smaller icons
                      color="white"
                      strokeWidth={2.5}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Main FAB Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              { translateX: fabTranslateX },
              { translateY: fabTranslateY },
              { scale: fabScale },
            ],
            opacity: fabOpacity,
            zIndex: 900,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={toggleMenu}
          style={styles.fab}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={isOpen
              ? ['#ff6b9d', '#c44569']
              : ['#667eea', '#764ba2']
            }
            style={styles.fabGradient}
          >
            <View style={styles.fabInnerGlow} />

            <Animated.View
              style={[
                styles.fabIconContainer,
                { transform: [{ rotate: fabRotationInterpolation }] },
              ]}
            >
              {isOpen ? (
                <X size={24} color="white" strokeWidth={2.5} />
              ) : (
                <Grid3X3 size={24} color="white" strokeWidth={2.5} />
              )}
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Background Touchable for Closing menu */}
      {isOpen && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFillObject, { zIndex: 799 }]}
          onPress={closeMenu}
          activeOpacity={1}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuItem: {
    position: 'absolute',
  },
  pillContainer: {
    width: 120, // Smaller pills
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 4,
  },
  activePillContainer: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  pillContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillContentReverse: {
    flexDirection: 'row-reverse',
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pillLabel: {
    fontSize: 12, // Smaller text
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'left',
  },
  activePillLabel: {
    color: '#1a202c',
    fontWeight: '800',
  },
  pillLabelRight: {
    textAlign: 'right',
  },
  iconCircle: {
    width: 32, // Smaller icon circle
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  fabContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fabInnerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: '40%',
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fabIconContainer: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});