/**
 * @file SlideOutMenu.tsx
 * @description Left-sliding menu with glass effect and blurred background
 * @features - Slide animation, glass morphism, blur overlay, theme support
 * @developer Dhyan Bhandari
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Info, 
  Mail,
  Bell,
  Heart,
  X
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.75; // 75% of screen width

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  badge?: number;
}

interface SlideOutMenuProps {
  isVisible: boolean;
  onClose: () => void;
  menuItems?: MenuItem[];
}

// Default menu items - Note: onClose needs to be passed from component
const createDefaultMenuItems = (onClose: () => void): MenuItem[] => [
  {
    id: 'home',
    title: 'Home',
    icon: Home,
    onPress: () => {
      console.log('Home pressed');
      onClose();
    },
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
    onPress: () => {
      console.log('Profile pressed');
      onClose();
    },
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    badge: 3,
    onPress: () => {
      console.log('Notifications pressed');
      onClose();
    },
  },
  {
    id: 'favorites',
    title: 'Favorites',
    icon: Heart,
    onPress: () => {
      console.log('Favorites pressed');
      onClose();
    },
  },
  {
    id: 'messages',
    title: 'Messages',
    icon: Mail,
    badge: 12,
    onPress: () => {
      console.log('Messages pressed');
      onClose();
    },
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    onPress: () => {
      console.log('Settings pressed');
      onClose();
    },
  },
  {
    id: 'about',
    title: 'About',
    icon: Info,
    onPress: () => {
      console.log('About pressed');
      onClose();
    },
  },
  {
    id: 'logout',
    title: 'Logout',
    icon: LogOut,
    onPress: () => {
      console.log('Logout pressed');
      onClose();
    },
  },
];

export default function SlideOutMenu({ 
  isVisible, 
  onClose, 
  menuItems 
}: SlideOutMenuProps) {
  const { theme, currentTheme } = useTheme();
  const slideAnimation = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  
  // Use provided menu items or create default ones
  const finalMenuItems = menuItems || createDefaultMenuItems(onClose);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: -MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnimation, opacityAnimation]);

  if (!isVisible) return null;

  const renderMenuItem = (item: MenuItem) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          { 
            backgroundColor: theme.colors.card + '20', // 20% opacity
            borderColor: theme.colors.border + '30',
          }
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemContent}>
          <View style={styles.iconContainer}>
            <IconComponent 
              size={24} 
              color={theme.colors.text}
            />
          </View>
          
          <Text style={[
            styles.menuItemText,
            { color: theme.colors.text }
          ]}>
            {item.title}
          </Text>
          
          {item.badge && (
            <View style={[
              styles.badge,
              { backgroundColor: theme.colors.primary }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: theme.colors.background }
              ]}>
                {item.badge > 99 ? '99+' : item.badge}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* Blurred Background Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.blurOverlay,
            { opacity: opacityAnimation }
          ]}
        >
          <BlurView
            style={StyleSheet.absoluteFillObject}
            intensity={15}
            tint={currentTheme === 'dark' ? 'dark' : 'light'}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Menu Panel */}
      <Animated.View
        style={[
          styles.menuPanel,
          {
            transform: [{ translateX: slideAnimation }],
            backgroundColor: theme.colors.background + 'E6', // 90% opacity
            borderColor: theme.colors.border + '40',
          }
        ]}
      >
        {/* Glass Effect Overlay */}
        <BlurView
          style={StyleSheet.absoluteFillObject}
          intensity={theme.blur ? 25 : 0}
          tint={currentTheme === 'dark' ? 'dark' : 'light'}
        />
        
        {/* Menu Header */}
        <View style={[
          styles.menuHeader,
          { 
            backgroundColor: theme.colors.card + '30',
            borderBottomColor: theme.colors.border + '40',
          }
        ]}>
          <Text style={[
            styles.menuTitle,
            { color: theme.colors.text }
          ]}>
            Menu
          </Text>
          
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.card + '40' }
            ]}
          >
            <X size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <ScrollView 
          style={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          {finalMenuItems.map(renderMenuItem)}
        </ScrollView>

        {/* Menu Footer */}
        <View style={[
          styles.menuFooter,
          { 
            backgroundColor: theme.colors.card + '20',
            borderTopColor: theme.colors.border + '30',
          }
        ]}>
          <Text style={[
            styles.footerText,
            { color: theme.colors.text + '80' }
          ]}>
            App Version 1.0.0
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconContainer: {
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});