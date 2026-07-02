import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary:
      "bg-brand text-white shadow-sm shadow-brand/30 hover:bg-brand-dark focus-visible:ring-brand/40",
    ghost:
      "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus-visible:ring-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-gray-400">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm shadow-gray-900/[0.03] ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div>
      <h2 className="font-semibold text-gray-900">{children}</h2>
      {sub ? <p className="mt-0.5 text-xs text-gray-400">{sub}</p> : null}
    </div>
  );
}

export function Banner({ kind, children }: { kind: "error" | "ok" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  }[kind];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-brand ${className}`}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

/** Colored initial avatar for a site card. */
export function SiteAvatar({ name }: { name: string }) {
  const palette = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-cyan-600"];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${palette[h % palette.length]}`}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
