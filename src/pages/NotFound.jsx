import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "../components/shared";

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center p-4">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-6xl font-extrabold text-slate-900 mb-3">404</h1>
        <p className="text-xl font-semibold text-slate-700 mb-2">Page not found</p>
        <p className="text-slate-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/"><Button size="lg">Go home</Button></Link>
      </div>
    </div>
  );
}
