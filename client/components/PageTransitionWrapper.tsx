
import React from 'react';
import { usePageTransition } from '../hooks/usePageTransition';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ children }) => {
  const transitioning = usePageTransition();

  return <div className={transitioning ? 'animate-fade-in' : ''}>{children}</div>;
};

export default PageTransitionWrapper;
