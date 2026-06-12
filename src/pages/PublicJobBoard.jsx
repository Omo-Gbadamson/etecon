import { useEffect, useState, useMemo } from "react";
import { Search, Briefcase } from "lucide-react";
import { getOpenJobs } from "../firebase/firestore";
import { Navbar } from "../components/layout/Navbar";
import { JobCard } from "../components/jobs/JobCard";
import { Select, SkeletonCard, EmptyState } from "../components/shared";
import { NIGERIAN_STATES, SUBJECTS } from "../utils";

export default function PublicJobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", subject: "", state: "", jobType: "" });

  useEffect(() => {
    getOpenJobs().then(j => { setJobs(j); setLoading(false); });
  }, []);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const filtered = useMemo(() => jobs.filter(j => {
    const q = filters.search.toLowerCase();
    if (q && !j.title.toLowerCase().includes(q) && !j.schoolName.toLowerCase().includes(q)) return false;
    if (filters.subject && j.subject !== filters.subject) return false;
    if (filters.state && j.state !== filters.state) return false;
    if (filters.jobType && j.jobType !== filters.jobType) return false;
    return true;
  }), [jobs, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-indigo-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Teaching Jobs in Nigeria</h1>
          <p className="text-indigo-200 mb-8">Browse {loading ? "..." : jobs.length} open positions across all 36 states</p>
          <div className="bg-white rounded-xl p-3 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2 text-slate-900 text-sm focus:outline-none rounded-lg"
                placeholder="Search jobs, schools, subjects…"
                value={filters.search}
                onChange={e => set("search", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <Select placeholder="Any subject" value={filters.subject} onChange={e => set("subject", e.target.value)} options={SUBJECTS} className="min-w-[150px]" />
          <Select placeholder="Any state" value={filters.state} onChange={e => set("state", e.target.value)} options={NIGERIAN_STATES} className="min-w-[140px]" />
          <Select placeholder="Job type" value={filters.jobType} onChange={e => set("jobType", e.target.value)}
            options={["full-time","part-time","contract","volunteer"].map(t => ({ value: t, label: t }))} className="min-w-[130px]" />
        </div>

        <p className="text-sm text-slate-500 mb-4">{filtered.length} jobs found</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your search or filters." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(job => <JobCard key={job.id} job={job} basePath="/jobs" />)}
          </div>
        )}
      </div>
    </div>
  );
}
