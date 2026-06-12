import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getSchoolProfile, createJob } from "../../firebase/firestore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button, Input, Textarea, Select, Card } from "../../components/shared";
import { NIGERIAN_STATES, SUBJECTS } from "../../utils";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Timestamp } from "firebase/firestore";

const JOB_TYPES = ["full-time", "part-time", "contract", "volunteer"];
const EDU_LEVELS = ["NCE", "BSc", "MSc", "PhD", "PGDE", "Other"];

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [reqInput, setReqInput] = useState("");
  const [benInput, setBenInput] = useState("");

  const [form, setForm] = useState({
    title: "", subject: "", jobType: "full-time", educationLevelRequired: "BSc",
    experienceRequired: 0, description: "", requirements: [], benefits: [],
    city: "", state: "", country: "Nigeria",
    salary: { min: "", max: "", currency: "NGN", negotiable: false },
    applicationDeadline: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSalary = (k, v) => setForm(f => ({ ...f, salary: { ...f.salary, [k]: v } }));

  const addItem = (field, val, clear) => {
    if (!val.trim()) return;
    setForm(f => ({ ...f, [field]: [...f[field], val.trim()] }));
    clear("");
  };
  const removeItem = (field, i) => setForm(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject || !form.city.trim() || !form.state) {
      return toast.error("Please fill in all required fields.");
    }
    setSaving(true);
    try {
      const school = await getSchoolProfile(user.uid);
      const deadline = form.applicationDeadline
        ? Timestamp.fromDate(new Date(form.applicationDeadline))
        : Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      await createJob(user.uid, {
        ...form,
        schoolName: school?.schoolName || user.displayName,
        schoolLogoURL: school?.logoURL || null,
        salary: {
          min: form.salary.min ? Number(form.salary.min) : null,
          max: form.salary.max ? Number(form.salary.max) : null,
          currency: "NGN",
          negotiable: form.salary.negotiable,
        },
        applicationDeadline: deadline,
        experienceRequired: Number(form.experienceRequired),
      });
      toast.success("Job posted successfully!");
      navigate("/dashboard/school/jobs");
    } catch {
      toast.error("Failed to post job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Role details</h2>
            <Input label="Job title *" placeholder="e.g. Senior Mathematics Teacher"
              value={form.title} onChange={e => set("title", e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Subject *" value={form.subject} onChange={e => set("subject", e.target.value)}
                options={SUBJECTS} placeholder="Select subject" />
              <Select label="Job type *" value={form.jobType} onChange={e => set("jobType", e.target.value)}
                options={JOB_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Min. education level" value={form.educationLevelRequired}
                onChange={e => set("educationLevelRequired", e.target.value)}
                options={EDU_LEVELS.map(l => ({ value: l, label: l }))} />
              <Input label="Min. years of experience" type="number" min={0} max={50}
                value={form.experienceRequired} onChange={e => set("experienceRequired", e.target.value)} />
            </div>
            <Textarea label="Job description *" rows={6}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              value={form.description} onChange={e => set("description", e.target.value)} />
          </Card>

          {/* Requirements */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Requirements</h2>
            <div className="space-y-2">
              {form.requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-2 rounded-lg">
                  <span className="flex-1">{r}</span>
                  <button type="button" onClick={() => removeItem("requirements", i)} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add a requirement" value={reqInput} onChange={e => setReqInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem("requirements", reqInput, setReqInput))} />
              <Button type="button" variant="secondary" size="sm" onClick={() => addItem("requirements", reqInput, setReqInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Benefits */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Benefits (optional)</h2>
            <div className="space-y-2">
              {form.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-emerald-50 px-3 py-2 rounded-lg">
                  <span className="flex-1">{b}</span>
                  <button type="button" onClick={() => removeItem("benefits", i)} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="e.g. Housing allowance, HMO, Transport" value={benInput}
                onChange={e => setBenInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem("benefits", benInput, setBenInput))} />
              <Button type="button" variant="secondary" size="sm" onClick={() => addItem("benefits", benInput, setBenInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Compensation */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Compensation</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min salary (₦/month)" type="number" placeholder="e.g. 80000"
                value={form.salary.min} onChange={e => setSalary("min", e.target.value)} />
              <Input label="Max salary (₦/month)" type="number" placeholder="e.g. 150000"
                value={form.salary.max} onChange={e => setSalary("max", e.target.value)} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.salary.negotiable}
                onChange={e => setSalary("negotiable", e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600" />
              <span className="text-sm text-slate-700">Salary is negotiable</span>
            </label>
          </Card>

          {/* Location & deadline */}
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Location & deadline</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="City *" value={form.city} onChange={e => set("city", e.target.value)} />
              <Select label="State *" value={form.state} onChange={e => set("state", e.target.value)}
                options={NIGERIAN_STATES} placeholder="Select state" />
            </div>
            <Input label="Application deadline" type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.applicationDeadline} onChange={e => set("applicationDeadline", e.target.value)} />
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate("/dashboard/school/jobs")}>Cancel</Button>
            <Button type="submit" loading={saving} size="lg">Post job</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
