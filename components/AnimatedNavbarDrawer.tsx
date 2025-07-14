/**
 * @file components/AnimatedNavbarDrawer.tsx
 * @description Professional animated navbar drawer with glassmorphism effects
 * @features - Right-side slide, staggered animations, backdrop blur, responsive design
 * @integration - Integrated with existing PLINK app theme and navigation system
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Settings, 
  Heart, 
  Bell, 
  Mail, 
  LogOut, 
  ChevronRight,
  Star,
  Gift,
  Rss
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.65; // 65% of screen width
const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  badge?: number;
  premium?: boolean;
  route?: string;
}

interface AnimatedNavbarDrawerProps {
  visible: boolean;
  onClose: () => void;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const AnimatedNavbarDrawer: React.FC<AnimatedNavbarDrawerProps> = ({
  visible,
  onClose,
  userInfo = { name: 'User Name', email: 'user@example.com' }
}) => {
  const { theme, currentTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Menu items integrated with your existing routes
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      title: 'Home',
      icon: Home,
      route: '/(tabs)',
      onPress: () => {
        console.log('Navigate to Home');
        router.push('/(tabs)');
      },
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      route: '/(tabs)/profile',
      onPress: () => {
        console.log('Navigate to Profile');
        router.push('/(tabs)/profile');
      },
    },
    {
      id: 'favorites',
      title: 'Favorites',
      icon: Heart,
      route: '/(tabs)/favorites',
      onPress: () => {
        console.log('Navigate to Favorites');
        router.push('/(tabs)/favorites');
      },
    },
    {
      id: 'feed',
      title: 'Feed',
      icon: Rss,
      route: '/(tabs)/feed',
      onPress: () => {
        console.log('Navigate to Feed');
        router.push('/(tabs)/feed');
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      badge: 3,
      onPress: () => {
        console.log('Navigate to Notifications');
        // Add notification functionality when ready
      },
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: Mail,
      badge: 12,
      onPress: () => {
        console.log('Navigate to Messages');
        // Add messaging functionality when ready
      },
    },
    {
      id: 'premium',
      title: 'Upgrade to Premium',
      icon: Star,
      premium: true,
      onPress: () => {
        console.log('Navigate to Premium');
        // Add premium upgrade functionality
      },
    },
    {
      id: 'invite',
      title: 'Invite Friends',
      icon: Gift,
      route: '/invite',
      onPress: () => {
        console.log('Navigate to Invite');
        router.push('/invite');
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      route: '/settings',
      onPress: () => {
        console.log('Navigate to Settings');
        router.push('/settings');
      },
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: LogOut,
      onPress: () => {
        console.log('Logout');
        // Add logout functionality
      },
    },
  ];
  
  // Animation values
  const slideAnimation = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Individual menu item animations
  const menuItemAnimations = useRef(
    menuItems.map(() => ({
      translateY: new Animated.Value(30),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // Handle visible prop changes
  useEffect(() => {
    if (visible) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [visible]);

  // Handle device orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      if (visible) {
        onClose();
      }
    });

    return () => subscription?.remove();
  }, [visible, onClose]);

  // Open drawer animation
  const openDrawer = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);

    // Animate drawer slide and overlay
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered menu item animations
    menuItemAnimations.forEach((animation, index) => {
      Animated.parallel([
        Animated.timing(animation.translateY, {
          toValue: 0,
          duration: 400,
          delay: index * 80, // 80ms stagger
          useNativeDriver: true,
        }),
        Animated.timing(animation.opacity, {
          toValue: 1,
          duration: 300,
          delay: index * 80 + 100,
          useNativeDriver: true,
        }),
        Animated.timing(animation.scale, {
          toValue: 1,
          duration: 350,
          delay: index * 80 + 50,
          useNativeDriver: true,
        }),
      ]).start();
    });

    setTimeout(() => setIsAnimating(false), 400 + menuItems.length * 80);
  };

  // Close drawer animation
  const closeDrawer = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);

    // Reverse staggered menu item animations
    const reversedAnimations = [...menuItemAnimations].reverse();
    reversedAnimations.forEach((animation, index) => {
      Animated.parallel([
        Animated.timing(animation.translateY, {
          toValue: -20,
          duration: 250,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(animation.opacity, {
          toValue: 0,
          duration: 200,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(animation.scale, {
          toValue: 0.8,
          duration: 250,
          delay: index * 60,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Animate drawer slide and overlay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
        
        // Reset menu item animations
        menuItemAnimations.forEach((animation) => {
          animation.translateY.setValue(30);
          animation.opacity.setValue(0);
          animation.scale.setValue(0.9);
        });
      });
    }, menuItems.length * 60);
  };

  // Handle menu item press
  const handleMenuItemPress = (item: MenuItem) => {
    item.onPress();
    onClose();
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, index: number) => {
    const IconComponent = item.icon;
    const animation = menuItemAnimations[index];

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.menuItemContainer,
          {
            transform: [
              { translateY: animation.translateY },
              { scale: animation.scale },
            ],
            opacity: animation.opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.menuItem,
            item.premium && styles.premiumMenuItem,
            { backgroundColor: theme.colors.card }
          ]}
          onPress={() => handleMenuItemPress(item)}
          activeOpacity={0.7}
        >
          {theme.blur && (
            <BlurView
              style={StyleSheet.absoluteFillObject}
              intensity={theme.blurIntensity / 3}
              tint={currentTheme === 'dark' ? 'dark' : 'light'}
            />
          )}
          <View style={styles.menuItemContent}>
            <View style={[
              styles.iconContainer,
              item.premium && styles.premiumIconContainer
            ]}>
              <IconComponent 
                size={22} 
                color={item.premium ? '#fbbf24' : theme.colors.text}
              />
            </View>
            
            <Text style={[
              styles.menuItemText,
              { 
                color: theme.colors.text,
                textShadowColor: theme.blur ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: theme.blur ? 1 : 0,
              },
              item.premium && styles.premiumText
            ]}>
              {item.title}
            </Text>
            
            {item.badge && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>
                  {item.badge > 99 ? '99+' : item.badge}
                </Text>
              </View>
            )}
            
            {item.premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
            
            <ChevronRight size={16} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      {/* Backdrop Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <BlurView
            style={StyleSheet.absoluteFillObject}
            intensity={20}
            tint={currentTheme === 'dark' ? 'dark' : 'light'}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Animated Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnimation }],
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {/* Glassmorphism effect for drawer */}
        {theme.blur && (
          <BlurView
            style={StyleSheet.absoluteFillObject}
            intensity={theme.blurIntensity}
            tint={currentTheme === 'dark' ? 'dark' : 'light'}
          />
        )}
        
        {/* Drawer Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>
                {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[
                styles.userName, 
                { 
                  color: theme.colors.text,
                  textShadowColor: theme.blur ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: theme.blur ? 1 : 0,
                }
              ]}>
                {userInfo.name}
              </Text>
              <Text style={[
                styles.userEmail, 
                { 
                  color: theme.colors.textSecondary,
                  textShadowColor: theme.blur ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: theme.blur ? 1 : 0,
                }
              ]}>
                {userInfo.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView 
          style={styles.menuContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menuContentContainer}
        >
          {menuItems.map(renderMenuItem)}
        </ScrollView>

        {/* Drawer Footer */}
        <View style={[styles.drawerFooter, { borderTopColor: theme.colors.border }]}>
          <Text style={[
            styles.footerText, 
            { 
              color: theme.colors.textSecondary,
              textShadowColor: theme.blur ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: theme.blur ? 1 : 0,
            }
          ]}>
            PLINK Version 1.0.0
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerHeader: {
    paddingTop: statusBarHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuContentContainer: {
    paddingVertical: 10,
  },
  menuItemContainer: {
    marginHorizontal: 15,
    marginVertical: 3,
  },
  menuItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumMenuItem: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIconContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  premiumText: {
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  premiumBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AnimatedNavbarDrawer;