/**
 * @file types/carousel.ts
 * @description TypeScript types for carousel functionality
 * @features - CarouselItem interface and related types
 */

import React from 'react';

export interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  gradient: string[];
  isHighlighted: boolean;
}