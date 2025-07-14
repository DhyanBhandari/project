/**
 * @file components/DraggableMenuButton.tsx
 * @description Draggable menu button that snaps to edges with 60% visibility
 */

import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Menu } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DraggableMenuButtonProps {
  onMenuPress: () => void;
}

export default function DraggableMenuButton({ onMenuPress }: DraggableMenuButtonProps) {
  const { theme } = useTheme();
  const pan = useRef(new Animated.ValueXY({ x: -20, y: 100 })).current; // Start on left side
  const opacity = useRef(new Animated.Value(0.6)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const buttonSize = 50;
  const hiddenAmount = buttonSize * 0.4; // 40% hidden, 60% visible

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start dragging if the gesture is significant enough
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        
        // Set the offset to the current value
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
        
        // Animate to full visibility and slightly larger size
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1.1,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);
        
        // Flatten the offset
        pan.flattenOffset();
        
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;
        
        // Determine which side to snap to based on current position
        const shouldSnapToRight = currentX > screenWidth / 2 - buttonSize / 2;
        
        // Calculate snap positions
        const snapX = shouldSnapToRight 
          ? screenWidth - buttonSize + hiddenAmount 
          : -hiddenAmount;
        
        // Constrain Y position within screen bounds
        const minY = 50; // Below status bar
        const maxY = screenHeight - buttonSize - 100; // Above bottom elements
        const constrainedY = Math.max(minY, Math.min(maxY, currentY));
        
        // Animate to snap position
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: snapX, y: constrainedY },
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      },
    })
  ).current;

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (!isDragging && now - lastTap < DOUBLE_PRESS_DELAY) {
      onMenuPress();
    }
    setLastTap(now);
    
    // Also trigger on single tap after a delay if no second tap comes
    setTimeout(() => {
      if (Date.now() - lastTap >= DOUBLE_PRESS_DELAY && !isDragging) {
        onMenuPress();
      }
    }, DOUBLE_PRESS_DELAY);
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: buttonSize,
          height: buttonSize,
          zIndex: 1000,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <Menu size={28} color={theme.colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}