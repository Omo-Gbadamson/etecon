import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeToTeacherApplications } from "../../firebase/firestore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Badge, EmptyState, Button, SkeletonCard } from "../../components/shared";
import { formatRelative } from "../../utils";

const STATUS_TABS = ["all", "pending", "shortlisted", "reviewed", "hired", "rejected"];

export default function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTeacherApplications(user.uid, (data) => {
      setApps(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const filtered = tab === "all" ? apps : apps.filter(a => a.status === tab);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Applications</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t
              ? "bg-indigo-700 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "all" ? ` (${apps.length})` : ` (${apps.filter(a => a.status === t).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title={tab === "all" ? "No applications yet" : `No ${tab} applications`}
          description="Browse open jobs and apply to get started."
          action={<Link to="/dashboard/teacher/jobs"><Button>Browse jobs</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{app.jobTitle || "Teaching Position"}</p>
                  <p className="text-sm text-slate-500">Applied {formatRelative(app.appliedAt)}</p>
                </div>
                <Badge status={app.status} />
              </div>

              {app.status === "shortlisted" && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-sm text-blue-800">
                  🎉 You've been shortlisted! The school may reach out to you soon.
                </div>
              )}
              {app.status === "hired" && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3 text-sm text-emerald-800">
                  🏆 Congratulations! You've been selected for this position.
                </div>
              )}
              {app.status === "rejected" && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 mb-3 text-sm text-rose-800">
                  Unfortunately, this application was unsuccessful. Keep applying!
                </div>
              )}

              {app.schoolNote && (
                <p className="text-sm text-slate-600 italic bg-slate-50 rounded-lg p-3">
                  School note: {app.schoolNote}
                </p>
              )}

              {app.coverLetter && (
                <details className="mt-3">
                  <summary className="text-sm text-indigo-600 cursor-pointer hover:underline">View cover letter</summary>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{app.coverLetter}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
