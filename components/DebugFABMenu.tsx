/**
 * @file components/DebugFABMenu.tsx
 * @description Debug version with bright colors and console logs
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { Home, Heart, User, Rss, X, Zap } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const menuItems = [
  { id: 'home', icon: Home, label: 'Home', route: '/', color: '#FF0000' },
  { id: 'favorites', icon: Heart, label: 'Favorites', route: '/favorites', color: '#00FF00' },
  { id: 'profile', icon: User, label: 'Profile', route: '/profile', color: '#0000FF' },
  { id: 'network', icon: Rss, label: 'Network', route: '/feed', color: '#FFFF00' },
];

export default function DebugFABMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActiveRoute = (route: string): boolean => {
    if (route === '/' && (pathname === '/' || pathname === '/index')) return true;
    if (route !== '/' && pathname === route) return true;
    return false;
  };

  const toggleMenu = () => {
    console.log('🔄 Toggle menu clicked, isOpen was:', isOpen);
    setIsOpen(!isOpen);
    console.log('🔄 Toggle menu clicked, isOpen now:', !isOpen);
  };

  const handleNavigation = (route: string) => {
    console.log('🚀 Navigating to:', route);
    setIsOpen(false);
    router.push(route as any);
  };

  console.log('🎨 DebugFABMenu render, isOpen:', isOpen, 'pathname:', pathname);

  return (
    <>
      {/* Fixed Position FAB Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          onPress={toggleMenu}
          style={[
            styles.fab,
            { backgroundColor: isOpen ? '#FF00FF' : '#00FFFF' }
          ]}
        >
          {isOpen ? (
            <X size={28} color="black" strokeWidth={3} />
          ) : (
            <Zap size={28} color="black" strokeWidth={3} />
          )}
        </TouchableOpacity>
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Menu: {isOpen ? 'OPEN' : 'CLOSED'}</Text>
        <Text style={styles.debugText}>Path: {pathname}</Text>
      </View>

      {/* Menu Items - Super Bright and Obvious */}
      {isOpen && (
        <View style={styles.menuOverlay}>
          {/* Big Background to close */}
          <TouchableOpacity 
            style={styles.backgroundClose}
            onPress={toggleMenu}
            activeOpacity={0.5}
          />

          <Text style={styles.bigText}>MENU IS OPEN!</Text>

          {/* Fixed Position Menu Items */}
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = isActiveRoute(item.route);
            
            // Simple fixed positions for testing
            const positions = [
              { top: 200, left: 100 },  // Home
              { top: 200, left: 200 },  // Favorites  
              { top: 300, left: 100 },  // Profile
              { top: 300, left: 200 },  // Network
            ];
            
            const position = positions[index];

            console.log(`📍 Rendering ${item.label} at:`, position, 'isActive:', isActive);

            return (
              <View
                key={item.id}
                style={[
                  styles.menuItem,
                  {
                    top: position.top,
                    left: position.left,
                    backgroundColor: item.color,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleNavigation(item.route)}
                  style={[
                    styles.menuButton,
                    { backgroundColor: isActive ? '#FFFFFF' : item.color }
                  ]}
                >
                  <IconComponent 
                    size={24} 
                    color={isActive ? 'black' : 'white'} 
                    strokeWidth={3}
                  />
                  <Text style={[
                    styles.menuLabel,
                    { color: isActive ? 'black' : 'white' }
                  ]}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <Text style={styles.activeText}>ACTIVE!</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    top: screenHeight / 2 - 35,
    left: 20,
    zIndex: 1000,
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  debugInfo: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 999,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  backgroundClose: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bigText: {
    position: 'absolute',
    top: 50,
    left: 50,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'red',
    padding: 10,
  },
  menuItem: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#000000',
    zIndex: 1001,
  },
  menuButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  activeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 2,
  },
});