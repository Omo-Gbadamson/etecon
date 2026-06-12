import { MapPin, Clock, Users, Briefcase, Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, Avatar } from "../shared";
import { formatDate, formatSalary, formatRelative } from "../../utils";

export function JobCard({ job, basePath = "/jobs", onSave, isSaved }) {
  const isExpired = job.applicationDeadline?.toDate && job.applicationDeadline.toDate() < new Date();
  return (
    <Card className="p-5 hover:shadow-md transition-shadow flex flex-col gap-3 relative">
      {onSave && (
        <button
          onClick={e => { e.preventDefault(); onSave(job.id); }}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
          title={isSaved ? "Remove bookmark" : "Save job"}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4 text-indigo-600" /> : <Bookmark className="w-4 h-4" />}
        </button>
      )}
      <div className="flex items-start gap-3">
        <Avatar src={job.schoolLogoURL} name={job.schoolName} size="md" />
        <div className="flex-1 min-w-0 pr-6">
          <Link to={`${basePath}/${job.id}`} className="font-semibold text-slate-900 hover:text-indigo-700 transition line-clamp-1">
            {job.title}
          </Link>
          <p className="text-sm text-slate-500 truncate">{job.schoolName}</p>
        </div>
        <Badge status={job.status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.city}, {job.state}</span>
        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.jobType}</span>
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicantsCount || 0} applicants</span>
        <span className={`flex items-center gap-1 ${isExpired ? "text-rose-500" : ""}`}>
          <Clock className="w-3.5 h-3.5" />Deadline: {formatDate(job.applicationDeadline)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <span className="text-sm font-medium text-emerald-600">{formatSalary(job.salary)}</span>
        <span className="text-xs text-slate-400">{formatRelative(job.createdAt)}</span>
      </div>
    </Card>
  );
}

export function JobListItem({ job, actions, basePath = "/jobs" }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition">
      <Avatar src={job.schoolLogoURL} name={job.schoolName} size="md" />
      <div className="flex-1 min-w-0">
        <Link to={`${basePath}/${job.id}`} className="font-medium text-slate-900 hover:text-indigo-700 transition">
          {job.title}
        </Link>
        <p className="text-sm text-slate-500">{job.schoolName} · {job.city}, {job.state}</p>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <Badge status={job.status} />
        <span className="text-xs text-slate-400">{job.applicantsCount || 0} applicants</span>
        {actions}
      </div>
    </div>
  );
}
