import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Children, useEffect } from "react";

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

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import PendingRequests from "./pages/teacher/PendingRequests";
import AssignedStudents from "./pages/teacher/AssignedStudents";
import TeacherFiles from "./pages/teacher/TeacherFiles";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageCoAdmin from "./pages/admin/ManageCoAdmin";
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import DeadlinesPage from "./pages/admin/DeadlinesPage";
import ProjectsPage from "./pages/admin/ProjectsPage";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Loader, Loader2 } from "lucide-react";
import { getUser } from "./store/slices/authSlice";
import { all } from "axios";
import { getAllUsers } from "./store/slices/adminSlice";


// co-admin
import CoAdminDashboard from "./pages/coadmin/CoAdminDashboard";
import CoAdminStudents from "./pages/coadmin/CoAdminStudents";
import CoAdminTeachers from "./pages/coadmin/CoAdminTeachers";

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (authUser?.role === "Admin") {
      dispatch(getAllUsers());
    }
  }, [authUser]);

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
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center m-auto h-screen">
       <Loader className="size-20 animate-spin text-[#17a2b8]" />
      </div>
    );
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
          <Route path="/admin/co-admin" element={<ManageCoAdmin />} />
          <Route path="assign-supervisor" element={<AssignSupervisor />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
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
        </Route>
      </Routes>
      <ToastContainer theme="dark" />
    </BrowserRouter>
  );
};

export default App;
