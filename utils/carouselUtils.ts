/**
 * @file utils/carouselUtils.ts
 * @description Utility functions for carousel functionality
 * @features - Index calculations, scroll utilities, animation helpers
 */

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Calculate the next carousel index
 */
export function getNextIndex(currentIndex: number, totalItems: number): number {
  return (currentIndex + 1) % totalItems;
}

/**
 * Calculate the previous carousel index
 */
export function getPreviousIndex(currentIndex: number, totalItems: number): number {
  return currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
}

/**
 * Calculate scroll offset for a given index
 */
export function getScrollOffset(index: number): number {
  return index * width;
}

/**
 * Calculate index from scroll position
 */
export function getIndexFromOffset(offset: number): number {
  return Math.round(offset / width);
}

/**
 * Validate carousel index bounds
 */
export function validateIndex(index: number, totalItems: number): number {
  if (index < 0) return 0;
  if (index >= totalItems) return totalItems - 1;
  return index;
}

/**
 * Create item layout for FlatList optimization
 */
export function createItemLayout(data: any, index: number) {
  return {
    length: width,
    offset: width * index,
    index,
  };
}

/**
 * Handle scroll to index failures
 */
export function handleScrollFailure(
  carouselRef: any,
  info: { index: number },
  delay: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      carouselRef.current?.scrollToOffset({ 
        offset: getScrollOffset(info.index), 
        animated: true 
      });
      resolve();
    }, delay);
  });
}