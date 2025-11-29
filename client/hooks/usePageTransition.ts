
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ANIMATION_CONFIG } from '../lib/animations';

export interface PageTransitionState {
  isEntering: boolean;
  isExiting: boolean;
  transitioning: boolean;
  progress: number;
}

export const usePageTransition = () => {
  const location = useLocation();
  const [state, setState] = useState<PageTransitionState>({
    isEntering: false,
    isExiting: false,
    transitioning: false,
    progress: 0,
  });

  // Enhanced page transition with enter and exit phases
  useEffect(() => {
    // Start exit transition
    setState(prev => ({ 
      ...prev, 
      isExiting: true, 
      transitioning: true,
      progress: 0 
    }));

    const exitTimer = setTimeout(() => {
      // Switch to enter transition
      setState(prev => ({ 
        ...prev, 
        isExiting: false, 
        isEntering: true,
        progress: 50 
      }));

      const enterTimer = setTimeout(() => {
        // Complete transition
        setState(prev => ({ 
          ...prev, 
          isEntering: false, 
          transitioning: false,
          progress: 100 
        }));
      }, ANIMATION_CONFIG.durations.normal);

      return () => clearTimeout(enterTimer);
    }, ANIMATION_CONFIG.durations.fast);

    return () => clearTimeout(exitTimer);
  }, [location.pathname]);

  const getTransitionClasses = useCallback(() => {
    if (state.isExiting) {
      return 'animate-fade-out-down';
    }
    if (state.isEntering) {
      return 'animate-fade-in-up';
    }
    return '';
  }, [state.isExiting, state.isEntering]);

  const startCustomTransition = useCallback(async (
    exitAnimation: string = 'animate-fade-out-down',
    enterAnimation: string = 'animate-fade-in-up',
    duration: number = ANIMATION_CONFIG.durations.normal
  ) => {
    setState(prev => ({ 
      ...prev, 
      isExiting: true, 
      transitioning: true 
    }));

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isExiting: false, 
          isEntering: true 
        }));

        setTimeout(() => {
          setState(prev => ({ 
            ...prev, 
            isEntering: false, 
            transitioning: false 
          }));
          resolve();
        }, duration);
      }, duration / 2);
    });
  }, []);

  return {
    ...state,
    transitioning: state.transitioning, // Backward compatibility
    getTransitionClasses,
    startCustomTransition,
  };
};

// Simplified hook for backward compatibility
export const useSimplePageTransition = () => {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const timer = setTimeout(() => setTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return transitioning;
};
