"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../../utils/api";
import { useToast, useConfirm } from "../../../../components/ui/UIProvider";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
];

export default function ManageStorePage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("products");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "General",
    images: "", stock: "", expectedDelivery: "3-5 business days",
  });

  const fetchProducts = async () => {
    const { data, ok } = await apiCall("/api/manager/store");
    if (ok) setProducts(data.products || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data, ok } = await apiCall("/api/manager/store?type=orders");
    if (ok) setOrders(data.orders || []);
  };

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "General", images: "", stock: "", expectedDelivery: "3-5 business days" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || "", price: String(p.price),
      category: p.category, images: (p.images || []).join("\n"), stock: String(p.stock),
      expectedDelivery: p.expectedDelivery,
    });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const images = form.images ? form.images.split("\n").map(s => s.trim()).filter(Boolean) : [];
    const body = {
      ...(editing ? { _id: editing } : {}),
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      images,
      stock: Number(form.stock) || 0,
      expectedDelivery: form.expectedDelivery,
    };

    const { data, ok } = await apiCall("/api/manager/store", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (ok && data.success) {
      toast.success(editing ? "Product updated" : "Product added");
      fetchProducts();
      resetForm();
    } else {
      toast.error(data.message || "Failed to save product");
    }
  };

  const handleDelete = async (product) => {
    const confirmed = await confirm({
      variant: "delete",
      title: "Delete product?",
      message: `Permanently delete "${product.name}"?`,
    });
    if (!confirmed) return;
    const { data, ok } = await apiCall("/api/manager/store", {
      method: "DELETE",
      body: JSON.stringify({ _id: product._id }),
    });
    if (ok) {
      toast.success("Product deleted");
      fetchProducts();
    } else {
      toast.error(data.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (product) => {
    const { data, ok } = await apiCall("/api/manager/store", {
      method: "PUT",
      body: JSON.stringify({ _id: product._id, isActive: !product.isActive }),
    });
    if (ok) {
      toast.success(product.isActive ? "Product disabled" : "Product enabled");
      fetchProducts();
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    const { data, ok } = await apiCall("/api/manager/order-status", {
      method: "PUT",
      body: JSON.stringify({ orderId, status }),
    });
    if (ok) {
      toast.success(`Order ${status}`);
      fetchOrders();
    } else {
      toast.error(data.message || "Failed to update order");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar active="Manage Store" />
      <main className="lg:ml-60 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">Manage Store</h1>
              <p className="text-sm text-zinc-500 mt-1">Add and manage gym products</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTab("products")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${tab === "products" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"}`}>
                Products
              </button>
              <button onClick={() => { setTab("orders"); fetchOrders(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${tab === "orders" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"}`}>
                Orders ({orders.length})
              </button>
              {tab === "products" && (
                <button onClick={() => { resetForm(); setShowForm(true); }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold uppercase tracking-wider hover:from-red-500 hover:to-orange-500 transition shadow-lg shadow-red-500/20 cursor-pointer">
                  + Add Product
                </button>
              )}
            </div>
          </div>

          {/* Orders Tab */}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">No orders yet.</div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{order.user?.name || "Unknown"}</p>
                        <p className="text-xs text-zinc-500">{order.user?.email} · {order.user?.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          order.status === "delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : order.status === "shipped" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : order.status === "confirmed" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : order.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}>{order.status}</span>
                        <span className="text-sm font-bold text-emerald-400">Rs {order.totalAmount?.toLocaleString()}</span>
                      </div>
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
                    {(order.shippingAddress || order.contactPhone) && (
                      <div className="text-xs text-zinc-500 space-y-0.5">
                        {order.shippingAddress && <p>📍 {order.shippingAddress}</p>}
                        {order.contactPhone && <p>📞 {order.contactPhone}</p>}
                        {order.notes && <p>📝 {order.notes}</p>}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      {["confirmed", "shipped", "delivered"].map(s => (
                        <button key={s} onClick={() => handleOrderStatus(order._id, s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition cursor-pointer
                            bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                          {s}
                        </button>
                      ))}
                      {order.status !== "cancelled" && (
                        <button onClick={() => handleOrderStatus(order._id, "cancelled")}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition cursor-pointer
                            bg-red-900/30 border-red-800/40 text-red-400 hover:bg-red-800/40">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Products Tab */}
          {tab === "products" && (
            <>
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                  <p className="text-4xl mb-3">🏪</p>
                  <p className="font-bold">No products yet</p>
                  <p className="text-sm mt-1">Click "Add Product" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => (
                    <div key={product._id} className={`bg-zinc-900 border rounded-2xl overflow-hidden transition hover:border-zinc-700 ${product.isActive ? "border-zinc-800" : "border-zinc-800/50 opacity-60"}`}>
                      <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-zinc-600 text-4xl">🏋️</div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button onClick={() => handleToggleActive(product)}
                            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur flex items-center justify-center text-xs hover:bg-black/80 transition cursor-pointer"
                            title={product.isActive ? "Disable" : "Enable"}>
                            {product.isActive ? "👁️" : "🚫"}
                          </button>
                          <button onClick={() => openEdit(product)}
                            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur flex items-center justify-center text-xs hover:bg-black/80 transition cursor-pointer">
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(product)}
                            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur flex items-center justify-center text-xs hover:bg-black/80 transition cursor-pointer">
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
                          <span className="text-sm font-bold text-emerald-400 shrink-0">Rs {product.price?.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2">{product.description || "No description"}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-wider font-bold">
                          <span>{product.category}</span>
                          <span>Stock: {product.stock}</span>
                        </div>
                        <div className="text-[10px] text-zinc-600">
                          Expected Delivery {product.expectedDelivery}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="font-black text-sm uppercase tracking-wider">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={resetForm}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className={inputClass} placeholder="e.g. Premium Yoga Mat" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className={inputClass + " min-h-[80px]"} placeholder="Describe the product..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Price (Rs) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    className={inputClass} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className={inputClass + " cursor-pointer"}>
                    {["General", "Supplements", "Equipment", "Apparel", "Accessories", "Recovery"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Expected Delivery</label>
                  <input value={form.expectedDelivery} onChange={e => setForm({...form, expectedDelivery: e.target.value})}
                    className={inputClass} placeholder="3-5 business days" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Image URLs <span className="text-zinc-600 font-normal normal-case">(one per line)</span>
                </label>
                <textarea value={form.images} onChange={e => setForm({...form, images: e.target.value})}
                  className={inputClass + " min-h-[60px]"} placeholder={DEFAULT_IMAGES.join("\n")} />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {DEFAULT_IMAGES.map((url, i) => (
                    <button key={i} type="button" onClick={() => setForm({...form, images: form.images ? form.images + "\n" + url : url})}
                      className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition cursor-pointer">
                      + Img {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button onClick={resetForm}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold hover:from-red-500 hover:to-orange-500 transition disabled:opacity-50 cursor-pointer">
                {saving ? "Saving..." : editing ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
