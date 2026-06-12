import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useJobs } from "../../hooks/useJobs";
import { useSavedJobs } from "../../hooks/useSavedJobs";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { JobCard } from "../../components/jobs/JobCard";
import { Input, Select, SkeletonCard, EmptyState, Button } from "../../components/shared";
import { NIGERIAN_STATES, SUBJECTS } from "../../utils";
import { Briefcase } from "lucide-react";

const JOB_TYPES = ["full-time", "part-time", "contract", "volunteer"];
const EDU_LEVELS = ["NCE", "BSc", "MSc", "PhD", "PGDE", "Other"];

export default function BrowseJobs() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "", subject: "", jobType: "", state: "",
    educationLevel: "", minExp: 0, minSalary: "",
  });

  const { jobs, allJobs, loading } = useJobs(filters);
  const { toggleSave, isSaved } = useSavedJobs();
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const activeFilterCount = [filters.subject, filters.jobType, filters.state, filters.educationLevel, filters.minExp, filters.minSalary].filter(Boolean).length;
  const clearFilters = () => setFilters({ search: "", subject: "", jobType: "", state: "", educationLevel: "", minExp: 0, minSalary: "" });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Jobs</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loading ? "Loading…" : `${jobs.length} open positions${allJobs.length !== jobs.length ? ` (filtered from ${allJobs.length})` : ""}`}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by title, school, or subject…"
              value={filters.search}
              onChange={e => set("search", e.target.value)}
            />
          </div>
          <Button variant={showFilters ? "primary" : "secondary"} onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <Select placeholder="Any subject" value={filters.subject} onChange={e => set("subject", e.target.value)} options={SUBJECTS} />
            <Select placeholder="Any job type" value={filters.jobType} onChange={e => set("jobType", e.target.value)}
              options={JOB_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} />
            <Select placeholder="Any state" value={filters.state} onChange={e => set("state", e.target.value)} options={NIGERIAN_STATES} />
            <Select placeholder="Any education level" value={filters.educationLevel} onChange={e => set("educationLevel", e.target.value)}
              options={EDU_LEVELS.map(l => ({ value: l, label: l }))} />
            <Select placeholder="Min experience" value={filters.minExp} onChange={e => set("minExp", e.target.value)}
              options={[1, 2, 3, 5, 10].map(n => ({ value: n, label: `${n}+ years` }))} />
            <Input placeholder="Min salary (₦)" type="number" value={filters.minSalary}
              onChange={e => set("minSalary", e.target.value)} />
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50 flex-wrap">
            <span className="text-xs text-slate-500">Active filters:</span>
            {filters.subject && <Chip label={filters.subject} onRemove={() => set("subject", "")} />}
            {filters.jobType && <Chip label={filters.jobType} onRemove={() => set("jobType", "")} />}
            {filters.state && <Chip label={filters.state} onRemove={() => set("state", "")} />}
            {filters.educationLevel && <Chip label={filters.educationLevel} onRemove={() => set("educationLevel", "")} />}
            {filters.minExp > 0 && <Chip label={`${filters.minExp}+ yrs`} onRemove={() => set("minExp", 0)} />}
            {filters.minSalary && <Chip label={`₦${Number(filters.minSalary).toLocaleString()}+`} onRemove={() => set("minSalary", "")} />}
            <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline ml-auto flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found"
          description="Try adjusting your filters or check back later for new listings."
          action={activeFilterCount > 0 && <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} basePath="/dashboard/teacher/jobs"
              onSave={toggleSave} isSaved={isSaved(job.id)} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
    </span>
  );
}
