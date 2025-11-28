/**
 * Analytics Response Types
 */

export interface AnalyticsOverview {
  pageViews: number;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  newUsers: number;
  topPages: Array<{
    page: string;
    views: number;
    avgTimeOnPage?: number;
  }>;
  trafficSources: Array<{
    source: string;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
  }>;
  lastUpdated: string;
}

export interface RealTimeData {
  activeUsers: number;
  currentPages: Array<{
    path: string;
    users: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
  }>;
  countries: Array<{
    country: string;
    users: number;
  }>;
}

export interface ConversionData {
  totalConversions: number;
  conversionRate: number;
  revenue: number;
  goalCompletions: Array<{
    goal: string;
    completions: number;
  }>;
  lastUpdated: string;
}

/**
 * Analytics API Response Types
 */
export interface AnalyticsResponse {
  overview: AnalyticsOverview;
  realTime: RealTimeData;
  conversions: ConversionData;
}