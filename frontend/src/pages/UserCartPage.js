import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { orderAPI, cartAPI } from "../utils/api";
import { toast } from "sonner";
import { UserLayout } from "@/components/user/UserLayout";

export default function UserCartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadCart();
    loadCustomerInfo();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);

      const response = await cartAPI.get();

      setCart(response.data.items || []);
    } catch (error) {
      console.error("Error loading cart:", error);

      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {
          setCart([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerInfo = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      setCustomerInfo({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: "",
      });
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  const updateQuantity = async (productId, change) => {
    const item = cart.find((i) => i.product_id === productId);

    if (!item) return;

    const newQuantity = Math.max(1, (item.quantity || 1) + change);

    try {
      await cartAPI.update(productId, { quantity: newQuantity });

      await loadCart();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartAPI.remove(productId);

      await loadCart();

      toast.success("Item removed from cart");
    } catch (error) {
      console.error(error);

      toast.error("Failed to remove item");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);

      return total + itemPrice * (item.quantity || 1);
    }, 0);
  };

  const handleCheckout = async () => {
    if (
      !customerInfo.name ||
      !customerInfo.email ||
      !customerInfo.phone ||
      !customerInfo.address
    ) {
      toast.error("Please fill all customer information");

      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");

      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const orderData = {
        user_id: user.id || "guest",

        items: cart.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity || 1,
          price: item.price * (1 - (item.discount || 0) / 100),
        })),

        total_amount: calculateTotal(),

        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shipping_address: customerInfo.address,
      };

      const response = await orderAPI.createRazorpay(orderData);

      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded");

        setLoading(false);

        return;
      }

      const options = {
        key: response.data.razorpay_key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        name: "FitSphere",
        description: "Fitness Products",
        order_id: response.data.razorpay_order_id,

        handler: async function (paymentResponse) {
          try {
            const verifyData = new FormData();

            verifyData.append(
              "razorpay_order_id",
              paymentResponse.razorpay_order_id
            );
            verifyData.append(
              "razorpay_payment_id",
              paymentResponse.razorpay_payment_id
            );
            verifyData.append(
              "razorpay_signature",
              paymentResponse.razorpay_signature
            );

            await orderAPI.verifyPayment(verifyData);

            try {
              await cartAPI.clear();
            } catch {}

            localStorage.removeItem("cart");

            setCart([]);

            toast.success("Payment successful! Order placed.");

            navigate("/user/dashboard");
          } catch (error) {
            console.error(error);

            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },

        theme: {
          color: "#06b6d4",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);

            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout
      activePath="/user/cart"
      title="Your Cart"
      subtitle="Review selected items, update quantities, and complete secure checkout in one flow."
    >
      {cart.length === 0 ? (
        <Card className="saas-glass-card p-12 text-center">
          <ShoppingCart className="mx-auto h-20 w-20 text-zinc-500" />

          <h3 className="mt-4 text-2xl font-bold text-white">
            Your cart is empty
          </h3>

          <p className="mt-2 text-zinc-300">
            Add products or sessions to get started.
          </p>

          <Button
            onClick={() => navigate("/user/shop")}
            className="mt-6 bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
          >
            Browse Store
          </Button>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <Card key={item.product_id} className="saas-glass-card p-5">
                <div className="flex flex-col gap-4 md:flex-row">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-zinc-900">
                      <ShoppingCart className="h-10 w-10 text-zinc-500" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {item.product_name}
                        </h3>

                        <p className="text-sm text-zinc-400">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>

                      <Button
                        onClick={() => removeItem(item.product_id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          variant="outline"
                          size="sm"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="text-lg font-semibold text-white">
                          {item.quantity || 1}
                        </span>

                        <Button
                          onClick={() => updateQuantity(item.product_id, 1)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-200">
                          ₹
                          {(
                            item.price *
                            (1 - (item.discount || 0) / 100) *
                            (item.quantity || 1)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Customer Info + Summary */}
          <div className="space-y-4">
            <Card className="saas-glass-card p-6">
              <h3 className="mb-4 text-xl font-semibold text-white">
                Customer Information
              </h3>

              <div className="space-y-4 text-white">
                <Input
                  placeholder="Name"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      name: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      email: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Phone"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      phone: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Address"
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </Card>

            <Card className="saas-glass-card p-6">
              <h3 className="mb-4 text-xl font-semibold text-white">
                Order Summary
              </h3>

              <div className="flex justify-between text-zinc-300">
                <span>Subtotal</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-zinc-300">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-cyan-200">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-6 w-full bg-cyan-500 py-6 text-lg font-semibold text-zinc-950"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </UserLayout>
  );
}