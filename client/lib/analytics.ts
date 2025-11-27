/**
 * Analytics Integration System
 * Performance tracking, user behavior analysis, and conversion optimization
 */

// Analytics event types
export type AnalyticsEvent = {
  name: string;
  category: 'performance' | 'user' | 'business' | 'error';
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
};

// User session data
export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userAgent: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  bundleSize: number;
  assetCount: number;
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  sessionTimeout: number;
}

// Analytics class
export class Analytics {
  private config: AnalyticsConfig;
  private session: UserSession;
  private events: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: process.env.NODE_ENV === 'development',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...config
    };

    this.session = this.createSession();
  }

  // Initialize analytics
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Start session tracking
    this.startSessionTracking();
    
    // Track page views
    this.trackPageView();
    
    // Track performance metrics
    this.trackPerformance();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track errors
    this.trackErrors();
    
    // Start periodic flushing
    this.startFlushTimer();
    
    // Track UTM parameters
    this.trackUTMParameters();
  }

  // Create new session
  private createSession(): UserSession {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      utmSource: this.getURLParameter('utm_source'),
      utmMedium: this.getURLParameter('utm_medium'),
      utmCampaign: this.getURLParameter('utm_campaign')
    };
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get URL parameter
  private getURLParameter(name: string): string | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || undefined;
  }

  // Start session tracking
  private startSessionTracking() {
    // Update last activity on user interaction
    const updateActivity = () => {
      this.session.lastActivity = Date.now();
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check session timeout
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.session.lastActivity;
      if (timeSinceLastActivity > this.config.sessionTimeout) {
        this.endSession();
        this.session = this.createSession();
      }
    }, 60000); // Check every minute
  }

  // Track page view
  private trackPageView() {
    this.session.pageViews++;
    this.trackEvent({
      name: 'page_view',
      category: 'user',
      action: 'view',
      label: window.location.pathname,
      properties: {
        title: document.title,
        url: window.location.href,
        referrer: document.referrer
      }
    });

    // Track route changes in SPA
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Track performance metrics
  private trackPerformance() {
    // Wait for page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPerformanceMetrics();
      }, 1000);
    });
  }

  // Track performance metrics
  private trackPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const metrics: PerformanceMetrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      bundleSize: 0,
      assetCount: 0
    };

    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            metrics.cumulativeLayoutShift += clsEntry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Calculate bundle size
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    resources.forEach((resource) => {
      if (resource.initiatorType === 'script' || resource.initiatorType === 'link') {
        metrics.bundleSize += resource.transferSize || 0;
        metrics.assetCount++;
      }
    });

    // Track performance event
    this.trackEvent({
      name: 'performance',
      category: 'performance',
      action: 'measure',
      properties: metrics
    });
  }

  // Track user interactions
  private trackUserInteractions() {
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;
      const text = target.textContent?.trim().substring(0, 50);

      this.trackEvent({
        name: 'click',
        category: 'user',
        action: 'click',
        label: `${tagName}${id ? `#${id}` : ''}${className ? `.${className.split(' ')[0]}` : ''}`,
        properties: {
          tagName,
          className,
          id,
          text,
          path: window.location.pathname
        }
      });
    }, { passive: true });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      this.trackEvent({
        name: 'form_submit',
        category: 'user',
        action: 'submit',
        label: form.action || form.id || 'unknown_form',
        properties: {
          formId: form.id,
          formAction: form.action,
          formMethod: form.method
        }
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    document.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (maxScrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent({
            name: 'scroll_depth',
            category: 'user',
            action: 'scroll',
            label: `${maxScrollDepth}%`,
            value: maxScrollDepth
          });
        }
      }
    }, { passive: true });
  }

  // Track errors
  private trackErrors() {
    // JavaScript errors
    window.addEventListener('error', (e) => {
      this.trackEvent({
        name: 'javascript_error',
        category: 'error',
        action: 'error',
        label: e.message,
        properties: {
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          error: e.error?.stack
        }
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent({
        name: 'promise_rejection',
        category: 'error',
        action: 'rejection',
        label: e.reason?.message || 'Unknown promise rejection',
        properties: {
          reason: e.reason
        }
      });
    });
  }

  // Track UTM parameters
  private trackUTMParameters() {
    if (this.session.utmSource || this.session.utmMedium || this.session.utmCampaign) {
      this.trackEvent({
        name: 'utm_tracking',
        category: 'user',
        action: 'campaign',
        label: `${this.session.utmSource || 'direct'}`,
        properties: {
          utmSource: this.session.utmSource,
          utmMedium: this.session.utmMedium,
          utmCampaign: this.session.utmCampaign
        }
      });
    }
  }

  // Track custom event
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>) {
    if (!this.config.enabled) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);
    this.session.events.push(fullEvent);

    if (this.config.debug) {
      console.log('📊 Analytics Event:', fullEvent);
    }

    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Track conversion
  trackConversion(conversionId: string, value?: number) {
    this.trackEvent({
      name: 'conversion',
      category: 'business',
      action: 'convert',
      label: conversionId,
      value,
      properties: {
        conversionId,
        sessionId: this.session.sessionId
      }
    });
  }

  // Track goal completion
  trackGoal(goalId: string, value?: number) {
    this.trackEvent({
      name: 'goal_completion',
      category: 'business',
      action: 'complete',
      label: goalId,
      value,
      properties: {
        goalId,
        sessionId: this.session.sessionId
      }
    });
  }

  // Start flush timer
  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Flush events to server
  private async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session: this.session,
            events: eventsToSend
          })
        });
      } else {
        // Store in localStorage for development
        const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        stored.push(...eventsToSend);
        localStorage.setItem('analytics_events', JSON.stringify(stored));
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to queue
      this.events.unshift(...eventsToSend);
    }
  }

  // End session
  private endSession() {
    this.trackEvent({
      name: 'session_end',
      category: 'user',
      action: 'end',
      properties: {
        sessionDuration: Date.now() - this.session.startTime,
        pageViews: this.session.pageViews,
        eventCount: this.session.events.length
      }
    });

    this.flush();
  }

  // Get analytics data
  getAnalyticsData() {
    return {
      session: this.session,
      events: this.events,
      config: this.config
    };
  }

  // Destroy analytics
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.endSession();
    this.isInitialized = false;
  }
}

// A/B Testing class
export class ABTesting {
  private experiments: Map<string, any> = new Map();
  private variants: Map<string, string> = new Map();

  // Create experiment
  createExperiment(name: string, variants: string[], trafficSplit: number[] = []) {
    const normalizedSplit = this.normalizeTrafficSplit(variants.length, trafficSplit);
    const variant = this.selectVariant(name, normalizedSplit);
    
    this.experiments.set(name, {
      variants,
      trafficSplit: normalizedSplit,
      variant
    });

    this.variants.set(name, variant);
    
    return variant;
  }

  // Normalize traffic split
  private normalizeTrafficSplit(variantCount: number, trafficSplit: number[]): number[] {
    if (trafficSplit.length === 0) {
      // Equal split
      return new Array(variantCount).fill(100 / variantCount);
    }

    if (trafficSplit.length !== variantCount) {
      throw new Error('Traffic split must match variant count');
    }

    const total = trafficSplit.reduce((sum, split) => sum + split, 0);
    return trafficSplit.map(split => (split / total) * 100);
  }

  // Select variant based on user ID or random
  private selectVariant(experimentName: string, trafficSplit: number[]): string {
    const userId = this.getUserId();
    const hash = this.hashString(`${userId}-${experimentName}`);
    const random = hash % 100;

    let cumulative = 0;
    for (let i = 0; i < trafficSplit.length; i++) {
      cumulative += trafficSplit[i];
      if (random < cumulative) {
        return this.experiments.get(experimentName)?.variants[i] || '';
      }
    }

    return this.experiments.get(experimentName)?.variants[0] || '';
  }

  // Get user ID (from localStorage or generate)
  private getUserId(): string {
    let userId = localStorage.getItem('ab_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_user_id', userId);
    }
    return userId;
  }

  // Simple hash function
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get current variant
  getVariant(experimentName: string): string {
    return this.variants.get(experimentName) || '';
  }

  // Track experiment view
  trackExperimentView(experimentName: string, analytics: Analytics) {
    const variant = this.getVariant(experimentName);
    if (variant) {
      analytics.trackEvent({
        name: 'experiment_view',
        category: 'user',
        action: 'view',
        label: `${experimentName}:${variant}`,
        properties: {
          experimentName,
          variant
        }
      });
    }
  }

  // Track experiment conversion
  trackExperimentConversion(experimentName: string, conversionId: string, analytics: Analytics, value?: number) {
    const variant = this.getVariant(experimentName);
    if (variant) {
      analytics.trackEvent({
        name: 'experiment_conversion',
        category: 'business',
        action: 'convert',
        label: `${experimentName}:${variant}:${conversionId}`,
        value,
        properties: {
          experimentName,
          variant,
          conversionId
        }
      });
    }
  }
}

import { AnalyticsOverview, RealTimeData, ConversionData } from '@shared/analytics';
import { ApiResponse } from '@shared/api';

async function fetchJSON<T = any>(url: string): Promise<T> {
  const sep = url.includes('?') ? '&' : '?';
  const tsUrl = `${url}${sep}ts=${Date.now()}`;
  const opts: RequestInit = { cache: 'no-store', headers: { 'cache-control': 'no-store' } };
  try {
    const res = await fetch(tsUrl, opts);
    return await res.json();
  } catch (e) {
    // Retry once with a fresh request if the body was already consumed
    const res2 = await fetch(`${tsUrl}&retry=1`, opts);
    return await res2.json();
  }
}

class GoogleAnalyticsClient {
  async getGoogleAnalytics(): Promise<ApiResponse<AnalyticsOverview>> {
    try {
      return await fetchJSON('/api/analytics/overview');
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
      return { success: false, error: 'Failed to fetch analytics data' } as any;
    }
  }

  async getRealTimeData(): Promise<ApiResponse<RealTimeData>> {
    try {
      return await fetchJSON('/api/analytics/realtime');
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      return { success: false, error: 'Failed to fetch real-time data' } as any;
    }
  }

  async getConversionData(): Promise<ApiResponse<ConversionData>> {
    try {
      return await fetchJSON('/api/analytics/conversions');
    } catch (error) {
      console.error('Error fetching conversion data:', error);
      return { success: false, error: 'Failed to fetch conversion data' } as any;
    }
  }
}

// Export instances
export const analytics = new Analytics();
export const abTesting = new ABTesting();
export const ga4Client = new GoogleAnalyticsClient();

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  analytics.init();
}
