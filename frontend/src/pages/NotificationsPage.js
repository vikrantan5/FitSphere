import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../lib/api';
import Layout from '../components/Layout';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const params = filter === 'unread' ? { unread_only: true } : {};
      const response = await notificationAPI.getAll(params);
      setNotifications(response.data);
    } catch (error) {
      console.error('Load notifications error:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      loadNotifications();
      toast.success('Marked as read');
    } catch (error) {
      console.error('Mark as read error:', error);
      toast.error('Failed to mark as read');
    }
  };

  const getIcon = (type) => {
    const icons = {
      new_order: <Package className="text-[#ff7f50]" size={20} />,
      failed_payment: <AlertCircle className="text-red-500" size={20} />,
      low_stock: <AlertCircle className="text-[#8b5cf6]" size={20} />,
      new_user: <UserPlus className="text-[#0f5132]" size={20} />,
      system_error: <Info className="text-[#5a5a5a]" size={20} />,
    };
    return icons[type] || <Bell size={20} />;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Layout>
      <div className="space-y-6" data-testid="notifications-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>Notifications</h1>
            <p className="text-[#5a5a5a] mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-full transition-all uppercase tracking-wider text-sm font-semibold ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white shadow-lg'
                  : 'bg-white text-[#5a5a5a] border border-stone-200 hover:bg-[#fdfbf7]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-3 rounded-full transition-all uppercase tracking-wider text-sm font-semibold ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white shadow-lg'
                  : 'bg-white text-[#5a5a5a] border border-stone-200 hover:bg-[#fdfbf7]'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5a5a5a]">Loading notifications...</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                data-testid={`notification-${notification.id}`}
                className={`bg-white rounded-none shadow-md p-6 flex items-start gap-4 transition-all hover:shadow-lg border ${
                  !notification.is_read ? 'border-l-4 border-l-[#ff7f50] border-t border-r border-b border-stone-100' : 'border-stone-100'
                }`}
              >
                <div className="flex-shrink-0 mt-1 bg-[#fdfbf7] p-2 rounded-full">
                  {getIcon(notification.notification_type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#1a1a1a] font-medium">{notification.message}</p>
                      <p className="text-sm text-[#5a5a5a] mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        data-testid={`mark-read-${notification.id}`}
                        className="text-[#0f5132] hover:text-[#ff7f50] text-sm flex items-center gap-1 transition-colors uppercase tracking-wider font-semibold ml-4"
                      >
                        <CheckCircle size={16} />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-none shadow-md border border-stone-100">
            <Bell size={48} className="mx-auto text-[#5a5a5a] opacity-30 mb-4" />
            <p className="text-[#5a5a5a]">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
