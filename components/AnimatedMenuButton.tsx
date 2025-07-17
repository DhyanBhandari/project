/**
 * @file components/AnimatedMenuButton.tsx
 * @description Animated menu button with scale and rotation effects
 * @integration - Integrated with PLINK app theme system
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Menu, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface AnimatedMenuButtonProps {
  isOpen: boolean;
  onPress: () => void;
  size?: number;
  style?: any;
}

const AnimatedMenuButton: React.FC<AnimatedMenuButtonProps> = ({
  isOpen,
  onPress,
  size = 44,
  style,
}) => {
  const { theme } = useTheme();
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;

  // Handle button press with animation
  const handlePress = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation animation
    Animated.timing(rotationAnimation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    onPress();
  };

  const rotationDegrees = rotationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={[
        styles.menuButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnimation },
            { rotate: rotationDegrees },
          ],
        }}
      >
        {isOpen ? (
          <X size={28} color={theme.colors.text} />
        ) : (
          <Menu size={28} color={theme.colors.text} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
});

export default AnimatedMenuButton;