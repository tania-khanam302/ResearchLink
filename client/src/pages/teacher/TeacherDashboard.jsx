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
  User,
} from "lucide-react";

import {
  getTeacherDashboardStats,
  getTeacherRequests,
  getAssignedStudents,
  acceptRequest,
  rejectRequest,
} from "../../store/slices/teacherSlice";
import TeacherPageHeader from "../../components/PageHeader/TeacherPageHeader";


const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    dashboardStats,
    assignedStudents = [],
    list: requests = [],
    loading,
  } = useSelector((state) => state.teacher);

  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);

  // Fetch teacher dashboard data
  useEffect(() => {
    if (isCheckingAuth) {
      console.log("TeacherDashboard: checking authentication...");
      return;
    }

    if (!authUser?._id) {
      console.log("TeacherDashboard: no authenticated teacher");
      return;
    }

    console.log("TeacherDashboard: fetching dashboard for", authUser._id);

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
  const safeStudents = Array.isArray(assignedStudents) ? assignedStudents : [];

  const safeRequests = Array.isArray(requests) ? requests : [];

  const pendingRequests = safeRequests.filter(
    (request) => request?.status === "pending",
  );

  // calculate research work values
  const calculatedTotalResearchWorks = safeStudents.reduce((total, student) => {
    let count = 0;

    if (student?.project) count += 1;
    if (student?.thesis) count += 1;

    return total + count;
  }, 0);

  const calculatedCompletedWorks = safeStudents.reduce((total, student) => {
    let count = 0;

    if (student?.project?.status === "completed") {
      count += 1;
    }

    if (student?.thesis?.status === "completed") {
      count += 1;
    }

    return total + count;
  }, 0);

  const calculatedActiveWorks = Math.max(
    calculatedTotalResearchWorks - calculatedCompletedWorks,
    0,
  );

  const assignedStudentCount =
    dashboardStats?.assignedStudents ?? safeStudents.length;

  const pendingRequestCount =
    dashboardStats?.totalPendingRequests ?? pendingRequests.length;

  const totalResearchWorks =
    dashboardStats?.totalResearchWorks ?? calculatedTotalResearchWorks;

  const completedWorks =
    dashboardStats?.completedWorks ?? calculatedCompletedWorks;

  const activeWorks = dashboardStats?.activeWorks ?? calculatedActiveWorks;

  // upcoming deadlines
  const upcomingDeadlines = Array.isArray(dashboardStats?.upcomingDeadlines)
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
      {/* techer dashboard heading */}
 <TeacherPageHeader
  label="Welcome back,"
  title={authUser?.name || "Teacher"}
  description="Manage your students and supervise their research, thesis and projects."
/>

      {/* statistics */}
      <section className="grid grid-cols-1 gap-3 min-[375px]:gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 xl:gap-5">
        {statsCards.map(({ title, value, icon: Icon, iconBg, color }) => (
          <div
            key={title}
            className="rounded-lg border border-slate-200 bg-white p-3 min-[375px]:p-3.5 sm:rounded-xl sm:p-4 lg:p-5 xl:p-6 2xl:p-7 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2 min-[375px]:gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] min-[375px]:text-xs sm:text-sm font-medium text-slate-500">
                  {title}
                </p>

                <p className="mt-1.5 min-[375px]:mt-2 sm:mt-2.5 lg:mt-3 text-lg min-[375px]:text-xl sm:text-2xl lg:text-[26px] xl:text-[28px] 2xl:text-[28px] font-bold leading-none text-slate-800">
                  {loading ? (
                    <Loader2 className="h-4 w-4 min-[375px]:h-5 min-[375px]:w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 animate-spin text-[#17a2b8]" />
                  ) : (
                    value
                  )}
                </p>
              </div>

              <div
                className={`flex h-8 w-8 min-[375px]:h-9 min-[375px]:w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
              >
                <Icon
                  className={`h-4 w-4 min-[375px]:h-5 min-[375px]:w-5 ${color}`}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* supervisor requests */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
              {/* supervisor requests sub-heading */}
      <TeacherPageHeader
  subHeader
  icon={UserCheck}
  title="Supervisor Requests"
  description="Students requesting you as their supervisor"
  action={
   <span className="ml-auto w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 custom-count">
  {pendingRequestCount} Pending
</span>
  }
/>

{/* supervisor requests card  */}
       <div className="p-3 xs:p-4 sm:p-6">
  {loading ? (
    <div className="flex justify-center py-8 xs:py-10">
      <Loader2
        size={26}
        className="animate-spin text-[#17a2b8] xs:h-[30px] xs:w-[30px]"
      />
    </div>
  ) : pendingRequests.length > 0 ? (
    <div className="space-y-3 xs:space-y-3.5">
      {pendingRequests.slice(0, 5).map((request) => (
        <div
          key={request._id}
          className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-[#f0fbfc] xs:gap-4 xs:rounded-xl xs:p-4 sm:p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          {/* Student info */}
          <div className="flex min-w-0 flex-1 items-start gap-2.5 xs:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17a2b8]/10 xs:h-10 xs:w-10">
              <Users className="h-4 w-4 text-[#138496] xs:h-5 xs:w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-sm font-semibold leading-5 text-slate-800 xs:text-base">
                {request.student?.name || "Unknown Student"}
              </h3>

              <p className="break-all text-xs leading-5 text-slate-500 xs:text-sm">
                {request.student?.email || "No email available"}
              </p>

              {request.proposal && (
                <div className="mt-1.5 flex min-w-0 items-start gap-1.5 xs:mt-2 xs:gap-2">
                  <FileText
                    size={13}
                    className="mt-0.5 shrink-0 text-[#138496] xs:h-[14px] xs:w-[14px]"
                  />

                  <p className="min-w-0 break-words text-xs leading-5 text-slate-600 xs:text-sm">
                    <span className="font-medium">
                      {request.proposalType}:
                    </span>{" "}
                    {request.proposal.title || "Untitled Research"}
                  </p>
                </div>
              )}

              <p className="mt-1 text-[11px] leading-4 text-slate-400 xs:text-xs">
                Requested{" "}
                {request.createdAt
                  ? new Date(request.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )
                  : "Recently"}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
            <button
              onClick={() => handleAccept(request._id)}
              className="inline-flex  items-center justify-center gap-1   transition-colors 
              btn-small 
              
              "
            >
              <Check size={15} className="shrink-0 xs:h-4 xs:w-4" />
              <span>Accept</span>
            </button>

            <button
              onClick={() => handleReject(request._id)}
              className=" btn-small  inline-flex  items-center justify-center gap-1  border border-red-200 bg-white  text-red-600 transition-colors hover:bg-red-50 "
            >
              <X size={15} className="shrink-0 xs:h-4 xs:w-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      ))}

      {pendingRequests.length > 5 && (
        <div className="flex justify-center pt-2 xs:pt-3">
          <button
            onClick={() => navigate("/teacher/pending-requests")}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#17a2b8]/20 bg-[#f0fbfc] px-3 py-2 text-xs font-semibold text-[#138496] transition-colors hover:bg-[#17a2b8]/10 xs:min-h-10 xs:px-4 xs:text-sm"
          >
            <span>View all {pendingRequestCount} requests</span>
            <ArrowRight size={15} className="shrink-0 xs:h-4 xs:w-4" />
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="py-8 text-center xs:py-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
        <CheckCircle className="h-6 w-6 text-green-500" />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-700 xs:text-base">
        No pending requests
      </h3>

      <p className="mt-1 text-xs text-slate-500 xs:text-sm">
        You are all caught up.
      </p>
    </div>
  )}
</div>
      </section>

      {/* students and research overview */}
      <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 xl:grid-cols-2">
        {/* students overview  */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
              {/* my research students sub-heading*/}
         <TeacherPageHeader
  subHeader
  icon={Users}
  title="My Research Students"
  description="Students currently under your supervision"
/>

          <div className="p-3 xs:p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-7 xs:py-8">
                <Loader2
                  size={25}
                  className="animate-spin text-[#17a2b8] xs:h-7 xs:w-7"
                />
              </div>
            ) : safeStudents.length > 0 ? (
              <div className="space-y-2.5 xs:space-y-3">
                {safeStudents.slice(0, 2).map((student) => {
                  const work = student?.project || student?.thesis;

                  const workType = student?.project
                    ? "Project"
                    : student?.thesis
                      ? "Thesis"
                      : null;

                  const isCompleted = work?.status === "completed";

                  return (
                    <div
                      key={student._id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-[#f0fbfc] xs:p-4"
                    >
                      <div className="flex items-center justify-between gap-2.5 xs:gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-800 xs:text-sm sm:text-base">
                            {student.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500 xs:text-sm sm:text-base">
                            {work?.title || "No research work yet"}
                          </p>

                          {/* Project / Thesis */}
                          {workType && (
                            <span className="mt-1.5 inline-block text-[11px] font-medium text-[#138496] xs:mt-2 xs:text-xs sm:text-sm">
                              {workType}
                            </span>
                          )}
                        </div>

                        {/* Status */}
                        {work?.status && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium xs:px-2.5 xs:py-1 xs:text-xs sm:text-sm ${
                              isCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {work.status}
                          </span>
                        )}
                      </div>

                      {/* Research Progress */}
                      {work && (
                        <div className="mt-2.5 xs:mt-3">
                          <div className="mb-1 flex justify-between gap-2 text-[10px] xs:text-xs sm:text-sm">
                            <span className="text-slate-500">
                              Research Progress
                            </span>

                            <span className="font-medium text-slate-700">
                              {isCompleted ? "100%" : "In Progress"}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                isCompleted ? "bg-green-500" : "bg-[#17a2b8]"
                              }`}
                              style={{
                                width: isCompleted ? "100%" : "50%",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* View All */}
                {safeStudents.length > 2 && (
                  <div className="pt-1.5 text-center xs:pt-2">
                    <button
                      onClick={() => navigate("/teacher/assigned-students")}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#138496] hover:text-[#0f6674] xs:text-sm sm:text-base"
                    >
                      View all students
                      <ArrowRight
                        size={14}
                        className="xs:h-[15px] xs:w-[15px] sm:h-4 sm:w-4"
                      />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center xs:py-10">
                <Users className="mx-auto h-7 w-7 text-slate-300 xs:h-8 xs:w-8" />

                <p className="mt-2.5 text-xs text-slate-500 xs:mt-3 xs:text-sm">
                  No students assigned yet.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* research overview  */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
              {/* research overview sub-heading */}

        <TeacherPageHeader
  subHeader
  icon={BookOpen}
  title="Research Overview"
  description="Current supervision summary"
/>

          <div className="grid grid-cols-2 gap-2.5 p-3 xs:gap-3 xs:p-4 sm:gap-4 sm:p-6">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 xs:rounded-xl xs:p-4 sm:p-5">
              <p className="text-[11px] text-blue-600 xs:text-xs sm:text-sm">
                Students
              </p>

              <p className="mt-1.5 text-xl font-bold text-blue-700 xs:mt-2 xs:text-2xl">
                {assignedStudentCount}
              </p>
            </div>

            <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 xs:rounded-xl xs:p-4 sm:p-5">
              <p className="text-[11px] text-yellow-600 xs:text-xs sm:text-sm">
                Pending Requests
              </p>

              <p className="mt-1.5 text-xl font-bold text-yellow-700 xs:mt-2 xs:text-2xl">
                {pendingRequestCount}
              </p>
            </div>

            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-3 xs:rounded-xl xs:p-4 sm:p-5">
              <p className="text-[11px] text-cyan-600 xs:text-xs sm:text-sm">
                Active Research
              </p>

              <p className="mt-1.5 text-xl font-bold text-cyan-700 xs:mt-2 xs:text-2xl">
                {activeWorks}
              </p>
            </div>

            <div className="rounded-lg border border-green-100 bg-green-50 p-3 xs:rounded-xl xs:p-4 sm:p-5">
              <p className="text-[11px] text-green-600 xs:text-xs sm:text-sm">
                Completed
              </p>

              <p className="mt-1.5 text-xl font-bold text-green-700 xs:mt-2 xs:text-2xl">
                {completedWorks}
              </p>
            </div>

            <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 xs:rounded-xl xs:p-4 sm:p-5">
              <p className="text-[11px] text-slate-500 xs:text-xs sm:text-sm">
                Total Research Works
              </p>

              <p className="mt-1.5 text-xl font-bold text-slate-800 xs:mt-2 xs:text-2xl">
                {totalResearchWorks}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* upcoming deadlines */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
            {/* upcoming deadlines sub-heading */}
        <TeacherPageHeader
  subHeader
  icon={CalendarDays}
  title="Upcoming Deadlines"
  description="Important deadlines for your supervised research"
  action={
    <button
      onClick={() => navigate("/teacher/table")}
      className="btn-small"
    >
      View all
    </button>
  }
/>

        <div className="p-3 xs:p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-7 xs:py-8">
              <Loader2
                size={26}
                className="animate-spin text-[#17a2b8] xs:h-[30px] xs:w-[30px]"
              />
            </div>
          ) : upcomingDeadlines.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 xs:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcomingDeadlines.slice(0, 6).map((deadline) => {
                const deadlineDate = deadline?.dueDate
                  ? new Date(deadline.dueDate)
                  : null;

                const today = new Date();

                const diffTime = deadlineDate
                  ? deadlineDate.getTime() - today.getTime()
                  : 0;

                const daysLeft = deadlineDate
                  ? Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  : null;

                const isUrgent = daysLeft !== null && daysLeft <= 3;

                return (
                  <div
                    key={deadline._id}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#17a2b8]/30 hover:shadow-md xs:rounded-2xl xs:p-4 sm:p-5"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 ${
                        isUrgent ? "bg-red-400" : "bg-[#17a2b8]"
                      }`}
                    />

                    <h3 className="line-clamp-2 pt-1 text-xs font-semibold leading-5 text-slate-800 xs:text-sm xs:leading-6 sm:text-base">
                      {deadline?.researchTitle ||
                        deadline?.projectTitle ||
                        deadline?.thesisTitle ||
                        deadline?.title ||
                        deadline?.name ||
                        "Research Deadline"}
                    </h3>

                    <div className="mt-2 flex items-center justify-between gap-2  pt-2.5 xs:mt-4 xs:gap-3 xs:pt-3">
                      <div className="flex items-center gap-1.5 min-w-0 font-medium text-slate-700 text-[10px] min-[320px]:text-[11px] min-[375px]:text-[12px] min-[425px]:text-[13px] md:text-[13px] lg:text-[13px] xl:text-[13px]">
                        <User className="shrink-0 text-slate-500 w-[1.2em] h-[1.2em]" />
                        <span className="truncate">
                          {deadline?.student?.name ||
                            deadline?.studentName ||
                            "Student"}
                        </span>
                      </div>

                      <span
                        className={`shrink-0 font-semibold text-[9px] min-[320px]:text-[10px] min-[375px]:text-[11px] min-[425px]:text-[12px] md:text-[12px] lg:text-[12px] xl:text-[12px] ${
                          deadline?.type?.toLowerCase() === "thesis"
                            ? "text-violet-600"
                            : "text-[#138496]"
                        }`}
                      >
                        {deadline?.type || "Project"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 xs:mt-4 xs:gap-3 xs:pt-3">
                      <div className="flex min-w-0 items-center gap-1.5 font-medium text-slate-600 text-[10px] min-[320px]:text-[11px] min-[375px]:text-[12px] min-[425px]:text-[13px] md:text-[13px] lg:text-[13px] xl:text-[13px]">
                        <CalendarDays
                          className={`h-3.5 w-3.5 shrink-0 xs:h-4 xs:w-4 ${
                            deadline?.type?.toLowerCase() === "thesis"
                              ? "text-violet-600"
                              : "text-[#138496]"
                          }`}
                        />

                        <span className="min-w-0 truncate whitespace-nowrap text-[10px] font-medium text-slate-600 xs:text-xs sm:text-sm">
                          {deadlineDate
                            ? deadlineDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No date"}
                        </span>
                      </div>

                      {daysLeft !== null && (
                        <span
                          className={`shrink-0 whitespace-nowrap font-semibold text-[9px] min-[320px]:text-[10px] min-[375px]:text-[11px] min-[425px]:text-[12px] md:text-[12px] lg:text-[12px] xl:text-[12px] ${
                            isUrgent ? "text-red-600" : "text-slate-500"
                          }`}
                        >
                          {daysLeft < 0
                            ? "Overdue"
                            : daysLeft === 0
                              ? "Due today"
                              : `${daysLeft} ${
                                  daysLeft === 1 ? "day" : "days"
                                } left`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center xs:py-10">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-50 xs:h-12 xs:w-12">
                <CheckCircle className="h-5 w-5 text-green-500 xs:h-6 xs:w-6" />
              </div>

              <h3 className="mt-2.5 text-xm font-semibold text-slate-700 xs:mt-3 xs:text-sm">
                No upcoming deadlines
              </h3>

              <p className="mt-1 text-xs text-slate-500 xs:text-sm">
                There are no upcoming deadlines at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;
