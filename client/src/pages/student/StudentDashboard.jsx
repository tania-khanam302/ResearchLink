import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";

import { Link } from "react-router-dom";
import { Bell, MessageCircleMore, MessageCircleWarning } from "lucide-react";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "N/A";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];
  const topNotifications = dashboardStats?.topNotifications || [];
  const feedbackList = dashboardStats?.feedbackList?.slice(-2).reverse() || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeris",
      month: "short",
      year: "numeric",
    });
  };


  return (
    <>

    </>
  );
};

export default StudentDashboard;
