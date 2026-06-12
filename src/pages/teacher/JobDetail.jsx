import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Briefcase, Calendar, Users, GraduationCap, DollarSign,
  ArrowLeft, CheckCircle, Clock, Share2, Check
} from "lucide-react";
import { getJob, applyToJob, checkAlreadyApplied, getTeacherProfile } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button, Badge, Modal, Textarea, Spinner, Card, Avatar } from "../../components/shared";
import { formatDate, formatSalary, formatRelative } from "../../utils";
import { toast } from "sonner";

export default function JobDetail() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      getJob(jobId),
      user ? checkAlreadyApplied(user.uid, jobId) : false,
      user ? getTeacherProfile(user.uid) : null,
    ]).then(([j, applied, tp]) => {
      setJob(j); setAlreadyApplied(applied); setTeacherProfile(tp); setLoading(false);
    });
  }, [jobId, user]);

  const handleApply = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await applyToJob(jobId, user.uid, job.schoolId, {
        jobTitle: job.title,
        teacherName: teacherProfile?.fullName || user.displayName,
        teacherPhotoURL: teacherProfile?.photoURL || null,
        coverLetter,
        cvURL: teacherProfile?.cvURL || null,
      });
      setAlreadyApplied(true);
      setApplyOpen(false);
      toast.success("Application submitted! Good luck 🎉");
    } catch { toast.error("Failed to submit. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/jobs/${jobId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: `${job.title} at ${job.schoolName}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Job link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* clipboard/share cancelled */
    }
  };

  const isExpired = job?.applicationDeadline?.toDate && job.applicationDeadline.toDate() < new Date();

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner /></div></DashboardLayout>;
  if (!job) return <DashboardLayout><p className="text-center py-20 text-slate-500">Job not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <Link to="/dashboard/teacher/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar src={job.schoolLogoURL} name={job.schoolName} size="lg" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{job.title}</h1>
                <p className="text-slate-600 font-medium">{job.schoolName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.city}, {job.state}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.jobType}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Posted {formatRelative(job.createdAt)}</span>
                </div>
              </div>
              <Badge status={job.status} />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {alreadyApplied ? (
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle className="w-5 h-5" /> Application submitted
                </div>
              ) : job.status !== "open" || isExpired ? (
                <Button disabled>{isExpired ? "Deadline passed" : "Position closed"}</Button>
              ) : (
                <Button onClick={() => setApplyOpen(true)} size="lg">Apply now</Button>
              )}
              <Button variant="secondary" size="sm" onClick={handleShare}>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share job"}
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
              <Row icon={DollarSign} label="Salary" value={<span className="font-medium text-emerald-600">{formatSalary(job.salary)}</span>} />
              <Row icon={GraduationCap} label="Education" value={job.educationLevelRequired} />
              <Row icon={Users} label="Experience" value={`${job.experienceRequired}+ years`} />
              <Row icon={Calendar} label="Deadline" value={
                <span className={isExpired ? "text-rose-500 font-medium" : "font-medium"}>{formatDate(job.applicationDeadline)}</span>
              } />
              <Row icon={Users} label="Applicants" value={job.applicantsCount || 0} />
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

          {/* Share card */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-2">Share this job</h3>
            <p className="text-sm text-slate-500 mb-3">Know someone who'd be a great fit?</p>
            <Button variant="secondary" className="w-full" onClick={handleShare}>
              <Share2 className="w-4 h-4" /> Copy job link
            </Button>
          </Card>
        </div>
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply — ${job.title}`}>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            <p className="font-medium">{job.schoolName}</p>
            <p>{job.city}, {job.state} · {job.jobType}</p>
          </div>
          <Textarea label="Cover letter" rows={6}
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
          {teacherProfile?.cvURL ? (
            <p className="text-sm text-slate-500">Your CV (<a href={teacherProfile.cvURL} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">view</a>) will be attached automatically.</p>
          ) : (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              No CV on file. <Link to="/dashboard/teacher/profile" className="underline">Add one to your profile</Link> to strengthen your application.
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setApplyOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleApply} loading={submitting} className="flex-1">Submit application</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 flex items-center gap-1.5"><Icon className="w-4 h-4" />{label}</span>
      <span>{value}</span>
    </div>
  );
}
