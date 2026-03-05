
import React from 'react';
import { usePageTransition } from '../hooks/usePageTransition';
import { usePostHogTracking } from '../hooks/usePostHogTracking';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ children }) => {
  const transitioning = usePageTransition();
  // Track PostHog page view on every route change
  usePostHogTracking();

  return <div className={transitioning ? 'animate-fade-in' : ''}>{children}</div>;
};

export default PageTransitionWrapper;
