import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { api } from '../lib/api';
import { GA4Dashboard } from './GA4Dashboard';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch basic stats
      const [productStats, serviceStats, userStats, quoteStats] = await Promise.all([
        api.products.getAll(),
        api.services.getAll(),
        api.users.getAll(),
        api.quotes.getAll(),
      ]);
      setStats({
        products: productStats.data.length,
        services: serviceStats.data.length,
        users: userStats.data.length,
        quotes: quoteStats.data.length,
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Services" value={stats.services} />
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Quotes" value={stats.quotes} />
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-6">Website Analytics</h2>
        <GA4Dashboard />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-slate-500">{label}</div>
    </div>
  );
}
