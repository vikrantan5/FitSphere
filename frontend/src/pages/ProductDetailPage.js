import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dumbbell, ShoppingCart, ArrowLeft, Package, Star, 
  Minus, Plus, Truck, Shield, RefreshCw 
} from 'lucide-react';
import { productAPI, cartAPI } from '../utils/api';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getOne(productId);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
      navigate('/user/shop');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      setAddingToCart(true);
      await cartAPI.add({
        product_id: product.id,
        quantity: quantity
      });
      toast.success(`Added ${quantity} item(s) to cart!`);
      navigate('/user/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    try {
      setAddingToCart(true);
      await cartAPI.add({
        product_id: product.id,
        quantity: quantity
      });
      navigate('/user/cart');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to proceed');
    } finally {
      setAddingToCart(false);
    }
  };

  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    return product.price * (1 - product.discount / 100);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/user/shop')}
                variant="outline"
                size="sm"
                className="gap-2"
                data-testid="back-button"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shop
              </Button>
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <Dumbbell className="h-6 w-6 text-purple-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  FitSphere
                </span>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/user/cart')} 
              className="bg-gradient-to-r from-purple-600 to-pink-600"
              data-testid="cart-button"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden" data-testid="main-image-card">
              <div className="aspect-square bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 flex items-center justify-center relative">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-32 w-32 text-white/80" />
                )}
                {product.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg z-10">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
                      selectedImage === index ? 'ring-2 ring-purple-600' : ''
                    }`}
                    onClick={() => setSelectedImage(index)}
                    data-testid={`thumbnail-${index}`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-teal-600 font-semibold mb-2 uppercase tracking-wide">
                {product.category}
              </div>
              <h1 className="text-4xl font-bold mb-4" data-testid="product-name">
                {product.name}
              </h1>
              {renderStars(product.rating)}
            </div>

            <div className="border-t border-b py-6">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-teal-600" data-testid="product-price">
                  ₹{calculateDiscountedPrice().toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="text-2xl text-gray-500 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="text-lg text-green-600 font-semibold">
                    Save ₹{(product.price - calculateDiscountedPrice()).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed" data-testid="product-description">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Package className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">SKU</p>
                <p className="text-xs text-gray-600">{product.sku}</p>
              </Card>
              <Card className="p-4 text-center">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold" data-testid="stock-status">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
                <p className="text-xs text-gray-600">
                  {product.stock > 10 ? 'Available' : product.stock > 0 ? 'Low Stock' : 'Unavailable'}
                </p>
              </Card>
              <Card className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-semibold">Rating</p>
                <p className="text-xs text-gray-600">{product.rating}/5.0</p>
              </Card>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    variant="ghost"
                    size="sm"
                    disabled={quantity <= 1}
                    data-testid="decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 py-2 font-bold text-lg" data-testid="quantity-display">
                    {quantity}
                  </span>
                  <Button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    variant="ghost"
                    size="sm"
                    disabled={quantity >= product.stock}
                    data-testid="increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  (Max: {product.stock} available)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={addToCart}
                disabled={product.stock === 0 || addingToCart}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-6 text-lg font-semibold"
                data-testid="add-to-cart-btn"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                onClick={buyNow}
                disabled={product.stock === 0 || addingToCart}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 text-lg font-semibold"
                data-testid="buy-now-btn"
              >
                {addingToCart ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>

            {/* Features */}
            <Card className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-teal-600" />
                  <div>
                    <p className="font-semibold text-sm">Free Delivery</p>
                    <p className="text-xs text-gray-600">On orders above ₹500</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-semibold text-sm">Easy Returns</p>
                    <p className="text-xs text-gray-600">7 days return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-pink-600" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600">100% secure transactions</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
