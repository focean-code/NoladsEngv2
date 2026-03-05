/**
 * Enhanced Animation Utilities for Nolads Engineering
 * Comprehensive animation system with scroll-triggered animations,
 * micro-interactions, and performance optimizations
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Animation configuration constants
export const ANIMATION_CONFIG = {
  // Duration settings
  durations: {
    instant: 0,
    fast: 500,
    normal: 1000,
    slow: 2000,
    slower: 3000,
    slowest: 4000,
  },
  
  // Easing functions
  easings: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Delay settings for staggered animations
  stagger: {
    short: 200,
    medium: 400,
    long: 600,
    longer: 800,
  },
  
  // Intersection observer settings
  observer: {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  },
};

// Animation variants for different types of elements
export const ANIMATION_VARIANTS = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInDown: {
    from: { opacity: 0, transform: 'translateY(-30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInLeft: {
    from: { opacity: 0, transform: 'translateX(-30px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  fadeInRight: {
    from: { opacity: 0, transform: 'translateX(30px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  
  // Scale animations
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  scaleInBounce: {
    from: { opacity: 0, transform: 'scale(0.3)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  
  // Slide animations
  slideInUp: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
  },
  slideInDown: {
    from: { transform: 'translateY(-100%)' },
    to: { transform: 'translateY(0)' },
  },
  slideInLeft: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
  },
  slideInRight: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
  },
  
  // Rotation animations
  rotateIn: {
    from: { opacity: 0, transform: 'rotate(-180deg)' },
    to: { opacity: 1, transform: 'rotate(0deg)' },
  },
  
  // Flip animations
  flipInX: {
    from: { opacity: 0, transform: 'rotateX(-90deg)' },
    to: { opacity: 1, transform: 'rotateX(0)' },
  },
  flipInY: {
    from: { opacity: 0, transform: 'rotateY(-90deg)' },
    to: { opacity: 1, transform: 'rotateY(0)' },
  },
  
  // Special effect animations
  zoomIn: {
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  bounceIn: {
    from: { opacity: 0, transform: 'scale(0.3)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  rollIn: {
    from: { opacity: 0, transform: 'translateX(-100%) rotate(-120deg)' },
    to: { opacity: 1, transform: 'translateX(0) rotate(0deg)' },
  },
};

// Intersection Observer Hook for Scroll Animations
export const useScrollAnimation = (
  animationType: keyof typeof ANIMATION_VARIANTS = 'fadeInUp',
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      {
        threshold: ANIMATION_CONFIG.observer.threshold,
        rootMargin: ANIMATION_CONFIG.observer.rootMargin,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasAnimated, options]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-700 ease-out';
    
    if (!isVisible) {
      const variant = ANIMATION_VARIANTS[animationType];
      return `${baseClasses} opacity-0`;
    }
    
    return `${baseClasses} opacity-100 animate-${animationType}`;
  };

  return { ref: elementRef, isVisible, classes: getAnimationClasses() };
};

// Stagger Animation Hook
export const useStaggerAnimation = (
  itemCount: number,
  animationType: keyof typeof ANIMATION_VARIANTS = 'fadeInUp',
  staggerDelay: number = ANIMATION_CONFIG.stagger.medium
) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the animation of each item
          Array.from({ length: itemCount }, (_, i) => {
            setTimeout(() => {
              setVisibleItems(prev => new Set(prev.add(i)));
            }, i * staggerDelay);
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [itemCount, staggerDelay]);

  const getItemClasses = (index: number) => {
    const baseClasses = 'transition-all duration-700 ease-out';
    const isVisible = visibleItems.has(index);
    
    if (!isVisible) {
      return `${baseClasses} opacity-0 transform translate-y-8`;
    }
    
    return `${baseClasses} opacity-100 transform translate-y-0`;
  };

  return { containerRef, getItemClasses, visibleItems };
};

// Page Transition Hook
export const usePageTransition = () => {
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const startEnterTransition = useCallback(() => {
    setIsEntering(true);
    setTimeout(() => setIsEntering(false), ANIMATION_CONFIG.durations.slow);
  }, []);

  const startExitTransition = useCallback(() => {
    setIsExiting(true);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setIsExiting(false);
        resolve();
      }, ANIMATION_CONFIG.durations.normal);
    });
  }, []);

  const getPageClasses = () => {
    if (isEntering) {
      return 'animate-fadeInUp';
    }
    if (isExiting) {
      return 'animate-fadeOutDown';
    }
    return '';
  };

  return {
    isEntering,
    isExiting,
    startEnterTransition,
    startExitTransition,
    pageClasses: getPageClasses(),
  };
};

// Hover Animation Utilities
export const getHoverAnimation = (type: 'lift' | 'scale' | 'glow' | 'tilt' | 'bounce' = 'lift') => {
  const animations = {
    lift: 'hover:transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-out',
    scale: 'hover:transform hover:scale-105 transition-all duration-300 ease-out',
    glow: 'hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 ease-out',
    tilt: 'hover:transform hover:rotate-1 hover:scale-105 transition-all duration-300 ease-out',
    bounce: 'hover:animate-bounce transition-all duration-300 ease-out',
  };
  
  return animations[type];
};

// Button Animation Variants
export const getButtonAnimation = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary'
) => {
  const base = 'transition-all duration-200 ease-out transform active:scale-95';
  
  const variants = {
    primary: `${base} hover:scale-105 hover:shadow-lg hover:-translate-y-0.5`,
    secondary: `${base} hover:scale-102 hover:shadow-md`,
    outline: `${base} hover:scale-102 hover:shadow-md hover:-translate-y-0.5`,
    ghost: `${base} hover:scale-102`,
  };
  
  return variants[variant];
};

// Card Animation Variants
export const getCardAnimation = (
  variant: 'default' | 'interactive' | 'featured' | 'glass' = 'default'
) => {
  const base = 'transition-all duration-300 ease-out';
  
  const variants = {
    default: `${base} hover:shadow-xl hover:-translate-y-1`,
    interactive: `${base} hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer`,
    featured: `${base} hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-3 hover:scale-[1.03]`,
    glass: `${base} hover:shadow-xl hover:backdrop-blur-lg hover:-translate-y-1`,
  };
  
  return variants[variant];
};

// Loading Animation Component Generator
export const generateLoadingAnimation = (type: 'spinner' | 'dots' | 'bars' | 'pulse' = 'spinner') => {
  const animations = {
    spinner: 'animate-spin',
    dots: 'animate-pulse',
    bars: 'animate-bounce',
    pulse: 'animate-ping',
  };
  
  return animations[type];
};

// Parallax Effect Hook
export const useParallax = (speed: number = 0.5) => {
  const elementRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        setOffset(parallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref: elementRef, offset };
};

// Animation Class Builders
export const buildAnimationClasses = ({
  animation = 'fadeInUp',
  duration = 'normal',
  easing = 'easeOut',
  delay = 0,
}: {
  animation?: keyof typeof ANIMATION_VARIANTS;
  duration?: keyof typeof ANIMATION_CONFIG.durations;
  easing?: keyof typeof ANIMATION_CONFIG.easings;
  delay?: number;
} = {}) => {
  const durationMs = ANIMATION_CONFIG.durations[duration];
  const easingValue = ANIMATION_CONFIG.easings[easing];
  
  return {
    className: `animate-${animation}`,
    style: {
      animationDuration: `${durationMs}ms`,
      animationTimingFunction: easingValue,
      animationDelay: `${delay}ms`,
    },
  };
};

// Utility function to create custom animation keyframes
export const createCustomAnimation = (
  name: string,
  keyframes: Record<string, React.CSSProperties>
) => {
  const keyframeStrings = Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      return `${key} { ${styleString} }`;
    })
    .join(' ');

  return `@keyframes ${name} { ${keyframeStrings} }`;
};

// Performance optimized animation utilities
export const withPerformanceOptimization = (animationClass: string) => {
  return `${animationClass} will-change-transform backface-visibility-hidden perspective-1000`;
};

// Animation debug helper (development only)
export const debugAnimation = (elementRef: React.RefObject<HTMLElement>) => {
  if (process.env.NODE_ENV === 'development') {
    const element = elementRef.current;
    if (element) {
      element.style.outline = '2px dashed orange';
      element.style.outlineOffset = '2px';
      console.log('Animation Debug:', {
        element,
        computedStyles: window.getComputedStyle(element),
        animations: element.getAnimations?.(),
      });
    }
  }
};