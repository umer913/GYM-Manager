"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const UIContext = createContext(null);

export function useToast() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useToast must be used within <UIProvider>");
  return ctx.toast;
}

export function useConfirm() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useConfirm must be used within <UIProvider>");
  return ctx.confirm;
}

/* ---------- Icons ---------- */
const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconX = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconInfo = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" />
  </svg>
);
const IconWarn = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" />
  </svg>
);
const IconTrash = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
const IconPencil = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);
const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconKey = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 9.3-9.3M16 5l3 3M18 7l2-2" />
  </svg>
);

/* ---------- Toast types ---------- */
const TOAST_TYPES = {
  success: { Icon: IconCheck, ring: "ring-emerald-500/30", accent: "text-emerald-400", bar: "bg-emerald-400" },
  error: { Icon: IconX, ring: "ring-red-500/30", accent: "text-red-400", bar: "bg-red-400" },
  info: { Icon: IconInfo, ring: "ring-sky-500/30", accent: "text-sky-400", bar: "bg-sky-400" },
  warning: { Icon: IconWarn, ring: "ring-amber-500/30", accent: "text-amber-400", bar: "bg-amber-400" },
};

/* ---------- Confirm variants ---------- */
export const CONFIRM_VARIANTS = {
  delete: { Icon: IconTrash, label: "Delete", color: "bg-red-600 hover:bg-red-700 focus:ring-red-500/40", iconWrap: "bg-red-500/10 text-red-400" },
  edit: { Icon: IconPencil, label: "Edit", color: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/40", iconWrap: "bg-amber-500/10 text-amber-400" },
  save: { Icon: IconCheck, label: "Save", color: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/40", iconWrap: "bg-emerald-500/10 text-emerald-400" },
  login: { Icon: IconKey, label: "Login", color: "bg-red-600 hover:bg-red-700 focus:ring-red-500/40", iconWrap: "bg-red-500/10 text-red-400" },
  create: { Icon: IconPlus, label: "Create", color: "bg-red-600 hover:bg-red-700 focus:ring-red-500/40", iconWrap: "bg-red-500/10 text-red-400" },
};

let toastSeq = 0;

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (type, message, options = {}) => {
      const id = ++toastSeq;
      const duration = options.duration ?? 3500;
      const toast = {
        id,
        type,
        message,
        title: options.title,
        duration,
      };
      setToasts((prev) => [...prev, toast]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast]
  );

  const toast = {
    success: (message, opts) => pushToast("success", message, opts),
    error: (message, opts) => pushToast("error", message, opts),
    info: (message, opts) => pushToast("info", message, opts),
    warning: (message, opts) => pushToast("warning", message, opts),
    dismiss: dismissToast,
  };

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setConfirmState({ ...options, resolve });
      }),
    []
  );

  const closeConfirm = (result) => {
    if (confirmState?.resolve) confirmState.resolve(result);
    setConfirmState(null);
  };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast viewport */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => {
          const cfg = TOAST_TYPES[t.type] || TOAST_TYPES.info;
          const Icon = cfg.Icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative overflow-hidden rounded-xl bg-zinc-900/95 backdrop-blur border border-zinc-800 ring-1 ${cfg.ring} shadow-2xl shadow-black/40 pl-4 pr-3 py-3 animate-toast-in`}
              role="alert"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className={`mt-0.5 shrink-0 ${cfg.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 overflow-hidden">
                  {t.title && (
                    <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                  )}
                  <p className="text-sm text-zinc-300 break-words">{t.message}</p>
                </div>
                <button
                  onClick={() => dismissToast(t.id)}
                  className="shrink-0 text-zinc-500 hover:text-white transition mt-0.5"
                  aria-label="Dismiss"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
              {t.duration > 0 && (
                <span
                  className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} opacity-70`}
                  style={{
                    animation: `toast-progress ${t.duration}ms linear forwards`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <ConfirmModal
          state={confirmState}
          onConfirm={() => closeConfirm(true)}
          onCancel={() => closeConfirm(false)}
        />
      )}
    </UIContext.Provider>
  );
}

function ConfirmModal({ state, onConfirm, onCancel }) {
  const variant = CONFIRM_VARIANTS[state.variant] || CONFIRM_VARIANTS.save;
  const Icon = variant.Icon;
  const loading = state.loading;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-modal-fade"
        onClick={() => !loading && onCancel()}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/50 animate-modal-pop">
        <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gradient-to-br from-red-600/20 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${variant.iconWrap}`}>
              <Icon className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-bold text-white">
              {state.title || `${variant.label}?`}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {state.message || `Are you sure you want to ${variant.label.toLowerCase()} this?`}
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {state.cancelText || "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 ${variant.color} disabled:opacity-60`}
            >
              {loading ? (state.loadingText || "Please wait...") : (state.confirmText || variant.label)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
