/**
 * Google Analytics 4 Integration
 * Provides comprehensive analytics tracking and reporting
 */

// Google Analytics configuration
interface GAConfig {
  measurementId: string;
  enabled: boolean;
  debug: boolean;
  anonymizeIp: boolean;
  cookieExpires: number;
}

// Analytics event interface
interface GAEvent {
  name: string;
  parameters?: Record<string, any>;
}

// Page view parameters
interface PageViewParams {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  content_group1?: string;
  content_group2?: string;
}

// E-commerce event parameters
interface EcommerceParams {
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}

class GoogleAnalytics {
  private config: GAConfig;
  private gtag: Function | null = null;
  private isInitialized = false;

  constructor(config: Partial<GAConfig> = {}) {
    this.config = {
      measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || '',
      enabled: import.meta.env.MODE === 'production',
      debug: import.meta.env.MODE !== 'production',
      anonymizeIp: true,
      cookieExpires: 63072000, // 2 years
      ...config
    };
  }

  // Initialize Google Analytics
  async init(): Promise<void> {
    if (this.isInitialized || !this.config.enabled || !this.config.measurementId) {
      return;
    }

    try {
      // Load Google Analytics script
      await this.loadScript();
      
      // Initialize gtag
      this.gtag = (window as any).gtag;
      
      if (this.gtag) {
        // Configure GA4
        this.gtag('config', this.config.measurementId, {
          anonymize_ip: this.config.anonymizeIp,
          cookie_expires: this.config.cookieExpires,
          send_page_view: false, // We'll handle page views manually
          debug_mode: this.config.debug
        });

        this.isInitialized = true;
        
        if (this.config.debug) {
          console.log('✅ Google Analytics initialized:', this.config.measurementId);
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Analytics:', error);
    }
  }

  // Load Google Analytics script
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      
      script.onload = () => {
        // Initialize gtag function
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function() {
          (window as any).dataLayer.push(arguments);
        };
        (window as any).gtag('js', new Date());
        resolve();
      };
      
      script.onerror = () => reject(new Error('Failed to load Google Analytics script'));
      
      document.head.appendChild(script);
    });
  }

  // Track page view
  trackPageView(params?: PageViewParams): void {
    if (!this.gtag || !this.isInitialized) return;

    const pageParams: PageViewParams = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...params
    };

    this.gtag('event', 'page_view', pageParams);

    if (this.config.debug) {
      console.log('📊 Page view tracked:', pageParams);
    }
  }

  // Track custom event
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.gtag || !this.isInitialized) return;

    this.gtag('event', eventName, parameters);

    if (this.config.debug) {
      console.log('📊 Event tracked:', eventName, parameters);
    }
  }

  // Track user engagement
  trackEngagement(action: string, category: string, label?: string, value?: number): void {
    this.trackEvent('engagement', {
      action,
      category,
      label,
      value
    });
  }

  // Track conversion
  trackConversion(conversionId: string, value?: number, currency = 'USD'): void {
    this.trackEvent('conversion', {
      send_to: conversionId,
      value,
      currency
    });
  }

  // Track e-commerce purchase
  trackPurchase(transactionId: string, value: number, currency = 'USD', items?: EcommerceParams['items']): void {
    this.trackEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items
    });
  }

  // Track form submission
  trackFormSubmission(formName: string, formId?: string): void {
    this.trackEvent('form_submit', {
      form_name: formName,
      form_id: formId
    });
  }

  // Track file download
  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    });
  }

  // Track search
  trackSearch(searchTerm: string, resultsCount?: number): void {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  // Track scroll depth
  trackScrollDepth(depth: number): void {
    this.trackEvent('scroll', {
      scroll_depth: depth
    });
  }

  // Track video engagement
  trackVideoPlay(videoTitle: string, videoDuration?: number): void {
    this.trackEvent('video_play', {
      video_title: videoTitle,
      video_duration: videoDuration
    });
  }

  // Track video progress
  trackVideoProgress(videoTitle: string, progress: number): void {
    this.trackEvent('video_progress', {
      video_title: videoTitle,
      progress_percent: progress
    });
  }

  // Track video complete
  trackVideoComplete(videoTitle: string, videoDuration?: number): void {
    this.trackEvent('video_complete', {
      video_title: videoTitle,
      video_duration: videoDuration
    });
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (!this.gtag || !this.isInitialized) return;

    this.gtag('config', this.config.measurementId, {
      user_properties: properties
    });
  }

  // Set user ID
  setUserId(userId: string): void {
    if (!this.gtag || !this.isInitialized) return;

    this.gtag('config', this.config.measurementId, {
      user_id: userId
    });
  }

  // Track timing
  trackTiming(name: string, value: number, category?: string, label?: string): void {
    this.trackEvent('timing_complete', {
      name,
      value,
      category,
      label
    });
  }

  // Track exception
  trackException(description: string, fatal = false): void {
    this.trackEvent('exception', {
      description,
      fatal
    });
  }

  // Get client ID
  getClientId(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.gtag || !this.isInitialized) {
        resolve(null);
        return;
      }

      this.gtag('get', this.config.measurementId, 'client_id', (clientId: string) => {
        resolve(clientId);
      });
    });
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (this.gtag) {
      this.gtag('config', this.config.measurementId, {
        send_page_view: enabled
      });
    }
  }

  // Get configuration
  getConfig(): GAConfig {
    return { ...this.config };
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized && this.gtag !== null;
  }
}

// Enhanced Analytics class with additional features
export class EnhancedAnalytics extends GoogleAnalytics {
  private sessionStartTime: number;
  private pageViewCount: number = 0;
  private eventQueue: Array<{ event: string; params: any; timestamp: number }> = [];

  constructor(config: Partial<GAConfig> = {}) {
    super(config);
    this.sessionStartTime = Date.now();
  }

  // Track session start
  trackSessionStart(): void {
    this.trackEvent('session_start', {
      session_id: this.generateSessionId(),
      timestamp: this.sessionStartTime
    });
  }

  // Track session end
  trackSessionEnd(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.trackEvent('session_end', {
      session_duration: sessionDuration,
      page_views: this.pageViewCount,
      events_count: this.eventQueue.length
    });
  }

  // Enhanced page view tracking
  trackPageView(params?: PageViewParams): void {
    this.pageViewCount++;
    super.trackPageView(params);
  }

  // Queue events for batch processing
  queueEvent(eventName: string, parameters?: Record<string, any>): void {
    this.eventQueue.push({
      event: eventName,
      params: parameters,
      timestamp: Date.now()
    });
  }

  // Process queued events
  processEventQueue(): void {
    this.eventQueue.forEach(({ event, params, timestamp }) => {
      this.trackEvent(event, {
        ...params,
        queued_timestamp: timestamp
      });
    });
    this.eventQueue = [];
  }

  // Track user journey
  trackUserJourney(step: string, stepNumber: number, totalSteps?: number): void {
    this.trackEvent('user_journey', {
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      progress_percent: totalSteps ? (stepNumber / totalSteps) * 100 : undefined
    });
  }

  // Track performance metrics
  trackPerformanceMetrics(metrics: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  }): void {
    this.trackEvent('performance_metrics', {
      load_time: metrics.loadTime,
      dom_content_loaded: metrics.domContentLoaded,
      first_contentful_paint: metrics.firstContentfulPaint,
      largest_contentful_paint: metrics.largestContentfulPaint,
      first_input_delay: metrics.firstInputDelay,
      cumulative_layout_shift: metrics.cumulativeLayoutShift
    });
  }

  // Generate session ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const ga = new EnhancedAnalytics();

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  ga.init().then(() => {
    ga.trackSessionStart();
  });
}

// Export types
export type { GAConfig, GAEvent, PageViewParams, EcommerceParams };
