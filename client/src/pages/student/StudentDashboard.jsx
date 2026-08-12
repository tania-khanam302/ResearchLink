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
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };


  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="bg-gradient-to-r from-[#17a2b8] to-purple-500 rounded-lg text-white p-4">
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-blue-100">
            Here's your project overview and recent updates.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 mb:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Project Title */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">📘</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Project Title
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {project?.title || "No Project"}
                </p>
              </div>
            </div>
          </div>

          {/* supervisor name */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">👨‍🏫 </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Supervisor</p>
                <p className="text-lg font-semibold text-slate-800">
                  {supervisorName || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* deadline */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">⏰ </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Next Deadline
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {formatDate(project?.deadline)}
                </p>
              </div>
            </div>
          </div>

          {/* Recent feedback */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">💬</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Recent Feedback
                </p>

                <p className="text-lg font-semibold text-slate-800">
                  {feedbackList?.length
                    ? formatDate(feedbackList[0]?.createAt)
                    : "No feedback yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Overview</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Title
                </label>
                <p className="text-slate-800 font-medium">
                  {project?.title || "N/A"}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Description
                </label>
                <p className="text-slate-800 font-medium">
                  {project?.description || "No description provided"}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-4 py-[2px] rounded-full text-sm
                     font-medium capitalize ${
                       project?.status === "approved"
                         ? "bg-green-100 text-green-800"
                         : project?.status === "pending"
                           ? "bg-yellow-100 text-yellow-800"
                           : project?.status === "rejected"
                             ? "bg-red-100 text-red-800"
                             : "bg-gray-100 text-gray-800"
                     }`}
                >
                  {project?.status || "Unknown"}
                </span>
              </div>

              <div>
                <label
                  className="text-sm font-medium 
                  text-slate-600"
                >
                  Submission Deadline
                </label>
                <p className="text-slate-800 font-medium">
                  {formatDate(project?.deadline)}
                </p>
              </div>
            </div>
          </div>

          {/* Latest Feedback */}
          <div className="card">
            <div
              className="card-header flex
                 items-center justify-between"
            >
              <h2 className="card-title">Latest Feedback</h2>
              <Link
                to={"/student/feedback"}
                className="text-sm 
              bg-[#17a2b8]
                    hover:bg-[#138496]
                    text-white
                    px-6
                    py-2
                    rounded-md
                    font-medium
                    shadow-md
                    hover:shadow-lg
                    transition-all
                    duration-300"
              >
                View All
              </Link>
            </div>

            {feedbackList && feedbackList.length > 0 ? (
              <div className="space-y-4 p-4">
                {feedbackList.map((feedback, index) => {
                  return (
                    <div
                      key={index}
                      className="border  border-slate-200 rounded-lg p-4  hover:shadow-md transition-shadow"
                    >
                      <div
                        className="flex items-center
                          justify-between mb-2"
                      >
                        <div className="flex items-center space-x-2">
                          <MessageCircleMore className="w-5 h-5 text-blue-500" />
                          <h3
                            className="font-medium
                              text-slate-800"
                          >
                            {feedback.title || "Supervisor Feedback"}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDate(feedback.createAt)}
                        </p>
                      </div>

                      <div className="text-slate-50 rounded-lg p-3">
                        <p className="text-slate-700 text-sm loading-relaxed">
                          {feedback.massage}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-slate-500">
                          {supervisorName || "supervisor"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircleMore className="w-10 h-10 text-slate-300 mx-auto mb-3 mt-5" />
                <p className="text-slate-500 text-sm">
                  No feedback available yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Deadlines</h2>
            </div>
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((d, i) => {
                  return (
                    <div
                      key={i}
                      className="flex
                      items-center justify-between p-3 
                      bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p
                          className="font-medium
                              text-slate-800"
                        >
                          {d.title}
                        </p>
                        <p
                          className="text-sm
                              text-slate-600"
                        >
                          {formatDate(d.deadline)}
                        </p>
                      </div>
                      <div className={`badge badge-pending`}>upcoming</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircleWarning
                  className="w-10 h-10
                  text-slate-300 mx-auto mb-3"
                />
                <p className="text-slate-500 text-sm">
                  No upcoming deadlines yet.
                </p>
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Notifications</h2>
              {topNotifications && topNotifications.length > 0 ? (
                <div className="space-y-3">
                  {topNotifications.map((n, i) => {
                    return (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 rounded-lg border  border-slate-100"
                      >
                        <p className="font-medium  text-slate-800">
                          {n.message}
                        </p>
                        <p className="text-xs  text-slate-500 mt-1">
                          {formatDate(n.createAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell
                    className="w-10 h-10 text-slate-300 
                        mx-auto mb-3"
                  />
                  <p className="text-slate-500 text-sm">
                    No notifications yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
