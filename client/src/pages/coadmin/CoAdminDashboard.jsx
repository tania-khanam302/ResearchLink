import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  UserCheck,
  Clock,
  FolderKanban,
  FileText,
  Folder,
  PlusIcon,
  X,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import {
  getAllUsers,
  getAllProjects,
  getAllTheses,
} from "../../store/slices/adminSlice";

import { getNotifications } from "../../store/slices/notificationSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";
import { downloadThesisFile } from "../../store/slices/thesisSlice";
import {
  toggleStudentModal,
  toggleTeacherModal,
} from "../../store/slices/popupSlice";

const CoAdminDashboard = () => {
  const dispatch = useDispatch();

  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector(
    (state) => state.popup,
  );

  const {
    users = [],
    projects = [],
    theses = [],
  } = useSelector((state) => state.admin);

  const notifications = useSelector((state) => state.notification.list || []);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
    dispatch(getAllTheses());
    dispatch(getNotifications());
  }, [dispatch]);

  const students = useMemo(() => {
    return (users || []).filter(
      (user) => user.role?.toLowerCase() === "student",
    );
  }, [users]);

  const teachers = useMemo(() => {
    return (users || []).filter(
      (user) => user.role?.toLowerCase() === "teacher",
    );
  }, [users]);

  // assigned students
  const assignedStudents = useMemo(() => {
    return students.filter((student) => {
      return [...(projects || []), ...(theses || [])].some((item) => {
        const studentId =
          item.student?._id || item.student?.id || item.studentId;

        return studentId && String(studentId) === String(student._id);
      });
    });
  }, [students, projects, theses]);

  const unassignedStudents = students.length - assignedStudents.length;

  // completed projects
  const completedProjects = useMemo(() => {
    return (projects || []).filter(
      (project) => project.status?.toLowerCase() === "completed",
    ).length;
  }, [projects]);

  const pendingProjects = projects.length - completedProjects;

  // completed theses
  const completedTheses = useMemo(() => {
    return (theses || []).filter(
      (thesis) => thesis.status?.toLowerCase() === "completed",
    ).length;
  }, [theses]);

  const pendingTheses = theses.length - completedTheses;

  // supervisor distribution
  const supervisorBucket = useMemo(() => {
    const map = new Map();

    const addSupervisor = (supervisorName, type) => {
      if (!map.has(supervisorName)) {
        map.set(supervisorName, {
          name: supervisorName,
          projectCount: 0,
          thesisCount: 0,
        });
      }

      if (type === "project") {
        map.get(supervisorName).projectCount += 1;
      }

      if (type === "thesis") {
        map.get(supervisorName).thesisCount += 1;
      }
    };

    (projects || []).forEach((project) => {
      addSupervisor(project.supervisor?.name || "Not Assigned", "project");
    });

    (theses || []).forEach((thesis) => {
      addSupervisor(thesis.supervisor?.name || "Not Assigned", "thesis");
    });

    return Array.from(map.values());
  }, [projects, theses]);

  // recent projects
  const recentProjects = useMemo(() => {
    return [...(projects || [])]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [projects]);

  // recent theses
  const recentTheses = useMemo(() => {
    return [...(theses || [])]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [theses]);

  // report files
  const files = useMemo(() => {
    const projectFiles = (projects || []).flatMap((project) =>
      (project.files || []).map((file) => ({
        id: `${project._id}-${file._id}`,
        projectId: project._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        title: project.title,
        studentName: project.student?.name,
        type: "Project",
      })),
    );

    // thesis files
    const thesisFiles = (theses || []).flatMap((thesis) =>
      (thesis.files || []).map((file) => ({
        id: `${thesis._id}-${file._id}`,
        thesisId: thesis._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        title: thesis.title,
        studentName: thesis.student?.name,
        type: "Thesis",
      })),
    );

    return [...projectFiles, ...thesisFiles];
  }, [projects, theses]);

  const filteredFiles = useMemo(() => {
    const search = reportSearch.toLowerCase();

    return files.filter(
      (file) =>
        (file.originalName || "").toLowerCase().includes(search) ||
        (file.title || "").toLowerCase().includes(search) ||
        (file.studentName || "").toLowerCase().includes(search) ||
        (file.type || "").toLowerCase().includes(search),
    );
  }, [files, reportSearch]);

  // bownload
  const handleDownload = async (file) => {
    try {
      let response;

      if (file.type === "Project") {
        response = await dispatch(
          downloadProjectFile({
            projectId: file.projectId,
            fileId: file.fileId,
          }),
        ).unwrap();
      }

      if (file.type === "Thesis") {
        response = await dispatch(
          downloadThesisFile({
            thesisId: file.thesisId,
            fileId: file.fileId,
          }),
        ).unwrap();
      }

      const blob = response.blob;

      const url = window.URL.createObjectURL(new Blob([blob]));

      const link = document.createElement("a");

      link.href = url;
      link.download = file.originalName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("File download failed");
    }
  };

  // latest notifications
  const latestNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);
  }, [notifications]);

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();

    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-slate-400";

    if (t === "approval" || t === "approved") {
      return "bg-green-500";
    }

    if (t === "request") {
      return "bg-blue-500";
    }

    return "bg-slate-400";
  };

  const stats = [
    {
      title: "Total Teachers",
      value: teachers.length,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      bar: "bg-green-500",
    },
    {
      title: "Total Students",
      value: students.length,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      bar: "bg-blue-500",
    },
    {
      title: "Assigned Students",
      value: assignedStudents.length,
      icon: UserCheck,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      bar: "bg-cyan-500",
    },
    {
      title: "Unassigned Students",
      value: unassignedStudents,
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      bar: "bg-yellow-500",
    },
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      bar: "bg-purple-500",
    },
    {
      title: "Total Theses",
      value: theses.length,
      icon: FileText,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      bar: "bg-indigo-500",
    },
  ];

  const actionButtons = [
    {
      label: "Add Student",
      onClick: () => dispatch(toggleStudentModal()),
      className: "bg-[#17a2b8] hover:bg-[#138496] text-white",
      icon: PlusIcon,
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModal()),
      className: "bg-green-600 hover:bg-green-800 text-white",
      icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportModalOpen(true),
      className: "border border-cyan-500 text-cyan-600 hover:bg-cyan-50",
      icon: FileText,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Co-Admin Dashboard Header  */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />
          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-600">
                      Academic Management
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-400">
                      Co-Admin Panel
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Co-Admin Dashboard
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Monitor students, supervisors, theses, projects and academic
                    activities from one place.
                  </p>
                </div>
              </div>

              {/* Status */}

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
        </div>

        {/* Co-admin stats  */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${item.bar}`}
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
                    <Icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-xs font-medium text-slate-400">
                    Current overview
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thesis and Project */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Project */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <FolderKanban className="h-5 w-5 text-purple-600" />
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
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-slate-600">
                    Completed Projects
                  </span>

                  <span className="font-bold text-green-600">
                    {completedProjects}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width:
                        projects.length > 0
                          ? `${(completedProjects / projects.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-slate-600">
                    Pending Projects
                  </span>

                  <span className="font-bold text-yellow-600">
                    {pendingProjects}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-yellow-500"
                    style={{
                      width:
                        projects.length > 0
                          ? `${(pendingProjects / projects.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thesis */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <FileText className="h-5 w-5 text-indigo-600" />
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
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-slate-600">
                    Completed Theses
                  </span>

                  <span className="font-bold text-green-600">
                    {completedTheses}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width:
                        theses.length > 0
                          ? `${(completedTheses / theses.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-slate-600">Pending Theses</span>

                  <span className="font-bold text-yellow-600">
                    {pendingTheses}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-yellow-500"
                    style={{
                      width:
                        theses.length > 0
                          ? `${(pendingTheses / theses.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thesis / Project Distribution */}
        <div className="grid grid-cols-1 gap-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                    <FileText className="h-5 w-5 text-indigo-600" />
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

            <div className="p-5">
              {supervisorBucket.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                  No supervisor data available
                </div>
              ) : (
                <div className="h-[300px]">
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
                      />

                      <Bar
                        dataKey="projectCount"
                        name="Project"
                        stackId="academic"
                        fill="#2563EB"
                      />

                      <Bar
                        dataKey="thesisCount"
                        name="Thesis"
                        stackId="academic"
                        fill="#7C3AED"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Thesis and Project */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Projects */}

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

          {/* Theses */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <FileText className="h-5 w-5 text-indigo-600" />
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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              {actionButtons.map((button, index) => {
                const Icon = button.icon;

                return (
                  <button
                    key={index}
                    onClick={button.onClick}
                    className={`${button.className} flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{button.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Report modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-200 bg-blue-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Academic Reports
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Download project and thesis files
                    </p>
                  </div>

                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Search file, thesis, project or student..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-[450px] overflow-y-auto p-4">
                {filteredFiles.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                    No files found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              file.type === "Project"
                                ? "bg-purple-100"
                                : "bg-indigo-100"
                            }`}
                          >
                            {file.type === "Project" ? (
                              <Folder className="h-5 w-5 text-purple-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {file.originalName}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {file.type} • {file.title || "No Title"} •{" "}
                              {file.studentName || "No Student"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(file)}
                          className="flex shrink-0 items-center gap-2 rounded-lg border border-cyan-500 px-3 py-2 text-xs font-semibold text-cyan-600 transition hover:bg-cyan-50"
                        >
                          <Download className="h-4 w-4" />
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

        {/* modal */}
        {isCreateStudentModalOpen && <AddStudent />}
        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </>
  );
};

export default CoAdminDashboard;
