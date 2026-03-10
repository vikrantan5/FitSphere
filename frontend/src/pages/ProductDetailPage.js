import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { productAPI, cartAPI } from "../utils/api";
import { toast } from "sonner";
import { UserLayout } from "@/components/user/UserLayout";

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
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
      navigate("/user/shop");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      setAddingToCart(true);

      await cartAPI.add({
        product_id: product.id,
        quantity: quantity,
      });

      toast.success(`Added ${quantity} item(s) to cart!`);

      navigate("/user/cart");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    try {
      setAddingToCart(true);

      await cartAPI.add({
        product_id: product.id,
        quantity: quantity,
      });

      navigate("/user/cart");
    } catch (error) {
      console.error(error);
      toast.error("Failed to proceed");
    } finally {
      setAddingToCart(false);
    }
  };

  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    return product.price * (1 - (product.discount || 0) / 100);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-500"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-zinc-400">
          ({rating?.toFixed(1)})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen saas-aurora flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-300">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : [];

  return (
    <UserLayout
      activePath="/user/shop"
      title="Product Details"
      subtitle="Review product specifications, choose quantity, and add directly to your cart."
      actions={
        <>
          <Button
            onClick={() => navigate("/user/shop")}
            variant="outline"
            size="sm"
            className="border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>

          <Button
            onClick={() => navigate("/user/cart")}
            className="bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart
          </Button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <Card className="saas-glass-card overflow-hidden">
            <div className="relative aspect-square bg-zinc-950">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-zinc-500" />
                </div>
              )}

              {product.discount > 0 && (
                <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </Card>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-xl border ${
                    selectedImage === index
                      ? "border-cyan-300"
                      : "border-white/10"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <Card className="saas-glass-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              {product.category}
            </p>

            <h1 className="mt-2 text-4xl font-bold text-white">
              {product.name}
            </h1>

            <div className="mt-3">{renderStars(product.rating)}</div>

            <div className="mt-6 border-y border-white/10 py-5">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-cyan-200">
                  ₹{calculateDiscountedPrice().toFixed(2)}
                </span>

                {product.discount > 0 && (
                  <span className="text-xl text-zinc-400 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white">
                Description
              </h3>

              <p className="mt-2 text-zinc-300">
                {product.description}
              </p>
            </div>
          </Card>

          {/* Quantity + Buy */}
          <Card className="saas-glass-card p-6">
            <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300">
              Quantity
            </label>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-white/15 bg-zinc-950/70">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="ghost"
                  size="sm"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="px-6 py-2 text-lg font-semibold">
                  {quantity}
                </span>

                <Button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  variant="ghost"
                  size="sm"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <span className="text-sm text-zinc-400">
                Max {product.stock} available
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <Button
                onClick={addToCart}
                disabled={product.stock === 0 || addingToCart}
                className="w-full bg-cyan-500 py-6 text-lg font-semibold text-zinc-950 hover:bg-cyan-400"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {addingToCart
                  ? "Adding..."
                  : product.stock === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </Button>

              <Button
                onClick={buyNow}
                disabled={product.stock === 0 || addingToCart}
                className="w-full border border-white/15 bg-white/5 py-6 text-lg font-semibold text-zinc-100 hover:bg-white/10"
              >
                {addingToCart ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </Card>

          {/* Benefits */}
          <Card className="saas-glass-card p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-cyan-300" />
                <div>
                  <p className="font-semibold text-white">
                    Free Delivery
                  </p>
                  <p className="text-xs text-zinc-400">
                    On orders above ₹500
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6 text-blue-300" />
                <div>
                  <p className="font-semibold text-white">
                    Easy Returns
                  </p>
                  <p className="text-xs text-zinc-400">
                    7 day return policy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="font-semibold text-white">
                    Secure Payment
                  </p>
                  <p className="text-xs text-zinc-400">
                    Protected checkout
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}