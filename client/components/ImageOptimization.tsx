/**
 * Image Optimization Component
 * WebP/AVIF support with lazy loading and responsive images
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  sizes = '100vw',
  priority = false,
  loading = 'lazy',
  onLoad,
  onError,
  fallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URLs
  const generateImageUrls = (originalSrc: string) => {
    const baseUrl = originalSrc.split('?')[0];
    const extension = originalSrc.split('.').pop()?.toLowerCase();
    
    // If it's already a WebP or AVIF, return as is
    if (extension === 'webp' || extension === 'avif') {
      return {
        avif: originalSrc,
        webp: originalSrc,
        original: originalSrc
      };
    }

    // Generate optimized formats
    return {
      avif: `${baseUrl}.avif`,
      webp: `${baseUrl}.webp`,
      original: originalSrc
    };
  };

  const imageUrls = generateImageUrls(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Show placeholder while loading
  if (!isInView && !priority) {
    return (
      <div
        className={cn(
          'bg-slate-200 animate-pulse rounded-lg',
          className
        )}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
        aria-label={alt}
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Optimized Image with multiple formats */}
      <picture>
        {/* AVIF format - best compression */}
        <source
          srcSet={imageUrls.avif}
          type="image/avif"
          sizes={sizes}
        />
        
        {/* WebP format - good compression, wide support */}
        <source
          srcSet={imageUrls.webp}
          type="image/webp"
          sizes={sizes}
        />
        
        {/* Fallback to original format */}
        <img
          ref={imgRef}
          src={hasError ? (fallback || imageUrls.original) : imageUrls.original}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          sizes={sizes}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto'
          }}
        />
      </picture>

      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-slate-200 animate-pulse rounded-lg',
            placeholder ? 'bg-cover bg-center' : ''
          )}
          style={{
            backgroundImage: placeholder ? `url(${placeholder})` : undefined
          }}
        />
      )}

      {/* Error fallback */}
      {hasError && fallback && (
        <img
          src={fallback}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

// Responsive Image Component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  aspectRatio?: 'square' | 'video' | 'wide' | 'ultrawide' | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  },
  aspectRatio = 'video',
  objectFit = 'cover'
}) => {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'wide': return 'aspect-[16/10]';
      case 'ultrawide': return 'aspect-[21/9]';
      default: return `aspect-[${aspectRatio}]`;
    }
  };

  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'cover': return 'object-cover';
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      case 'none': return 'object-none';
      case 'scale-down': return 'object-scale-down';
      default: return 'object-cover';
    }
  };

  // Generate responsive sizes
  const generateSizes = () => {
    const sizes = [];
    if (breakpoints.xl) sizes.push(`(min-width: ${breakpoints.xl}px) ${breakpoints.xl}px`);
    if (breakpoints.lg) sizes.push(`(min-width: ${breakpoints.lg}px) ${breakpoints.lg}px`);
    if (breakpoints.md) sizes.push(`(min-width: ${breakpoints.md}px) ${breakpoints.md}px`);
    if (breakpoints.sm) sizes.push(`(min-width: ${breakpoints.sm}px) ${breakpoints.sm}px`);
    sizes.push('100vw');
    return sizes.join(', ');
  };

  return (
    <div className={cn('relative overflow-hidden', getAspectRatioClass(), className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        className={cn('w-full h-full', getObjectFitClass())}
        sizes={generateSizes()}
        loading="lazy"
      />
    </div>
  );
};

// Background Image Component
interface BackgroundImageProps {
  src: string;
  className?: string;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  className = '',
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.5,
  children
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        'relative bg-cover bg-center bg-no-repeat',
        className
      )}
      style={{
        backgroundImage: `url(${src})`,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {/* Preload image */}
      <img
        src={src}
        alt=""
        className="hidden"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Image Gallery Component
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 'md',
  className = ''
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getGap = () => {
    switch (gap) {
      case 'sm': return 'gap-2';
      case 'md': return 'gap-4';
      case 'lg': return 'gap-6';
      default: return 'gap-4';
    }
  };

  return (
    <div className={cn('grid', getGridCols(), getGap(), className)}>
      {images.map((image, index) => (
        <div key={index} className="group relative overflow-hidden rounded-lg">
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            aspectRatio="square"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-sm">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Image Upload Component
interface ImageUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  disabled = false,
  multiple = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return;
      }

      setError(null);
      onUpload(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200',
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="space-y-2">
          <div className="text-4xl">📷</div>
          <p className="text-sm text-slate-600">
            {isDragOver ? 'Drop your image here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-slate-500">
            PNG, JPG, WebP, AVIF up to {maxSize}MB
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default OptimizedImage;
