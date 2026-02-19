import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { Users, Mail, Phone, Calendar, Eye, X, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'admin') {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (user) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data);
      setUserOrders(response.data.orders || []);
    } catch (error) {
      console.error('View user error:', error);
      toast.error('Failed to load user details');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="users-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>Registered Users</h1>
            <p className="text-[#5a5a5a] mt-1">View all registered members</p>
          </div>
          <div className="bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{users.length} Total Users</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5a5a5a]">Loading users...</div>
        ) : (
          <div className="bg-white rounded-none shadow-md overflow-hidden border border-stone-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#fdfbf7] border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {users.map((user, idx) => (
                    <tr key={user.id} data-testid={`user-row-${idx}`} className="hover:bg-[#fdfbf7] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-[#5a5a5a]" data-testid={`user-id-${idx}`}>
                          {user.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#ff7f50] to-[#8b5cf6] rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium text-[#1a1a1a]" data-testid={`user-name-${idx}`}>{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-[#5a5a5a]">
                          <Mail className="w-4 h-4 mr-2 text-[#0f5132]" />
                          <span data-testid={`user-email-${idx}`}>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-[#5a5a5a]">
                          <Phone className="w-4 h-4 mr-2 text-[#0f5132]" />
                          <span data-testid={`user-phone-${idx}`}>{user.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[#0f5132] text-white text-xs rounded-full uppercase tracking-wider font-semibold" data-testid={`user-role-${idx}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-[#5a5a5a]">
                          <Calendar className="w-4 h-4 mr-2 text-[#0f5132]" />
                          <span data-testid={`user-created-${idx}`}>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`} data-testid={`user-status-${idx}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewUserDetails(user)}
                          data-testid={`view-user-${idx}`}
                          className="text-[#0f5132] hover:text-[#ff7f50] transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-[#5a5a5a] opacity-50" />
                <p className="text-[#5a5a5a]">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-[#5a5a5a] hover:text-[#1a1a1a]">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Info */}
              <Card className="p-6 bg-gradient-to-br from-[#ff7f50]/10 to-[#8b5cf6]/10 border-0">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#ff7f50] to-[#8b5cf6] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-2xl">{selectedUser.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#1a1a1a]">{selectedUser.name}</h3>
                    <p className="text-sm text-[#5a5a5a]">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-1">User ID</p>
                    <p className="font-mono text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-sm">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-1">Role</p>
                    <span className="px-3 py-1 bg-[#0f5132] text-white text-xs rounded-full uppercase tracking-wider font-semibold">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-1">Status</p>
                    <span className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold ${
                      selectedUser.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-1">Joined Date</p>
                    <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              {/* Purchase History */}
              <div>
                <h3 className="text-lg font-semibold text-[#0f5132] mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Purchase History
                </h3>
                {userOrders && userOrders.length > 0 ? (
                  <div className="space-y-3">
                    {userOrders.map((order, idx) => (
                      <Card key={idx} className="p-4 border border-stone-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-[#1a1a1a]">Order #{order.id.substring(0, 8)}</p>
                            <p className="text-sm text-[#5a5a5a] mt-1">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <div className="mt-2">
                              <span className="px-2 py-1 bg-[#0f5132] text-white text-xs rounded-full mr-2">
                                {order.order_status}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {order.payment_status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#ff7f50]">₹{order.total_amount}</p>
                            <p className="text-xs text-[#5a5a5a] mt-1">{order.items?.length || 0} items</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#fdfbf7] rounded-none border border-stone-200">
                    <Award className="w-12 h-12 mx-auto mb-2 text-[#5a5a5a] opacity-50" />
                    <p className="text-[#5a5a5a]">No purchase history</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-[#0f5132] text-white py-3 rounded-full hover:opacity-90 transition-all uppercase tracking-wider font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}