import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../lib/analyticsApi';
import type { GA4Metrics } from '../lib/analyticsApi';

// Note: This dashboard displays analytics data
// The data source can be configured to use PostHog API in the future

interface GA4DashboardProps {
  apiKey?: string;
}

const PIE_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

export function GA4Dashboard({ apiKey }: GA4DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<GA4Metrics>({
    activeUsers: 0,
    sessions: 0,
    screenPageViews: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
  });

  const [timeseriesData, setTimeseriesData] = useState<{ label: string; users: number; sessions: number }[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        const [metricsResponse, timeseriesResponse, sourcesResponse] = await Promise.all([
          analyticsApi.getMetrics(),
          analyticsApi.getTimeseries(),
          analyticsApi.getSources(),
        ]);

        setMetrics({
          activeUsers: metricsResponse.activeUsers || 0,
          sessions: metricsResponse.sessions || 0,
          screenPageViews: metricsResponse.screenPageViews || 0,
          averageSessionDuration: metricsResponse.averageSessionDuration || 0,
          bounceRate: metricsResponse.bounceRate || 0,
        });

        setTimeseriesData(
          (timeseriesResponse.labels || []).map((label: string, i: number) => ({
            label,
            users: timeseriesResponse.users?.[i] ?? 0,
            sessions: timeseriesResponse.sessions?.[i] ?? 0,
          }))
        );

        setSourceData(
          (sourcesResponse.labels || []).map((name: string, i: number) => ({
            name,
            value: sourcesResponse.sessions?.[i] ?? 0,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
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
        <MetricCard title="Active Users" value={metrics.activeUsers.toLocaleString()} icon="👥" />
        <MetricCard title="Sessions" value={metrics.sessions.toLocaleString()} icon="🔄" />
        <MetricCard title="Page Views" value={metrics.screenPageViews.toLocaleString()} icon="👁️" />
        <MetricCard title="Avg. Duration" value={formatDuration(metrics.averageSessionDuration)} icon="⏱️" />
        <MetricCard title="Bounce Rate" value={`${metrics.bounceRate.toFixed(1)}%`} icon="↩️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Users & Sessions (Last 7 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeseriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="rgb(75, 192, 192)" dot={false} />
              <Line type="monotone" dataKey="sessions" stroke="rgb(255, 99, 132)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
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
