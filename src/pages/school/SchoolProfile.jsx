import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSchoolProfile, setSchoolProfile, updateUserDoc } from "../../firebase/firestore";
import { uploadAvatar } from "../../firebase/storage";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button, Input, Textarea, Select, Card, Avatar, Spinner } from "../../components/shared";
import { NIGERIAN_STATES, SCHOOL_TYPES } from "../../utils";
import { toast } from "sonner";

export default function SchoolProfile() {
  const { user, refreshUserDoc } = useAuth();
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const defaults = {
    schoolName: "", address: "", city: "", state: "", country: "Nigeria",
    schoolType: "Government Secondary", description: "", website: "", contactEmail: "",
    contactPhone: "", logoURL: null, verifiedStatus: false,
  };

  useEffect(() => {
    if (!user) return;
    getSchoolProfile(user.uid).then(p => {
      setProfileState(p ? { ...defaults, ...p } : { ...defaults, schoolName: user.displayName || "" });
      setLoading(false);
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setProfileState(p => ({ ...p, [k]: v }));

  const handleLogo = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadAvatar(user.uid, file);
      set("logoURL", url);
      toast.success("Logo updated");
    } catch (err) { toast.error(err.message); }
    finally { setLogoUploading(false); }
  };

  const handleSave = async () => {
    if (!profile.schoolName.trim()) return toast.error("School name is required");
    setSaving(true);
    try {
      await setSchoolProfile(user.uid, profile);
      await updateUserDoc(user.uid, { profileComplete: true, displayName: profile.schoolName, photoURL: profile.logoURL });
      await refreshUserDoc();
      toast.success("School profile saved!");
    } catch { toast.error("Failed to save. Try again."); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">School Profile</h1>
          <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Save changes</Button>
        </div>

        {/* Logo */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar src={profile.logoURL} name={profile.schoolName} size="xl" />
              {logoUploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full"><Spinner className="w-5 h-5 border-white border-t-transparent" /></div>}
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">School logo</p>
              <p className="text-sm text-slate-500 mb-3">JPG or PNG, max 2MB</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/jpeg,image/png" onChange={handleLogo} className="hidden" />
                <Button variant="secondary" size="sm" as="span"><Camera className="w-4 h-4" /> Upload logo</Button>
              </label>
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card className="p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-slate-900">School information</h2>
          <Input label="School name" value={profile.schoolName} onChange={e => set("schoolName", e.target.value)} />
          <Select label="School type" value={profile.schoolType} onChange={e => set("schoolType", e.target.value)}
            options={SCHOOL_TYPES} />
          <Textarea label="About the school" rows={4} placeholder="Describe your school, its mission, values, and what makes it a great place to teach..."
            value={profile.description} onChange={e => set("description", e.target.value)} />
          <Input label="Website (optional)" type="url" placeholder="https://www.yourschool.edu.ng"
            value={profile.website} onChange={e => set("website", e.target.value)} />
        </Card>

        {/* Contact */}
        <Card className="p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Contact information</h2>
          <Input label="Contact email" type="email" value={profile.contactEmail}
            onChange={e => set("contactEmail", e.target.value)} />
          <Input label="Contact phone" type="tel" placeholder="+234 801 234 5678"
            value={profile.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
          <Input label="Address" value={profile.address} onChange={e => set("address", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={profile.city} onChange={e => set("city", e.target.value)} />
            <Select label="State" value={profile.state} onChange={e => set("state", e.target.value)}
              options={NIGERIAN_STATES} placeholder="Select state" />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg"><Save className="w-4 h-4" /> Save profile</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
