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

  const { users, projects, theses } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
    dispatch(getAllTheses());
  }, [dispatch]);

  // Teachers
  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (u) => (u.role || "").toLowerCase() === "teacher",
    );

    return teacherUsers.map((t) => ({
      ...t,
      assignedCount: Array.isArray(t.assignedStudents)
        ? t.assignedStudents.length
        : 0,

      capacityLeft:
        (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0),
    }));
  }, [users]);

  // Student Projects
  const studentProjects = useMemo(() => {
    const projectRows = (projects || [])
      .filter((p) => p.student?._id || p.student)
      .map((p) => ({
        workId: p._id,
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

        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-",

        isApproved: p.status === "approved",
      }));

    const thesisRows = (theses || [])
      .filter((t) => t.student?._id || t.student)
      .map((t) => ({
        workId: t._id,
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

        updatedAt: t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "-",

        isApproved: t.status === "approved",
      }));

    return [...thesisRows, ...projectRows];
  }, [projects, theses]);

  // filtered
  const filtered = useMemo(() => {
    return studentProjects.filter((row) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (row.studentName || "").toLowerCase().includes(search) ||
        (row.title || "").toLowerCase().includes(search);

      const status = row.supervisorId ? "assigned" : "unassigned";
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesType = filterType === "all" || row.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [studentProjects, searchTerm, filterStatus, filterType]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  // Reset page when filter andsearch changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  // Assign Supervisor
  const handleAssignSupervisor = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  const handleAssign = async (studentId, workStatus, workId, workType) => {
    const supervisorId = selectedSupervisor[workId];

    if (!studentId || !supervisorId) {
      toast.error("Student or Supervisor ID is missing");
      return;
    }

    setPendingFor(workId);
    try {
      const res = await dispatch(
        assignSupervisorThunk({
          studentId,
          supervisorId,
          workId,
          workType,
        }),
      ).unwrap();

      await dispatch(getAllUsers());
      await dispatch(getAllProjects());
      await dispatch(getAllTheses());
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[workId];
        return newState;
      });
    } catch (error) {
      toast.error(error || "Failed to assign supervisor");
    } finally {
      setPendingFor(null);
    }
  };

  // Dashboard Cards
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
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0),
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  // Table Headers
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
        {/* Assign Supervisor Heading */}
  {/* Header */}
<div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  {/* Top Accent */}
  <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />

  <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      {/* Title */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
          <Users className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Assign Supervisor
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage supervisor assignments for thesis and project
          </p>
        </div>
      </div>

    </div>
  </div>

  {/* Decorative Circles */}
  <div className="pointer-events-none absolute -right-16 -bottom-20 h-52 w-52 rounded-full bg-cyan-100/50 blur-3xl" />

  <div className="pointer-events-none absolute right-16 -bottom-8 h-28 w-28 rounded-full border border-cyan-200/40 bg-cyan-50/30" />

  <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-indigo-500/5" />
</div>




        {/* Search and Filters */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">
          <div className="flex flex-col lg:flex-row gap-4">
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

        {/* Student Assignments Table */}
        <div className="card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Student Assignments Header */}
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Student Assignments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage supervisor assignments for thesis and project
                </p>
              </div>
            </div>
          </div>

          {/* Table Wrapper */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] table-fixed border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-[15%] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Student
                  </th>
                  <th className="w-[8%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="w-[20%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Thesis / Project Title
                  </th>
                  <th className="w-[12%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Supervisor
                  </th>

                  <th className="w-[10%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Deadline
                  </th>

                  <th className="w-[13%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Updated
                  </th>

                  <th className="w-[12%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Assign Supervisor
                  </th>

                  <th className="w-[10%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((row) => (
                  <tr
                    key={row.workId}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    {/* Student */}
                    <td className="px-5 py-4 align-middle">
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold text-slate-800 truncate"
                          title={row.studentName}
                        >
                          {row.studentName}
                        </div>

                        <div
                          className="text-xs text-slate-500 mt-1 truncate"
                          title={row.studentEmail}
                        >
                          {row.studentEmail}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4 align-middle">
                      {row.type === "thesis" ? (
                        <Badge color="bg-purple-50 text-purple-700 ring-1 ring-purple-200">
                          Thesis
                        </Badge>
                      ) : (
                        <Badge color="bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                          Project
                        </Badge>
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-4 align-middle">
                      <div
                        className="text-sm font-medium text-slate-800 truncate"
                        title={row.title}
                      >
                        {row.title}
                      </div>
                    </td>

                    {/* Supervisor */}
                    <td className="px-4 py-4 align-middle">
                      {row.supervisor ? (
                        <Badge color="bg-green-50 text-green-700 ring-1 ring-green-200">
                          <span
                            className="max-w-[100px] truncate inline-block"
                            title={row.supervisor}
                          >
                            {row.supervisor}
                          </span>
                        </Badge>
                      ) : (
                        <Badge color="bg-red-50 text-red-700 ring-1 ring-red-200">
                          {row.status === "rejected"
                            ? "Rejected"
                            : "Not Assigned"}
                        </Badge>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="px-4 py-4 text-sm text-slate-600 align-middle whitespace-nowrap">
                      {row.deadline}
                    </td>

                    {/* Updated */}
                    <td className="px-4 py-4 text-xs text-slate-500 align-middle">
                      <div className="truncate" title={row.updatedAt}>
                        {row.updatedAt}
                      </div>
                    </td>

                    {/* Assign Supervisor */}
                    <td className="px-4 py-4 align-middle">
                      <select
                        className="
                  w-full
                  rounded-lg
                  border border-slate-300
                  bg-white
                  px-2.5
                  py-2
                  text-xs
                  text-slate-700
                  outline-none
                  shadow-sm
                  transition
                  hover:border-[#17a2b8]
                  focus:border-[#17a2b8]
                  focus:ring-2
                  focus:ring-[#17a2b8]/20
                  disabled:bg-slate-100
                  disabled:text-slate-400
                  disabled:cursor-not-allowed
                "
                        value={selectedSupervisor[row.workId] || ""}
                        disabled={
                          !!row.supervisor ||
                          row.status === "rejected" ||
                          !row.isApproved
                        }
                        onChange={(e) =>
                          handleAssignSupervisor(row.workId, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select
                        </option>

                        {teachers
                          .filter((t) => t.capacityLeft > 0)
                          .map((t) => (
                            <option value={t._id} key={t._id}>
                              {t.name} ({t.capacityLeft})
                            </option>
                          ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 align-middle">
                      <button
                        className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  bg-[#17a2b8]
                  hover:bg-[#138496]
                  text-white
                  text-xs
                  font-semibold
                  shadow-sm
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
                        onClick={() =>
                          handleAssign(
                            row.studentId,
                            row.status,
                            row.workId,
                            row.type,
                          )
                        }
                        disabled={
                          pendingFor === row.workId ||
                          !!row.supervisor ||
                          row.status === "rejected" ||
                          !row.isApproved ||
                          !selectedSupervisor[row.workId]
                        }
                      >
                        {pendingFor === row.workId
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

            {/* No students found */}
            {filtered.length === 0 && (
              <div className="py-12 text-center bg-white">
                <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />

                <h3 className="text-sm font-semibold text-slate-700">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  No students match your current search or filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filtered.length}
                  </span>{" "}
                  students
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="
              px-3.5 py-2
              text-sm font-medium
              border border-slate-200
              rounded-lg
              bg-white
              text-slate-600
              hover:bg-slate-50
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
            "
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                min-w-[38px]
                px-3 py-2
                text-sm font-semibold
                rounded-lg
                border
                transition
                ${
                  currentPage === page
                    ? "bg-[#17a2b8] text-white border-[#17a2b8]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }
              `}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="
              px-3.5 py-2
              text-sm font-medium
              border border-slate-200
              rounded-lg
              bg-white
              text-slate-600
              hover:bg-slate-50
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
            "
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 ${card.bg} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
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
