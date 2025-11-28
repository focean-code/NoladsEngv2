/**
 * AnimatedSection Component
 * A reusable component that provides scroll-triggered animations
 * with stagger effects and customizable animation types
 */

import React, { forwardRef } from 'react';
import { useScrollAnimation, useStaggerAnimation, ANIMATION_VARIANTS } from '../lib/animations';
import { cn } from '../lib/utils';

// Base AnimatedSection Props
interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: keyof typeof ANIMATION_VARIANTS;
  duration?: 'fast' | 'normal' | 'slow' | 'slower';
  delay?: number;
  className?: string;
  as?: any; // Using any for now to resolve the component type issue
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}

// Staggered Animation Props
interface StaggeredSectionProps extends Omit<AnimatedSectionProps, 'animation'> {
  stagger?: boolean;
  staggerDelay?: number;
  animation?: keyof typeof ANIMATION_VARIANTS;
  itemCount?: number;
  itemSelector?: string;
}

// Main AnimatedSection Component
export const AnimatedSection = forwardRef<HTMLElement, AnimatedSectionProps>(
  (
    {
      children,
      animation = 'fadeInUp',
      duration = 'normal',
      delay = 0,
      className = '',
      as: Element = 'div',
      once = true,
      threshold = 0.1,
      rootMargin = '0px 0px -50px 0px',
      ...props
    },
    ref
  ) => {
    const { ref: animationRef, classes } = useScrollAnimation(animation, {
      threshold,
      rootMargin,
    });

    // Merge refs if provided
    const mergedRef = ref || animationRef;

    const durationClass = {
      fast: 'duration-1000',
      normal: 'duration-2000',
      slow: 'duration-3000',
      slower: 'duration-4000',
    };

    return (
      <Element
        ref={mergedRef}
        className={cn(
          classes,
          durationClass[duration],
          delay > 0 && `delay-${delay}`,
          className
        )}
        style={{ animationDelay: `${delay}ms` }}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

AnimatedSection.displayName = 'AnimatedSection';

// Staggered Animation Section
export const StaggeredSection = forwardRef<HTMLElement, StaggeredSectionProps>(
  (
    {
      children,
      animation = 'fadeInUp',
      staggerDelay = 100,
      className = '',
      as: Element = 'div',
      itemCount,
      ...props
    },
    ref
  ) => {
    // Automatically detect item count from children if not provided
    const childArray = React.Children.toArray(children);
    const count = itemCount || childArray.length;

    const { containerRef, getItemClasses } = useStaggerAnimation(
      count,
      animation,
      staggerDelay
    );

    // Merge refs if provided
    const mergedRef = ref || containerRef;

    return (
      <Element ref={mergedRef} className={cn(className)} {...props}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              className: cn(child.props.className, getItemClasses(index)),
            });
          }
          return child;
        })}
      </Element>
    );
  }
);

StaggeredSection.displayName = 'StaggeredSection';

// Pre-configured Animation Components
export const FadeInSection = (props: Omit<AnimatedSectionProps, 'animation'>) => (
  <AnimatedSection animation="fadeIn" {...props} />
);

export const SlideInSection = (props: Omit<AnimatedSectionProps, 'animation'>) => (
  <AnimatedSection animation="fadeInUp" {...props} />
);

export const ScaleInSection = (props: Omit<AnimatedSectionProps, 'animation'>) => (
  <AnimatedSection animation="scaleIn" {...props} />
);

export const BounceInSection = (props: Omit<AnimatedSectionProps, 'animation'>) => (
  <AnimatedSection animation="bounceIn" {...props} />
);

// Animation wrapper for cards
export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: 'default' | 'scale' | 'bounce' | 'slide';
}> = ({ children, className = '', delay = 0, variant = 'default' }) => {
  const animations = {
    default: 'fadeInUp',
    scale: 'scaleIn',
    bounce: 'bounceIn',
    slide: 'slideInUp',
  } as const;

  return (
    <AnimatedSection
      animation={animations[variant]}
      delay={delay}
      className={cn(
        'transform transition-all duration-700 ease-out',
        'hover:scale-105 hover:shadow-xl hover:-translate-y-2',
        className
      )}
    >
      {children}
    </AnimatedSection>
  );
};

// Animation wrapper for text elements
export const AnimatedText: React.FC<{
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  delay?: number;
  animation?: keyof typeof ANIMATION_VARIANTS;
}> = ({ 
  children, 
  as: Element = 'div', 
  className = '', 
  delay = 0, 
  animation = 'fadeInUp' 
}) => {
  return (
    <AnimatedSection
      as={Element}
      animation={animation}
      delay={delay}
      className={className}
    >
      {children}
    </AnimatedSection>
  );
};

// Special animated counter component
export const AnimatedCounter: React.FC<{
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}> = ({ from, to, duration = 2000, className = '', suffix = '', prefix = '' }) => {
  const [count, setCount] = React.useState(from);
  const [hasStarted, setHasStarted] = React.useState(false);
  const { ref, isVisible } = useScrollAnimation('fadeInUp');

  React.useEffect(() => {
    if (isVisible && !hasStarted) {
      setHasStarted(true);
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateCount = () => {
        const now = Date.now();
        if (now >= endTime) {
          setCount(to);
          return;
        }

        const progress = (now - startTime) / duration;
        const currentCount = Math.round(from + (to - from) * progress);
        setCount(currentCount);
        requestAnimationFrame(updateCount);
      };

      requestAnimationFrame(updateCount);
    }
  }, [isVisible, hasStarted, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
};

// Parallax section component
export const ParallaxSection: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = 0.5, className = '' }) => {
  const [offset, setOffset] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        setOffset(parallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        style={{
          transform: `translateY(${offset}px)`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Typewriter effect component
export const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
}> = ({ text, speed = 100, className = '', showCursor = true }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);
  const { ref, isVisible } = useScrollAnimation('fadeIn');

  React.useEffect(() => {
    if (isVisible && !hasStarted) {
      setHasStarted(true);
      const timer = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else {
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }
  }, [isVisible, hasStarted, currentIndex, text, speed]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      {showCursor && (
        <span className="animate-blink">|</span>
      )}
    </span>
  );
};

export default AnimatedSection;