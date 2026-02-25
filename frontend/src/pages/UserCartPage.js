import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dumbbell, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { orderAPI } from '../utils/api';
import { toast } from 'sonner';

export default function UserCartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadCart();
    loadCustomerInfo();
    
    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart:', error);
        setCart([]);
      }
    }
  };

  const loadCustomerInfo = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user) {
        setCustomerInfo({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: ''
        });
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const updateQuantity = (itemId, change) => {
    const newCart = cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, (item.quantity || 1) + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (itemId) => {
    const newCart = cart.filter(item => item.id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      return total + (itemPrice * (item.quantity || 1));
    }, 0);
  };

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast.error('Please fill all customer information');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const orderData = {
        user_id: user.id || 'guest',
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity || 1,
          price: item.price * (1 - (item.discount || 0) / 100)
        })),
        total_amount: calculateTotal(),
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shipping_address: customerInfo.address
      };

     const response = await orderAPI.createRazorpay(orderData);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Initialize Razorpay
      const options = {
        key: response.data.razorpay_key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'FitSphere',
        description: 'Fitness Services & Products',
        order_id: response.data.razorpay_order_id,
        handler: async function (paymentResponse) {
          try {
            // Create FormData and append payment details
            const verifyData = new FormData();
            verifyData.append('razorpay_order_id', paymentResponse.razorpay_order_id);
            verifyData.append('razorpay_payment_id', paymentResponse.razorpay_payment_id);
            verifyData.append('razorpay_signature', paymentResponse.razorpay_signature);

            await orderAPI.verifyPayment(verifyData);
            
            // Clear cart
            localStorage.removeItem('cart');
            setCart([]);
            
            toast.success('Payment successful! Order placed.');
            navigate('/user/dashboard');
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#9333ea'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Dumbbell className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FitSphere
              </span>
            </div>
            <Button onClick={() => navigate('/user/dashboard')} variant="outline">Dashboard</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <Card className="p-12 text-center" data-testid="empty-cart">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
            <Button onClick={() => navigate('/user/sessions')} className="bg-gradient-to-r from-purple-600 to-pink-600">
              Browse Sessions
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
              {cart.map((item) => (
                <Card key={item.id} className="p-6" data-testid="cart-item">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <p className="text-gray-600 text-sm">{item.category}</p>
                        </div>
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          data-testid="remove-item-btn"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => updateQuantity(item.id, -1)}
                            variant="outline"
                            size="sm"
                            data-testid="decrease-qty-btn"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold text-lg" data-testid="item-quantity">{item.quantity || 1}</span>
                          <Button
                            onClick={() => updateQuantity(item.id, 1)}
                            variant="outline"
                            size="sm"
                            data-testid="increase-qty-btn"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            ₹{((item.price * (1 - (item.discount || 0) / 100) * (item.quantity || 1)).toFixed(2))}
                          </div>
                          {item.discount > 0 && (
                            <div className="text-sm text-gray-500 line-through">
                              ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary & Customer Info */}
            <div className="space-y-4">
              <Card className="p-6" data-testid="customer-info-card">
                <h3 className="font-bold text-xl mb-4">Customer Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <Input
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="Your name"
                      required
                      data-testid="customer-name-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      data-testid="customer-email-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone *</label>
                    <Input
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+91 1234567890"
                      required
                      data-testid="customer-phone-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Address *</label>
                    <Input
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="Your address"
                      required
                      data-testid="customer-address-input"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6" data-testid="order-summary-card">
                <h3 className="font-bold text-xl mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-purple-600" data-testid="total-amount">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 py-6 text-lg"
                  data-testid="checkout-btn"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}