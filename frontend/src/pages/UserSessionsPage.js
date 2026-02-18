import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Clock, Users, Star, ShoppingCart, Search } from 'lucide-react';
import { productAPI } from '../utils/api';
import { toast } from 'sonner';

export default function UserSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchSessions();
    loadCart();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, categoryFilter]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await productAPI.getAll({ limit: 100 });
      setSessions(response.data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(session => session.category === categoryFilter);
    }

    setFilteredSessions(filtered);
  };

  const addToCart = (session) => {
    const existingItem = cart.find(item => item.id === session.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === session.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...session, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Added to cart!');
  };

  const categories = ['all', 'Yoga', 'Cardio', 'Strength', 'Pilates', 'Dance', 'Meditation'];

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
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/user/dashboard')} variant="outline">Dashboard</Button>
              <Button onClick={() => navigate('/user/cart')} className="bg-gradient-to-r from-purple-600 to-pink-600" data-testid="cart-button">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cart.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Personal Training Sessions
          </h1>
          <p className="text-xl text-gray-600">
            Book one-on-one sessions with certified trainers
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Sessions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">Loading sessions...</div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">No sessions found</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="sessions-grid">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105" data-testid="session-card">
                <div className="h-56 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 flex items-center justify-center relative">
                  <Dumbbell className="h-20 w-20 text-white/80" />
                  {session.discount > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                      {session.discount}% OFF
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="text-sm text-purple-600 font-semibold mb-2 uppercase">
                    {session.category}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{session.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {session.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-purple-600">₹{session.price}</span>
                      {session.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{(session.price / (1 - session.discount / 100)).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{session.stock} slots</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => addToCart(session)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    disabled={session.stock === 0}
                    data-testid="add-to-cart-btn"
                  >
                    {session.stock === 0 ? 'Fully Booked' : 'Book Session'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
