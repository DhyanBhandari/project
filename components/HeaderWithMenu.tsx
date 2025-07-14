/**
 * @file HeaderWithMenu.tsx
 * @description Integration example showing how to use the SlideOutMenu with your headers
 * @features - Menu state management, seamless integration
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Home, User, Settings } from 'lucide-react-native';
import Header from './Header';
import AppHeader from './AppHeader';
import SlideOutMenu from './SlideOutMenu';

// Example usage with your existing Header component
export function HeaderWithSlideMenu() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const customMenuItems = [
    {
      id: 'home',
      title: 'Home',
      icon: Home,
      onPress: () => {
        console.log('Navigate to Home');
        setIsMenuVisible(false);
      },
    },
    {
      id: 'profile',
      title: 'My Profile',
      icon: User,
      onPress: () => {
        console.log('Navigate to Profile');
        setIsMenuVisible(false);
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      onPress: () => {
        console.log('Navigate to Settings');
        setIsMenuVisible(false);
      },
    },
    // Add more items as needed
  ];

  return (
    <View style={styles.container}>
      <Header
        title="My App"
        showMenuButton={true}
        onMenuPress={() => setIsMenuVisible(true)}
      />
      
      <SlideOutMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        menuItems={customMenuItems}
      />
    </View>
  );
}

// Example usage with your AppHeader component
export function AppHeaderWithSlideMenu() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader
        onMenuPress={() => setIsMenuVisible(true)}
        logoSource={require('@/assets/images/logo-supe.png')}
      />
      
      <SlideOutMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        // Uses default menu items if not specified
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Usage in your main screen/component:
/*
import { HeaderWithSlideMenu, AppHeaderWithSlideMenu } from './HeaderWithMenu';

export default function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <HeaderWithSlideMenu />
      {/* Your main content */}
    </View>
  );
}
*/