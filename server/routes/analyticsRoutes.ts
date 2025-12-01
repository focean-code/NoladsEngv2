import { Router } from 'express';
import { ga4Analytics } from '../services/ga4Analytics.ts';

const router = Router();

// CORS and caching middleware for all analytics routes
router.use((req, res, next) => {
  // Get allowed origins from environment
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'];
  
  const origin = req.get('origin');
  
  // Set CORS headers
  if (!origin || corsOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Max-Age', '3600');
  }
  
  // Prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

interface AnalyticsFallbackData {
  pageViews: number;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: any[];
  trafficSources: any[];
  deviceBreakdown: any[];
  activeUsers?: number;
  currentPages?: any[];
  countries?: any[];
  totalConversions?: number;
  conversionRate?: number;
  revenue?: number;
  goalCompletions?: any[];
  lastUpdated?: string;
}

const FALLBACK_DATA: AnalyticsFallbackData = {
  pageViews: 0,
  sessions: 0,
  users: 0,
  bounceRate: 0,
  avgSessionDuration: 0,
  topPages: [],
  trafficSources: [],
  deviceBreakdown: [],
  activeUsers: 0,
  currentPages: [],
  countries: [],
  totalConversions: 0,
  conversionRate: 0,
  revenue: 0,
  goalCompletions: [],
  lastUpdated: new Date().toISOString()
};

const METRICS_FALLBACK = {
  activeUsers: 0,
  sessions: 0,
  screenPageViews: 0,
  averageSessionDuration: 0,
  bounceRate: 0
};

const TIMESERIES_FALLBACK = {
  labels: [] as string[],
  users: [] as number[],
  sessions: [] as number[]
};

const SOURCES_FALLBACK = {
  labels: [] as string[],
  sessions: [] as number[]
};

const handleAnalyticsError = (res: any, error: any, message: string, fallbackData: any = null) => {
  console.error(`Error in analytics route: ${message}`, error);

  // Always return 200 with fallback data so the UI remains functional
  return res.json({
    success: true,
    error: message,
    data: fallbackData || FALLBACK_DATA
  });
};

router.get('/overview', async (req, res) => {
  if (!ga4Analytics.isConfigured) {
    return handleAnalyticsError(res, null, 'GA4 not configured', FALLBACK_DATA);
  }

  try {
    const [overview, topPages, trafficSources, devices] = await Promise.all([
      ga4Analytics.getBasicMetrics(),
      ga4Analytics.getTopPages(),
      ga4Analytics.getTrafficSources(),
      ga4Analytics.getDeviceBreakdown()
    ]);
    if (!overview) {
      return handleAnalyticsError(res, null, 'No analytics data available', FALLBACK_DATA);
    }

    const data = {
      pageViews: overview.screenPageViews || 0,
      sessions: overview.sessions || 0,
      users: overview.activeUsers || 0,
      bounceRate: overview.bounceRate || 0,
      avgSessionDuration: overview.averageSessionDuration || 0,
      topPages: topPages || [],
      trafficSources: trafficSources || [],
      deviceBreakdown: devices || []
    };

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return handleAnalyticsError(res, error, 'Failed to fetch analytics overview', FALLBACK_DATA);
  }
});

router.get('/metrics', async (req, res) => {
  if (!ga4Analytics.isConfigured) {
    return res.json({ success: true, data: METRICS_FALLBACK });
  }

  try {
    const metrics = await ga4Analytics.getBasicMetrics();
    res.json({ success: true, data: metrics || METRICS_FALLBACK });
  } catch (error) {
    console.error('Failed to fetch GA4 metrics', error);
    res.json({ success: true, data: METRICS_FALLBACK });
  }
});

router.get('/timeseries', async (req, res) => {
  if (!ga4Analytics.isConfigured) {
    return res.json({ success: true, data: TIMESERIES_FALLBACK });
  }

  try {
    const timeseries = await ga4Analytics.getTimeseriesData();
    res.json({ success: true, data: timeseries || TIMESERIES_FALLBACK });
  } catch (error) {
    console.error('Failed to fetch GA4 timeseries', error);
    res.json({ success: true, data: TIMESERIES_FALLBACK });
  }
});

router.get('/sources', async (req, res) => {
  if (!ga4Analytics.isConfigured) {
    return res.json({ success: true, data: SOURCES_FALLBACK });
  }

  try {
    const sources = await ga4Analytics.getTrafficSources();
    const chartData = {
      labels: sources?.map((source: any) => source.source) || [],
      sessions: sources?.map((source: any) => Number(source.percentage) || 0) || []
    };
    return res.json(chartData);
  } catch (error) {
    console.error('Failed to fetch GA4 sources', error);
    res.json({ success: true, data: SOURCES_FALLBACK });
  }
});

router.get('/realtime', async (req, res) => {
  if (!ga4Analytics.isConfigured) {
    return handleAnalyticsError(res, null, 'GA4 not configured', FALLBACK_DATA);
  }

  try {
    const metrics = await ga4Analytics.getBasicMetrics();

    if (!metrics) {
      return handleAnalyticsError(res, null, 'No realtime data available', FALLBACK_DATA);
    }

    const realtimeData = {
      activeUsers: metrics.activeUsers || 0,
      sessions: metrics.sessions || 0,
      pageViews: metrics.screenPageViews || 0,
      currentPages: [],
      countries: []
    };

    return res.json({
      success: true,
      data: realtimeData
    });
  } catch (error) {
    return handleAnalyticsError(res, error, 'Failed to fetch realtime data', FALLBACK_DATA);
  }
});

router.get('/conversions', async (req, res) => {
  if (!ga4Analytics.isConfigured) {
    return handleAnalyticsError(res, null, 'GA4 not configured', FALLBACK_DATA);
  }

  try {
    const metrics = await ga4Analytics.getBasicMetrics();
    const eventName = process.env.GA4_CONVERSION_EVENT || 'generate_lead';
    const eventSummary = await ga4Analytics.getEventCountSummary(eventName);
    if (!metrics) {
      return handleAnalyticsError(res, null, 'No conversion data available', FALLBACK_DATA);
    }

    const conversionData = {
      totalConversions: eventSummary?.count || 0,
      conversionRate: eventSummary?.rate || 0,
      revenue: 0,
      goalCompletions: [],
      lastUpdated: new Date().toISOString()
    };

    return res.json({
      success: true,
      data: conversionData
    });
  } catch (error) {
    return handleAnalyticsError(res, error, 'Failed to fetch conversion data', FALLBACK_DATA);
  }
});

export default router;
