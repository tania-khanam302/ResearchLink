import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Children, useEffect, useState } from "react";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Dashboard Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitProposal from "./pages/student/SubmitProposal";
import UploadFiles from "./pages/student/UploadFiles";
import SupervisorPage from "./pages/student/SupervisorPage";
import FeedbackPage from "./pages/student/FeedbackPage";
import NotificationsPage from "./pages/student/NotificationsPage";
import StudentProfile from "./pages/student/StudentProfile";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import PendingRequests from "./pages/teacher/PendingRequests";
import AssignedStudents from "./pages/teacher/AssignedStudents";
import TeacherFiles from "./pages/teacher/TeacherFiles";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import AccountProfile from "./pages/profile/AccountProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageCoAdmin from "./pages/admin/ManageCoAdmin";
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import DeadlinesPage from "./pages/admin/DeadlinesPage";
import ThesisPage from "./pages/admin/ThesisPage";
import ProjectsPage from "./pages/admin/ProjectsPage";

import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { BookOpen } from "lucide-react";
import { getUser } from "./store/slices/authSlice";
import { all } from "axios";
import { getAllTheses, getAllProjects, getAllUsers } from "./store/slices/adminSlice";

// co-admin
import CoAdminDashboard from "./pages/coadmin/CoAdminDashboard";
import CoAdminStudents from "./pages/coadmin/CoAdminStudents";
import CoAdminTeachers from "./pages/coadmin/CoAdminTeachers";
import CoAdminAssignSupervisor from "./pages/coadmin/CoAdminAssignSupervisor";
import CoAdminThesisPage from "./pages/coadmin/CoAdminThesisPage";
import CoAdminProjectsPage from "./pages/coadmin/CoAdminProjectsPage";
import CoAdminDeadlinesPage from "./pages/coadmin/CoAdminDeadlinesPage";


// not found
import NotFound from "./pages/NotFound";
import { fetchDashboardStats } from "./store/slices/studentSlice";

const LoadingScreen = ({ isReady }) => {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (isReady) {
      setProgress(100);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setProgress((current) => (current >= 92 ? 92 : current + 4));
    }, 180);

    return () => window.clearInterval(timer);
  }, [isReady]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#17a2b8] shadow-lg shadow-[#17a2b8]/25">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-800">Research Link</h1>
        {/* <p className="mt-1 text-sm text-slate-500">Preparing your workspace...</p> */}

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#17a2b8] transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-[#138496]">{progress}%</p>
      </div>
    </div>
  );
};

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!isCheckingAuth) {
      const timer = window.setTimeout(() => setLoadingComplete(true), 450);
      return () => window.clearTimeout(timer);
    }

    setLoadingComplete(false);
  }, [isCheckingAuth]);

  // useEffect(() => {
  //   if (authUser?.role === "Admin") {
  //     dispatch(getAllUsers());
  //     dispatch(getAllTheses());
  //     dispatch(getAllProjects());
  //   }
  //   if (authUser?.role === "Student") {
  //     dispatch(fetchDashboardStats());
  //   }
  // }, [authUser]);


  useEffect(() => {
  if (
    authUser?.role === "Admin" ||
    authUser?.role === "Co-Admin"
  ) {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
  }

  if (authUser?.role === "Admin") {
    dispatch(getAllTheses());
  }

  if (authUser?.role === "Student") {
    dispatch(fetchDashboardStats());
  }
}, [authUser, dispatch]);


  // protected routes ===================
  const ProtectedRoutes = ({ children, allowedRoles }) => {
    if (!authUser) {
      return <Navigate to="/login" replace />;
    }

    if (
      allowedRoles?.length &&
      authUser?.role &&
      !allowedRoles.includes(authUser.role)
    ) {
      const redirectPath =
        authUser.role === "Admin"
          ? "/admin"
          : authUser.role === "Co-Admin"
            ? "/co-admin"
            : authUser.role === "Teacher"
              ? "/teacher"
              : "/student";

      return <Navigate to={redirectPath} replace />;
    }
    return children;
  };

  // loading page
  if (!loadingComplete) {
    return <LoadingScreen isReady={!isCheckingAuth} />;
  }

  return (
    //  router setupr ===================
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* login  */}
        <Route
          path="/"
          element={
            authUser ? (
              <Navigate
                to={
                  authUser.role === "Admin"
                    ? "/admin"
                    : authUser.role === "Teacher"
                      ? "/teacher"
                      : "/student"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoutes allowedRoles={["Admin"]}>
              <DashboardLayout userRole={"Admin"} />
            </ProtectedRoutes>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="teachers" element={<ManageTeachers />} />
          {/* <Route path="/admin/co-admin" element={<ManageCoAdmin />} /> */}
          <Route path="co-admin" element={<ManageCoAdmin />} />
          <Route path="assign-supervisor" element={<AssignSupervisor />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="thesis" element={<ThesisPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="profile" element={<AccountProfile />} />
        </Route>

        {/* Co-Admin Routes */}
        <Route
          path="/co-admin"
          element={
            <ProtectedRoutes allowedRoles={["Co-Admin"]}>
              <DashboardLayout userRole={"Co-Admin"} />
            </ProtectedRoutes>
          }
        >
          <Route index element={<CoAdminDashboard />} />
          <Route path="students" element={<CoAdminStudents />} />
          <Route path="teachers" element={<CoAdminTeachers />} />
           <Route
    path="assign-supervisor"
    element={<CoAdminAssignSupervisor />}
  />
    {/* Co-Admin Thesis */}
  <Route
    path="thesis"
    element={<CoAdminThesisPage />}
  />

  {/* Co-Admin Projects */}
  <Route
    path="projects"
    element={<CoAdminProjectsPage />}
  />

  {/* Co-Admin Deadlines */}
  <Route
    path="deadlines"
    element={<CoAdminDeadlinesPage />}
  />
  <Route path="profile" element={<AccountProfile />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoutes allowedRoles={["Student"]}>
              <DashboardLayout userRole={"Student"} />
            </ProtectedRoutes>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="submit-proposal" element={<SubmitProposal />} />
          <Route path="upload-files" element={<UploadFiles />} />
          <Route path="supervisor" element={<SupervisorPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<StudentProfile />} />

        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoutes allowedRoles={["Teacher"]}>
              <DashboardLayout userRole={"Teacher"} />
            </ProtectedRoutes>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="pending-requests" element={<PendingRequests />} />
          <Route path="assigned-students" element={<AssignedStudents />} />
          <Route path="files" element={<TeacherFiles />} />
         <Route path="profile" element={<TeacherProfile />} />
          
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer theme="dark" />
    </BrowserRouter>
  );
};

export default App;
