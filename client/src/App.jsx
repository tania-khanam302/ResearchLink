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
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import DeadlinesPage from "./pages/admin/DeadlinesPage";
import ProjectsPage from "./pages/admin/ProjectsPage";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Loader, Loader2 } from "lucide-react";
import { getUser } from "./store/slices/authSlice";
import { all } from "axios";
import { getAllUsers } from "./store/slices/adminSlice";

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
          : authUser.role === "Teacher"
            ? "/teacher"
            : "/student";

      return <Navigate to={redirectPath} replace />;
    }
    return children;
  };

  // loading page condition
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center m-auto h-screen">
        <div className="flex gap-2 justify-center items-center">
          <div className="w-3 h-3 bg-[#17a2b8] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#17a2b8] rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-3 h-3 bg-[#17a2b8] rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>

        {/* <Loader2 className="animate-spin size-20 text-[#17a2b8]" /> */}

        {/* <div className="w-12 h-12 bg-[#17a2b8] rounded-full animate-ping"></div> */}

        {/* <p className="text-[#17a2b8] text-xl animate-pulse">Loading...</p> */}

        {/* <div className="w-12 h-12 border-4 border-gray-200 border-t-[#17a2b8] rounded-full animate-spin"></div> */}

        {/* <div className="w-12 h-12 border-4 border-gray-200 border-t-[#17a2b8] rounded-full animate-spin"></div>
        <p className="text-xl text-gray-500 animate-pulse">Loading...</p> */}

        {/* <Loader className="size-20 animate-spin text-[#17a2b8]" /> */}
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

        {/* ata line ta na dile output asena */}
        {/* <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} /> */}

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
          <Route path="assign-supervisor" element={<AssignSupervisor />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
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
