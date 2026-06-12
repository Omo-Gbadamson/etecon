import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, BookOpen, Star, GraduationCap, Briefcase,
  Calendar, Globe, ThumbsUp, Lock, ArrowLeft, MessageSquare
} from "lucide-react";
import { getTeacherProfile, getEndorsements } from "../../firebase/firestore";
import { Navbar } from "../../components/layout/Navbar";
import { Avatar, Badge, Spinner, Card, Button } from "../../components/shared";
import { formatDate } from "../../utils";
import { useAuth } from "../../context/AuthContext";

const AVAILABILITY_LABELS = {
  immediately: "Available now",
  "1_month": "In 1 month",
  "3_months": "In 3 months",
  not_available: "Not available",
};

const AVAIL_STATUS = {
  immediately: "open",
  "1_month": "pending",
  "3_months": "pending",
  not_available: "closed",
};

export default function PublicTeacherProfile() {
  const { teacherId } = useParams();
  const { user, userDoc } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([getTeacherProfile(teacherId), getEndorsements(teacherId)])
      .then(([t, e]) => {
        if (!t || (!t.isProfilePublic && user?.uid !== teacherId)) { setNotFound(true); }
        else { setTeacher(t); setEndorsements(e); }
        setLoading(false);
      });
  }, [teacherId, user]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="flex justify-center py-20"><Spinner /></div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="max-w-lg mx-auto text-center py-24 px-4">
        <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Profile not found</h2>
        <p className="text-slate-500 mb-6">This teacher's profile is either private or doesn't exist.</p>
        <Link to="/jobs"><Button>Browse jobs</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={userDoc?.role === "school" ? "/dashboard/school/teachers" : "/jobs"}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <Avatar src={teacher.photoURL} name={teacher.fullName} size="xl" className="mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-1">{teacher.fullName}</h1>
              <p className="text-sm text-indigo-600 mb-3">{teacher.headline}</p>
              <div className="flex items-center justify-center gap-1 text-sm text-slate-500 mb-4">
                <MapPin className="w-4 h-4" />{teacher.city}, {teacher.state}
              </div>
              <Badge status={AVAIL_STATUS[teacher.availability] || "default"}
                label={AVAILABILITY_LABELS[teacher.availability]} />
              {userDoc?.role === "school" && (
                <Link to={`/messages?teacher=${teacherId}`} className="block mt-4">
                  <Button className="w-full" size="sm">
                    <MessageSquare className="w-4 h-4" /> Send Message
                  </Button>
                </Link>
              )}
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="font-semibold text-slate-900">Details</h3>
              <Detail icon={GraduationCap} label="Education" value={teacher.educationLevel} />
              <Detail icon={Briefcase} label="Experience" value={`${teacher.yearsOfExperience} years`} />
              <Detail icon={Calendar} label="Member since" value={formatDate(teacher.createdAt)} />
              {teacher.country && <Detail icon={Globe} label="Country" value={teacher.country} />}
            </Card>

            {teacher.certifications?.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Certifications</h3>
                <div className="flex flex-col gap-2">
                  {teacher.certifications.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />{c}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-6">
            {teacher.bio && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 mb-3">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{teacher.bio}</p>
              </Card>
            )}

            {teacher.subjects?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Subjects
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map(s => (
                    <span key={s} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </Card>
            )}

            {teacher.skills?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.skills.map(s => (
                    <span key={s} className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </Card>
            )}

            {teacher.preferredSchoolTypes?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 mb-3">Preferred school types</h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.preferredSchoolTypes.map(t => (
                    <span key={t} className="text-sm bg-amber-50 text-amber-800 px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </Card>
            )}

            {teacher.cvURL && (
              <Card className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">CV / Resume</p>
                  <p className="text-sm text-slate-500">PDF document</p>
                </div>
                <a href={teacher.cvURL} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">Download CV</Button>
                </a>
              </Card>
            )}

            {/* Endorsements */}
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-emerald-500" /> Endorsements ({endorsements.length})
              </h2>
              {endorsements.length === 0 ? (
                <p className="text-sm text-slate-400">No endorsements yet.</p>
              ) : (
                <div className="space-y-4">
                  {endorsements.map(e => (
                    <div key={e.id} className="border-l-4 border-indigo-100 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{e.skill}</span>
                        <span className="text-xs text-slate-500">by {e.fromName}</span>
                      </div>
                      {e.note && <p className="text-sm text-slate-600 italic">"{e.note}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}
