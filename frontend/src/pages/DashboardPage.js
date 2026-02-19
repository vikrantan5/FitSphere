import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../lib/api';
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Video,
  Activity,
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
import { toast } from 'sonner';

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
      toast.error('Failed to load analytics');
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
      bgLight: 'bg-[#0f5132]/10',
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics?.total_revenue?.toFixed(2) || 0}`,
      icon: DollarSign,
      color: 'bg-[#ff7f50]',
      bgLight: 'bg-[#ff7f50]/10',
    },
    {
      title: 'Total Orders',
      value: analytics?.total_orders || 0,
      icon: ShoppingCart,
      color: 'bg-[#8b5cf6]',
      bgLight: 'bg-[#8b5cf6]/10',
    },
    {
      title: 'Orders Today',
      value: analytics?.orders_today || 0,
      icon: TrendingUp,
      color: 'bg-[#0f5132]',
      bgLight: 'bg-[#0f5132]/10',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8" data-testid="dashboard-page">
        <div>
          <h1 className="text-4xl font-normal text-[#0f5132] mb-2" style={{fontFamily: 'Tenor Sans, serif'}}>Dashboard</h1>
          <p className="text-[#5a5a5a]">Welcome to FitSphere Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}
                className="bg-white rounded-none shadow-md p-6 hover:shadow-xl transition-all border border-stone-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgLight} p-3 rounded-full`}>
                    <Icon className={`${stat.color.replace('bg-', 'text-')}`} size={24} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs uppercase tracking-wider text-[#5a5a5a] mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-[#1a1a1a]">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-none shadow-md p-6 border border-stone-100">
            <h2 className="text-xl font-normal text-[#0f5132] mb-4" style={{fontFamily: 'Tenor Sans, serif'}}>Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthly_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#5a5a5a" />
                <YAxis stroke="#5a5a5a" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#ff7f50" strokeWidth={3} dot={{ fill: '#ff7f50', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Products */}
          <div className="bg-white rounded-none shadow-md p-6 border border-stone-100">
            <h2 className="text-xl font-normal text-[#0f5132] mb-4" style={{fontFamily: 'Tenor Sans, serif'}}>Popular Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.popular_products || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" stroke="#5a5a5a" />
                <YAxis stroke="#5a5a5a" />
                <Tooltip />
                <Bar dataKey="sales" fill="#0f5132" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Watched Videos */}
        <div className="bg-white rounded-none shadow-md p-6 border border-stone-100">
          <h2 className="text-xl font-normal text-[#0f5132] mb-4" style={{fontFamily: 'Tenor Sans, serif'}}>Most Watched Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(analytics?.most_watched_videos || []).map((video, index) => (
              <div key={index} className="border border-stone-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0f5132]/10 p-2 rounded-full">
                    <Video className="w-5 h-5 text-[#0f5132]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a1a1a] text-sm">{video.title}</p>
                    <p className="text-xs text-[#5a5a5a]">{video.view_count} views</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(!analytics?.most_watched_videos || analytics.most_watched_videos.length === 0) && (
            <p className="text-center text-[#5a5a5a] py-8">No video data available</p>
          )}
        </div>

        {/* Payment Success Rate */}
        {analytics?.payment_success_rate !== undefined && (
          <div className="bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] rounded-none shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider opacity-90">Payment Success Rate</p>
                <p className="text-4xl font-bold mt-2">{analytics.payment_success_rate.toFixed(1)}%</p>
              </div>
              <Activity className="w-16 h-16 opacity-30" />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
