import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Star, TrendingUp, Shield } from 'lucide-react';

// Gradient background component
export const GradientBackground: React.FC<{
  children: React.ReactNode;
  variant?: 'subtle' | 'vibrant' | 'professional' | 'electric';
  className?: string;
}> = ({ children, variant = 'subtle', className }) => {
  const variants = {
    subtle: 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
    vibrant: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
    professional: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800',
    electric: 'bg-gradient-to-br from-yellow-400 via-blue-500 to-purple-600',
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
};

// Animated counter component
export const AnimatedCounter: React.FC<{
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}> = ({ end, duration = 2000, suffix = '', prefix = '', className }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Progress bar with animation
export const AnimatedProgressBar: React.FC<{
  progress: number;
  className?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
  showLabel?: boolean;
}> = ({ progress, className, color = 'blue', showLabel = false }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-slate-600 mt-1 text-right">
          {Math.round(animatedProgress)}%
        </div>
      )}
    </div>
  );
};

// Icon with background glow
export const GlowIcon: React.FC<{
  icon: React.ComponentType<any>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gold' | 'green' | 'purple';
  className?: string;
}> = ({ icon: Icon, size = 'md', color = 'blue', className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-2',
    md: 'w-12 h-12 p-3',
    lg: 'w-16 h-16 p-4',
    xl: 'w-20 h-20 p-5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 shadow-blue-500/20',
    gold: 'bg-yellow-100 text-yellow-600 shadow-yellow-500/20',
    green: 'bg-green-100 text-green-600 shadow-green-500/20',
    purple: 'bg-purple-100 text-purple-600 shadow-purple-500/20',
  };

  return (
    <div className={cn(
      'rounded-full shadow-lg transition-all duration-300 hover:shadow-xl',
      sizeClasses[size],
      colorClasses[color],
      className
    )}>
      <Icon className={iconSizes[size]} />
    </div>
  );
};

// Testimonial card with enhanced styling
export const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  position: string;
  company: string;
  rating?: number;
  avatar?: string;
  className?: string;
}> = ({ quote, author, position, company, rating = 5, avatar, className }) => {
  return (
    <div className={cn(
      'bg-white rounded-2xl p-8 shadow-lg border border-slate-200',
      'hover:shadow-xl transition-all duration-300',
      className
    )}>
      {/* Rating stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-5 h-5',
              i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
            )}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-slate-700 text-lg leading-relaxed mb-6 italic">
        "{quote}"
      </blockquote>

      {/* Author info */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {author.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <div className="font-semibold text-slate-900">{author}</div>
          <div className="text-slate-600 text-sm">{position}</div>
          <div className="text-slate-500 text-sm">{company}</div>
        </div>
      </div>
    </div>
  );
};

// Stats card with animation
export const StatsCard: React.FC<{
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}> = ({ 
  value, 
  label, 
  suffix = '', 
  prefix = '', 
  icon: Icon,
  trend,
  trendValue,
  className 
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  return (
    <div className={cn(
      'bg-white rounded-xl p-6 shadow-lg border border-slate-200',
      'hover:shadow-xl transition-all duration-300',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        {Icon && <GlowIcon icon={Icon} size="md" color="blue" />}
        {trend && trendValue && (
          <div className={cn('flex items-center gap-1 text-sm', trendColors[trend])}>
            <TrendingUp className="w-4 h-4" />
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-slate-900 mb-2">
        <AnimatedCounter 
          end={value} 
          prefix={prefix} 
          suffix={suffix}
        />
      </div>
      
      <div className="text-slate-600 font-medium">{label}</div>
    </div>
  );
};

// Feature highlight box
export const FeatureHighlight: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color?: 'blue' | 'gold' | 'green' | 'purple';
  className?: string;
}> = ({ title, description, icon: Icon, color = 'blue', className }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50/50',
    gold: 'border-yellow-200 bg-yellow-50/50',
    green: 'border-green-200 bg-green-50/50',
    purple: 'border-purple-200 bg-purple-50/50',
  };

  return (
    <div className={cn(
      'rounded-xl border-2 p-6 transition-all duration-300',
      'hover:shadow-lg hover:-translate-y-1',
      colorClasses[color],
      className
    )}>
      <GlowIcon icon={Icon} color={color} className="mb-4" />
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
};