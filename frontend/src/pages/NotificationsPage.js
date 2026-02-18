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
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      loadNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const getIcon = (type) => {
    const icons = {
      new_order: <Package className="text-blue-500" size={20} />,
      failed_payment: <AlertCircle className="text-red-500" size={20} />,
      low_stock: <AlertCircle className="text-orange-500" size={20} />,
      new_user: <UserPlus className="text-green-500" size={20} />,
      system_error: <Info className="text-gray-500" size={20} />,
    };
    return icons[type] || <Bell size={20} />;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Layout>
      <div className="space-y-6" data-testid="notifications-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'unread'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading notifications...</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                data-testid={`notification-${notification.id}`}
                className={`bg-white rounded-xl shadow-md p-4 flex items-start gap-4 transition-all hover:shadow-lg ${
                  !notification.is_read ? 'border-l-4 border-purple-600' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.notification_type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-800 font-medium">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        data-testid={`mark-read-${notification.id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
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
          <div className="text-center py-12 bg-white rounded-xl">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
