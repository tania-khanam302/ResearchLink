import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  Users,
  Clock,
  Loader2,
  LayoutDashboard,
  UserCheck,
  BookOpen,
  ArrowRight,
  Check,
  X,
  CalendarDays,
  FileText,
} from "lucide-react";

import {
  getTeacherDashboardStats,
  getTeacherRequests,
  getAssignedStudents,
  acceptRequest,
  rejectRequest,
} from "../../store/slices/teacherSlice";

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    dashboardStats,
    assignedStudents = [],
    list: requests = [],
    loading,
  } = useSelector((state) => state.teacher);

const { authUser, isCheckingAuth } = useSelector(
  (state) => state.auth
);

// Fetch teacher dashboard data
useEffect(() => {
  // Auth check এখনো চলছে
  if (isCheckingAuth) {
    console.log("TeacherDashboard: checking authentication...");
    return;
  }

  // Auth check শেষ কিন্তু user নেই
  if (!authUser?._id) {
    console.log("TeacherDashboard: no authenticated teacher");
    return;
  }

  console.log(
    "TeacherDashboard: fetching dashboard for",
    authUser._id
  );

  const loadDashboard = async () => {
    try {
      await Promise.all([
        dispatch(getTeacherDashboardStats()).unwrap(),
        dispatch(getTeacherRequests(authUser._id)).unwrap(),
        dispatch(getAssignedStudents()).unwrap(),
      ]);

      console.log("TeacherDashboard: data loaded successfully");
    } catch (error) {
      console.error("Teacher dashboard load error:", error);
    }
  };

  loadDashboard();
}, [dispatch, authUser?._id, isCheckingAuth]);


  // calculate safe values
  const safeStudents = Array.isArray(assignedStudents)
    ? assignedStudents
    : [];

  const safeRequests = Array.isArray(requests) ? requests : [];

  const pendingRequests = safeRequests.filter(
    (request) => request?.status === "pending",
  );

  // calculate research work values
  const calculatedTotalResearchWorks = safeStudents.reduce(
    (total, student) => {
      let count = 0;

      if (student?.project) count += 1;
      if (student?.thesis) count += 1;

      return total + count;
    },
    0,
  );

  const calculatedCompletedWorks = safeStudents.reduce(
    (total, student) => {
      let count = 0;

      if (student?.project?.status === "completed") {
        count += 1;
      }

      if (student?.thesis?.status === "completed") {
        count += 1;
      }

      return total + count;
    },
    0,
  );

  const calculatedActiveWorks = Math.max(
    calculatedTotalResearchWorks - calculatedCompletedWorks,
    0,
  );

  const assignedStudentCount =
    dashboardStats?.assignedStudents ?? safeStudents.length;

  const pendingRequestCount =
    dashboardStats?.totalPendingRequests ??
    pendingRequests.length;

  const totalResearchWorks =
    dashboardStats?.totalResearchWorks ??
    calculatedTotalResearchWorks;

  const completedWorks =
    dashboardStats?.completedWorks ??
    calculatedCompletedWorks;

  const activeWorks =
    dashboardStats?.activeWorks ??
    calculatedActiveWorks;

  // upcoming deadlines
const upcomingDeadlines =
  Array.isArray(dashboardStats?.upcomingDeadlines)
    ? dashboardStats.upcomingDeadlines
    : [];

console.log("dashboardStats:", dashboardStats);
console.log("upcomingDeadlines:", upcomingDeadlines);


  // accept request
const handleAccept = async (requestId) => {
  const result = await dispatch(acceptRequest(requestId));

  if (acceptRequest.fulfilled.match(result)) {
    await Promise.all([
      dispatch(getTeacherDashboardStats()),
      dispatch(getTeacherRequests(authUser._id)),
      dispatch(getAssignedStudents()),
    ]);
  }
};


  // reject request
const handleReject = async (requestId) => {
  const result = await dispatch(rejectRequest(requestId));

  if (rejectRequest.fulfilled.match(result)) {
    await Promise.all([
      dispatch(getTeacherDashboardStats()),
      dispatch(getTeacherRequests(authUser._id)),
    ]);
  }
};


  // statistics
  const statsCards = [
    {
      title: "Assigned Students",
      value: assignedStudentCount,
      icon: Users,
      iconBg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: pendingRequestCount,
      icon: Clock,
      iconBg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Active Research",
      value: activeWorks,
      icon: BookOpen,
      iconBg: "bg-cyan-100",
      color: "text-cyan-600",
    },
    {
      title: "Completed Works",
      value: completedWorks,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* header */}
      <div className="relative px-6 py-6 border border-slate-200 rounded-2xl bg-gradient-to-r from-[#f0fbfc] to-white overflow-hidden shadow-sm">

        <div className="absolute -right-10 -top-16 w-40 h-40 rounded-full bg-[#17a2b8]/5" />

        <div className="absolute right-20 -bottom-20 w-36 h-36 rounded-full bg-[#17a2b8]/5" />

        <div className="relative flex items-center gap-4">

          <div
            className="w-12 h-12 shrink-0 rounded-xl
            bg-[#17a2b8]/10
            border border-[#17a2b8]/20
            flex items-center justify-center"
          >
            <LayoutDashboard className="w-6 h-6 text-[#138496]" />
          </div>

          <div>
            <p className="text-sm text-[#138496] font-medium">
              Welcome back,
            </p>

            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
              {authUser?.name || "Teacher"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your students and supervise their research,
              thesis and projects.
            </p>
          </div>

        </div>
      </div>

      {/* statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {statsCards.map(
          ({ title, value, icon: Icon, iconBg, color }) => (
            <div
              key={title}
              className="bg-white border border-slate-200 rounded-xl
              p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {loading ? (
                      <Loader2
                        size={22}
                        className="animate-spin text-[#17a2b8]"
                      />
                    ) : (
                      value
                    )}
                  </p>
                </div>

                <div
                  className={`w-11 h-11 rounded-xl ${iconBg}
                  flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>

              </div>
            </div>
          ),
        )}

      </div>

      {/* supervisor requests */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="flex items-center gap-3">

              <div
                className="w-10 h-10 rounded-lg
                bg-[#17a2b8]/10
                border border-[#17a2b8]/20
                flex items-center justify-center"
              >
                <UserCheck className="w-5 h-5 text-[#138496]" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Supervisor Requests
                </h2>

                <p className="text-sm text-slate-500">
                  Students requesting you as their supervisor
                </p>
              </div>

            </div>

            <span
              className="w-fit px-3 py-1 rounded-full
              bg-yellow-100 text-yellow-700
              text-xs font-semibold"
            >
              {pendingRequestCount} Pending
            </span>

          </div>
        </div>

        <div className="p-6">

          {loading ? (

            <div className="flex justify-center py-10">
              <Loader2
                size={30}
                className="animate-spin text-[#17a2b8]"
              />
            </div>

          ) : pendingRequests.length > 0 ? (

            <div className="space-y-3">

              {pendingRequests.slice(0, 5).map((request) => (

                <div
                  key={request._id}
                  className="flex flex-col lg:flex-row
                  lg:items-center justify-between gap-4
                  p-4 rounded-xl
                  bg-slate-50 border border-slate-100
                  hover:bg-[#f0fbfc]
                  transition-colors"
                >

                  <div className="flex items-start gap-3 min-w-0">

                    <div
                      className="w-10 h-10 shrink-0 rounded-full
                      bg-[#17a2b8]/10
                      flex items-center justify-center"
                    >
                      <Users className="w-5 h-5 text-[#138496]" />
                    </div>

                    <div className="min-w-0">

                      <h3 className="font-semibold text-slate-800">
                        {request.student?.name || "Unknown Student"}
                      </h3>

                      <p className="text-sm text-slate-500 truncate">
                        {request.student?.email ||
                          "No email available"}
                      </p>

                      {request.proposal && (
                        <div className="flex items-center gap-2 mt-2">

                          <FileText
                            size={14}
                            className="text-[#138496]"
                          />

                          <p className="text-sm text-slate-600">

                            <span className="font-medium">
                              {request.proposalType}:
                            </span>{" "}

                            {request.proposal.title ||
                              "Untitled Research"}

                          </p>

                        </div>
                      )}

                      <p className="mt-1 text-xs text-slate-400">
                        Requested{" "}
                        {request.createdAt
                          ? new Date(
                              request.createdAt,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </p>

                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">

                    <button
                      onClick={() =>
                        handleAccept(request._id)
                      }
                      className="inline-flex items-center justify-center
                      gap-1.5 px-3 py-1.5 rounded-lg
                      bg-[#17a2b8] text-white
                      text-sm font-medium
                      hover:bg-[#138496]
                      transition-colors"
                    >
                      <Check size={16} />
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleReject(request._id)
                      }
                      className="inline-flex items-center justify-center
                      gap-1.5 px-3 py-1.5 rounded-lg
                      border border-red-200
                      text-red-600 bg-white
                      text-sm font-medium
                      hover:bg-red-50
                      transition-colors"
                    >
                      <X size={16} />
                      Reject
                    </button>

                  </div>

                </div>

              ))}

         {pendingRequests.length > 5 && (
  <div className="flex justify-center pt-3">
    <button
      onClick={() =>
        navigate("/teacher/pending-requests")
      }
      className="inline-flex items-center gap-1.5
      px-4 py-2 rounded-lg
      text-sm font-semibold
      text-[#138496]
      bg-[#f0fbfc]
      border border-[#17a2b8]/20
      hover:bg-[#17a2b8]/10
      transition-colors"
    >
      View all {pendingRequestCount} requests
      <ArrowRight size={16} />
    </button>
  </div>
)}


            </div>

          ) : (

            <div className="text-center py-10">

              <div
                className="w-12 h-12 mx-auto rounded-full
                bg-green-50
                flex items-center justify-center"
              >
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>

              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                No pending requests
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                You are all caught up.
              </p>

            </div>
          )}

        </div>
      </div>

      {/* students + research overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* students */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  My Research Students
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Students currently under your supervision
                </p>
              </div>

              <div
                className="w-10 h-10 rounded-lg
                bg-blue-50
                flex items-center justify-center"
              >
                <Users className="w-5 h-5 text-blue-600" />
              </div>

            </div>
          </div>

          <div className="p-6">

            {loading ? (

              <div className="flex justify-center py-8">
                <Loader2
                  size={28}
                  className="animate-spin text-[#17a2b8]"
                />
              </div>

            ) : safeStudents.length > 0 ? (

              <div className="space-y-3">

                {safeStudents.slice(0, 2).map((student) => {

                  const work =
                    student?.project || student?.thesis;

                  const workType = student?.project
                    ? "Project"
                    : student?.thesis
                      ? "Thesis"
                      : null;

                  const isCompleted =
                    work?.status === "completed";

                  return (
                    <div
                      key={student._id}
                      className="p-4 rounded-lg
                      border border-slate-100
                      bg-slate-50
                      hover:bg-[#f0fbfc]
                      transition-colors"
                    >

                      <div
                        className="flex items-center
                        justify-between gap-3"
                      >

                        <div className="min-w-0">

                          <p className="font-medium text-slate-800">
                            {student.name}
                          </p>

                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {work?.title ||
                              "No research work yet"}
                          </p>

                          {workType && (
                            <span className="inline-block mt-2 text-xs font-medium text-[#138496]">
                              {workType}
                            </span>
                          )}

                        </div>

                        {work?.status && (
                          <span
                            className={`shrink-0 px-2.5 py-1
                            rounded-full text-xs font-medium
                            ${
                              isCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {work.status}
                          </span>
                        )}

                      </div>

                      {work && (
                        <div className="mt-3">

                          <div className="flex justify-between text-xs mb-1">

                            <span className="text-slate-500">
                              Research Progress
                            </span>

                            <span className="font-medium text-slate-700">
                              {isCompleted
                                ? "100%"
                                : "In Progress"}
                            </span>

                          </div>

                          <div
                            className="h-1.5 bg-slate-200
                            rounded-full overflow-hidden"
                          >
                            <div
                              className={`h-full rounded-full ${
                                isCompleted
                                  ? "bg-green-500"
                                  : "bg-[#17a2b8]"
                              }`}
                              style={{
                                width: isCompleted
                                  ? "100%"
                                  : "50%",
                              }}
                            />
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}

                {safeStudents.length > 2 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() =>
                        navigate("/teacher/assigned-students")
                      }
                      className="inline-flex items-center gap-1
                      text-sm font-medium
                      text-[#138496]
                      hover:text-[#0f6674]"
                    >
                      View all students
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

              </div>

            ) : (

              <div className="text-center py-10">

                <Users className="w-8 h-8 mx-auto text-slate-300" />

                <p className="mt-3 text-sm text-slate-500">
                  No students assigned yet.
                </p>

              </div>
            )}

          </div>
        </div>

        {/* research overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div
                className="w-10 h-10 rounded-lg
                bg-green-50
                flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Research Overview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Current supervision summary
                </p>
              </div>

            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-4">

            <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-600">
                Students
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {assignedStudentCount}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-yellow-50 border border-yellow-100">
              <p className="text-sm text-yellow-600">
                Pending Requests
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-700">
                {pendingRequestCount}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-cyan-50 border border-cyan-100">
              <p className="text-sm text-cyan-600">
                Active Research
              </p>

              <p className="mt-2 text-2xl font-bold text-cyan-700">
                {activeWorks}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-green-50 border border-green-100">
              <p className="text-sm text-green-600">
                Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {completedWorks}
              </p>
            </div>

            <div className="col-span-2 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-500">
                Total Research Works
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {totalResearchWorks}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* upcoming deadlines */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div
          className="relative px-6 py-5
          border-b border-slate-200
          bg-gradient-to-r from-[#f0fbfc] to-white
          overflow-hidden"
        >

          <div
            className="absolute -right-10 -top-16
            w-36 h-36 rounded-full
            bg-[#17a2b8]/5"
          />

          <div className="relative flex items-center gap-4">

            <div
              className="w-11 h-11 shrink-0
              rounded-lg
              bg-[#17a2b8]/10
              border border-[#17a2b8]/20
              flex items-center justify-center"
            >
              <CalendarDays className="w-5 h-5 text-[#138496]" />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Upcoming Deadlines
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Important deadlines for your supervised research
              </p>
            </div>

          </div>
        </div>

        <div className="p-6">

          {loading ? (

            <div className="flex justify-center py-8">
              <Loader2
                size={30}
                className="animate-spin text-[#17a2b8]"
              />
            </div>

          ) : upcomingDeadlines.length > 0 ? (

            <div className="space-y-3">

              {upcomingDeadlines.slice(0, 5).map((deadline) => {

                const deadlineDate = deadline?.dueDate
  ? new Date(deadline.dueDate)
  : null;

                const today = new Date();

                const diffTime = deadlineDate
                  ? deadlineDate.getTime() - today.getTime()
                  : 0;

                const daysLeft = deadlineDate
                  ? Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    )
                  : null;

                const isUrgent =
                  daysLeft !== null && daysLeft <= 3;

                return (
                  <div
                    key={deadline._id}
                    className="flex flex-col sm:flex-row
                    sm:items-center justify-between gap-4
                    p-4 rounded-xl
                    bg-slate-50
                    border border-slate-100
                    hover:bg-[#f0fbfc]
                    transition-colors"
                  >

                    <div className="flex items-start gap-3 min-w-0">

                      <div
                        className={`w-10 h-10 shrink-0
                        rounded-lg
                        flex items-center justify-center
                        ${
                          isUrgent
                            ? "bg-red-50"
                            : "bg-[#17a2b8]/10"
                        }`}
                      >
                        <CalendarDays
                          className={`w-5 h-5
                          ${
                            isUrgent
                              ? "text-red-500"
                              : "text-[#138496]"
                          }`}
                        />
                      </div>

                      <div className="min-w-0">

                        <h3 className="font-semibold text-slate-800">
                          {deadline?.title ||
                            deadline?.name ||
                            "Research Deadline"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {deadline?.student?.name ||
                            deadline?.studentName ||
                            "Student"}
                        </p>

                        {deadline?.type && (
                          <span className="inline-block mt-2 text-xs font-medium text-[#138496]">
                            {deadline.type}
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="shrink-0 sm:text-right">

                      <p className="text-sm font-medium text-slate-700">
                        {deadlineDate
                          ? deadlineDate.toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "No date"}
                      </p>

                      {daysLeft !== null && (
                        <p
                          className={`mt-1 text-xs font-medium
                          ${
                            isUrgent
                              ? "text-red-600"
                              : "text-slate-500"
                          }`}
                        >
                          {daysLeft < 0
                            ? "Overdue"
                            : daysLeft === 0
                              ? "Due today"
                              : `${daysLeft} ${
                                  daysLeft === 1
                                    ? "day"
                                    : "days"
                                } left`}
                        </p>
                      )}

                    </div>

                  </div>
                );
              })}

              {upcomingDeadlines.length > 5 && (
                <div className="text-center pt-2">

                  <button
                    onClick={() =>
                      navigate("/teacher/assigned-students")
                    }
                    className="inline-flex items-center gap-1
                    text-sm font-medium
                    text-[#138496]
                    hover:text-[#0f6674]"
                  >
                    View all deadlines
                    <ArrowRight size={15} />
                  </button>

                </div>
              )}

            </div>

          ) : (

            <div className="text-center py-10">

              <div
                className="w-12 h-12 mx-auto rounded-full
                bg-green-50
                flex items-center justify-center"
              >
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>

              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                No upcoming deadlines
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                There are no upcoming deadlines at the moment.
              </p>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default TeacherDashboard;
