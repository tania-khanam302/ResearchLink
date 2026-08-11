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
  getDashboardStats,
} from "../../store/slices/adminSlice";
import { downloadProjectFile } from "./../../store/slices/projectSlice";
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

  const { stats, projects } = useSelector((state) => state.admin);
  // const { projects } = useSelector((state) => state.project);
  const { notifications } = useSelector((state) => state.notification.list);

  const dispatch = useDispatch();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());
  }, [dispatch]);

  const nearingDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 din in milliseconds
    return (projects || []).filter((p) => {
      if (!p.deadline) return false;
      const d = new Date(p.deadline);
      return d >= now && d.getTime() - now.getTime() <= threeDays;
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        fileId: f._id,
        originalName: f.originalName,
        uploadedAt: f.uploadedAt,
        projectTitle: p.title,
        studentName: p.student?.name,
      })),
    );
  }, [projects]);

  const filteredFiles = files.filter(
    (f) =>
      (f.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.studentName || "").toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const handleDownload = async (projectId, fileId, name) => {
    const res = await dispatch(downloadProjectFile({ projectId, fileId })).then(
      (res) => {
        const { blob } = res.payload;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", name || "download");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
    );
  };


  const supervisorBucket = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => {
      if (!p.supervisor?.name) return;
      const name = p.supervisor.name;
      map.set(name, (map.get(name) || 0) + 1);
    });

    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [projects]);

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
      btnClass: "btn-primary bg-[#17a2b8] hover:bg-[#138496]",
      Icon: PlusIcon,
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModal()),
      btnClass: "btn-secondary",
      Icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportModalOpen(true),
      btnClass: "btn-outline border-[#17a2b8] text-[#17a2b8]",
      Icon: FileTextIcon,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="bg-gradient-to-r from-[#17a2b8] to-purple-500 rounded-lg text-white p-4">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">
            Manage the entire project management system and oversee all
            activities.
          </p>
        </div>

        {/* stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {dashboardStats.map((item, i) => (
            <div
              key={i}
              className={`relative overflow-hidden ${item.bg} backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition`}
            >
              {/* left border */}
              <div className="absolute left-0 top-0 h-full w-1 bg-[#17a2b8]" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{item.title}</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>

                <div className={`p-3 rounded-full shadow-sm ${item.iconBg}`}>
                  <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
              </div>

              {/* glow effect */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-200/20 blur-2xl rounded-full" />
            </div>
          ))}
        </div>

        {/* Charts & activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vertical Bar Chart */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="card-title">Project Distribution by Supervisor</h3>
            </div>
            <div className="p-2">
              {supervisorBucket.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded text-slate-500">
                  No data
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={supervisorBucket}
                      margin={{ top: 28, right: 8, bottom: 10, left: 8 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={{ stroke: "#CBD5E1" }}
                        tickLine={{ stroke: "#CBD5E1" }}
                        interval={0}
                        height={50}
                        dy={10}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={{ stroke: "#CBD5E1" }}
                        tickLine={{ stroke: "#CBD5E1" }}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                        contentStyle={{
                          borderRadius: 8,
                          borderColor: "#E2E8F0",
                        }}
                        formatter={(value, name) => [
                          value,
                          name === "count" ? "Projects Assigned" : name,
                        ]}
                        labelFormatter={(label) => `Supervisor: ${label}`}
                      />

                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {supervisorBucket.map((entry, index) => {
                          const colors = [
                            "#1E3A8A",
                            "#2563EB",
                            "#3882F6",
                            "#60A5FA",
                            "#93C5FD",
                          ];

                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {latestNotifications.map((n) => {
                return (
                  <div key={n._id} className="flex items-center text-sm ">
                    <div
                      className={`mt-1 w-2 h-2 ${getBulletColor(n.type, n.priority)} rounded-full mr-3`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{n.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-sm font-medium ${
                            (getBadgeClasses("type"), String(n.type))
                          }`}
                        >
                          Type: {n.type}
                        </span>
                        <span
                          className={`px-2 py-0.05 rounded text-sm font-medium`}
                        >
                          Priority: {n.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {latestNotifications.length === 0 && (
                <div className="text-slate-500 text-sm">
                  No recent notifications
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>

          <div className="grid grid-1 md:grid-cols-3 gap-4">
            {actionButtons.map((btn, index) => {
              return (
                <button
                  key={index}
                  className={`${btn.btnClass} flex items-center justify-center space-x-2`}
                  onClick={btn.onClick}
                >
                  <btn.Icon className="w-5 h-5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
            <div className="bg-white rounded-sm w-full max-w-lg mx-4 overflow-hidden">
              <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50  sticky top-0 z-10">
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
                    placeholder="Search by file name, project title, or student name"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="text-slate-500 ">No files found.</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {filteredFiles.map((f, i) => {
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {f.originalName}
                          </div>

                          <div className="text-sm text-slate-500">
                            {f.projectTitle} - {f.studentName}
                          </div>
                        </div>

                        <button
                          className="btn-outline btn-small"
                          onClick={() =>
                            handleDownload(
                              f.projectId,
                              f.fileId,
                              f.originalName,
                            )
                          }
                        >
                          Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
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
