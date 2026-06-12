import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { loginWithEmail, loginWithGoogle } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Card } from "../components/shared";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { userDoc } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const redirect = (role) => navigate(`/dashboard/${role}`, { replace: true });

  const handleEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // AuthContext will update; redirect via effect
    } catch (err) {
      setError(err.code === "auth/invalid-credential" ? "Invalid email or password." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Redirect after auth state updates
  if (userDoc) redirect(userDoc.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            TeachConnect
          </Link>
          <p className="text-slate-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleEmail} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-rose-500 bg-rose-50 rounded-lg p-3">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative text-center text-xs text-slate-400 bg-white px-3 mx-auto w-fit">or continue with</div>
          </div>

          <Button variant="secondary" className="w-full" size="lg" onClick={handleGoogle} loading={googleLoading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">Create one</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
