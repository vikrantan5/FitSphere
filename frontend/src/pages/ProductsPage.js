import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShoppingCart, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to purchase products');
      navigate('/login');
      return;
    }
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="products-page">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-stone-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff7f50] to-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-normal" style={{fontFamily: 'Tenor Sans, serif'}}>FitSphere</h1>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Home</Link>
              <Link to="/programs" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Programs</Link>
              <Link to="/products" className="text-sm uppercase tracking-widest text-[#0f5132]">Shop</Link>
              <Link to="/dashboard" className="text-sm uppercase tracking-widest hover:text-[#0f5132] transition-colors">Dashboard</Link>
            </div>
            <Button onClick={() => navigate('/login')} className="bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white rounded-full px-6 py-3 text-sm uppercase tracking-widest">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#0f5132] mb-4 uppercase tracking-widest" style={{fontFamily: 'Tenor Sans, serif'}} data-testid="products-page-title">
              Wellness Shop
            </h1>
            <p className="text-[#5a5a5a] text-base">Premium fitness gear and supplements for your journey</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <Card key={product.id} className="bg-white border border-stone-100 overflow-hidden group hover:shadow-xl transition-all duration-500" data-testid={`product-card-${idx}`}>
                <div className="aspect-square overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <span className="inline-block px-4 py-1 bg-[#0f5132] text-white text-xs uppercase tracking-widest rounded-full mb-3">{product.category}</span>
                  <h3 className="text-xl font-medium text-[#1a1a1a] mb-2" style={{fontFamily: 'Tenor Sans, serif'}}>{product.name}</h3>
                  <p className="text-[#5a5a5a] text-sm mb-4">{product.description}</p>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-[#0f5132]" data-testid={`product-price-${idx}`}>₹ {product.price}</span>
                    <div className="flex items-center text-sm text-[#5a5a5a]">
                      <Package className="w-4 h-4 mr-1" />
                      <span>{product.stock} in stock</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gradient-to-r from-[#ff7f50] to-[#d4af37] hover:opacity-90 text-white rounded-full py-6 uppercase tracking-widest flex items-center justify-center gap-2"
                    data-testid={`add-to-cart-${idx}`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}