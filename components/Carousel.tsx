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
  autoScrollInterval?: number;
  enableAutoScroll?: boolean;
}

export default function Carousel({ 
  data, 
  currentIndex, 
  onIndexChange, 
  fadeAnim, 
  scaleAnim,
  autoScrollInterval = 4000, // Changed to 4 seconds
  enableAutoScroll = true,
}: CarouselProps) {
  const carouselRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<number | null>(null);
  const highlightAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!enableAutoScroll || data.length <= 1) return;

    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }

    // Start highlight animation
    Animated.sequence([
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(highlightAnim, {
        toValue: 0.3,
        duration: 3500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    autoScrollRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      
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

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [currentIndex, data.length, enableAutoScroll, autoScrollInterval, fadeAnim, scaleAnim, onIndexChange]);

  useEffect(() => {
    if (carouselRef.current && data.length > 0) {
      carouselRef.current.scrollToIndex({
        index: currentIndex,
        animated: true,
      });
    }
  }, [currentIndex]);

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

  const handleScrollBeginDrag = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
    }
    
    setTimeout(() => {
      if (enableAutoScroll && data.length > 1) {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
        
        autoScrollRef.current = setInterval(() => {
          const nextIndex = (newIndex + 1) % data.length;
          onIndexChange(nextIndex);
        }, autoScrollInterval);
      }
    }, 2000);
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
          <Animated.View style={[styles.iconContainer, {
            backgroundColor: item.gradient[0],
            shadowColor: item.gradient[0],
            opacity: highlightAnim,
          }]}>
            <IconComponent 
              size={item.isHighlighted ? 76 : 68}
              color="rgba(255,255,255,0.9)"
              strokeWidth={item.isHighlighted ? 1.8 : 1.5}
            />
            <Animated.View 
              style={[
                styles.iconHighlight,
                {
                  opacity: highlightAnim
                }
              ]} 
            />
          </Animated.View>
          
          <Text style={[styles.title, {
            fontSize: item.isHighlighted ? 38 : 32,
            fontWeight: item.isHighlighted ? '900' : '800',
            color: item.gradient[0],
            opacity: 0.85
          }]}>
            {item.title}
          </Text>
          
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
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