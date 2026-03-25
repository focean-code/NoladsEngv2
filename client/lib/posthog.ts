/**
 * PostHog Analytics Integration
 *
 * PostHog is a free, open-source analytics platform with:
 * - 1 million free events/month (PostHog Cloud)
 * - Session recordings, heatmaps, feature flags
 * - Self-hostable
 *
 * Setup:
 * 1. Create a free account at https://app.posthog.com
 * 2. Copy your Project API Key
 * 3. Add to .env: VITE_POSTHOG_KEY=phc_xxxxxxxx
 * 4. Optionally: VITE_POSTHOG_HOST=https://us.i.posthog.com (default) or your self-hosted URL
 */

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';

let initialized = false;
let posthogClient: any = null;
const enableSessionRecording =
  import.meta.env.DEV || import.meta.env.VITE_POSTHOG_SESSION_RECORDING === "true";

export function initPostHog(): void {
  if (initialized) return;
  if (!POSTHOG_KEY) {
    if (import.meta.env.DEV) {
      console.info('[PostHog] VITE_POSTHOG_KEY not set — analytics disabled. Add it to .env to enable PostHog.');
    }
    return;
  }

  // Dynamically import so the posthog-js bundle is not part of the first-load chunk.
  void import('posthog-js')
    .then((mod) => {
      const posthog = mod.default;
      posthogClient = posthog;

      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Capture pageviews manually (we send them via trackPageView on route change)
        capture_pageview: false,
        // Session recordings are heavy; disable by default in production.
        session_recording: enableSessionRecording
          ? {
              recordCrossOriginIframes: false,
            }
          : false,
        // Respect Do Not Track
        respect_dnt: true,
        loaded: () => {
          if (import.meta.env.DEV) {
            // In dev, keep initialization but avoid noisy logs.
          }
        },
      });

      initialized = true;
    })
    .catch((err) => {
      // If analytics fails to load, never block the app UI.
      console.warn('[PostHog] Failed to load posthog-js:', err);
    });
}

/**
 * Track a page view. Call this on every route change.
 */
export function trackPageView(path?: string): void {
  if (!initialized || !POSTHOG_KEY || !posthogClient) return;
  posthogClient.capture('$pageview', {
    $current_url: path ?? window.location.href,
  });
}

/**
 * Track a custom event.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (!initialized || !POSTHOG_KEY || !posthogClient) return;
  posthogClient.capture(event, properties);
}

/**
 * Identify a logged-in user.
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!initialized || !POSTHOG_KEY || !posthogClient) return;
  posthogClient.identify(userId, properties);
}

/**
 * Reset the user identity on logout.
 */
export function resetUser(): void {
  if (!initialized || !POSTHOG_KEY || !posthogClient) return;
  posthogClient.reset();
}
