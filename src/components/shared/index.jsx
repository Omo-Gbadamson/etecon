import { cn } from "../../utils/cn";

// ─── Button ───────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", className, loading, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const variants = {
    primary: "bg-indigo-700 text-white hover:bg-indigo-800 focus:ring-indigo-500",
    secondary: "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 focus:ring-indigo-300",
    danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
    amber: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────
const badgeColors = {
  pending: "bg-amber-100 text-amber-800",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-blue-100 text-blue-800",
  rejected: "bg-rose-100 text-rose-800",
  hired: "bg-emerald-100 text-emerald-800",
  open: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-100 text-slate-600",
  filled: "bg-purple-100 text-purple-800",
  default: "bg-slate-100 text-slate-700",
};

export function Badge({ status, label, className }) {
  const color = badgeColors[status] || badgeColors.default;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", color, className)}>
      {label || status}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────
export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition",
          error ? "border-rose-400" : "border-slate-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────
export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        rows={4}
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none",
          error ? "border-rose-400" : "border-slate-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────
export function Select({ label, error, options = [], placeholder, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition",
          error ? "border-rose-400" : "border-slate-200",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-100 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────
export function Skeleton({ className }) {
  return <div className={cn("bg-slate-200 rounded animate-pulse", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-indigo-400" />
      </div>}
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────
import { X } from "lucide-react";
export function Modal({ open, onClose, title, children, className }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", className)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────
export function Spinner({ className }) {
  return <div className={cn("w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin", className)} />;
}

// ─── Avatar ───────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = "md", className }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  if (src) return <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />;
  return (
    <div className={cn("rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center flex-shrink-0", sizes[size], className)}>
      {initials}
    </div>
  );
}

// ─── StatsCard ────────────────────────────────────────────────────────────
export function StatsCard({ label, value, icon: Icon, color = "indigo", sub }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value ?? "—"}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {Icon && <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>}
      </div>
    </Card>
  );
}
