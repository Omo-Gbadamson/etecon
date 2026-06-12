import { useState } from "react";
import { MapPin, BookOpen, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, Avatar, Button } from "../shared";
import { EndorseTeacherModal } from "./EndorseTeacherModal";
import { useAuth } from "../../context/AuthContext";

const AVAIL_STATUS = {
  immediately: "open",
  "1_month": "pending",
  "3_months": "pending",
  not_available: "closed",
};
const AVAIL_LABELS = {
  immediately: "Available now",
  "1_month": "In 1 month",
  "3_months": "In 3 months",
  not_available: "Not available",
};

export function TeacherCard({ teacher, showEndorse }) {
  const { user } = useAuth();
  const [endorseOpen, setEndorseOpen] = useState(false);

  return (
    <>
      <Card className="p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
        <Link to={`/teachers/${teacher.id}`} className="block">
          <div className="flex items-start gap-3 mb-3">
            <Avatar src={teacher.photoURL} name={teacher.fullName} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 hover:text-indigo-700 transition">{teacher.fullName}</p>
              <p className="text-sm text-indigo-600 truncate">{teacher.headline}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin className="w-3 h-3" />{teacher.city}, {teacher.state}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {teacher.subjects?.slice(0, 3).map(s => (
              <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
            {teacher.subjects?.length > 3 && (
              <span className="text-xs text-slate-400">+{teacher.subjects.length - 3}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{teacher.yearsOfExperience} yrs exp</span>
            <Badge status={AVAIL_STATUS[teacher.availability] || "default"} label={AVAIL_LABELS[teacher.availability]} />
          </div>
        </Link>

        {showEndorse && user && user.uid !== teacher.id && (
          <div className="pt-3 border-t border-slate-50">
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setEndorseOpen(true)}>
              <ThumbsUp className="w-3.5 h-3.5" /> Endorse
            </Button>
          </div>
        )}
      </Card>

      <EndorseTeacherModal
        open={endorseOpen}
        onClose={() => setEndorseOpen(false)}
        teacherId={teacher.id}
        teacherName={teacher.fullName}
      />
    </>
  );
}
