import { AnalyticsEvent } from './analytics';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class GA4Service {
  private measurementId: string;
  private isInitialized: boolean = false;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  init() {
    if (this.isInitialized) return;

    // Add Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId);

    this.isInitialized = true;
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) return;

    window.gtag('event', event.name, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.properties
    });
  }

  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title
    });
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return;

    window.gtag('set', 'user_properties', properties);
  }
}

// Export singleton instance
export const ga4 = new GA4Service(import.meta.env.VITE_GA4_MEASUREMENT_ID);