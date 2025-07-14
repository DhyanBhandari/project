// src/components/Carousel.tsx

/**
 * @file components/Carousel.tsx
 * @description Reusable carousel component with 1-second auto-scroll
 * @features - Auto-scroll every 1 second, smooth animations, gradient styling
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { CarouselItem } from '@/types/Carousel';

const { width } = Dimensions.get('window');

interface CarouselProps {
  data: CarouselItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  autoScrollInterval?: number; // Optional prop to control auto-scroll timing
  enableAutoScroll?: boolean; // Optional prop to enable/disable auto-scroll
}

export default function Carousel({ 
  data, 
  currentIndex, 
  onIndexChange, 
  fadeAnim, 
  scaleAnim,
  autoScrollInterval = 1000, // Default 1 second (1000ms)
  enableAutoScroll = true, // Auto-scroll enabled by default
}: CarouselProps) {
  const carouselRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<number | null>(null);

  // Auto-scroll effect with 1-second interval
  useEffect(() => {
    if (!enableAutoScroll || data.length <= 1) {
      return; // Don't auto-scroll if disabled or only one item
    }

    // Clear any existing interval
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }

    // Set up new interval for auto-scrolling
    autoScrollRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      
      // Trigger fade and scale animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change index after fade out
        onIndexChange(nextIndex);
        
        // Fade back in with new content
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, autoScrollInterval);

    // Cleanup function
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [currentIndex, data.length, enableAutoScroll, autoScrollInterval, fadeAnim, scaleAnim, onIndexChange]);

  // Scroll to current index when it changes
  useEffect(() => {
    if (carouselRef.current && data.length > 0) {
      carouselRef.current.scrollToIndex({
        index: currentIndex,
        animated: true,
      });
    }
  }, [currentIndex]);

  // Handle scroll failure (e.g., if data loads after initial render)
  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollToOffset({ 
          offset: info.index * width, 
          animated: true 
        });
      }
    });
  };

  // Handle manual scroll (pause auto-scroll temporarily)
  const handleScrollBeginDrag = () => {
    // Pause auto-scroll when user starts manual scrolling
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  // Resume auto-scroll after manual scroll ends
  const handleMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
    }
    
    // Resume auto-scroll after a short delay
    setTimeout(() => {
      if (enableAutoScroll && data.length > 1) {
        // Restart auto-scroll interval
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
        
        autoScrollRef.current = setInterval(() => {
          const nextIndex = (newIndex + 1) % data.length;
          
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 200,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.9,
              duration: 200,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onIndexChange(nextIndex);
            
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
              }),
            ]).start();
          });
        }, autoScrollInterval);
      }
    }, 2000); // Wait 2 seconds before resuming auto-scroll
  };

  const renderCarouselItem = ({ item }: { item: CarouselItem }) => {
    const IconComponent = item.icon;
    
    return (
      <View style={styles.carouselItem}>
        <Animated.View 
          style={[
            styles.itemContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Gradient Icon Container */}
          <View style={[styles.iconContainer, {
            backgroundColor: item.gradient[0],
            shadowColor: item.gradient[0],
          }]}>
            <IconComponent 
              size={item.isHighlighted ? 72 : 64} 
              color="#ffffff"
              strokeWidth={item.isHighlighted ? 2.5 : 2}
            />
          </View>
          
          {/* Title Text */}
          <Text style={[styles.title, {
            fontSize: item.isHighlighted ? 38 : 32,
            fontWeight: item.isHighlighted ? '900' : '800',
            color: item.gradient[0],
          }]}>
            {item.title}
          </Text>
          
          {/* Featured Badge */}
          {item.isHighlighted && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>✨ FEATURED ✨</Text>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={carouselRef}
        data={data}
        renderItem={renderCarouselItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}

        onScrollToIndexFailed={handleScrollToIndexFailed}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
      
      {/* Auto-scroll indicator */}
      {enableAutoScroll && data.length > 1 && (
        <View style={styles.autoScrollIndicator}>
          <Text style={styles.indicatorText}>Auto-scrolling every {autoScrollInterval/1000}s</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 152,
  },
  carouselItem: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 180,
    paddingHorizontal: 30,
  },
  itemContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },
  featuredBadge: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  autoScrollIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    color: 'white',
    fontSize: 10,
    opacity: 0.7,
  },
});