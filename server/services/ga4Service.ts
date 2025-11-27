import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from '@google-analytics/data/build/protos/protos';

export class GA4Service {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor(propertyId: string) {
    this.propertyId = propertyId;
    this.client = new BetaAnalyticsDataClient();
  }

  async getBasicMetrics(startDate: string, endDate: string) {
    try {
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

      return this.formatResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 metrics:', error);
      throw error;
    }
  }

  async getTimeseriesData(lastNDays: number) {
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
          { name: 'sessions' },
        ],
        orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: 'date' } }],
      });

      return this.formatTimeseriesResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 timeseries data:', error);
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
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5,
      });

      return this.formatSourcesResponse(response);
    } catch (error) {
      console.error('Error fetching GA4 traffic sources:', error);
      throw error;
    }
  }

  private formatResponse(response: google.analytics.data.v1beta.IRunReportResponse) {
    const metrics: Record<string, number> = {};
    
    response.rows?.[0]?.metricValues?.forEach((metric, index) => {
      const metricName = response.metricHeaders?.[index]?.name || '';
      metrics[metricName] = Number(metric.value) || 0;
    });

    return metrics;
  }

  private formatTimeseriesResponse(response: google.analytics.data.v1beta.IRunReportResponse) {
    const data = {
      labels: [] as string[],
      users: [] as number[],
      sessions: [] as number[],
    };

    response.rows?.forEach(row => {
      data.labels.push(this.formatDate(row.dimensionValues?.[0].value || ''));
      data.users.push(Number(row.metricValues?.[0].value) || 0);
      data.sessions.push(Number(row.metricValues?.[1].value) || 0);
    });

    return data;
  }

  private formatSourcesResponse(response: google.analytics.data.v1beta.IRunReportResponse) {
    const data = {
      labels: [] as string[],
      sessions: [] as number[],
    };

    response.rows?.forEach(row => {
      data.labels.push(row.dimensionValues?.[0].value || 'Unknown');
      data.sessions.push(Number(row.metricValues?.[0].value) || 0);
    });

    return data;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}