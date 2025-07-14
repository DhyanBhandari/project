/**
 * @file app/(tabs)/_layout.tsx
 * @description Updated layout with hidden tab bar and FAB navigation
 * @features - Hidden bottom tabs, circular FAB navigation overlay
 */

import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { User, Heart, Rss } from 'lucide-react-native';
import { View, StyleSheet, Image } from 'react-native';
import CircularFABNavigation from '@/components/CircularFABNavigation';
import DraggableLeftFABMenu from '@/components/DraggableLeftFABMenu';

export default function TabLayout() {
  const { theme, currentTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none', // Hide the tab bar completely
          },
        }}
      >
        {/* TAB 1: HOME */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color, focused }) => (
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/1946/1946436.png',
                }}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? '#14b8a6' : color,
                }}
                resizeMode="contain"
              />
            ),
          }}
        />

        {/* TAB 2: FAVORITES */}
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ size, color }) => (
              <Heart size={size} color={color} />
            ),
          }}
        />

        {/* TAB 3: PROFILE */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />

        {/* TAB 4: FEED */}
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarIcon: ({ size, color }) => (
              <Rss size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Draggable FAB Navigation Overlay */}
      <DraggableLeftFABMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});