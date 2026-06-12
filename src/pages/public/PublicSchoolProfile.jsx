import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Globe, Phone, Mail, ArrowLeft, Briefcase, CheckCircle } from "lucide-react";
import { getSchoolProfile, getSchoolJobs } from "../../firebase/firestore";
import { Navbar } from "../../components/layout/Navbar";
import { Avatar, Spinner, Card, Button } from "../../components/shared";
import { JobCard } from "../../components/jobs/JobCard";
import { formatDate } from "../../utils";

export default function PublicSchoolProfile() {
  const { schoolId } = useParams();
  const [school, setSchool] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSchoolProfile(schoolId), getSchoolJobs(schoolId)]).then(([s, j]) => {
      setSchool(s);
      setJobs(j.filter(job => job.status === "open"));
      setLoading(false);
    });
  }, [schoolId]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="flex justify-center py-20"><Spinner /></div>
    </div>
  );

  if (!school) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="max-w-lg mx-auto text-center py-24 px-4">
        <p className="text-slate-500">School profile not found.</p>
        <Link to="/jobs"><Button className="mt-4">Browse jobs</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-white mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> Browse jobs
          </Link>
          <div className="flex items-start gap-5">
            <Avatar src={school.logoURL} name={school.schoolName} size="xl"
              className="border-4 border-white/20 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold">{school.schoolName}</h1>
                {school.verifiedStatus && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-full font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-indigo-200 text-sm mb-2">{school.schoolType}</p>
              <div className="flex items-center gap-1 text-sm text-indigo-300">
                <MapPin className="w-4 h-4" />{school.city}, {school.state}, {school.country}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-slate-900">Contact</h3>
            {school.contactEmail && (
              <a href={`mailto:${school.contactEmail}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition">
                <Mail className="w-4 h-4 text-slate-400" />{school.contactEmail}
              </a>
            )}
            {school.contactPhone && (
              <a href={`tel:${school.contactPhone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition">
                <Phone className="w-4 h-4 text-slate-400" />{school.contactPhone}
              </a>
            )}
            {school.website && (
              <a href={school.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                <Globe className="w-4 h-4" />Visit website
              </a>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-2">Address</h3>
            <p className="text-sm text-slate-600">{school.address}</p>
            <p className="text-sm text-slate-600">{school.city}, {school.state}</p>
            <p className="text-sm text-slate-500">{school.country}</p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              {jobs.length} open {jobs.length === 1 ? "position" : "positions"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Member since {formatDate(school.createdAt)}</p>
          </Card>
        </div>

        {/* Right */}
        <div className="md:col-span-2 space-y-6">
          {school.description && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 mb-3">About {school.schoolName}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{school.description}</p>
            </Card>
          )}

          {jobs.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-900 mb-4">Open positions</h2>
              <div className="grid gap-4">
                {jobs.map(job => <JobCard key={job.id} job={job} basePath="/jobs" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
