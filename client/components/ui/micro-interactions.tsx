import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Hover lift effect for cards
export const HoverLift: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}> = ({ children, className, intensity = 'medium' }) => {
  const intensityClasses = {
    subtle: 'hover:-translate-y-1 hover:shadow-lg',
    medium: 'hover:-translate-y-2 hover:shadow-xl',
    strong: 'hover:-translate-y-3 hover:shadow-2xl',
  };

  return (
    <div className={cn(
      'transition-all duration-300 ease-out',
      intensityClasses[intensity],
      className
    )}>
      {children}
    </div>
  );
};

// Magnetic button effect
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  strength?: number;
}> = ({ children, className, strength = 0.3 }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={buttonRef}
      className={cn('transition-transform duration-300 ease-out', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Ripple effect for buttons
export const RippleEffect: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
}> = ({ children, className, color = 'rgba(255, 255, 255, 0.6)' }) => {
  const [ripples, setRipples] = useState<Array<{
    x: number;
    y: number;
    id: number;
  }>>([]);

  const addRipple = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};

// Parallax scroll effect
export const ParallaxContainer: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = 0.5, className }) => {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={elementRef}
      className={cn('transition-transform duration-75', className)}
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
};

// Stagger animation for lists
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 100 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'transition-all duration-700 ease-out',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
          style={{
            transitionDelay: isVisible ? `${index * delay}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Glow effect on hover
export const GlowEffect: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: 'blue' | 'gold' | 'green' | 'purple';
}> = ({ children, className, color = 'blue' }) => {
  const glowColors = {
    blue: 'hover:shadow-blue-500/25 hover:shadow-2xl',
    gold: 'hover:shadow-yellow-500/25 hover:shadow-2xl',
    green: 'hover:shadow-green-500/25 hover:shadow-2xl',
    purple: 'hover:shadow-purple-500/25 hover:shadow-2xl',
  };

  return (
    <div className={cn(
      'transition-all duration-300',
      glowColors[color],
      className
    )}>
      {children}
    </div>
  );
};

// Floating animation
export const FloatingElement: React.FC<{
  children: React.ReactNode;
  className?: string;
  duration?: number;
}> = ({ children, className, duration = 3 }) => {
  return (
    <div
      className={cn('animate-bounce', className)}
      style={{
        animationDuration: `${duration}s`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
      }}
    >
      {children}
    </div>
  );
};