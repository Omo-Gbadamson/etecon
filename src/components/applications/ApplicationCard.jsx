import { formatRelative } from "../../utils";
import { Badge, Avatar, Button } from "../shared";

export function ApplicationCard({ app, forSchool, onStatusChange }) {
  const statuses = ["pending", "reviewed", "shortlisted", "hired", "rejected"];

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar src={app.teacherPhotoURL} name={app.teacherName} size="md" />
          <div>
            <p className="font-semibold text-slate-900">{app.teacherName}</p>
            <p className="text-xs text-slate-400">{formatRelative(app.appliedAt)}</p>
          </div>
        </div>
        <Badge status={app.status} />
      </div>

      {app.coverLetter && (
        <p className="text-sm text-slate-600 line-clamp-3 mb-3 bg-slate-50 rounded-lg p-3">{app.coverLetter}</p>
      )}

      {app.cvURL && (
        <a href={app.cvURL} target="_blank" rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline mb-3 block">
          View CV / Resume →
        </a>
      )}

      {forSchool && onStatusChange && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
          {statuses.filter(s => s !== app.status).map(s => (
            <Button key={s} size="sm"
              variant={s === "hired" ? "primary" : s === "rejected" ? "danger" : "secondary"}
              onClick={() => onStatusChange(app.id, s)}>
              Mark {s}
            </Button>
          ))}
        </div>
      )}

      {app.schoolNote && (
        <p className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-slate-50">Note: {app.schoolNote}</p>
      )}
    </div>
  );
}
