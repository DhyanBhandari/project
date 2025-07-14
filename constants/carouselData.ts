/**
 * @file constants/carouselData.ts
 * @description Carousel data configuration and content
 * @features - Service cards with icons, gradients, and descriptions
 */

import { Globe, Car, Coffee, Wrench, Heart, Zap } from 'lucide-react-native';
import { CarouselItem } from '../types/Carousel.js';

export const carouselData: CarouselItem[] = [
  {
    id: 1,
    title: "Shop Smarter",
    subtitle: "Find everything at one place",
    icon: Zap,
    gradient: ['#ff9a9e', '#fad0c4'],
    isHighlighted: false,
  },
  {
    id: 2,
    title: "Faster Delivery",
    subtitle: "We deliver in minutes",
    icon: Car,
    gradient: ['#fbc2eb', '#a6c1ee'],
    isHighlighted: false,
  },
  {
    id: 3,
    title: "Fresh Everyday",
    subtitle: "Fresh food & produce",
    icon: Coffee,
    gradient: ['#a1c4fd', '#c2e9fb'],
    isHighlighted: false,
  },
  {
    id: 4,
    title: "Local Services",
    subtitle: "Book services near you",
    icon: Wrench,
    gradient: ['#f6d365', '#fda085'],
    isHighlighted: false,
  },
  {
    id: 5,
    title: "Connect & Share",
    subtitle: "Share with family and friends",
    icon: Heart,
    gradient: ['#84fab0', '#8fd3f4'],
    isHighlighted: false,
  },
];

export const AUTO_SCROLL_INTERVAL = 1000; // 4 seconds