import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Briefcase, Calendar, Users, GraduationCap, DollarSign,
  ArrowLeft, CheckCircle, Clock, Share2, Check
} from "lucide-react";
import { getJob } from "../../firebase/firestore";
import { Navbar } from "../../components/layout/Navbar";
import { Badge, Spinner, Card, Avatar, Button } from "../../components/shared";
import { formatDate, formatSalary, formatRelative } from "../../utils";
import { useAuth } from "../../context/AuthContext";

export default function PublicJobDetail() {
  const { jobId } = useParams();
  const { user, userDoc } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { getJob(jobId).then(j => { setJob(j); setLoading(false); }); }, [jobId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: job.title, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch {
      /* clipboard/share cancelled */
    }
  };

  const handleApply = () => {
    if (user && userDoc?.role === "teacher") navigate(`/dashboard/teacher/jobs/${jobId}`);
    else navigate(`/register?role=teacher`);
  };

  const isExpired = job?.applicationDeadline?.toDate && job.applicationDeadline.toDate() < new Date();

  if (loading) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="flex justify-center py-20"><Spinner /></div></div>;
  if (!job) return <div className="min-h-screen bg-slate-50"><Navbar /><p className="text-center py-20 text-slate-500">Job not found.</p></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> All jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar src={job.schoolLogoURL} name={job.schoolName} size="lg" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{job.title}</h1>
                  <Link to={`/schools/${job.schoolId}`} className="text-slate-600 font-medium hover:text-indigo-600 transition">{job.schoolName}</Link>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.city}, {job.state}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.jobType}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatRelative(job.createdAt)}</span>
                  </div>
                </div>
                <Badge status={job.status} />
              </div>
              <div className="flex gap-3 flex-wrap">
                {job.status === "open" && !isExpired ? (
                  <Button size="lg" onClick={handleApply}>
                    {user && userDoc?.role === "teacher" ? "Apply now" : "Sign up to apply"}
                  </Button>
                ) : (
                  <Button disabled size="lg">{isExpired ? "Deadline passed" : "Closed"}</Button>
                )}
                <Button variant="secondary" size="sm" onClick={handleShare}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share"}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 mb-3">About this role</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </Card>

            {job.requirements?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {job.benefits?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 mb-3">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-slate-900">Job overview</h3>
              <div className="space-y-3 text-sm">
                {[
                  [DollarSign, "Salary", <span className="font-medium text-emerald-600">{formatSalary(job.salary)}</span>],
                  [GraduationCap, "Education", job.educationLevelRequired],
                  [Users, "Experience", `${job.experienceRequired}+ years`],
                  [Calendar, "Deadline", <span className={isExpired ? "text-rose-500 font-medium" : "font-medium"}>{formatDate(job.applicationDeadline)}</span>],
                  [Users, "Applicants", job.applicantsCount || 0],
                ].map(([Icon, label, val], i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5"><Icon className="w-4 h-4" />{label}</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-3">About the school</h3>
              <Link to={`/schools/${job.schoolId}`} className="flex items-center gap-3 hover:opacity-80 transition">
                <Avatar src={job.schoolLogoURL} name={job.schoolName} size="md" />
                <div>
                  <p className="font-medium text-slate-900 hover:text-indigo-600 transition">{job.schoolName}</p>
                  <p className="text-xs text-slate-500">{job.city}, {job.state}</p>
                </div>
              </Link>
            </Card>

            {!user && (
              <Card className="p-5 bg-indigo-50 border-indigo-100">
                <p className="font-semibold text-indigo-900 mb-1">Ready to apply?</p>
                <p className="text-sm text-indigo-700 mb-3">Create a free teacher account to apply in minutes.</p>
                <Button className="w-full" onClick={() => navigate("/register?role=teacher")}>Get started free</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
