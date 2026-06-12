import { useEffect, useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { getPublicTeachers } from "../../firebase/firestore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { TeacherCard } from "../../components/teachers/TeacherCard";
import { Select, SkeletonCard, EmptyState } from "../../components/shared";
import { NIGERIAN_STATES, SUBJECTS } from "../../utils";

const AVAIL_OPTIONS = [
  { value: "immediately", label: "Available now" },
  { value: "1_month", label: "In 1 month" },
  { value: "3_months", label: "In 3 months" },
];

export default function BrowseTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", subject: "", state: "", availability: "", educationLevel: "" });

  useEffect(() => {
    getPublicTeachers().then(t => { setTeachers(t); setLoading(false); });
  }, []);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const EDU_LEVELS = ["NCE", "BSc", "MSc", "PhD", "PGDE", "Other"];

  const filtered = useMemo(() => teachers.filter(t => {
    const q = filters.search.toLowerCase();
    if (q && !t.fullName?.toLowerCase().includes(q) && !t.headline?.toLowerCase().includes(q) && !t.bio?.toLowerCase().includes(q)) return false;
    if (filters.subject && !t.subjects?.includes(filters.subject)) return false;
    if (filters.state && t.state !== filters.state) return false;
    if (filters.availability && t.availability !== filters.availability) return false;
    if (filters.educationLevel && t.educationLevel !== filters.educationLevel) return false;
    return true;
  }), [teachers, filters]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Teachers</h1>
        <p className="text-slate-500 text-sm mt-1">{loading ? "Loading…" : `${filtered.length} teachers available`}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by name, headline, or bio…"
            value={filters.search}
            onChange={e => set("search", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select placeholder="Any subject" value={filters.subject} onChange={e => set("subject", e.target.value)} options={SUBJECTS} />
          <Select placeholder="Any state" value={filters.state} onChange={e => set("state", e.target.value)} options={NIGERIAN_STATES} />
          <Select placeholder="Any availability" value={filters.availability} onChange={e => set("availability", e.target.value)} options={AVAIL_OPTIONS} />
          <Select placeholder="Any education" value={filters.educationLevel} onChange={e => set("educationLevel", e.target.value)}
            options={EDU_LEVELS.map(l => ({ value: l, label: l }))} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No teachers found"
          description="Try adjusting your filters or check back as more teachers join TeachConnect." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => <TeacherCard key={t.id} teacher={t} showEndorse />)}
        </div>
      )}
    </DashboardLayout>
  );
}
