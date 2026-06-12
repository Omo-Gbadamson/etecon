import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, School, User, ArrowLeft } from "lucide-react";
import { registerWithEmail, loginWithGoogle } from "../firebase/auth";
import { Button, Input, Card } from "../components/shared";
import { toast } from "sonner";

function RolePicker({ onSelect }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">I am joining as a…</h2>
      <button onClick={() => onSelect("teacher")}
        className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition">
          <User className="w-6 h-6 text-indigo-700" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Teacher</p>
          <p className="text-sm text-slate-500">Find teaching positions and build your profile</p>
        </div>
      </button>
      <button onClick={() => onSelect("school")}
        className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all group text-left">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition">
          <School className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">School</p>
          <p className="text-sm text-slate-500">Post vacancies and find qualified teachers</p>
        </div>
      </button>
    </div>
  );
}

function RegisterForm({ role, onBack }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.displayName.trim()) e.displayName = role === "school" ? "School name is required" : "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.displayName, role);
      toast.success("Account created! Let's set up your profile.");
      navigate(`/dashboard/${role}/profile`);
    } catch (err) {
      toast.error(err.code === "auth/email-already-in-use" ? "Email already in use." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(role);
      navigate(`/dashboard/${role}/profile`);
    } catch {
      toast.error("Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const label = role === "school" ? "School" : "Teacher";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900">Create {label} account</h2>
      </div>

      <Input
        label={role === "school" ? "School name" : "Full name"}
        placeholder={role === "school" ? "Greenfield Academy" : "Adaeze Okonkwo"}
        value={form.displayName}
        onChange={e => set("displayName", e.target.value)}
        error={errors.displayName}
      />
      <Input
        label="Email address"
        type="email"
        placeholder="you@school.edu.ng"
        value={form.email}
        onChange={e => set("email", e.target.value)}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        value={form.password}
        onChange={e => set("password", e.target.value)}
        error={errors.password}
      />
      <Input
        label="Confirm password"
        type="password"
        placeholder="Repeat password"
        value={form.confirmPassword}
        onChange={e => set("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
      />

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Create account
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative text-center text-xs text-slate-400 bg-white px-3 mx-auto w-fit">or</div>
      </div>

      <Button type="button" variant="secondary" className="w-full" size="lg" onClick={handleGoogle} loading={googleLoading}>
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Continue with Google
      </Button>
    </form>
  );
}

export default function Register() {
  const [params] = useSearchParams();
  const initRole = params.get("role");
  const [role, setRole] = useState(initRole || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            TeachConnect
          </Link>
          <p className="text-slate-500 text-sm mt-2">Create your free account</p>
        </div>

        <Card className="p-8">
          {role ? (
            <RegisterForm role={role} onBack={() => setRole(null)} />
          ) : (
            <RolePicker onSelect={setRole} />
          )}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
