import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { PrivateRoute, RoleRoute, PublicOnlyRoute } from "./components/auth/AuthGuards";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicJobBoard from "./pages/PublicJobBoard";
import NotificationsPage from "./pages/Notifications";
import { NotFound } from "./pages/NotFound";

// Public profiles
import PublicJobDetail from "./pages/public/PublicJobDetail";
import PublicTeacherProfile from "./pages/public/PublicTeacherProfile";
import PublicSchoolProfile from "./pages/public/PublicSchoolProfile";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import BrowseJobs from "./pages/teacher/BrowseJobs";
import JobDetail from "./pages/teacher/JobDetail";
import MyApplications from "./pages/teacher/MyApplications";
import SavedJobs from "./pages/teacher/SavedJobs";

// School pages
import SchoolDashboard from "./pages/school/SchoolDashboard";
import SchoolProfile from "./pages/school/SchoolProfile";
import ManageJobs from "./pages/school/ManageJobs";
import PostJob from "./pages/school/PostJob";
import ViewApplicants from "./pages/school/ViewApplicants";
import AllApplications from "./pages/school/AllApplications";
import BrowseTeachers from "./pages/school/BrowseTeachers";

// Messages
import MessagesPage from "./pages/messages/MessagesPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/jobs" element={<PublicJobBoard />} />
            <Route path="/jobs/:jobId" element={<PublicJobDetail />} />
            <Route path="/teachers/:teacherId" element={<PublicTeacherProfile />} />
            <Route path="/schools/:schoolId" element={<PublicSchoolProfile />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

            {/* Notifications (any auth) */}
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />

            {/* Messages (any auth) */}
            <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
            <Route path="/messages/:convId" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />

            {/* Teacher dashboard */}
            <Route path="/dashboard/teacher" element={<RoleRoute role="teacher"><TeacherDashboard /></RoleRoute>} />
            <Route path="/dashboard/teacher/profile" element={<RoleRoute role="teacher"><TeacherProfile /></RoleRoute>} />
            <Route path="/dashboard/teacher/jobs" element={<RoleRoute role="teacher"><BrowseJobs /></RoleRoute>} />
            <Route path="/dashboard/teacher/jobs/:jobId" element={<RoleRoute role="teacher"><JobDetail /></RoleRoute>} />
            <Route path="/dashboard/teacher/applications" element={<RoleRoute role="teacher"><MyApplications /></RoleRoute>} />
            <Route path="/dashboard/teacher/saved-jobs" element={<RoleRoute role="teacher"><SavedJobs /></RoleRoute>} />

            {/* School dashboard */}
            <Route path="/dashboard/school" element={<RoleRoute role="school"><SchoolDashboard /></RoleRoute>} />
            <Route path="/dashboard/school/profile" element={<RoleRoute role="school"><SchoolProfile /></RoleRoute>} />
            <Route path="/dashboard/school/jobs" element={<RoleRoute role="school"><ManageJobs /></RoleRoute>} />
            <Route path="/dashboard/school/jobs/new" element={<RoleRoute role="school"><PostJob /></RoleRoute>} />
            <Route path="/dashboard/school/jobs/:jobId" element={<RoleRoute role="school"><ViewApplicants /></RoleRoute>} />
            <Route path="/dashboard/school/applications" element={<RoleRoute role="school"><AllApplications /></RoleRoute>} />
            <Route path="/dashboard/school/teachers" element={<RoleRoute role="school"><BrowseTeachers /></RoleRoute>} />

            {/* Fallbacks */}
            <Route path="/dashboard" element={<PrivateRoute><Navigate to="/" replace /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
