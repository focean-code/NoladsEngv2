interface GA4Metrics {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
}

interface TimeseriesData {
  labels: string[];
  users: number[];
  sessions: number[];
}

interface SourceData {
  labels: string[];
  sessions: number[];
}

const fetchJSON = async <T>(url: string, fallback: T): Promise<T> => {
  try {
    const response = await fetch(`${url}?ts=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'cache-control': 'no-store' }
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`analyticsApi: falling back for ${url}`, error);
    return fallback;
  }
};

const METRICS_FALLBACK: GA4Metrics = {
  activeUsers: 0,
  sessions: 0,
  pageViews: 0,
  avgSessionDuration: 0,
  bounceRate: 0,
};

const TIMESERIES_FALLBACK: TimeseriesData = {
  labels: [],
  users: [],
  sessions: [],
};

const SOURCES_FALLBACK: SourceData = {
  labels: [],
  sessions: [],
};

export const analyticsApi = {
  async getMetrics(): Promise<GA4Metrics> {
    return fetchJSON('/api/analytics/metrics', METRICS_FALLBACK);
  },
  
  async getTimeseries(): Promise<TimeseriesData> {
    return fetchJSON('/api/analytics/timeseries', TIMESERIES_FALLBACK);
  },
  
  async getSources(): Promise<SourceData> {
    return fetchJSON('/api/analytics/sources', SOURCES_FALLBACK);
  },
};