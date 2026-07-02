"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Kind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: Kind;
  title: string;
  detail?: string;
}

const ToastCtx = createContext<{ push: (kind: Kind, title: string, detail?: string) => void }>({
  push: () => {},
});

export function useToast() {
  return useContext(ToastCtx);
}

const ICONS: Record<Kind, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" className="fill-emerald-100" />
      <path d="m6.5 10.5 2.3 2.3 4.7-5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" className="fill-red-100" />
      <path d="m7 7 6 6M13 7l-6 6" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" className="fill-blue-100" />
      <path d="M10 9v5M10 6.2v.2" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((kind: Kind, title: string, detail?: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, title, detail }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5500);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-gray-200 bg-white/95 p-3.5 shadow-lg shadow-gray-900/5 backdrop-blur"
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.kind]}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              {t.detail ? <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{t.detail}</p> : null}
            </div>
            <button
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              className="ml-auto shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
