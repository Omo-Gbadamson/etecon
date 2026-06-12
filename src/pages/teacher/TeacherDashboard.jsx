import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, Star, User, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getTeacherApplications, getOpenJobs, getTeacherProfile } from "../../firebase/firestore";
import { useProfileCompleteness } from "../../hooks/useProfileCompleteness";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard, SkeletonCard, EmptyState, Badge, Button } from "../../components/shared";
import { ProfileCompletenessCard } from "../../components/shared/ProfileCompletenessCard";
import { formatRelative, formatSalary } from "../../utils";

export default function TeacherDashboard() {
  const { user, userDoc } = useAuth();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { percent, missing } = useProfileCompleteness(profile, "teacher");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getTeacherApplications(user.uid),
      getOpenJobs(),
      getTeacherProfile(user.uid),
    ]).then(([a, j, p]) => {
      setApps(a);
      setJobs(j.filter(job => {
        if (job.applicationDeadline?.toDate) return job.applicationDeadline.toDate() > new Date();
        return true;
      }).slice(0, 4));
      setProfile(p);
      setLoading(false);
    });
  }, [user]);

  const pending = apps.filter(a => a.status === "pending").length;
  const shortlisted = apps.filter(a => a.status === "shortlisted").length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userDoc?.displayName?.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's your job search summary.</p>
      </div>

      <ProfileCompletenessCard percent={percent} missing={missing} role="teacher" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Applications sent" value={loading ? "…" : apps.length} icon={FileText} color="indigo" />
        <StatsCard label="Pending review" value={loading ? "…" : pending} icon={Clock} color="amber" />
        <StatsCard label="Shortlisted" value={loading ? "…" : shortlisted} icon={Star} color="emerald" />
        <StatsCard label="Profile" value={loading ? "…" : `${percent}%`} icon={User}
          color={percent >= 80 ? "emerald" : "rose"} sub={percent < 80 ? "Tap to complete" : "Complete"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent applications</h2>
            <Link to="/dashboard/teacher/applications" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : apps.length === 0 ? (
            <EmptyState icon={FileText} title="No applications yet"
              description="Browse open positions and apply to get started."
              action={<Link to="/dashboard/teacher/jobs"><Button>Browse jobs</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {apps.slice(0, 5).map(app => (
                <div key={app.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{app.jobTitle || "Position"}</p>
                    <p className="text-xs text-slate-500">{formatRelative(app.appliedAt)}</p>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">New openings</h2>
            <Link to="/dashboard/teacher/jobs" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No open jobs" description="Check back soon for new listings." />
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <Link key={job.id} to={`/dashboard/teacher/jobs/${job.id}`}
                  className="block bg-white rounded-xl border border-slate-100 p-4 hover:border-indigo-200 hover:shadow-sm transition">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{job.jobType}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{job.schoolName}</p>
                  <p className="text-xs text-emerald-600 font-medium">{formatSalary(job.salary)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
