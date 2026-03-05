import { BetaAnalyticsDataClient } from '@google-analytics/data';

export class GA4Analytics {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  public isConfigured: boolean = false;

  constructor() {
    this.propertyId = process.env.GA4_PROPERTY_ID || '';
    const clientEmail = process.env.GA4_CLIENT_EMAIL;
    const privateKey = process.env.GA4_PRIVATE_KEY;

    if (!this.propertyId || !clientEmail || !privateKey) {
      console.warn('GA4 analytics is not configured. Missing required credentials.');
      this.isConfigured = false;
      return;
    }

    try {
      this.client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
      });
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to initialize GA4 client:', error);
      this.isConfigured = false;
    }
  }

  async getBasicMetrics(startDate: string = '7daysAgo', endDate: string = 'today') {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' }
        ],
      });

      return this.formatMetricsResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 metrics:', error);
      throw error;
    }
  }

  async getTimeseriesData(lastNDays: number = 7) {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{
          startDate: `${lastNDays}daysAgo`,
          endDate: 'today',
        }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' }
        ],
        orderBys: [
          {
            dimension: {
              dimensionName: 'date'
            }
          }
        ]
      });

      return this.formatTimeseriesResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 timeseries:', error);
      throw error;
    }
  }

  async getTrafficSources() {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true
          }
        ],
        limit: 5
      });

      return this.formatSourcesResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 sources:', error);
      throw error;
    }
  }

  async getTopPages() {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePathPlusQueryString' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true
          }
        ],
        limit: 5
      });

      return this.formatTopPagesResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 top pages:', error);
      throw error;
    }
  }

  async getDeviceBreakdown() {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true
          }
        ]
      });

      return this.formatDeviceResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 device breakdown:', error);
      throw error;
    }
  }

  async getEventCountSummary(eventName: string, startDate: string = '30daysAgo', endDate: string = 'today') {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: eventName }
          }
        }
      });

      const count = Number(response.rows?.[0]?.metricValues?.[0]?.value || 0);
      return { eventName, count };
    } catch (error) {
      console.error('Error fetching GA4 event count:', error);
      throw error;
    }
  }

  private formatMetricsResponse(response: any) {
    const metrics: Record<string, number> = {};
    const row = response.rows?.[0];
    const headers = response.metricHeaders || [];
    if (row?.metricValues) {
      row.metricValues.forEach((metric: any, index: number) => {
        const header = headers[index];
        const metricName = header?.name || `metric_${index}`;
        metrics[metricName] = Number(metric?.value) || 0;
      });
    }

    // Provide derived values expected by the client shape when possible
    if (metrics.sessions && metrics.screenPageViews) {
      const pagesPerSession = metrics.sessions > 0 ? metrics.screenPageViews / metrics.sessions : 0;
      metrics.pagesPerSession = Number(pagesPerSession.toFixed(2));
    }

    return metrics;
  }

  private formatTimeseriesResponse(response: any) {
    const data = {
      labels: [] as string[],
      users: [] as number[],
      sessions: [] as number[],
    };

    response.rows?.forEach((row: any) => {
      const date = this.formatDate(row.dimensionValues?.[0].value || '');
      data.labels.push(date);
      data.users.push(Number(row.metricValues?.[0].value) || 0);
      data.sessions.push(Number(row.metricValues?.[1].value) || 0);
    });

    return data;
  }

  private formatSourcesResponse(response: any) {
    const rows = response.rows || [];
    const total = rows.reduce((sum: number, row: any) => sum + (Number(row.metricValues?.[0]?.value) || 0), 0) || 1;
    const data: { source: string; percentage: number }[] = [];
    rows.forEach((row: any) => {
      const source = row.dimensionValues?.[0]?.value || 'Unknown';
      const sessions = Number(row.metricValues?.[0]?.value) || 0;
      const percentage = Number(((sessions / total) * 100).toFixed(2));
      data.push({ source, percentage });
    });
    return data;
  }

  private formatTopPagesResponse(response: any) {
    const rows = response.rows || [];
    const total = rows.reduce((sum: number, row: any) => sum + (Number(row.metricValues?.[0]?.value) || 0), 0) || 1;
    const data: { page: string; views: number; avgTimeOnPage?: number }[] = [];
    rows.forEach((row: any) => {
      const path = row.dimensionValues?.[0]?.value || '';
      const title = row.dimensionValues?.[1]?.value || '';
      const pageViews = Number(row.metricValues?.[0]?.value) || 0;
      data.push({ page: title || path || '/', views: pageViews });
    });
    return data;
  }

  private formatDeviceResponse(response: any) {
    const rows = response.rows || [];
    const total = rows.reduce((sum: number, row: any) => sum + (Number(row.metricValues?.[0]?.value) || 0), 0) || 1;
    const data: { device: string; percentage: number }[] = [];
    rows.forEach((row: any) => {
      const device = row.dimensionValues?.[0]?.value || 'unknown';
      const sessions = Number(row.metricValues?.[0]?.value) || 0;
      const percentage = Number(((sessions / total) * 100).toFixed(2));
      data.push({ device, percentage });
    });
    return data;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export const ga4Analytics = new GA4Analytics();