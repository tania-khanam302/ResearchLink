import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AlertTriangle, CheckCircle2, FileDown, Folder, X } from "lucide-react";
import {
  approveProject,
  getProject,
  rejectProject,
  deleteProject,
} from "../../store/slices/adminSlice";
import { downloadProjectFile } from "./../../store/slices/projectSlice";

const ProjectsPage = () => {
  const [searchTearm, setsearchTearm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [isReportsOpen, setReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [editFrom, setEditFrom] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const supervisor = useMemo(() => {
    const set = new Set(
      projects?.map((p) => p?.supervisor?.name).filter(Boolean),
    );
    return Array.from(set);
  }, [projects]);

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      (project.title || "").toLowerCase().includes(searchTearm.toLowerCase()) ||
      (project.student?.name || "")
        .toLowerCase()
        .includes(searchTearm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;

    const matchesSupervisor =
      filterSupervisor === "all" ||
      project.supervisor?.name === filterSupervisor;

    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTearm, filterStatus, filterSupervisor]);

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

  const filterfiles = files?.filter(
    (file) =>
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()),
  );

  const handleDownloadFile = async (file) => {
    const res = await dispatch(
      downloadProjectFile({
        projectId: file.projectId,
        fileId: file.fileId,
      }),
    ).then((res) => {
      const { blob } = res.payload;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    if (newStatus === "approved") {
      dispatch(approveProject(projectId));
    } else if (newStatus === "rejected") {
      dispatch(rejectProject(projectId));
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) return;

    const res = await dispatch(deleteProject(projectId));

    if (!deleteProject.fulfilled.match(res)) {
      console.error(res.payload);
    }
  };

  const projectStats = [
    {
      title: "Total Projects",
      value: projects.length,
      bg: "bg-cyan-50",
      iconColor: "text-[#17a2b8]",
      Icon: Folder,
    },
    {
      title: "Pending Review",
      value: projects.filter((p) => p.status === "pending").length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },
    {
      title: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: projects.filter((p) => p.status === "rejected").length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* All Projects header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />
          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                  <Folder className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    All Projects
                  </h1>

                  <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">
                    View and manage all students projects across the platform.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReportsOpen(true)}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#138fa3] hover:shadow-md active:scale-[0.98]"
              >
                <FileDown className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span>Download Reports</span>
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-24 -right-20 h-52 w-52 rounded-full bg-cyan-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-cyan-500/5" />
          <div className="pointer-events-none absolute bottom-0 right-48 h-24 w-24 rounded-full bg-indigo-500/5" />
        </div>

        {/* Stats  */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {projectStats.map((item, index) => {
            const Icon = item.Icon;

            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`rounded-lg p-2 ${item.bg}`}>
                    <Icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>

                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {item.title}
                    </p>

                    <p className="text-lg font-semibold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* seacrh and filter  */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />
          <div className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                <Folder className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Search Projects
                </h2>
                <p className="text-sm text-slate-500">
                  Search and filter projects by title, student, status, or
                  supervisor.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                  Search Projects
                </label>

                <input
                  type="text"
                  className="input w-full  rounded-lg border border-slate-200 focus:border-[#17a2b8] focus:ring-0 focus:outline-none"
                  placeholder="Search by project title or student name..."
                  value={searchTearm}
                  onChange={(e) => setsearchTearm(e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                  Filter by Status
                </label>

                <select
                  className="input w-full rounded-lg border border-slate-200 focus:border-[#17a2b8] focus:ring-0 focus:outline-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Projects</option>

                  <option value="pending">Pending Projects</option>

                  <option value="approved">Approved Projects</option>

                  <option value="completed">Completed Projects</option>

                  <option value="rejected">Rejected Projects</option>
                </select>
              </div>

              {/* Supervisor */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                  Filter Supervisor
                </label>

                <select
                  className="input w-full rounded-lg border border-slate-200 focus:border-[#17a2b8] focus:ring-0 focus:outline-none"
                  value={filterSupervisor}
                  onChange={(e) => setFilterSupervisor(e.target.value)}
                >
                  <option value="all">All Supervisors</option>

                  {supervisor.map((supervisor) => (
                    <option key={supervisor} value={supervisor}>
                      {supervisor}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-cyan-500/5" />
        </div>

        {/* Projects Overview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                <Folder className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Projects Overview
                </h2>
                <p className="text-sm text-slate-500">
                  View and manage all students projects across the platform.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center rounded-lg bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-[#17a2b8] ring-1 ring-cyan-100">
              {filteredProjects.length} Projects
            </div>
          </div>

          {/* Project Details Table */}
          <div className="max-h-[500px] overflow-x-auto overflow-y-auto scrollbar-thin">
            <table className="w-full min-w-[900px] table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[25%] px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Project Details
                  </th>

                  <th className="px-3 py-5 text-left text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Student
                  </th>

                  <th className="px-3 py-5 text-left text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Supervisor
                  </th>

                  <th className="px-3 py-5 text-left text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Deadline
                  </th>

                  <th className="px-3 py-5 text-left text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Status
                  </th>

                  <th className="px-3 py-5 text-left text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedProjects.map((project) => (
                  <tr
                    key={project._id}
                    className="transition-colors hover:bg-cyan-50/30"
                  >
                    {/* Project Details */}
                    <td className="w-[25%] px-3 py-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {project.title}
                        </div>

                        <div className="mt-1 max-w-xs truncate text-sm text-slate-500">
                          {project.description}
                        </div>

                        <div className="mt-1.5 text-xs font-medium text-purple-600">
                          Due:{" "}
                          {project.deadline
                            ? project.deadline.split("T")[0]
                            : "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Student */}
                    <td className="whitespace-nowrap px-3 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {project.student?.name || "N/A"}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Last Updated:{" "}
                        {project.updatedAt
                          ? new Date(project.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>

                    {/* Supervisor */}
                    <td className="whitespace-nowrap px-3 py-4">
                      {project.supervisor?.name ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-100">
                          {project.supervisor.name}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-3 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(
                          project.status,
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            const res = await dispatch(getProject(project._id));

                            if (!getProject.fulfilled.match(res)) {
                              return;
                            }

                            const details = res.payload?.project || res.payload;

                            setCurrentProject(details);
                            setShowViewModal(true);
                          }}
                          className="inline-flex items-center justify-center rounded-lg bg-[#17a2b8] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#138496] hover:shadow-md active:scale-[0.98]"
                        >
                          View
                        </button>

                        {project.status === "pending" && (
                          <>
                            <button
                              className="inline-flex items-center justify-center rounded-lg bg-green-600  px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-700hover:shadow-md active:scale-[0.98]
                            "
                              onClick={() =>
                                handleStatusChange(project._id, "approved")
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="btn-danger px-3.5 py-2 text-xs"
                              onClick={() =>
                                handleStatusChange(project._id, "rejected")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Delete */}
                        <button
                          className="btn-danger px-3.5 py-2 text-xs"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination  */}
          {filteredProjects.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + itemsPerPage, filteredProjects.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredProjects.length}
                </span>{" "}
                projects
              </p>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    currentPage === 1
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[38px] rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      currentPage === page
                        ? "border-[#17a2b8] bg-[#17a2b8] text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    currentPage === totalPages
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/*  No projects found matching the criteria. */}
          {filteredProjects.length === 0 && (
            <div className="border-t border-slate-100 py-10 text-center text-sm text-slate-500">
              No projects found matching the criteria.
            </div>
          )}
        </div>

        {/* showViewModal */}
        {showViewModal && currentProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 !mt-0 !pt-0 backdrop-blur-sm"
            onClick={() => setShowViewModal(false)}
          >
            <div
              className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                    <Folder className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Project Details
                    </h3>

                    <p className="mt-0.5 text-sm text-slate-500">
                      View complete information about this project.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto px-6 py-6 scrollbar-thin">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Project Title
                    </label>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-900">
                      {currentProject.title || "-"}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </label>

                    <div className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 text-justify">
                      {currentProject.description || "-"}
                    </div>
                  </div>

                  {/* Student and Supervisor */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Student
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentProject?.student?.name || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Supervisor
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentProject?.supervisor?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Status and Deadline */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </label>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                          currentProject.status,
                        )}`}
                      >
                        {currentProject?.status || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Deadline
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentProject?.deadline
                          ? new Date(
                              currentProject.deadline,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Project Files
                      </label>

                      <span className="text-xs font-medium text-slate-400">
                        {currentProject.files?.length || 0} Files
                      </span>
                    </div>

                    {(currentProject.files || []).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                        <Folder className="mx-auto mb-2 h-6 w-6 text-slate-300" />

                        <p className="text-sm text-slate-500">
                          No files uploaded.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentProject.files.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-[#17a2b8]">
                                <FileDown className="h-4 w-4" />
                              </div>

                              <span className="truncate text-sm font-medium text-slate-700">
                                {file.originalName ||
                                  file.name ||
                                  "Unnamed file"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


        {isReportsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 !mt-0 !pt-0 backdrop-blur-sm"
            onClick={() => setReportsOpen(false)}
          >
            <div
              className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                    <FileDown className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      All Project Files
                    </h3>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Search and download project documents.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReportsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto px-6 py-6 scrollbar-thin">
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Search Files
                  </label>

                  <input
                    type="text"
                    className="input w-full rounded-xl border-slate-200 bg-slate-50 focus:border-[#17a2b8] focus:ring-[#17a2b8]"
                    placeholder="Search by file name, project title or student name..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Project Documents
                  </p>

                  <span className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-[#17a2b8] ring-1 ring-cyan-100">
                    {filterfiles.length} Files
                  </span>
                </div>

                {filterfiles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                    <Folder className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                    <p className="text-sm font-medium text-slate-600">
                      No files found.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try searching with a different keyword.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filterfiles.map((f) => (
                      <div
                        key={`${f.projectId}-${f.fileId}`}
                        className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/30"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                            <FileDown className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-800">
                              {f.originalName || "Unnamed file"}
                            </div>

                            <div className="mt-1 truncate text-xs text-slate-500">
                              {f.projectTitle || "Unknown Project"}
                              {" • "}
                              {f.studentName || "Unknown Student"}
                            </div>
                          </div>
                        </div>

                        <button
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#17a2b8] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#138fa3] hover:shadow-md active:scale-[0.98]"
                          onClick={() => handleDownloadFile(f)}
                        >
                          <FileDown className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                <button
                  onClick={() => setReportsOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsPage;
