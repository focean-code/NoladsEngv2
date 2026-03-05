/**
 * Animated Loading Components
 * Beautiful loading states with smooth animations for various UI elements
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2, Zap, Settings, Wrench } from 'lucide-react';

// Base loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'white' | 'yellow';
}> = ({ size = 'md', className = '', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-slate-600',
    white: 'text-white',
    yellow: 'text-yellow-500',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

// Skeleton loading component
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'shimmer' | 'wave';
}> = ({ className = '', variant = 'rectangular', animation = 'shimmer' }) => {
  const baseClasses = 'bg-slate-200 dark:bg-slate-800';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    wave: 'animate-float-slow',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
    />
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{
  className?: string;
  showImage?: boolean;
  lines?: number;
}> = ({ className = '', showImage = true, lines = 3 }) => {
  return (
    <div className={cn('card p-6 space-y-4', className)}>
      {showImage && (
        <Skeleton variant="rectangular" className="w-full h-48" />
      )}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-3/4 h-6" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className={`h-4 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="rectangular" className="w-20 h-8 rounded-full" />
      </div>
    </div>
  );
};

// Navigation skeleton
export const NavSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <nav className={cn('flex items-center justify-between p-4', className)}>
      <Skeleton variant="rectangular" className="w-32 h-8" />
      <div className="hidden md:flex space-x-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} variant="text" className="w-16 h-6" />
        ))}
      </div>
      <Skeleton variant="rectangular" className="w-24 h-8 rounded-full" />
    </nav>
  );
};

// Hero section skeleton
export const HeroSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={cn('section-hero space-y-8', className)}>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Skeleton variant="text" className="w-24 h-6" />
            <div className="space-y-4">
              <Skeleton variant="text" className="w-full h-12" />
              <Skeleton variant="text" className="w-4/5 h-12" />
              <Skeleton variant="text" className="w-3/4 h-12" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton variant="circular" className="w-4 h-4" />
                  <Skeleton variant="text" className="w-32 h-4" />
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <Skeleton variant="rectangular" className="w-32 h-10 rounded-lg" />
              <Skeleton variant="rectangular" className="w-32 h-10 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton variant="rectangular" className="w-full h-80 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Dots loading animation
export const DotsLoader: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'yellow';
  className?: string;
}> = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-slate-600',
    white: 'bg-white',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};

// Bars loading animation
export const BarsLoader: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'yellow';
  className?: string;
}> = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-0.5 h-4',
    md: 'w-1 h-6',
    lg: 'w-1.5 h-8',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-slate-600',
    white: 'bg-white',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className={cn('flex space-x-1 items-end', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-sm',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

// Pulse loading animation
export const PulseLoader: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'yellow';
  className?: string;
}> = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-slate-600',
    white: 'bg-white',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full animate-pulse-glow opacity-20',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      <div
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    </div>
  );
};

// Engineering-themed loader
export const EngineeringLoader: React.FC<{
  className?: string;
  text?: string;
}> = ({ className = '', text = 'Loading...' }) => {
  const icons = [Zap, Settings, Wrench];
  
  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative">
        {icons.map((Icon, index) => (
          <Icon
            key={index}
            className={cn(
              'absolute w-6 h-6 text-blue-600 animate-bounce',
              index === 0 && 'top-0 left-0',
              index === 1 && 'top-2 right-0',
              index === 2 && 'bottom-0 left-2'
            )}
            style={{
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
        <div className="w-16 h-16" />
      </div>
      {text && (
        <p className="text-slate-600 font-medium animate-pulse-slow">
          {text}
        </p>
      )}
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children?: React.ReactNode;
  text?: string;
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'engineering';
}> = ({ 
  isLoading, 
  children, 
  text = 'Loading...', 
  variant = 'engineering' 
}) => {
  const loaderComponents = {
    spinner: <LoadingSpinner size="lg" color="primary" />,
    dots: <DotsLoader size="lg" color="primary" />,
    bars: <BarsLoader size="lg" color="primary" />,
    pulse: <PulseLoader size="lg" color="primary" />,
    engineering: <EngineeringLoader text={text} />,
  };

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          {loaderComponents[variant]}
          {variant !== 'engineering' && text && (
            <p className="text-slate-600 font-medium animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Button loading state
export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}> = ({ 
  loading = false, 
  children, 
  className = '', 
  disabled = false,
  variant = 'primary',
  size = 'md',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
    ghost: 'text-blue-600 hover:bg-blue-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" color="white" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export {
  LoadingSpinner as default,
};