import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, Users, Star, ArrowRight, CheckCircle, School, BookOpen } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/shared";

const stats = [
  { label: "Schools registered", value: "500+" },
  { label: "Teaching positions filled", value: "2,000+" },
  { label: "Qualified teachers", value: "8,000+" },
  { label: "Nigerian states covered", value: "36" },
];

const features = [
  { icon: Briefcase, title: "Post & find jobs fast", desc: "Schools post vacancies in minutes. Teachers apply the same day. No middlemen, no delays." },
  { icon: Users, title: "Verified teacher profiles", desc: "Detailed profiles with qualifications, subjects, and experience — so schools hire with confidence." },
  { icon: Star, title: "Real-time application tracking", desc: "Teachers see every status update instantly. Schools manage applicants in one clean dashboard." },
];

const schoolTypes = ["Government Primary", "Government Secondary", "Private Secondary", "Federal University", "State University", "Polytechnic"];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Nigeria's #1 teacher employment platform
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Where schools find<br />
            <span className="text-amber-400">great teachers</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
            TeachConnect connects qualified teachers across all 36 Nigerian states with schools that need them — from primary schools in Lagos to universities in Kano.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="amber" onClick={() => navigate("/register?role=teacher")} className="text-base">
              I'm a teacher <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/register?role=school")} className="text-base bg-white/10 text-white border-white/30 hover:bg-white/20">
              I represent a school <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-indigo-700">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Built for Nigerian education</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Everything teachers and schools need, designed for how hiring actually works in Nigeria.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(f => (
            <div key={f.title} className="text-center p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Teachers */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">For teachers</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Your next classroom is one application away</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">Create a professional profile that schools can discover. Browse positions filtered by subject, location, and school type. Apply with a cover letter and track every application in real time.</p>
            <ul className="space-y-3 mb-8">
              {["Free to sign up and apply", "Profile visible to 500+ schools", "Real-time status updates", "Supports all qualification levels (NCE to PhD)"].map(i => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
            <Button size="lg" onClick={() => navigate("/register?role=teacher")}>Create teacher profile</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Mathematics", "English Language", "Physics", "Computer Science", "Biology", "Economics"].map((subj, i) => (
              <div key={subj} className={`p-4 rounded-xl border ${i % 3 === 0 ? "bg-indigo-700 border-indigo-600 text-white" : "bg-white border-slate-100 text-slate-700"}`}>
                <BookOpen className={`w-5 h-5 mb-2 ${i % 3 === 0 ? "text-amber-400" : "text-indigo-400"}`} />
                <p className="text-sm font-medium">{subj}</p>
                <p className={`text-xs mt-1 ${i % 3 === 0 ? "text-indigo-200" : "text-slate-400"}`}>High demand</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Schools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 grid grid-cols-1 gap-3">
          {schoolTypes.map((type, i) => (
            <div key={type} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${["bg-indigo-50","bg-amber-50","bg-emerald-50","bg-rose-50","bg-blue-50","bg-purple-50"][i % 6]}`}>
                <School className={`w-4 h-4 ${["text-indigo-600","text-amber-600","text-emerald-600","text-rose-600","text-blue-600","text-purple-600"][i % 6]}`} />
              </div>
              <span className="text-sm font-medium text-slate-700">{type}</span>
            </div>
          ))}
        </div>
        <div className="order-1 md:order-2">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">For schools</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Post a vacancy, find qualified teachers</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">Post detailed job listings, browse teacher profiles directly, and manage the full hiring pipeline — from application to hired — all in one dashboard.</p>
          <ul className="space-y-3 mb-8">
            {["Post unlimited job vacancies", "Browse 8,000+ teacher profiles", "Filter by subject, qualification, experience", "Track applicants through your pipeline"].map(i => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                {i}
              </li>
            ))}
          </ul>
          <Button size="lg" variant="amber" onClick={() => navigate("/register?role=school")}>Register your school</Button>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">Join thousands of teachers and hundreds of schools already using TeachConnect across Nigeria.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="amber" onClick={() => navigate("/register?role=teacher")}>Join as a teacher</Button>
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50" onClick={() => navigate("/register?role=school")}>Register school</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <GraduationCap className="w-5 h-5 text-indigo-700" /> TeachConnect
          </div>
          <p>© {new Date().getFullYear()} TeachConnect. Connecting educators across Nigeria.</p>
          <div className="flex gap-4">
            <Link to="/jobs" className="hover:text-indigo-700">Browse Jobs</Link>
            <Link to="/login" className="hover:text-indigo-700">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
