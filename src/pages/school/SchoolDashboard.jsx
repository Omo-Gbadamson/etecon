import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Star, CheckCircle, PlusCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSchoolJobs, getSchoolApplications, getSchoolProfile } from "../../firebase/firestore";
import { useProfileCompleteness } from "../../hooks/useProfileCompleteness";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard, SkeletonCard, EmptyState, Badge, Button } from "../../components/shared";
import { ProfileCompletenessCard } from "../../components/shared/ProfileCompletenessCard";
import { formatRelative } from "../../utils";

export default function SchoolDashboard() {
  const { user, userDoc } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { percent, missing } = useProfileCompleteness(profile, "school");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getSchoolJobs(user.uid),
      getSchoolApplications(user.uid),
      getSchoolProfile(user.uid),
    ]).then(([j, a, p]) => {
      setJobs(j); setApps(a); setProfile(p); setLoading(false);
    });
  }, [user]);

  const activeJobs = jobs.filter(j => j.status === "open").length;
  const shortlisted = apps.filter(a => a.status === "shortlisted").length;
  const now = new Date();
  const hiredThisMonth = apps.filter(a => {
    if (a.status !== "hired") return false;
    const d = a.updatedAt?.toDate?.();
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {userDoc?.displayName} 🏫</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your vacancies and applicants.</p>
        </div>
        <Link to="/dashboard/school/jobs/new">
          <Button><PlusCircle className="w-4 h-4" /> Post a job</Button>
        </Link>
      </div>

      <ProfileCompletenessCard percent={percent} missing={missing} role="school" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Active jobs" value={loading ? "…" : activeJobs} icon={Briefcase} color="indigo" />
        <StatsCard label="Total applications" value={loading ? "…" : apps.length} icon={Users} color="amber" />
        <StatsCard label="Shortlisted" value={loading ? "…" : shortlisted} icon={Star} color="blue" />
        <StatsCard label="Hired this month" value={loading ? "…" : hiredThisMonth} icon={CheckCircle} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Active job listings</h2>
            <Link to="/dashboard/school/jobs" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs posted yet"
              description="Post your first vacancy to start receiving applications."
              action={<Link to="/dashboard/school/jobs/new"><Button><PlusCircle className="w-4 h-4" /> Post a job</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <Link key={job.id} to={`/dashboard/school/jobs/${job.id}`}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.applicantsCount || 0} applicants · {formatRelative(job.createdAt)}</p>
                  </div>
                  <Badge status={job.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent applications</h2>
            <Link to="/dashboard/school/applications" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : apps.length === 0 ? (
            <EmptyState icon={Users} title="No applications yet"
              description="Applications appear here when teachers apply to your jobs." />
          ) : (
            <div className="space-y-3">
              {apps.slice(0, 5).map(app => (
                <div key={app.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 flex-shrink-0">
                    {app.teacherName?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{app.teacherName}</p>
                    <p className="text-xs text-slate-500">{app.jobTitle || "Position"} · {formatRelative(app.appliedAt)}</p>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
