import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../lib/api';
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Video,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Layout from '../components/Layout';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: analytics?.total_users || 0,
      icon: Users,
      color: 'bg-[#0f5132]',
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics?.total_revenue?.toFixed(2) || 0}`,
      icon: DollarSign,
      color: 'bg-[#d4af37]',
    },
    {
      title: 'Total Orders',
      value: analytics?.total_orders || 0,
      icon: ShoppingCart,
      color: 'bg-[#ff7f50]',
    },
    {
      title: 'Orders Today',
      value: analytics?.orders_today || 0,
      icon: TrendingUp,
      color: 'bg-[#0f5132]',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8" data-testid="dashboard-page">
        <div>
          <h1 className="text-3xl font-bold text-[#0f5132]" style={{fontFamily: 'Playfair Display, serif'}}>Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Henna Heaven Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}
                className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4"
              >
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.monthly_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Products Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Products</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.popular_products || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Watched Videos & Payment Success Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Watched Videos */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="text-purple-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Most Watched Videos</h2>
            </div>
            <div className="space-y-3">
              {analytics?.most_watched_videos?.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">{video.title}</span>
                  <span className="text-purple-600 font-semibold">
                    {video.view_count} views
                  </span>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </div>

          {/* Payment Success Rate */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Payment Success Rate</h2>
            </div>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600">
                  {analytics?.payment_success_rate?.toFixed(1) || 0}%
                </div>
                <p className="text-gray-600 mt-2">Successful Payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
