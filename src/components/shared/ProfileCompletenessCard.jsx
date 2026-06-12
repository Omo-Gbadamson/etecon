import { Link } from "react-router-dom";
import { AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export function ProfileCompletenessCard({ percent, missing, role }) {
  const color = percent >= 80 ? "emerald" : percent >= 50 ? "amber" : "rose";
  const colors = {
    emerald: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    amber: { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
    rose: { bar: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50 border-rose-100" },
  }[color];

  if (percent >= 100) return null;

  return (
    <div className={cn("rounded-xl border p-5 mb-6", colors.bg)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className={cn("w-5 h-5 flex-shrink-0", colors.text)} />
          <p className={cn("font-semibold", colors.text)}>Profile {percent}% complete</p>
        </div>
        <Link to={`/dashboard/${role}/profile`}
          className={cn("text-sm font-medium flex items-center gap-1 hover:underline", colors.text)}>
          Complete <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-3">
        <div className={cn("h-full rounded-full transition-all", colors.bar)} style={{ width: `${percent}%` }} />
      </div>

      {missing.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {missing.slice(0, 4).map(m => (
            <span key={m} className="text-xs bg-white/70 text-slate-700 px-2 py-0.5 rounded-full border border-white">
              + {m}
            </span>
          ))}
          {missing.length > 4 && (
            <span className="text-xs text-slate-500 px-1">+{missing.length - 4} more</span>
          )}
        </div>
      )}
    </div>
  );
}
