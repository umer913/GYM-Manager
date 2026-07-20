"use client";

export default function OrderModal({ cartItems, cartTotal, cartCount, orderForm, placing, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-modal-fade"
        onClick={() => !placing && onCancel()}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/50 animate-modal-pop">
        <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gradient-to-br from-red-600/20 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white">Order Summary</h3>
            <button
              onClick={onCancel}
              disabled={placing}
              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition disabled:opacity-50 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item._id} className="flex items-center gap-3 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-xl shrink-0">🏋️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-emerald-400 shrink-0">
                  Rs {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Shipping</span>
              <span className="text-white text-right max-w-[60%] truncate">{orderForm.shippingAddress || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Contact</span>
              <span className="text-white">{orderForm.contactPhone || "—"}</span>
            </div>
            {orderForm.notes && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Notes</span>
                <span className="text-white text-right max-w-[60%] truncate">{orderForm.notes}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-zinc-700">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-base font-black text-emerald-400">Rs {cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={onCancel}
              disabled={placing}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={placing}
              className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 py-2.5 text-sm font-semibold text-white hover:from-red-500 hover:to-orange-500 transition focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-60 cursor-pointer"
            >
              {placing ? "Redirecting to Payment..." : `Pay Rs ${cartTotal.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
