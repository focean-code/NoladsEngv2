/**
 * Loading States Component
 * Comprehensive skeleton loading system for better UX
 */

import React from 'react';
import { cn } from '../lib/utils';

// Base Skeleton Component
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  animated = true,
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-700',
        roundedClasses[rounded],
        animated && 'animate-pulse',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

// Text Skeleton
interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  className = '',
  lastLineWidth = '60%',
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? lastLineWidth : '100%'}
          className="animate-pulse"
        />
      ))}
    </div>
  );
};

// Card Skeleton
interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
}) => {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6', className)}>
      {showImage && (
        <Skeleton
          height="200px"
          className="mb-4 animate-pulse"
          rounded="lg"
        />
      )}
      
      {showTitle && (
        <Skeleton
          height="1.5rem"
          width="70%"
          className="mb-3 animate-pulse"
        />
      )}
      
      {showDescription && (
        <TextSkeleton
          lines={2}
          className="mb-4"
          lastLineWidth="80%"
        />
      )}
      
      {showActions && (
        <div className="flex gap-2">
          <Skeleton
            height="2.5rem"
            width="100px"
            className="animate-pulse"
            rounded="md"
          />
          <Skeleton
            height="2.5rem"
            width="80px"
            className="animate-pulse"
            rounded="md"
          />
        </div>
      )}
    </div>
  );
};

// Hero Section Skeleton
export const HeroSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={cn('min-h-screen flex items-center', className)}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <Skeleton
              height="1rem"
              width="200px"
              className="animate-pulse"
              rounded="full"
            />
            <Skeleton
              height="3rem"
              width="80%"
              className="animate-pulse"
            />
            <Skeleton
              height="2rem"
              width="60%"
              className="animate-pulse"
            />
            <TextSkeleton
              lines={4}
              className="mb-8"
            />
            <div className="flex gap-4">
              <Skeleton
                height="3rem"
                width="150px"
                className="animate-pulse"
                rounded="md"
              />
              <Skeleton
                height="3rem"
                width="120px"
                className="animate-pulse"
                rounded="md"
              />
            </div>
          </div>
          
          {/* Right Content */}
          <div className="hidden lg:block">
            <Skeleton
              height="400px"
              className="animate-pulse"
              rounded="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Service Card Skeleton
export const ServiceCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg', className)}>
      <div className="flex items-center mb-4">
        <Skeleton
          width="3rem"
          height="3rem"
          className="animate-pulse"
          rounded="lg"
        />
        <div className="ml-4 flex-1">
          <Skeleton
            height="1.25rem"
            width="70%"
            className="animate-pulse"
          />
        </div>
      </div>
      
      <TextSkeleton
        lines={3}
        className="mb-6"
      />
      
      <div className="flex justify-between items-center">
        <Skeleton
          height="2rem"
          width="100px"
          className="animate-pulse"
        />
        <Skeleton
          height="2.5rem"
          width="120px"
          className="animate-pulse"
          rounded="md"
        />
      </div>
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ 
  items?: number;
  className?: string;
}> = ({ items = 6, className = '' }) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: items }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton
              key={i}
              height="1rem"
              width={`${100 / columns}%`}
              className="animate-pulse"
            />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }, (_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  height="1rem"
                  width={`${100 / columns}%`}
                  className="animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number;
  className?: string;
}> = ({ fields = 4, className = '' }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton
            height="1rem"
            width="120px"
            className="animate-pulse"
          />
          <Skeleton
            height="2.5rem"
            className="animate-pulse"
            rounded="md"
          />
        </div>
      ))}
      
      <div className="flex gap-4 pt-4">
        <Skeleton
          height="2.5rem"
          width="100px"
          className="animate-pulse"
          rounded="md"
        />
        <Skeleton
          height="2.5rem"
          width="80px"
          className="animate-pulse"
          rounded="md"
        />
      </div>
    </div>
  );
};

// Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-slate-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
};

// Page Loading Overlay
export const PageLoadingOverlay: React.FC<{ 
  message?: string;
  className?: string;
}> = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={cn(
      'fixed inset-0 bg-white dark:bg-slate-900 bg-opacity-90 dark:bg-opacity-90',
      'flex items-center justify-center z-50',
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
};

// Inline loading component for backward compatibility
export const InlineLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <LoadingSpinner size="sm" />
    </div>
  );
};

// Error state component for backward compatibility
export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({ title = 'Something went wrong', message, onRetry, className = '' }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

// Empty state component for backward compatibility
export const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ title, description, action, className = '' }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📭</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default Skeleton;