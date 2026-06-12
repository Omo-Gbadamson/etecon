import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button, EmptyState } from "../components/shared";
import { formatRelative } from "../utils";
import { markNotificationRead } from "../firebase/firestore";
import { cn } from "../utils/cn";

const typeIcon = (type) => {
  const icons = {
    application_received: "📬",
    application_status_changed: "📋",
    job_match: "✨",
    message: "💬",
  };
  return icons[type] || "🔔";
};

const typeColor = (type) => ({
  application_received: "border-l-indigo-500",
  application_status_changed: "border-l-amber-500",
  job_match: "border-l-emerald-500",
  message: "border-l-blue-500",
}[type] || "border-l-slate-300");

export default function NotificationsPage() {
  const { notifications, markRead } = useNotifications();
  // role-aware navigation handled inline
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read);

  const markAll = async () => {
    await Promise.all(unread.map(n => markNotificationRead(n.id)));
  };

  const handleClick = (notif) => {
    if (!notif.read) markRead(notif.id);
    if (notif.relatedId) {      if (notif.type === "application_received") navigate(`/dashboard/school/jobs/${notif.relatedId}`);
      else if (notif.type === "application_status_changed") navigate(`/dashboard/teacher/applications`);
      else if (notif.type === "message") navigate(`/messages/${notif.relatedId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unread.length > 0 && (
              <p className="text-sm text-slate-500 mt-1">{unread.length} unread</p>
            )}
          </div>
          {unread.length > 0 && (
            <Button variant="secondary" size="sm" onClick={markAll}>
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You'll receive notifications for applications, status updates, and messages here."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-l-4 bg-white border border-slate-100 hover:shadow-sm transition-all",
                  typeColor(notif.type),
                  !notif.read && "ring-1 ring-indigo-100 bg-indigo-50/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", notif.read ? "text-slate-600" : "text-slate-900 font-medium")}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{formatRelative(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
