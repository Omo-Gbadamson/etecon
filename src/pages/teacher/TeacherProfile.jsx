import { useEffect, useState } from "react";
import { Camera, Save, Plus, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getTeacherProfile, setTeacherProfile, updateUserDoc } from "../../firebase/firestore";
import { uploadAvatar, uploadCV } from "../../firebase/storage";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button, Input, Textarea, Select, Card, Avatar, Spinner } from "../../components/shared";
import { NIGERIAN_STATES, SUBJECTS, SCHOOL_TYPES } from "../../utils";
import { toast } from "sonner";

const EDU_LEVELS = ["NCE", "BSc", "MSc", "PhD", "PGDE", "Other"];
const AVAILABILITY = [
  { value: "immediately", label: "Available immediately" },
  { value: "1_month", label: "Available in 1 month" },
  { value: "3_months", label: "Available in 3 months" },
  { value: "not_available", label: "Not currently available" },
];

export default function TeacherProfile() {
  const { user, refreshUserDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  const defaults = {
    fullName: "", headline: "", bio: "", subjects: [],
    educationLevel: "BSc", yearsOfExperience: 0, city: "", state: "",
    country: "Nigeria", availability: "immediately", preferredSchoolTypes: [],
    skills: [], certifications: [], isProfilePublic: true, photoURL: null, cvURL: null,
  };

  useEffect(() => {
    if (!user) return;
    getTeacherProfile(user.uid).then(p => {
      setProfile(p ? { ...defaults, ...p } : { ...defaults, fullName: user.displayName || "" });
      setLoading(false);
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const toggleArr = (k, val) => setProfile(p => ({
    ...p, [k]: p[k].includes(val) ? p[k].filter(x => x !== val) : [...p[k], val]
  }));
  const addTag = (k, val, clear) => {
    if (!val.trim()) return;
    setProfile(p => ({ ...p, [k]: [...(p[k] || []), val.trim()] }));
    clear("");
  };
  const removeTag = (k, i) => setProfile(p => ({ ...p, [k]: p[k].filter((_, idx) => idx !== i) }));

  const handleAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(user.uid, file);
      set("photoURL", url);
      toast.success("Photo updated");
    } catch (err) { toast.error(err.message); }
    finally { setAvatarUploading(false); }
  };

  const handleCV = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setCvUploading(true);
    try {
      const url = await uploadCV(user.uid, file);
      set("cvURL", url);
      toast.success("CV uploaded");
    } catch (err) { toast.error(err.message); }
    finally { setCvUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setTeacherProfile(user.uid, profile);
      await updateUserDoc(user.uid, { profileComplete: true, displayName: profile.fullName, photoURL: profile.photoURL });
      await refreshUserDoc();
      toast.success("Profile saved!");
    } catch { toast.error("Failed to save. Try again."); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Save changes</Button>
        </div>

        {/* Avatar */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar src={profile.photoURL} name={profile.fullName} size="xl" />
              {avatarUploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full"><Spinner className="w-5 h-5 border-white border-t-transparent" /></div>}
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Profile photo</p>
              <p className="text-sm text-slate-500 mb-3">JPG or PNG, max 2MB</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/jpeg,image/png" onChange={handleAvatar} className="hidden" />
                <Button variant="secondary" size="sm" as="span"><Camera className="w-4 h-4" /> Upload photo</Button>
              </label>
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card className="p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Basic information</h2>
          <Input label="Full name" value={profile.fullName} onChange={e => set("fullName", e.target.value)} />
          <Input label="Professional headline" placeholder="e.g. Mathematics Teacher with 5 years of experience"
            value={profile.headline} onChange={e => set("headline", e.target.value)} />
          <Textarea label="Bio / About me" rows={4} placeholder="Tell schools about your teaching philosophy and experience..."
            value={profile.bio} onChange={e => set("bio", e.target.value)} />
        </Card>

        {/* Qualifications */}
        <Card className="p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Qualifications</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Highest education level" value={profile.educationLevel}
              onChange={e => set("educationLevel", e.target.value)}
              options={EDU_LEVELS.map(l => ({ value: l, label: l }))} />
            <Input label="Years of experience" type="number" min={0} max={50}
              value={profile.yearsOfExperience} onChange={e => set("yearsOfExperience", Number(e.target.value))} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Subjects you teach</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUBJECTS.slice(0, 20).map(s => (
                <button key={s} type="button" onClick={() => toggleArr("subjects", s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${profile.subjects?.includes(s)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* CV Upload */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">CV / Resume</p>
            {profile.cvURL && (
              <a href={profile.cvURL} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline block mb-2">
                View current CV →
              </a>
            )}
            <label className="cursor-pointer">
              <input type="file" accept="application/pdf" onChange={handleCV} className="hidden" />
              <Button variant="secondary" size="sm" as="span" loading={cvUploading}>
                {cvUploading ? "Uploading…" : "Upload PDF (max 5MB)"}
              </Button>
            </label>
          </div>

          {/* Skills */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.skills?.map((s, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {s} <button onClick={() => removeTag("skills", i)} className="text-slate-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add a skill (e.g. Lesson planning)" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("skills", skillInput, setSkillInput))} />
              <Button variant="secondary" size="sm" onClick={() => addTag("skills", skillInput, setSkillInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Certifications</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.certifications?.map((c, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                  {c} <button onClick={() => removeTag("certifications", i)} className="text-emerald-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="e.g. TRCN Certificate" value={certInput}
                onChange={e => setCertInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("certifications", certInput, setCertInput))} />
              <Button variant="secondary" size="sm" onClick={() => addTag("certifications", certInput, setCertInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Location & availability */}
        <Card className="p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Location & availability</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={profile.city} onChange={e => set("city", e.target.value)} />
            <Select label="State" value={profile.state} onChange={e => set("state", e.target.value)}
              options={NIGERIAN_STATES} placeholder="Select state" />
          </div>
          <Select label="Availability" value={profile.availability}
            onChange={e => set("availability", e.target.value)} options={AVAILABILITY} />

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Preferred school types</p>
            <div className="flex flex-wrap gap-2">
              {SCHOOL_TYPES.map(t => (
                <button key={t} type="button" onClick={() => toggleArr("preferredSchoolTypes", t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${profile.preferredSchoolTypes?.includes(t)
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={profile.isProfilePublic}
              onChange={e => set("isProfilePublic", e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600" />
            <div>
              <p className="text-sm font-medium text-slate-700">Make profile public</p>
              <p className="text-xs text-slate-500">Schools can discover and view your profile</p>
            </div>
          </label>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg"><Save className="w-4 h-4" /> Save profile</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
