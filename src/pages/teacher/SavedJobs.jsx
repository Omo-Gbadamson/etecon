import { BookmarkIcon, BookmarkX } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { EmptyState, Button, SkeletonCard } from "../../components/shared";
import { JobCard } from "../../components/jobs/JobCard";
import { useSavedJobs } from "../../hooks/useSavedJobs";

export default function SavedJobs() {
  const { savedJobs, loading, toggleSave } = useSavedJobs();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
        <p className="text-slate-500 text-sm mt-1">{loading ? "Loading..." : `${savedJobs.length} saved positions`}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={BookmarkIcon}
          title="No saved jobs yet"
          description="Bookmark jobs you're interested in so you can find them easily later."
          action={<Link to="/dashboard/teacher/jobs"><Button>Browse open jobs</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs.map(job => (
            <div key={job.id} className="relative">
              <JobCard job={job} basePath="/dashboard/teacher/jobs" />
              <button
                onClick={() => toggleSave(job.id)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 text-rose-500 hover:bg-rose-50 transition"
                title="Remove from saved"
              >
                <BookmarkX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
