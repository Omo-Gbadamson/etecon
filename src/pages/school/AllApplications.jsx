import { useEffect, useState, useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSchoolApplications, updateApplicationStatus } from "../../firebase/firestore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { EmptyState, SkeletonCard } from "../../components/shared";
import { toast } from "sonner";

const TABS = ["all", "pending", "reviewed", "shortlisted", "hired", "rejected"];

export default function AllApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToSchoolApplications(user.uid, (data) => {
      setApps(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleStatusChange = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Marked as ${status}.`);
    } catch { toast.error("Failed to update."); }
  };

  const filtered = useMemo(() =>
    tab === "all" ? apps : apps.filter(a => a.status === tab)
  , [apps, tab]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">All Applications</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t
              ? "bg-indigo-700 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"}`}>
            {t === "all" ? `All (${apps.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${apps.filter(a => a.status === t).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No applications"
          description={tab === "all" ? "Applications will appear here when teachers apply to your jobs." : `No ${tab} applications yet.`} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(app => (
            <ApplicationCard key={app.id} app={app} forSchool onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
