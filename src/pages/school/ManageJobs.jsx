import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Briefcase, Trash2, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSchoolJobs, deleteJob, updateJob } from "../../firebase/firestore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button, Badge, EmptyState, SkeletonCard, ConfirmDialog, Select } from "../../components/shared";
import { formatDate, formatRelative } from "../../utils";
import { toast } from "sonner";

export default function ManageJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToSchoolJobs(user.uid, (data) => {
      setJobs(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteJob(deleteId);
      setDeleteId(null);
      toast.success("Job deleted.");
    } catch { toast.error("Failed to delete."); }
    finally { setDeleting(false); }
  };

  const handleStatusChange = async (jobId, status) => {
    try {
      await updateJob(jobId, { status });
      toast.success(`Job marked as ${status}.`);
    } catch { toast.error("Failed to update."); }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Jobs</h1>
        <Link to="/dashboard/school/jobs/new">
          <Button><PlusCircle className="w-4 h-4" /> Post a job</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs posted yet"
          description="Post your first vacancy to start receiving applications."
          action={<Link to="/dashboard/school/jobs/new"><Button><PlusCircle className="w-4 h-4" /> Post a job</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <Badge status={job.status} />
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    {job.subject} · {job.city}, {job.state} · {job.applicantsCount || 0} applicants · Deadline: {formatDate(job.applicationDeadline)}
                  </p>
                  <p className="text-xs text-slate-400">Posted {formatRelative(job.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <Select
                    value={job.status}
                    onChange={e => handleStatusChange(job.id, e.target.value)}
                    options={[
                      { value: "open", label: "Open" },
                      { value: "closed", label: "Closed" },
                      { value: "filled", label: "Filled" },
                    ]}
                    className="text-xs py-1.5"
                  />
                  <Link to={`/dashboard/school/jobs/${job.id}`}>
                    <Button variant="secondary" size="sm"><Eye className="w-4 h-4" /> View</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(job.id)}
                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete job listing"
        message="Are you sure you want to delete this job? All associated applications will still exist but this listing will be removed. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </DashboardLayout>
  );
}
