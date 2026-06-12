import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { getJob, getJobApplications, updateApplicationStatus } from "../../firebase/firestore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { Badge, Spinner, EmptyState } from "../../components/shared";
import { toast } from "sonner";

const STATUS_TABS = ["all", "pending", "reviewed", "shortlisted", "hired", "rejected"];

export default function ViewApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    Promise.all([getJob(jobId), getJobApplications(jobId)]).then(([j, a]) => {
      setJob(j);
      setApps(a);
      setLoading(false);
    });
  }, [jobId]);

  const handleStatusChange = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Applicant marked as ${status}.`);
    } catch { toast.error("Failed to update status."); }
  };

  const filtered = tab === "all" ? apps : apps.filter(a => a.status === tab);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <Link to="/dashboard/school/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </Link>

      {job && (
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h1>
              <p className="text-sm text-slate-500">{job.city}, {job.state} · {job.subject} · {apps.length} total applicants</p>
            </div>
            <Badge status={job.status} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t
              ? "bg-indigo-700 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"}`}>
            {t === "all" ? `All (${apps.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${apps.filter(a => a.status === t).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title={tab === "all" ? "No applications yet" : `No ${tab} applicants`}
          description={tab === "all" ? "Applications will appear here when teachers apply." : `No applicants with ${tab} status.`} />
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
