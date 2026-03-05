/**
 * PostHog page-view tracking hook.
 * Fires a $pageview event on every route change.
 * Usage: call this hook once inside a component that is rendered on every page
 * (e.g. the root layout or directly in App.tsx after RouterProvider mounts).
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/posthog';

export function usePostHogTracking(): void {
  const location = useLocation();

  useEffect(() => {
    trackPageView(window.location.href);
  }, [location.pathname, location.search]);
}
