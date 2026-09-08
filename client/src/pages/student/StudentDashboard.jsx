import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";
import { useState } from "react";

import { Link } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  MessageCircleMore,
  MessageCircleWarning,
  BookOpen,
  UserRound,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats } = useSelector((state) => state.student);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const proposal = dashboardStats?.proposal || null;
  const project = dashboardStats?.project || null;
  const thesis = dashboardStats?.thesis || null;
  const academicWork = proposal || project || thesis || null;
  const workType =
    academicWork?.type || (thesis ? "Thesis" : project ? "Project" : null);

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
        {/* student dashboard header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] rounded-lg px-6 sm:px-8 py-7">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -right-4 -bottom-16 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <LayoutDashboard
                className="w-7 h-7 text-white"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-white/80">
                Here's an overview of your thesis/project and recent updates.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Thesis / Project Title */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {workType ? `${workType} Title` : "Thesis / Project Title"}
                </p>

                <p className="mt-2 text-lg font-bold text-slate-800 truncate max-w-[180px]">
                  {academicWork?.title || "No Thesis / Project"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {academicWork?.title
                    ? "Your current academic work"
                    : "No proposal submitted yet"}
                </p>
              </div>

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <BookOpen className="w-6 h-6" strokeWidth={1.8} />
              </div>
            </div>
          </div>

          {/* Supervisor */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Supervisor</p>
                <p className="mt-2 text-lg font-bold text-slate-800 truncate max-w-[180px]">
                  {supervisorName}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {supervisorName !== "N/A"
                    ? "Assigned supervisor"
                    : "Not assigned yet"}
                </p>
              </div>

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <UserRound className="w-6 h-6" strokeWidth={1.8} />
              </div>
            </div>
          </div>

          {/* Next Deadline */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Next Deadline
                </p>
                <p className="mt-2 text-lg font-bold text-slate-800">
                  {formatDate(academicWork?.deadline)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {academicWork?.deadline
                    ? "Submission deadline"
                    : "No deadline available"}
                </p>
              </div>

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <CalendarDays className="w-6 h-6" strokeWidth={1.8} />
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Recent Feedback
                </p>

                <p className="mt-2 text-lg font-bold text-slate-800">
                  {feedbackList?.length
                    ? formatDate(feedbackList[0]?.createdAt)
                    : "No feedback yet"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {feedbackList?.length
                    ? "Latest supervisor feedback"
                    : "No feedback received yet"}
                </p>
              </div>

              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <MessageSquareText className="w-6 h-6" strokeWidth={1.8} />
              </div>
            </div>
          </div>
        </div>

        {/* thesis and project overview and recent feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thesis / Project Overview */}
          <div className="card overflow-hidden border border-slate-300 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="card-header flex items-center gap-3 border-b border-slate-100 p-2 bg-slate-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600">
                <BookOpen className="w-5 h-5" strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="card-title">
                  {workType === "Thesis"
                    ? "Thesis Overview"
                    : workType === "Project"
                      ? "Project Overview"
                      : "Thesis / Project Overview"}
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Overview of your academic work
                </p>
              </div>
            </div>
            <div className="p-3 space-y-5">
              <div className="group">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17a2b8] mb-1.5">
                  Title
                </label>

                <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                  {academicWork?.title || "N/A"}
                </p>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17a2b8] mb-1.5">
                  Description
                </label>
                <p
                  className={`text-sm text-slate-600 leading-6  text-justify ${
                    !showFullDescription ? "line-clamp-3" : ""
                  }`}
                >
                  {academicWork?.description || "No description provided"}
                </p>

                {academicWork?.description &&
                  academicWork.description.length > 180 && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="mt-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                    >
                      {showFullDescription ? "Read less" : "Read more"}
                    </button>
                  )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-100">
                <label className="text-sm font-medium text-[#17a2b8]">
                  Status
                </label>

                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${
                    academicWork?.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : academicWork?.status === "pending"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        : academicWork?.status === "rejected"
                          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {academicWork?.status || "Unknown"}
                </span>
              </div>

              {/* Submission Deadline */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#17a2b8] mb-1">
                    Submission Deadline
                  </label>

                  <p className="text-sm font-semibold text-slate-800">
                    {formatDate(academicWork?.deadline)}
                  </p>
                </div>

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
                  <CalendarDays className="w-5 h-5" strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="card overflow-hidden border border-slate-300 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="card-header flex items-center justify-between border-b border-slate-100  p-2 bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600">
                  <MessageSquareText className="w-5 h-5" strokeWidth={1.8} />
                </div>

                <div>
                  <h2 className="card-title">Recent Feedback</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest feedback from your supervisor
                  </p>
                </div>
              </div>

              <Link
                to={"/student/feedback"}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold
        bg-cyan-600 hover:bg-cyan-700
        text-white rounded-lg
        shadow-sm hover:shadow-md
        transition-all duration-200"
              >
                View All
              </Link>
            </div>

            {feedbackList && feedbackList.length > 0 ? (
              <div className="p-2 space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar">
                {feedbackList.map((feedback, index) => {
                  return (
                    <div
                      key={index}
                      className="group relative border border-slate-200 rounded-xl p-4
              bg-white hover:bg-slate-50/70
              hover:border-slate-300 hover:shadow-sm
              transition-all duration-200"
                    >
                      {/* Feedback Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
                            <MessageCircleMore
                              className="w-5 h-5"
                              strokeWidth={1.8}
                            />
                          </div>

                          <h3 className="font-semibold text-sm text-slate-800 truncate">
                            {feedback.title || "Supervisor Feedback"}
                          </h3>
                        </div>

                        <p className="text-[11px] text-slate-400 whitespace-nowrap">
                          {formatDate(feedback.createdAt)}
                        </p>
                      </div>

                      {/* Message */}
                      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                        <p
                          className={`text-slate-600 text-justify text-sm leading-6 ${
                            expandedFeedback !== index ? "line-clamp-3" : ""
                          }`}
                        >
                          {feedback.message}
                        </p>

                        {feedback.message && feedback.message.length > 180 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedFeedback(
                                expandedFeedback === index ? null : index,
                              )
                            }
                            className="mt-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                          >
                            {expandedFeedback === index
                              ? "See Less"
                              : "See More"}
                          </button>
                        )}
                      </div>

                      {/* Supervisor */}
                      <div className="flex items-center gap-2 mt-3">
                        <UserRound className="w-3.5 h-3.5 text-slate-400" />

                        <p className="text-xs text-slate-500">
                          {thesis?.supervisor?.name ||
                            supervisorName ||
                            "Supervisor"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-200">
                  <MessageCircleMore className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">
                  No feedback available yet.
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Your supervisor's feedback will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* upcoming deadlines and recent updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="card overflow-hidden border border-slate-300 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="card-header flex items-center gap-3 border-b border-slate-100  p-2 bg-slate-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
                <CalendarDays className="w-5 h-5" strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="card-title">Upcoming Deadlines</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Important upcoming submissions
                </p>
              </div>
            </div>

            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="p-5 space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                {upcomingDeadlines.map((d, i) => {
                  return (
                    <div
                      key={i}
                      className="group flex items-center justify-between gap-4
              p-4 rounded-xl
              border border-slate-200 bg-white
              hover:border-amber-200 hover:bg-amber-50/30
              hover:shadow-sm
              transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-600">
                          <CalendarDays className="w-4 h-4" strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 truncate">
                            {d.title}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(d.deadline)}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 px-3 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-[11px] font-semibold capitalize">
                        upcoming
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-200">
                  <MessageCircleWarning className="w-6 h-6 text-slate-400" />
                </div>

                <p className="text-slate-500 text-sm">
                  No upcoming deadlines yet.
                </p>
              </div>
            )}
          </div>

          {/* Recent Updates */}
          <div className="card overflow-hidden border border-slate-300 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="card-header flex items-center gap-3 border-b border-slate-100  p-2 bg-slate-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600">
                <Bell className="w-5 h-5" strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="card-title">Recent Updates</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest activity and notifications
                </p>
              </div>
            </div>

            {topNotifications && topNotifications.length > 0 ? (
              <div className="p-2 space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                {topNotifications.map((n, i) => {
                  return (
                    <div
                      key={i}
                      className="group p-4 rounded-xl
              border border-slate-200 bg-white
              hover:border-cyan-200 hover:bg-cyan-50/30
              hover:shadow-sm
              transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600">
                          <Bell className="w-4 h-4" strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-slate-800 leading-5">
                            {n.message}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-1.5">
                            {formatDate(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-200">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No updates yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
