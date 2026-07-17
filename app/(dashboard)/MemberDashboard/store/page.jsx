"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../../utils/api";
import { useToast, useConfirm } from "../../../../components/ui/UIProvider";

export default function MemberStorePage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("shop");
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderForm, setOrderForm] = useState({ shippingAddress: "", contactPhone: "", notes: "" });

  const fetchProducts = async () => {
    const { data, ok } = await apiCall("/api/member/store");
    if (ok) setProducts(data.products || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data, ok } = await apiCall("/api/member/store?type=my-orders");
    if (ok) setOrders(data.orders || []);
  };

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product._id]: { ...product, quantity: (prev[product._id]?.quantity || 0) + 1 },
    }));
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => ({
      ...prev,
      [id]: { ...prev[id], quantity: qty },
    }));
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (!cartItems.length) return;

    // Validation
    if (!orderForm.shippingAddress.trim()) {
      toast.error("Shipping address is required.");
      return;
    }
    if (!orderForm.contactPhone.trim()) {
      toast.error("Contact phone number is required.");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(orderForm.contactPhone.trim())) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    const confirmed = await confirm({
      variant: "save",
      title: "Proceed to Payment?",
      message: `Rs ${cartTotal.toLocaleString()} for ${cartCount} item${cartCount > 1 ? "s" : ""}. You'll be redirected to Stripe for secure payment.`,
      confirmText: "Pay Now",
      cancelText: "Review Cart",
    });
    if (!confirmed) return;

    setPlacing(true);
    const { data, ok } = await apiCall("/api/payment/create-checkout", {
      method: "POST",
      body: JSON.stringify({
        type: "order",
        cartItems: cartItems.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          images: item.images,
        })),
        orderForm,
      }),
    });
    setPlacing(false);

    if (ok && data.success) {
      window.location.href = data.url;
    } else {
      toast.error(data.message || "Failed to start checkout.");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar active="Store" />
      <main className="lg:ml-60 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">Gym Store</h1>
              <p className="text-sm text-zinc-500 mt-1">Gear up with the best gym equipment</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setTab("shop"); setShowCart(false); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${tab === "shop" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"}`}>
                Shop
              </button>
              <button onClick={() => { setTab("orders"); fetchOrders(); setShowCart(false); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${tab === "orders" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"}`}>
                My Orders ({orders.length})
              </button>
              <button onClick={() => setShowCart(true)}
                className="relative px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold uppercase tracking-wider hover:from-red-500 hover:to-orange-500 transition shadow-lg shadow-red-500/20 cursor-pointer">
                Cart {cartCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white text-red-600 text-[9px] font-black">{cartCount}</span>}
              </button>
            </div>
          </div>

          {/* My Orders */}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="font-bold">No orders yet</p>
                  <p className="text-sm mt-1">Start shopping at the gym store!</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "long" })}
                        </span>
                        <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          order.status === "delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : order.status === "shipped" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : order.status === "confirmed" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : order.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}>{order.status}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 shrink-0">Rs {order.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                          )}
                          <span className="flex-1">{item.name} × {item.quantity}</span>
                          <span className="text-zinc-400">Rs {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-zinc-500 space-y-0.5">
                      {order.shippingAddress && <p>📍 {order.shippingAddress}</p>}
                      {order.contactPhone && <p>📞 {order.contactPhone}</p>}
                      {order.expectedDelivery && <p>Expected Delivery {order.expectedDelivery}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Shop */}
          {tab === "shop" && (
            <>
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                  <p className="text-4xl mb-3">🏪</p>
                  <p className="font-bold">Store is empty</p>
                  <p className="text-sm mt-1">Check back later for new products!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => {
                    const inCart = cart[product._id];
                    return (
                      <div key={product._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition hover:border-zinc-700 hover:shadow-xl group">
                        <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-zinc-600 text-4xl">🏋️</div>
                          )}
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
                            <span className="text-sm font-bold text-emerald-400 shrink-0">Rs {product.price?.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2">{product.description || ""}</p>
                          <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-wider font-bold">
                            <span>{product.category}</span>
                            <span className={product.stock > 0 ? "text-emerald-500" : "text-red-500"}>
                              {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-600">🚚 {product.expectedDelivery}</div>
                          <button onClick={() => addToCart(product)} disabled={product.stock <= 0}
                            className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold uppercase tracking-wider hover:from-red-500 hover:to-orange-500 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-500/10 cursor-pointer">
                            {inCart ? `+ Add More (${inCart.quantity})` : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 flex flex-col text-white overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="font-black text-sm uppercase tracking-wider">Your Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer">✕</button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                <p className="text-4xl mb-3">🛒</p>
                <p className="font-bold">Cart is empty</p>
                <p className="text-sm mt-1">Browse the store and add items!</p>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 py-4 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex items-center gap-3 bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-zinc-800 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl shrink-0">🏋️</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.name}</p>
                        <p className="text-xs text-emerald-400 font-bold">Rs {item.price?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item._id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold transition cursor-pointer">−</button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item._id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold transition cursor-pointer">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-xs text-red-400 transition cursor-pointer">✕</button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <div className="space-y-2">
                    <input value={orderForm.shippingAddress} onChange={e => setOrderForm({...orderForm, shippingAddress: e.target.value})}
                      className={inputClass} placeholder="Shipping address (optional)" />
                    <input value={orderForm.contactPhone} onChange={e => setOrderForm({...orderForm, contactPhone: e.target.value})}
                      className={inputClass} placeholder="Contact phone (optional)" />
                    <input value={orderForm.notes} onChange={e => setOrderForm({...orderForm, notes: e.target.value})}
                      className={inputClass} placeholder="Order notes (optional)" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Total</span>
                    <span className="text-lg font-black text-emerald-400">Rs {cartTotal.toLocaleString()}</span>
                  </div>
                  <button onClick={placeOrder} disabled={placing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold hover:from-red-500 hover:to-orange-500 transition disabled:opacity-50 shadow-lg shadow-red-500/20 cursor-pointer">
                    {placing ? "Placing Order..." : `Place Order · Rs ${cartTotal.toLocaleString()}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
