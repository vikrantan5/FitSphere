import React, { useEffect, useState } from 'react';
import { orderAPI } from '../lib/api';
import Layout from '../components/Layout';
import { Download, Eye, X, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Load orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success('Order status updated');
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await orderAPI.exportCSV();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'orders.csv';
      link.click();
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="orders-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>Orders</h1>
            <p className="text-[#5a5a5a] mt-1">Manage customer orders</p>
          </div>
          <button
            onClick={exportToCSV}
            data-testid="export-csv-button"
            className="bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-all uppercase tracking-wider text-sm font-semibold shadow-lg"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#5a5a5a]">Loading orders...</div>
        ) : (
          <div className="bg-white rounded-none shadow-md overflow-hidden border border-stone-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#fdfbf7] border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {orders.map((order) => (
                    <tr key={order.id} data-testid={`order-row-${order.id}`} className="hover:bg-[#fdfbf7] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-[#5a5a5a]">
                          {order.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[#1a1a1a]">
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-[#5a5a5a]">{order.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#1a1a1a]">
                          ₹{order.total_amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold ${getStatusColor(
                            order.order_status
                          )}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold ${getPaymentStatusColor(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#5a5a5a]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          data-testid={`view-order-${order.id}`}
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
            {orders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-[#5a5a5a] opacity-50" />
                <p className="text-[#5a5a5a]">No orders found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-normal text-[#0f5132]" style={{fontFamily: 'Tenor Sans, serif'}}>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-[#5a5a5a] hover:text-[#1a1a1a]">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#5a5a5a] uppercase tracking-wider">Order ID</p>
                  <p className="font-mono text-sm mt-1">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5a5a5a] uppercase tracking-wider">Date</p>
                  <p className="text-sm mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-2">Customer Information</p>
                <div className="bg-[#fdfbf7] p-4 border border-stone-200">
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-[#5a5a5a] mt-1">{selectedOrder.customer_email}</p>
                  <p className="text-sm text-[#5a5a5a]">{selectedOrder.customer_phone}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-2">Shipping Address</p>
                <p className="text-sm bg-[#fdfbf7] p-4 border border-stone-200">{selectedOrder.shipping_address}</p>
              </div>

              <div>
                <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-2">Order Items</p>
                <div className="border border-stone-200 divide-y">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 flex justify-between hover:bg-[#fdfbf7] transition-colors">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-[#5a5a5a]">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#0f5132]">₹{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-normal" style={{fontFamily: 'Tenor Sans, serif'}}>Total Amount</span>
                  <span className="font-bold text-[#ff7f50]">₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#5a5a5a] uppercase tracking-wider mb-2">Update Order Status</p>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="w-full border border-stone-300 rounded-none p-3 focus:outline-none focus:border-[#0f5132]"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-[#0f5132] text-white py-3 rounded-full hover:opacity-90 transition-all uppercase tracking-wider font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
