import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ShoppingCart, Search, Package } from "lucide-react";
import { productAPI, cartAPI } from "../utils/api";
import { toast } from "sonner";
import { UserLayout } from "@/components/user/UserLayout";

export default function UserShopPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cartCount, setCartCount] = useState(0);

  const categories = ["all", "Equipment", "Apparel", "Supplements", "Accessories"];

  /* ---------------- FETCH PRODUCTS ---------------- */

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({ limit: 100 });

      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Product fetch error:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOAD CART ---------------- */

  const loadCartCount = async () => {
    try {
      const response = await cartAPI.get();
      const items = response?.data?.items || [];
      setCartCount(items.length);
    } catch (error) {
      console.error("Cart load error:", error);
    }
  };

  /* ---------------- ADD TO CART ---------------- */

  const addToCart = async (product) => {
    try {
      await cartAPI.add({
        product_id: product.id,
        quantity: 1
      });

      toast.success("Added to cart");
      loadCartCount();
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    }
  };

  /* ---------------- FILTER PRODUCTS ---------------- */

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    return filtered;
  }, [products, searchQuery, categoryFilter]);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    fetchProducts();
    loadCartCount();
  }, []);

  return (
    <UserLayout
      activePath="/user/shop"
      title="FitSphere Store"
      subtitle="Premium gear, apparel, and supplements curated for your performance goals."
      actions={
        <Button
          onClick={() => navigate("/user/cart")}
          className="bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart ({cartCount})
        </Button>
      }
    >
      {/* ---------------- FILTERS ---------------- */}

      <Card className="saas-glass-card mb-8 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-white/10 bg-zinc-950/70 pl-10 text-zinc-100"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="border-white/10 bg-zinc-950/70">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>

            <SelectContent className="border-white/10 bg-zinc-900 text-zinc-100">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* ---------------- LOADING ---------------- */}

      {loading ? (
        <Card className="saas-glass-card p-10 text-center">
          <p className="text-zinc-300">Loading products...</p>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="saas-glass-card p-10 text-center">
          <p className="text-zinc-300">No products found.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border border-cyan-300/20 bg-zinc-900/70 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/45"
            >
              {/* PRODUCT IMAGE */}

              <button
                type="button"
                className="relative block aspect-[4/3] w-full overflow-hidden bg-zinc-950"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {product.image_urls?.length > 0 ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-16 w-16 text-zinc-500" />
                  </div>
                )}

                {product.discount > 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                    {product.discount}% OFF
                  </span>
                )}
              </button>

              {/* PRODUCT INFO */}

              <div className="space-y-3 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  {product.category}
                </p>

                <button
                  className="line-clamp-2 text-left text-lg font-semibold text-white hover:text-cyan-200"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </button>

                <p className="line-clamp-2 text-sm text-zinc-300">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-cyan-200">
                    ₹{product.price}
                  </p>

                  {product.discount > 0 && (
                    <p className="text-sm text-zinc-400 line-through">
                      ₹{(product.price / (1 - product.discount / 100)).toFixed(0)}
                    </p>
                  )}
                </div>

                <p className="text-sm text-zinc-400">
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </p>

                {/* BUTTONS */}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => navigate(`/product/${product.id}`)}
                    variant="outline"
                    className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                  >
                    Details
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </UserLayout>
  );
}