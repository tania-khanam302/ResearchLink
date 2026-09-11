import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import {
  AlertCircle,
  AlertTriangle,
  Box,
  FileTextIcon,
  Folder,
  Plus,
  PlusIcon,
  User,
  View,
  X,
} from "lucide-react";
import {
  getAllProjects,
  getAllTheses,
  getDashboardStats,
} from "../../store/slices/adminSlice";
import { downloadProjectFile } from "./../../store/slices/projectSlice";
import { downloadThesisFile } from "../../store/slices/thesisSlice";
import { getNotifications } from "./../../store/slices/notificationSlice";
import {
  toggleStudentModal,
  toggleTeacherModal,
} from "../../store/slices/popupSlice";

const AdminDashboard = () => {
  const {
    isCreateStudentModalOpen,
    isCreateTeacherModalOpen,
    isCreateCoAdminModalOpen,
  } = useSelector((state) => state.popup);
  const { stats, projects, theses } = useSelector((state) => state.admin);
  const notifications = useSelector((state) => state.notification.list);
  const dispatch = useDispatch();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());
    dispatch(getAllTheses());
  }, [dispatch]);

  const nearingDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    return (projects || []).filter((p) => {
      if (!p.deadline) return false;
      const d = new Date(p.deadline);
      return d >= now && d.getTime() - now.getTime() <= threeDays;
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    const projectFiles = (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        id: `${p._id}-${f._id}`,
        projectId: p._id,
        fileId: f._id,
        originalName: f.originalName,
        uploadedAt: f.uploadedAt,
        title: p.title,
        studentName: p.student?.name,
        type: "Project",
      })),
    );

    const thesisFiles = (theses || []).flatMap((t) =>
      (t.files || []).map((f) => ({
        id: `${t._id}-${f._id}`,
        thesisId: t._id,
        fileId: f._id,
        originalName: f.originalName,
        uploadedAt: f.uploadedAt,
        title: t.title,
        studentName: t.student?.name,
        type: "Thesis",
      })),
    );

    return [...projectFiles, ...thesisFiles];
  }, [projects, theses]);

  const filteredFiles = files.filter(
    (f) =>
      (f.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.title || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
      (f.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.type || "").toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const handleDownload = async (file) => {
    try {
      let res;

      if (file.type === "Project") {
        res = await dispatch(
          downloadProjectFile({
            projectId: file.projectId,
            fileId: file.fileId,
          }),
        ).unwrap();
      } else if (file.type === "Thesis") {
        res = await dispatch(
          downloadThesisFile({
            thesisId: file.thesisId,
            fileId: file.fileId,
          }),
        ).unwrap();
      }

      const blob = res.blob;

      const url = window.URL.createObjectURL(new Blob([blob]));

      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("File download failed");
    }
  };

  const recentProjects = useMemo(() => {
    return [...(projects || [])]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [projects]);

  const recentTheses = useMemo(() => {
    return [...(theses || [])]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [theses]);

  const supervisorBucket = useMemo(() => {
    const map = new Map();

    // Projects
    (projects || []).forEach((p) => {
      const supervisorName = p.supervisor?.name || "Not Assigned";

      if (!map.has(supervisorName)) {
        map.set(supervisorName, {
          name: supervisorName,
          projectCount: 0,
          thesisCount: 0,
        });
      }

      map.get(supervisorName).projectCount += 1;
    });

    // Theses
    (theses || []).forEach((t) => {
      const supervisorName = t.supervisor?.name || "Not Assigned";

      if (!map.has(supervisorName)) {
        map.set(supervisorName, {
          name: supervisorName,
          projectCount: 0,
          thesisCount: 0,
        });
      }

      map.get(supervisorName).thesisCount += 1;
    });

    return Array.from(map.values());
  }, [projects, theses]);

  const latestNotifications = useMemo(
    () => (notifications || []).slice(0, 6),
    [notifications],
  );

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();
    if (p === "high" && (t === "rejection" || t === "reject"))
      return "bg-red-600";
    if (p === "medium" && (t === "deadline" || t === "due"))
      return "bg-orange-500";
    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-slate-400";
    // type-based fallback
    if (t === "approval" || t === "approved") return "bg-green-600";
    if (t === "request") return "bg-blue-600";
    if (t === "feedback") return "bg-purple-600";
    if (t === "meeting") return "bg-cyan-600";
    if (t === "system") return "bg-slate-600";
    return "bg-slate-400";
  };

  const getBadgeClasses = (kind, value) => {
    const v = (value || "").toLowerCase();
    if (kind === "type") {
      if (["rejection", "reject"].includes(v)) return "bg-red-100 text-red-800";
      if (["approval", "approved"].includes(v))
        return "bg-green-100 text-green-800";
      if (["deadline", "due"].includes(v))
        return "bg-orange-100 text-orange-800";
      if (v === "request") return "bg-blue-100 text-blue-800";
      if (v === "feedback") return "bg-purple-100 text-purple-800";
      if (v === "meeting") return "bg-cyan-100 text-cyan-800";
      if (v === "system") return "bg-slate-100 text-slate-800";
      return "bg-gray-100 text-gray-800";
    }
    // priority
    if (v === "high") return "bg-red-100 text-red-800";
    if (v === "medium") return "bg-yellow-100 text-yellow-800";
    if (v === "low") return "bg-gray-100 text-gray-800";
    return "bg-slate-100 text-slate-800";
  };
  const completedProjects = useMemo(() => {
    return (projects || []).filter(
      (project) => project.status?.toLowerCase() === "completed",
    ).length;
  }, [projects]);

  const pendingProjects = (projects || []).length - completedProjects;

  const completedTheses = useMemo(() => {
    return (theses || []).filter(
      (thesis) => thesis.status?.toLowerCase() === "completed",
    ).length;
  }, [theses]);

  const pendingTheses = (theses || []).length - completedTheses;

  const dashboardStats = [
    {
      title: "Total Co-Admins",
      value: stats?.totalCoAdmins ?? 0,
      bg: "bg-purple-100",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      Icon: User,
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      bg: "bg-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: Box,
    },
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      bg: "bg-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: User,
    },

    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      bg: "bg-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertCircle,
    },
    {
      title: "Active Theses",
      value: stats?.totalTheses ?? 0,
      bg: "bg-indigo-100",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      Icon: FileTextIcon,
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      bg: "bg-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      Icon: Folder,
    },

    {
      title: "Nearing Deadlines",
      value: nearingDeadlines,
      bg: "bg-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: AlertTriangle,
    },
  ];

  const actionButtons = [
    {
      label: "Add Student",
      onClick: () => dispatch(toggleStudentModal()),
      btnClass: "btn-primary h-[40px] bg-[#17a2b8] hover:bg-[#138496]",
      Icon: PlusIcon,
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModal()),
      btnClass: "btn-secondary h-[40px]",
      Icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportModalOpen(true),
      btnClass: "btn-outline h-[40px] border-[#17a2b8] text-[#17a2b8]",
      Icon: FileTextIcon,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />
          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-4H3v4zm10-18v4h8V3h-8z"
                    />
                  </svg>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-600">
                      Administration
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-400">
                      Control Panel
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Admin Dashboard
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Manage your project management system, monitor activities,
                    and oversee users and academic projects from one place.
                  </p>
                </div>
              </div>

              {/* Right Status Card */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    System Status
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    All Systems Operational
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-cyan-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-500/5" />
          <div className="pointer-events-none absolute right-20 -bottom-20 h-32 w-32 rounded-full bg-indigo-500/5" />
        </div>

        {/* stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {dashboardStats.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 ${item.iconColor.replace(
                  "text-",
                  "bg-",
                )}`}
              />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {item.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  <item.Icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-400">
                  Current overview
                </span>
              </div>
            </div>
          ))}
        </div>

        {/*  project / thesis status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Project Status */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <Folder className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Project Overview
                  </h3>
                  <p className="text-xs text-slate-400">
                    Current project status
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Completed Projects */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Completed Projects
                  </span>
                  <span className="font-bold text-green-600">
                    {completedProjects}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{
                      width:
                        projects?.length > 0
                          ? `${(completedProjects / projects.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Pending Projects */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Pending Projects
                  </span>
                  <span className="font-bold text-yellow-600">
                    {pendingProjects}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                    style={{
                      width:
                        projects?.length > 0
                          ? `${(pendingProjects / projects.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thesis Status */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <FileTextIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Thesis Overview
                  </h3>

                  <p className="text-xs text-slate-400">
                    Current thesis status
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Completed Theses */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Completed Theses
                  </span>
                  <span className="font-bold text-green-600">
                    {completedTheses}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{
                      width:
                        theses?.length > 0
                          ? `${(completedTheses / theses.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Pending Theses */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Pending Theses
                  </span>
                  <span className="font-bold text-yellow-600">
                    {pendingTheses}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                    style={{
                      width:
                        theses?.length > 0
                          ? `${(pendingTheses / theses.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* charts and activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thesis / Project Distribution */}
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                      <FileTextIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Thesis / Project Distribution
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Academic work assigned to each supervisor
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-500">Project</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                    <span className="text-slate-500">Thesis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* // No supervisor data available */}
            <div className="p-5">
              {supervisorBucket.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                  No supervisor data available
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={supervisorBucket}
                      margin={{
                        top: 15,
                        right: 10,
                        bottom: 10,
                        left: 0,
                      }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E2E8F0"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 12,
                          fill: "#64748B",
                        }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        height={45}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 12,
                          fill: "#64748B",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        cursor={{
                          fill: "rgba(99, 102, 241, 0.04)",
                        }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                        }}
                        labelFormatter={(label) => `Supervisor: ${label}`}
                        formatter={(value, name) => {
                          if (name === "Project") {
                            return [value, "Project"];
                          }

                          if (name === "Thesis") {
                            return [value, "Thesis"];
                          }

                          return [value, name];
                        }}
                      />

                      <Bar
                        dataKey="projectCount"
                        name="Project"
                        stackId="a"
                        fill="#2563EB"
                        radius={[0, 0, 0, 0]}
                      />

                      <Bar
                        dataKey="thesisCount"
                        name="Thesis"
                        stackId="a"
                        fill="#7C3AED"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50">
                    <AlertCircle className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recent Activity
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Latest system notifications
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {latestNotifications.length}
                </span>
              </div>
            </div>

            <div
              className="
        h-[300px]
        space-y-1
        overflow-y-auto
        px-5 py-3
        pr-3
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-slate-200
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb:hover]:bg-slate-300
      "
            >
              {latestNotifications.map((n) => (
                <div
                  key={n._id}
                  className="group flex gap-3 rounded-xl p-3 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full ${getBulletColor(
                        n.type,
                        n.priority,
                      )}`}
                    />
                    <div className="mt-2 h-full w-px bg-slate-100 group-last:hidden" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5 text-slate-700">
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${getBadgeClasses(
                          "type",
                          n.type,
                        )}`}
                      >
                        {n.type}
                      </span>

                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          n.priority === "high"
                            ? "bg-red-50 text-red-600"
                            : n.priority === "medium"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {n.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* No recent notifications */}
              {latestNotifications.length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No recent notifications
                </div>
              )}
            </div>
          </div>
        </div>

        {/* recent projects and theses */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                  <Folder className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Projects
                  </h3>
                  <p className="text-xs text-slate-400">
                    Latest academic projects
                  </p>
                </div>
              </div>
            </div>

            {/* No projects found */}
            <div className="max-h-[300px] overflow-y-auto">
              {recentProjects.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  No projects found
                </div>
              ) : (
                recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {project.title || project.name || "Untitled Project"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {project.student?.name ||
                          project.studentName ||
                          "No Student"}
                      </p>
                    </div>

                    <span
                      className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        project.status?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {project.status || "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Theses */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <FileTextIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Theses
                  </h3>
                  <p className="text-xs text-slate-400">
                    Latest academic theses
                  </p>
                </div>
              </div>
            </div>

            {/* No theses found */}
            <div className="max-h-[300px] overflow-y-auto">
              {recentTheses.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  No theses found
                </div>
              ) : (
                recentTheses.map((thesis) => (
                  <div
                    key={thesis._id}
                    className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {thesis.title || "Untitled Thesis"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {thesis.student?.name ||
                          thesis.studentName ||
                          "No Student"}
                      </p>
                    </div>

                    <span
                      className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        thesis.status?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {thesis.status || "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Quick Actions
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Quickly manage your academic system
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {actionButtons.map((btn, index) => (
                <button
                  key={index}
                  className={`${btn.btnClass} flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition`}
                  onClick={btn.onClick}
                >
                  <btn.Icon className="h-4 w-4" />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isReportModalOpen && (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
  <div className="bg-white rounded-sm w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
    
    {/* Header */}
    <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50 sticky top-0 z-10 shrink-0">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">
          All Files
        </h3>

        <button
          onClick={() => setIsReportModalOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Search by file name, thesis and project title, or student name"
          value={reportSearch}
          onChange={(e) => setReportSearch(e.target.value)}
        />
      </div>
    </div>

    {/* Scrollable Files */}
    <div className="flex-1 overflow-y-auto p-3">
      {filteredFiles.length === 0 ? (
        <div className="text-slate-500">
          No files found.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-slate-50 rounded"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-800 truncate">
                  {f.originalName}
                </div>

                <div className="text-sm text-slate-500 truncate">
                  {f.type} - {f.title} - {f.studentName}
                </div>
              </div>

              <button
                className="btn-outline btn-small ml-3 shrink-0"
                onClick={() => handleDownload(f)}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>

        )}
        {isCreateStudentModalOpen && <AddStudent />}
        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </>
  );
};

export default AdminDashboard;
