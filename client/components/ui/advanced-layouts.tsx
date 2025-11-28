import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Masonry grid layout
export const MasonryGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}> = ({ children, columns = 3, gap = 24, className }) => {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

// Bento box layout (like Apple's design)
export const BentoGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      'auto-rows-fr',
      className
    )}>
      {children}
    </div>
  );
};

export const BentoCard: React.FC<{
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  className?: string;
}> = ({ children, size = 'medium', className }) => {
  const sizeClasses = {
    small: 'md:col-span-1 md:row-span-1',
    medium: 'md:col-span-1 md:row-span-2',
    large: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2 md:row-span-1',
    tall: 'md:col-span-1 md:row-span-3',
  };

  return (
    <div className={cn(
      'bg-white rounded-2xl p-6 shadow-lg border border-slate-200',
      'hover:shadow-xl transition-all duration-300',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
};

// Carousel with smooth transitions
export const SmoothCarousel: React.FC<{
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}> = ({ 
  children, 
  autoPlay = false, 
  interval = 5000, 
  showDots = true, 
  showArrows = true,
  className 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % children.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className={cn('relative overflow-hidden rounded-2xl', className)}>
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-6 h-6 text-slate-700" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Split screen layout
export const SplitScreen: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1';
  className?: string;
}> = ({ left, right, ratio = '1:1', className }) => {
  const ratioClasses = {
    '1:1': 'grid-cols-1 lg:grid-cols-2',
    '1:2': 'grid-cols-1 lg:grid-cols-3',
    '2:1': 'grid-cols-1 lg:grid-cols-3',
    '1:3': 'grid-cols-1 lg:grid-cols-4',
    '3:1': 'grid-cols-1 lg:grid-cols-4',
  };

  const leftSpan = {
    '1:1': 'lg:col-span-1',
    '1:2': 'lg:col-span-1',
    '2:1': 'lg:col-span-2',
    '1:3': 'lg:col-span-1',
    '3:1': 'lg:col-span-3',
  };

  const rightSpan = {
    '1:1': 'lg:col-span-1',
    '1:2': 'lg:col-span-2',
    '2:1': 'lg:col-span-1',
    '1:3': 'lg:col-span-3',
    '3:1': 'lg:col-span-1',
  };

  return (
    <div className={cn('grid gap-8', ratioClasses[ratio], className)}>
      <div className={leftSpan[ratio]}>{left}</div>
      <div className={rightSpan[ratio]}>{right}</div>
    </div>
  );
};

// Sticky sidebar layout
export const StickyLayout: React.FC<{
  sidebar: React.ReactNode;
  main: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  className?: string;
}> = ({ 
  sidebar, 
  main, 
  sidebarPosition = 'left', 
  sidebarWidth = '300px',
  className 
}) => {
  return (
    <div className={cn('flex gap-8', className)}>
      {sidebarPosition === 'left' && (
        <aside 
          className="sticky top-8 h-fit"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </aside>
      )}
      
      <main className="flex-1 min-w-0">
        {main}
      </main>
      
      {sidebarPosition === 'right' && (
        <aside 
          className="sticky top-8 h-fit"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </aside>
      )}
    </div>
  );
};

// Timeline layout
export const Timeline: React.FC<{
  items: Array<{
    title: string;
    description: string;
    date: string;
    icon?: React.ComponentType<any>;
  }>;
  className?: string;
}> = ({ items, className }) => {
  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
      
      {items.map((item, index) => (
        <div key={index} className="relative flex items-start gap-6 pb-8">
          {/* Timeline dot */}
          <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white border-4 border-blue-500 rounded-full shadow-lg">
            {item.icon ? (
              <item.icon className="w-6 h-6 text-blue-600" />
            ) : (
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pt-2">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {item.date}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};