import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { analyticsApi } from '../lib/analyticsApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface GA4Metrics {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

interface GA4DashboardProps {
  // Add your GA4 API key or configuration here
  apiKey?: string;
}

export function GA4Dashboard({ apiKey }: GA4DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<GA4Metrics>({
    activeUsers: 0,
    sessions: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
  });

  const [timeseriesData, setTimeseriesData] = useState({
    labels: [],
    datasets: [],
  });

  const [sourceData, setSourceData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch real GA4 data from our API endpoints
        const [metricsResponse, timeseriesResponse, sourcesResponse] = await Promise.all([
          analyticsApi.getMetrics(),
          analyticsApi.getTimeseries(),
          analyticsApi.getSources(),
        ]);

        setMetrics({
          activeUsers: metricsResponse.activeUsers || 0,
          sessions: metricsResponse.sessions || 0,
          pageViews: metricsResponse.screenPageViews || metricsResponse.pageViews || 0,
          avgSessionDuration: metricsResponse.averageSessionDuration || metricsResponse.avgSessionDuration || 0,
          bounceRate: metricsResponse.bounceRate || 0,
        });
        setTimeseriesData({
          labels: timeseriesResponse.labels,
          datasets: [
            {
              label: 'Users',
              data: timeseriesResponse.users,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
            {
              label: 'Sessions',
              data: timeseriesResponse.sessions,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
            },
          ],
        });

        setSourceData({
          labels: sourcesResponse.labels,
          datasets: [{
            data: sourcesResponse.sessions,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
            ],
          }],
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching GA4 data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [apiKey]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          icon="👥"
        />
        <MetricCard
          title="Sessions"
          value={metrics.sessions.toLocaleString()}
          icon="🔄"
        />
        <MetricCard
          title="Page Views"
          value={metrics.pageViews.toLocaleString()}
          icon="👁️"
        />
        <MetricCard
          title="Avg. Duration"
          value={formatDuration(metrics.avgSessionDuration)}
          icon="⏱️"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${metrics.bounceRate.toFixed(1)}%`}
          icon="↩️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Users & Sessions (Last 7 days)</h3>
          <Line 
            data={timeseriesData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          <Doughnut 
            data={sourceData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="text-sm text-gray-500">{title}</h4>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}