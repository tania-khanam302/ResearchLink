import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
  getAllProjects,
  getAllTheses,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [pendingFor, setPendingFor] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // const { users, projects } = useSelector((state) => state.admin);
const { users, projects, theses } = useSelector(
  (state) => state.admin
);

  // useEffect(() => {
  //   if (!users || users.length === 0) {
  //     dispatch(getAllUsers());
  //   }
  // }, [dispatch, users]);

  useEffect(() => {
  dispatch(getAllUsers());
  dispatch(getAllProjects());
  dispatch(getAllTheses());
}, [dispatch]);


  // =========================
  // Teachers
  // =========================
  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (u) => (u.role || "").toLowerCase() === "teacher"
    );

    return teacherUsers.map((t) => ({
      ...t,
      assignedCount: Array.isArray(t.assignedStudents)
        ? t.assignedStudents.length
        : 0,

      capacityLeft:
        (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignedStudents)
          ? t.assignedStudents.length
          : 0),
    }));
  }, [users]);

  // =========================
  // Student Projects
  // =========================
  // const studentProjects = useMemo(() => {
  //   return (projects || [])
  //     .filter((p) => !!p.student?._id)
  //     .map((p) => ({
  //       projectId: p._id,

  //       title: p.title || "-",

  //       type: (p.type || "project").toLowerCase(),

  //       status: p.status,

  //       supervisor: p.supervisor?.name || null,
  //       supervisorId: p.supervisor?._id || null,

  //       studentId: p.student?._id,
  //       studentName: p.student?.name || "-",
  //       studentEmail: p.student?.email || "-",

  //       deadline: p.deadline
  //         ? new Date(p.deadline).toISOString().slice(0, 10)
  //         : "-",

  //       updatedAt: p.updatedAt
  //         ? new Date(p.updatedAt).toLocaleString()
  //         : "-",

  //       isApproved: p.status === "approved",
  //     }));
  // }, [projects]);

const studentProjects = useMemo(() => {
  const projectRows = (projects || [])
    .filter((p) => p.student?._id || p.student)
    .map((p) => ({
      projectId: p._id,

      title: p.title || "-",

      type: "project",

      status: p.status,

      supervisor: p.supervisor?.name || null,
      supervisorId: p.supervisor?._id || p.supervisor || null,

      studentId: p.student?._id || p.student,

      studentName: p.student?.name || "-",
      studentEmail: p.student?.email || "-",

      deadline: p.deadline
        ? new Date(p.deadline).toISOString().slice(0, 10)
        : "-",

      updatedAt: p.updatedAt
        ? new Date(p.updatedAt).toLocaleString()
        : "-",

      isApproved: p.status === "approved",
    }));

  const thesisRows = (theses || [])
    .filter((t) => t.student?._id || t.student)
    .map((t) => ({
      projectId: t._id,

      title: t.title || "-",

      type: "thesis",

      status: t.status,

      supervisor: t.supervisor?.name || null,
      supervisorId: t.supervisor?._id || t.supervisor || null,

      studentId: t.student?._id || t.student,

      studentName: t.student?.name || "-",
      studentEmail: t.student?.email || "-",

      deadline: t.deadline
        ? new Date(t.deadline).toISOString().slice(0, 10)
        : "-",

      updatedAt: t.updatedAt
        ? new Date(t.updatedAt).toLocaleString()
        : "-",

      isApproved: t.status === "approved",
    }));

  return [...thesisRows, ...projectRows];
}, [projects, theses]);


  // =========================
  // Filter
  // =========================
  const filtered = useMemo(() => {
    return studentProjects.filter((row) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (row.studentName || "").toLowerCase().includes(search) ||
        (row.title || "").toLowerCase().includes(search);

      const status = row.supervisorId ? "assigned" : "unassigned";

      const matchesStatus =
        filterStatus === "all" || status === filterStatus;

      const matchesType =
        filterType === "all" || row.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [studentProjects, searchTerm, filterStatus, filterType]);

  // =========================
  // Pagination
  // =========================
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  // =========================
  // Assign Supervisor
  // =========================
  const handleAssignSupervisor = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  const handleAssign = async (
    studentId,
    projectStatus,
    projectId
  ) => {
    const supervisorId = selectedSupervisor[projectId];

    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }

    if (projectStatus === "rejected") {
      toast.error("Cannot assign a supervisor to a rejected project");
      return;
    }

    setPendingFor(projectId);

    const res = await dispatch(
      assignSupervisorThunk({
        projectId,
        supervisorId,
      })
    );

    setPendingFor(null);

    if (assignSupervisorThunk.fulfilled.match(res)) {
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });

      dispatch(getAllUsers());

      toast.success("Supervisor assigned successfully");
    } else {
      toast.error("Failed to assign supervisor");
    }
  };

  // =========================
  // Dashboard Cards
  // =========================
  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisor).length,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0)
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  // =========================
  // Table Headers
  // =========================
  const headers = [
    "Student",
    "Type",
    "Thesis / Project Title",
    "Supervisor",
    "Deadline",
    "Updated",
    "Assign Supervisor",
    "Actions",
  ];

  // =========================
  // Badge
  // =========================
  const Badge = ({ color, children }) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {children}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6">

        {/* =========================
            Heading
        ========================= */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assign Supervisor</h1>

            <p className="card-subtitle">
              Manage supervisor assignments for thesis and project
            </p>
          </div>
        </div>

        {/* =========================
            Search + Filters
        ========================= */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search */}
            <div className="flex-1">
              <label className="block mb-2 text-md font-semibold text-[#17a2b8]">
                Search Students
              </label>

              <input
                type="text"
                placeholder="Search by student name or thesis/project title..."
                className="input-field outline-none p-2 border border-slate-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-48">
              <label className="block mb-2 text-md font-semibold text-[#17a2b8]">
                Filter Type
              </label>

              <select
                className="input-field w-full outline-none p-2 border border-slate-300 rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="thesis">Thesis</option>
                <option value="project">Project</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <label className="block mb-2 text-md font-semibold text-[#17a2b8]">
                Filter Status
              </label>

              <select
                className="input-field w-full outline-none p-2 border border-slate-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

          </div>
        </div>

        {/* =========================
            Student Assignments Table
        ========================= */}
        <div className="overflow-hidden card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">

          <div className="card-header">
            <h2 className="card-title text-lg font-semibold text-[#17a2b8]">
              Student Assignments
            </h2>
          </div>
<div
  className="
    w-[950px]
    max-h-[500px]
    overflow-x-auto
    overflow-y-auto
    border-t
    border-slate-200
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar]:h-2
    [&::-webkit-scrollbar-track]:bg-slate-100
    [&::-webkit-scrollbar-thumb]:bg-[#b0cbcf]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb:hover]:bg-[#8fb8be]
  "
>
         <table className="w-full text-left border-collapse">
              {/* Header */}
              <thead className="bg-slate-200 sticky top-0 z-10">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-5 text-[#138496] text-xs font-semibold uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-slate-50 divide-y divide-slate-200">

                {paginatedData.map((row) => (
                  <tr
                    key={row.projectId}
                    className="hover:bg-white transition"
                  >

                    {/* Student */}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {row.studentName}
                        </div>

                        <div className="text-sm text-slate-500">
                          {row.studentEmail}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-4 whitespace-nowrap">

                      {row.type === "thesis" ? (
                        <Badge color="bg-purple-100 text-purple-800">
                          Thesis
                        </Badge>
                      ) : (
                        <Badge color="bg-blue-100 text-blue-800">
                          Project
                        </Badge>
                      )}

                    </td>

                    {/* Title */}
                    <td className="px-3 py-4 min-w-[150px]">
                      <div className="text-sm font-medium text-slate-800">
                        {row.title}
                      </div>
                    </td>

                    {/* Supervisor */}
                    <td className="px-3 py-4 whitespace-nowrap w-[20px]">

                      {row.supervisor ? (
                        <Badge color="bg-green-100 text-green-800">
                          {row.supervisor}
                        </Badge>
                      ) : (
                        <Badge color="bg-red-100 text-red-800">
                          {row.status === "rejected"
                            ? "Rejected"
                            : "Not Assigned"}
                        </Badge>
                      )}

                    </td>

                    {/* Deadline */}
                    <td className="px-3 py-4 text-[14px] whitespace-nowrap">
                      {row.deadline}
                    </td>

                    {/* Updated */}
                    <td className="px-3 py-4 text-[12px] whitespace-nowrap">
                      {row.updatedAt}
                    </td>

                    {/* Assign Supervisor */}
                    <td className="px-3 py-4 whitespace-nowrap">

                      <select
                        className="
                          w-full min-w-[120px]
                          rounded-lg
                          border border-gray-300
                          bg-white
                          px-1 py-2.5
                          text-sm text-gray-700
                          shadow-sm
                          outline-none
                          transition-all
                          duration-200
                          hover:border-blue-400
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                          disabled:cursor-not-allowed
                          disabled:bg-gray-100
                          disabled:text-gray-400
                        "
                        value={
                          selectedSupervisor[row.projectId] || ""
                        }
                        disabled={
                          !!row.supervisor ||
                          row.status === "rejected" ||
                          !row.isApproved
                        }
                        onChange={(e) =>
                          handleAssignSupervisor(
                            row.projectId,
                            e.target.value
                          )
                        }
                      >

                        <option value="" disabled>
                          Select Supervisor
                        </option>

                        {teachers
                          .filter((t) => t.capacityLeft > 0)
                          .map((t) => (
                            <option
                              value={t._id}
                              key={t._id}
                            >
                              {t.name} ({t.capacityLeft} slots left)
                            </option>
                          ))}

                      </select>

                    </td>

                    {/* Action */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">

                      <button
                        className="
                          btn-primary
                          bg-[#17a2b8]
                          hover:bg-[#138496]
                          text-[13px]
                          w-[100px]
                          px-0
                          pe-0
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                        onClick={() =>
                          handleAssign(
                            row.studentId,
                            row.status,
                            row.projectId
                          )
                        }
                        disabled={
                          pendingFor === row.projectId ||
                          !!row.supervisor ||
                          row.status === "rejected" ||
                          !row.isApproved ||
                          !selectedSupervisor[row.projectId]
                        }
                      >

                        {pendingFor === row.projectId
                          ? "Assigning..."
                          : row.supervisor
                            ? "Assigned"
                            : row.status === "rejected"
                              ? "Rejected"
                              : !row.isApproved
                                ? "Not Approved"
                                : "Assign"}

                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

            {/* Empty */}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                No students found matching your criteria
              </div>
            )}

          </div>

          {/* =========================
              Pagination
          ========================= */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-white">

              {/* Result info */}
              <div className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filtered.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length}
                </span>{" "}
                students
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">

                {/* Previous */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="
                    px-3 py-2
                    text-sm
                    border
                    border-slate-300
                    rounded-md
                    bg-white
                    hover:bg-slate-100
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      min-w-[38px]
                      px-3
                      py-2
                      text-sm
                      rounded-md
                      border

                      ${
                        currentPage === page
                          ? "bg-[#17a2b8] text-white border-[#17a2b8]"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="
                    px-3 py-2
                    text-sm
                    border
                    border-slate-300
                    rounded-md
                    bg-white
                    hover:bg-slate-100
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                >
                  Next
                </button>

              </div>

            </div>
          )}

        </div>

        {/* =========================
            Summary Cards
        ========================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

          {dashboardCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div key={index} className="card">

                <div className="flex items-center">

                  <div
                    className={`p-3 ${card.bg} rounded-lg`}
                  >
                    <Icon
                      className={`w-6 h-6 ${card.color}`}
                    />
                  </div>

                  <div className="ml-4">

                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="text-lg font-semibold text-slate-800">
                      {card.value}
                    </p>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </>
  );
};

export default AssignSupervisor;
