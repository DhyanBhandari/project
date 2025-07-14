/**
 * @file components/JapaneseFanFABMenu.tsx
 * @description Expo Go compatible Japanese fan-style FAB menu with darker background overlay
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

export default function JapaneseFanFABMenu() {
  const { theme, currentTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnLeft, setIsOnLeft] = useState(true);
  const [screenDimensions, setScreenDimensions] = useState({
    width: initialScreenWidth,
    height: initialScreenHeight,
  });

  // FAB's position: these Animated.Values will drive its translateX/Y.
  // They are initialized to the *target* absolute screen coordinates.
  const fabTranslateX = useRef(new Animated.Value(-28)).current;
  const fabTranslateY = useRef(new Animated.Value(initialScreenHeight / 2 - 35)).current;

  // Store the *absolute* pixel coordinates of the FAB.
  // This state is for calculations (e.g., snapping, menu item offsets)
  // and for initializing/updating the Animated.Values.
  const [fabCurrentAbsPos, setFabCurrentAbsPos] = useState({
    x: -28,
    y: initialScreenHeight / 2 - 35
  });

  // Track the drag offset manually to avoid accessing private _offset property
  const dragOffset = useRef({ x: 0, y: 0 });

  // Opacity and Scale for FAB (Scale is native, Opacity is JS for simplicity, though can be native)
  const fabOpacity = useRef(new Animated.Value(0.8)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  // Blur Overlay Opacity (must be JS-driven)
  const blurOpacity = useRef(new Animated.Value(0)).current;

  // Menu item animations (transform and opacity, all native-driven)
  const menuItemAnimations = useRef(
    menuItems.map(() => ({
      scale: new Animated.Value(0.3),
      opacity: new Animated.Value(0),
      // These are OFFSETS from the FAB's center, not absolute screen positions
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  const buttonSize = 70;
  const hiddenAmount = buttonSize * 0.4; // How much of the FAB is hidden when snapped to edge

  // Handle screen orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });

      // Recalculate snapped position based on new screen dimensions
      const screenCenter = window.width / 2;
      const newIsOnLeft = fabCurrentAbsPos.x < screenCenter;
      const newSnapX = newIsOnLeft ? -hiddenAmount : window.width - buttonSize + hiddenAmount;
      const minY = safeAreaTop + 50;
      const maxY = window.height - buttonSize - 100;
      const newSnapY = Math.max(minY, Math.min(maxY, fabCurrentAbsPos.y));

      // Update the state with the new absolute position
      setFabCurrentAbsPos({ x: newSnapX, y: newSnapY });

      // Animate the FAB's position to the new snapped coordinates
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
  }, [fabCurrentAbsPos.x, fabCurrentAbsPos.y, hiddenAmount, buttonSize, safeAreaTop]); // Dependencies for useEffect

  // Calculate consistent arc positions with proper spacing
  // This now returns offsets from the FAB's center
  const calculateArcPosition = useCallback((index: number) => {
    const radius = 120; // Base distance for the arc
    const itemSpacing = 70; // Vertical spacing between items

    let xOffset, yOffset;

    // The logic needs to account for the pivot point (center of FAB)
    // and the direction (left/right side)
    if (isOnLeft) {
      // Items fan out to the right of the FAB
      // xOffset = distance from FAB center to the start of the item
      // yOffset = vertical spread
      xOffset = radius + (index * 15); // Slight horizontal spread
      yOffset = -(index * itemSpacing) + (menuItems.length - 1) * itemSpacing / 2;
    } else {
      // Items fan out to the left of the FAB
      // We need to move the pill-shaped menu item to the left.
      // A pill is approx 140px wide. FAB is 70px.
      // From FAB center, go left by radius + item width.
      xOffset = -radius - 140 - (index * 15); // Adjust for pill width and spread
      yOffset = -(index * itemSpacing) + (menuItems.length - 1) * itemSpacing / 2;
    }
    return { x: xOffset, y: yOffset };
  }, [isOnLeft]); // Re-calculate if isOnLeft changes

  // Dragging logic with separate handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only allow drag if menu is closed and gesture is significant
        return !isOpen && (Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8);
      },
      onPanResponderGrant: () => {
        if (!isOpen) {
          setIsDragging(true);
          // Stop any active breathing animation
          fabScale.stopAnimation();

          // Store the current absolute position as drag offset
          dragOffset.current = { x: fabCurrentAbsPos.x, y: fabCurrentAbsPos.y };
          
          // Set the current absolute position as an offset for the Animated.Value
          // Then, subsequent setValue() calls during drag are relative to this offset.
          fabTranslateX.setOffset(fabCurrentAbsPos.x);
          fabTranslateY.setOffset(fabCurrentAbsPos.y);
          fabTranslateX.setValue(0); // Start from 0 for the drag movement
          fabTranslateY.setValue(0);

          Animated.parallel([
            Animated.timing(fabOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.spring(fabScale, {
              toValue: 1.3,
              useNativeDriver: true,
              tension: 100,
              friction: 5,
            }),
          ]).start();
        }
      },
      onPanResponderMove: !isOpen ? (evt, gestureState) => {
        // Update the Animated.Value with the delta X/Y
        fabTranslateX.setValue(gestureState.dx);
        fabTranslateY.setValue(gestureState.dy);
      } : undefined, // Disable move if menu is open
      onPanResponderRelease: (evt, gestureState) => {
        if (!isOpen) {
          setIsDragging(false);

          // Calculate the final absolute position using our tracked offset and gesture
          const finalX = dragOffset.current.x + gestureState.dx;
          const finalY = dragOffset.current.y + gestureState.dy;

          // Remove the offset from the Animated.Value to make it absolute again
          fabTranslateX.flattenOffset();
          fabTranslateY.flattenOffset();

          const screenCenter = screenDimensions.width / 2;
          const newIsOnLeft = finalX < screenCenter;
          setIsOnLeft(newIsOnLeft);

          const snapX = newIsOnLeft ? -hiddenAmount : screenDimensions.width - buttonSize + hiddenAmount;
          const minY = safeAreaTop + 50;
          const maxY = screenDimensions.height - buttonSize - 100;
          const constrainedY = Math.max(minY, Math.min(maxY, finalY));

          // Update the state with the new snapped absolute position
          setFabCurrentAbsPos({ x: snapX, y: constrainedY });

          // Animate to the new snapped position
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
              toValue: 0.8,
              duration: 400,
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
    // Handle different route patterns for home
    if (route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)' || pathname === '/index')) return true;
    // For other tabs, check exact path or the nested tab path
    if (route === '/(tabs)/favorites' && (pathname === '/favorites' || pathname === '/(tabs)/favorites')) return true;
    if (route === '/(tabs)/feed' && (pathname === '/feed' || pathname === '/(tabs)/feed')) return true;
    if (route === '/(tabs)/profile' && (pathname === '/profile' || pathname === '/(tabs)/profile')) return true;
    return pathname === route; // Fallback for direct match
  }, [pathname]);

  // Breathing animation for FAB (runs when not dragging or open)
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
      // Ensure animation is stopped if state changes
      fabScale.stopAnimation();
    }
    return () => {
      // Clean up on component unmount or dependencies change
      if (breatheAnimation) {
        breatheAnimation.stop();
      }
    };
  }, [isDragging, isOpen, fabScale]);

  // Open menu with Japanese fan animation
  const openMenu = () => {
    setIsOpen(true);

    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue: 1, // Rotates to X
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false, // BlurView opacity must be JS-driven
      }),
    ]).start();

    menuItems.forEach((_, index) => {
      const animation = menuItemAnimations[index];
      const position = calculateArcPosition(index); // These are offsets from FAB center

      Animated.parallel([
        Animated.timing(animation.translateX, {
          toValue: position.x,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(animation.translateY, {
          toValue: position.y,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.spring(animation.scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(animation.opacity, {
          toValue: 1,
          duration: 300,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Close menu with reverse Japanese fan folding animation
  const closeMenu = () => {
    const reverseIndices = [...Array(menuItems.length).keys()].reverse(); // Animate in reverse order for closing

    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue: 0, // Rotates back to grid icon
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false, // BlurView opacity must be JS-driven
      }),
    ]).start();

    reverseIndices.forEach((index, reverseIndex) => {
      const animation = menuItemAnimations[index];

      Animated.parallel([
        Animated.timing(animation.translateX, {
          toValue: 0, // Reset to 0 (relative to FAB center)
          duration: 300,
          delay: reverseIndex * 80,
          useNativeDriver: true,
        }),
        Animated.timing(animation.translateY, {
          toValue: 0, // Reset to 0 (relative to FAB center)
          duration: 300,
          delay: reverseIndex * 80,
          useNativeDriver: true,
        }),
        Animated.timing(animation.scale, {
          toValue: 0.3,
          duration: 300,
          delay: reverseIndex * 80,
          useNativeDriver: true,
        }),
        Animated.timing(animation.opacity, {
          toValue: 0,
          duration: 250,
          delay: reverseIndex * 80,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Set isOpen to false after all animations complete
    setTimeout(() => {
      setIsOpen(false);
    }, 300 + (menuItems.length * 80));
  };

  const toggleMenu = () => {
    if (isDragging) return; // Prevent toggling while dragging

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleNavigation = (route: string) => {
    closeMenu(); // Close menu first
    // Delay navigation slightly to allow close animation to start
    setTimeout(() => {
      try {
        router.push(route as any);
      } catch (error) {
        console.log('Navigation error:', error);
        router.push('/(tabs)' as any); // Fallback to home tab
      }
    }, 200);
  };

  // FAB rotation interpolation for icon change
  const fabRotationInterpolation = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <>
      {/* Darker Background Overlay - Reduced Brightness */}
      {isOpen && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: blurOpacity }, // blurOpacity is JS driven
          ]}
          pointerEvents="none" // BlurView shouldn't block touch events when just fading
        >
          {/* Light Blur Effect */}
          <BlurView
            style={StyleSheet.absoluteFillObject}
            intensity={20}
            tint={currentTheme === 'dark' ? 'dark' : 'light'}
          />
          
          {/* Dark Overlay to Reduce Brightness */}
          <View style={[
            styles.darkOverlay,
            {
              backgroundColor: currentTheme === 'dark' 
                ? 'rgba(0, 0, 0, 0.7)' // Darker overlay for dark theme
                : 'rgba(0, 0, 0, 0.5)', // Medium dark overlay for light theme
            }
          ]} />
        </Animated.View>
      )}

      {/* Menu Items Container - acts as a logical container for menu items,
          their positions are calculated relative to the FAB's position. */}
      <View style={styles.menuContainer} pointerEvents="box-none">
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
                  // The overall position of each menu item is the sum of:
                  // 1. The FAB's current absolute position (fabTranslateX, fabTranslateY)
                  // 2. The menu item's animated offset from the FAB's center (animation.translateX, animation.translateY)
                  transform: [
                    // Ensure the base FAB position is added to the menu item's offset
                    { translateX: Animated.add(fabTranslateX, animation.translateX) },
                    { translateY: Animated.add(fabTranslateY, animation.translateY) },
                    { scale: animation.scale },
                  ],
                  opacity: animation.opacity,
                  zIndex: 1000 - index, // Layering for fan effect
                },
              ]}
              // Only allow pointer events on menu items when the menu is open
              pointerEvents={isOpen ? 'auto' : 'none'}
            >
              <TouchableOpacity
                onPress={() => handleNavigation(item.route)}
                style={[
                  styles.pillContainer,
                  isActive && styles.activePillContainer,
                  {
                    shadowColor: item.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.pillContent,
                  !isOnLeft && styles.pillContentReverse // Reverse layout for right side
                ]}>
                  <View style={styles.textSection}>
                    <Text
                      style={[
                        styles.pillLabel,
                        isActive && styles.activePillLabel,
                        !isOnLeft && styles.pillLabelRight // Align text right for right side
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
                      size={22}
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
            // Position the FAB using transforms, which can be native-driven
            transform: [
              { translateX: fabTranslateX },
              { translateY: fabTranslateY },
              { scale: fabScale },
            ],
            opacity: fabOpacity,
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
              ? ['#ff6b9d', '#c44569'] // Colors when open (e.g., red tones)
              : ['#667eea', '#764ba2'] // Colors when closed (e.g., purple tones)
            }
            style={styles.fabGradient}
          >
            <View style={styles.fabInnerGlow} />

            <Animated.View
              style={[
                styles.fabIconContainer,
                { transform: [{ rotate: fabRotationInterpolation }] }, // Icon rotation
              ]}
            >
              {isOpen ? (
                <X size={28} color="white" strokeWidth={2.5} />
              ) : (
                <Grid3X3 size={28} color="white" strokeWidth={2.5} />
              )}
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Background Touchable for Closing menu (only visible when menu is open) */}
      {isOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={closeMenu}
          activeOpacity={1} // Prevents visual feedback on touch
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
    zIndex: 998,
  },
  menuItem: {
    position: 'absolute', // Important for positioning relative to its parent (the screen)
    // We remove `left` and `top` here because position is entirely handled by `transform`
    zIndex: 999,
    // The actual position will be (fabTranslateX + animation.translateX) and (fabTranslateY + animation.translateY)
  },
  pillContainer: {
    width: 140,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 5,
    // Shadow for pill
  },
  activePillContainer: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  pillContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillContentReverse: {
    flexDirection: 'row-reverse', // For right-aligned pills
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'left',
  },
  activePillLabel: {
    color: '#1a202c', // Darker color for active state
    fontWeight: '800', // Slightly bolder for active state
  },
  pillLabelRight: {
    textAlign: 'right', // For right-aligned pills
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  fabContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    zIndex: 1000,
    // `left` and `top` are removed here, as `transform` handles positioning
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden', // Ensures gradient and glow stay within bounds
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fabInnerGlow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    height: '40%', // Creates a top light reflection effect
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fabIconContainer: {
    zIndex: 2, // Ensure icon is above glow
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Background color is set dynamically based on theme
  },
});