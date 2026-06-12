import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../shared";

export function Navbar() {
  const { user, userDoc } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          TeachConnect
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <Link to="/jobs" className="hover:text-indigo-700 transition font-medium">Browse Jobs</Link>
          <Link to="/schools" className="hover:text-indigo-700 transition font-medium">Schools</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user && userDoc ? (
            <Button onClick={() => navigate(`/dashboard/${userDoc.role}`)}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate("/login")}>Sign in</Button>
              <Button onClick={() => navigate("/register")}>Get started</Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-3">
          <Link to="/jobs" className="text-sm font-medium text-slate-700 py-2" onClick={() => setOpen(false)}>Browse Jobs</Link>
          {user && userDoc ? (
            <Button onClick={() => { navigate(`/dashboard/${userDoc.role}`); setOpen(false); }}>Dashboard</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => { navigate("/login"); setOpen(false); }}>Sign in</Button>
              <Button onClick={() => { navigate("/register"); setOpen(false); }}>Get started</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
