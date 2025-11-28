import { BetaAnalyticsDataClient } from '@google-analytics/data';

class GoogleAnalyticsService {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor() {
    this.propertyId = process.env.GA4_PROPERTY_ID as string;
    this.client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA4_CLIENT_EMAIL,
        private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });
  }

  async getRealtimeUsers() {
    const [response] = await this.client.runRealtimeReport({
      property: `properties/${this.propertyId}`,
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
    });
    return response;
  }

  async getBasicMetrics(startDate: string, endDate: string) {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });
    return response;
  }

  async getTrafficSource(startDate: string, endDate: string) {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 5,
    });
    return response;
  }

  async getDailyUsers(days: number = 7) {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ 
        startDate: `${days}daysAgo`,
        endDate: 'today',
      }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });
    return response;
  }
}

export const googleAnalytics = new GoogleAnalyticsService();