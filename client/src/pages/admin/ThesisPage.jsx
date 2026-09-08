import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  FileText,
  X,
} from "lucide-react";
import axios from "axios";

const ThesisPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");

  const [isReportsOpen, setReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [currentThesis, setCurrentThesis] = useState(null);

  const [theses, setTheses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get All Theses
  const fetchTheses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("http://localhost:4000/api/v1/thesis", {
        withCredentials: true,
      });

      setTheses(response.data.theses || []);
    } catch (err) {
      console.error("Failed to fetch theses:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load theses",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheses();
  }, []);

  // Supervisor List
  const supervisors = useMemo(() => {
    const set = new Set(
      theses?.map((thesis) => thesis?.supervisor?.name).filter(Boolean),
    );

    return Array.from(set);
  }, [theses]);

  // Filter Thesis
  const filteredTheses = theses?.filter((thesis) => {
    const matchesSearch =
      (thesis.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (thesis.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || thesis.status === filterStatus;

    const matchesSupervisor =
      filterSupervisor === "all" ||
      thesis.supervisor?.name === filterSupervisor;

    return matchesSearch && matchesStatus && matchesSupervisor;
  });
  // Paginatio
  const totalPages = Math.ceil(filteredTheses.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedTheses = filteredTheses.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterSupervisor]);

  // All Thesis Files
  const files = useMemo(() => {
    return (theses || []).flatMap((thesis) =>
      (thesis.files || []).map((file) => ({
        thesisId: thesis._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        thesisTitle: thesis.title,
        studentName: thesis.student?.name,
      })),
    );
  }, [theses]);

  // Filter Files
  const filteredFiles = files.filter(
    (file) =>
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.thesisTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()),
  );

  // Status Color
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

  // Thesis Stats
  const thesisStats = [
    {
      title: "Total Theses",
      value: theses.length,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: FileText,
    },
    {
      title: "Pending Review",
      value: theses.filter((thesis) => thesis.status === "pending").length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },
    {
      title: "Completed",
      value: theses.filter((thesis) => thesis.status === "completed").length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: theses.filter((thesis) => thesis.status === "rejected").length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];

  // Approve and  Reject
  const handleStatusChange = async (thesisId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/thesis/${thesisId}/status`,
        {
          status: newStatus,
        },
        {
          withCredentials: true,
        },
      );

      const updatedThesis = response.data.thesis;

      setTheses((prev) =>
        prev.map((thesis) =>
          thesis._id === thesisId ? updatedThesis : thesis,
        ),
      );

      if (currentThesis && currentThesis._id === thesisId) {
        setCurrentThesis(updatedThesis);
      }
    } catch (err) {
      console.error("Failed to update thesis status:", err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update thesis status",
      );
    }
  };

  const handleDeleteThesis = async (thesisId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this thesis?",
    );

    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:4000/api/v1/thesis/${thesisId}`, {
        withCredentials: true,
      });

      setTheses((prev) => prev.filter((thesis) => thesis._id !== thesisId));

      toast.success("Thesis deleted successfully");
    } catch (err) {
      console.error("Failed to delete thesis:", err);

      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete thesis",
      );
    }
  };

  // Download File
  const handleDownloadFile = async (file) => {
    try {
      const thesisId = file.thesisId;
      const fileId = file.fileId;

      const response = await axios.get(
        `http://localhost:4000/api/v1/thesis/${thesisId}/files/${fileId}/download`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName || "thesis-file";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);

      alert(err.response?.data?.message || "Failed to download file");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* thesis header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />
          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                  <FileText className="h-7 w-7" strokeWidth={1.8} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    All Theses
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">
                    View and manage all students thesis across the platform.
                  </p>
                </div>
              </div>

              {/* Download Reports */}
              <button
                onClick={() => setReportsOpen(true)}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#138fa3] hover:shadow-md active:scale-[0.98]"
              >
                <FileDown className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span>Download Reports</span>
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="pointer-events-none absolute -bottom-24 -right-20 h-52 w-52 rounded-full bg-cyan-100/50 blur-3xl" />

          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-cyan-500/5" />

          <div className="pointer-events-none absolute bottom-0 right-48 h-24 w-24 rounded-full bg-indigo-500/5" />
        </div>

        {/* error */}
        {error && (
          <div className="card bg-red-50 border border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {thesisStats.map((item, index) => {
            const Icon = item.Icon;

            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
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

        {/* Search & Filter */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />
          <div className="p-5 sm:p-6">
            {/* Section Header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Find & Filter Theses
                </h2>
                <p className="text-sm text-slate-500">
                  Search and filter theses by title, student, status, or
                  supervisor.
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div className="lg:col-span-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                  Search
                </label>

                <input
                  type="text"
                  className="input rounded-lg border border-slate-200 focus:border-[#17a2b8] focus:ring-0 focus:outline-none"
                  placeholder="Search by thesis title or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                  Thesis Status
                </label>

                <select
                  className="input rounded-lg border border-slate-200 focus:border-[#17a2b8] focus:ring-0 focus:outline-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Theses</option>

                  <option value="pending">Pending Theses</option>

                  <option value="approved">Approved Theses</option>

                  <option value="completed">Completed Theses</option>

                  <option value="rejected">Rejected Theses</option>
                </select>
              </div>

              {/* Supervisor */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                  Supervisor
                </label>

                <select
                  className="input  rounded-lg border border-slate-200 focus:border-[#17a2b8] focus:ring-0 focus:outline-none"
                  value={filterSupervisor}
                  onChange={(e) => setFilterSupervisor(e.target.value)}
                >
                  <option value="all">All Supervisors</option>

                  {supervisors.map((supervisor) => (
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

        {/* thesis table  */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Thesis Records
                </h2>
                <p className="text-sm text-slate-500">
                  Manage, review and monitor all submitted theses.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center rounded-lg bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-[#17a2b8] ring-1 ring-cyan-100">
              {filteredTheses.length} Theses
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto overflow-y-auto scrollbar-thin">
            <table className="w-full min-w-[900px] table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[25%] px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Thesis Details
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
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      Loading theses...
                    </td>
                  </tr>
                ) : (
                  paginatedTheses.map((thesis) => (
                    <tr
                      key={thesis._id}
                      className="transition-colors hover:bg-cyan-50/30"
                    >
                      {/* Thesis Details */}
                      <td className="w-[25%] px-3 py-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {thesis.title}
                          </div>

                          <div className="mt-1 max-w-xs truncate text-sm text-slate-500">
                            {thesis.description}
                          </div>

                          <div className="mt-1.5 text-xs font-medium text-purple-600">
                            Research Area: {thesis.researchArea || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {thesis.student?.name || "N/A"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Last Updated:{" "}
                          {thesis.updatedAt
                            ? new Date(thesis.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>

                      {/* Supervisor */}
                      <td className="whitespace-nowrap px-3 py-4">
                        {thesis.supervisor?.name ? (
                          <div>
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-100">
                              {thesis.supervisor.name}
                            </span>

                            {thesis.coSupervisor?.name && (
                              <div className="mt-1 text-xs text-slate-500">
                                Co: {thesis.coSupervisor.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">
                        {thesis.deadline
                          ? new Date(thesis.deadline).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(
                            thesis.status,
                          )}`}
                        >
                          {thesis.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          {/* View */}
                          <button
                            onClick={() => {
                              setCurrentThesis(thesis);
                              setShowViewModal(true);
                            }}
                            className="inline-flex items-center justify-center rounded-lg bg-[#17a2b8] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#138496] hover:shadow-md active:scale-[0.98]"
                          >
                            View
                          </button>

                          {/* Approve */}
                          {thesis.status === "pending" && (
                            <>
                              <button
                                className="inline-flex items-center justify-center rounded-lg bg-[#17a2b8] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#138496] hover:shadow-md active:scale-[0.98]"
                                onClick={() =>
                                  handleStatusChange(thesis._id, "approved")
                                }
                              >
                                Approve
                              </button>

                              {/* Reject */}
                              <button
                                className="btn-danger px-3.5 py-2 text-xs"
                                onClick={() =>
                                  handleStatusChange(thesis._id, "rejected")
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Delete */}
                          <button
                            className="btn-danger px-3.5 py-2 text-xs "
                            onClick={() => handleDeleteThesis(thesis._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredTheses.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + itemsPerPage, filteredTheses.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredTheses.length}
                </span>{" "}
                theses
              </p>

              {/* Pagination */}
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

          {/* No theses found matching the criteria. */}
          {!loading && filteredTheses.length === 0 && (
            <div className="border-t border-slate-100 py-10 text-center text-sm text-slate-500">
              No theses found matching the criteria.
            </div>
          )}
        </div>

        {/* showViewModal*/}
        {showViewModal && currentThesis && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0"
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
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Thesis Details
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      View complete information about this thesis.
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
                      Thesis Title
                    </label>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-900">
                      {currentThesis.title || "-"}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </label>

                    <div className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 text-justify">
                      {currentThesis.description || "-"}
                    </div>
                  </div>

                  {/* Student and Supervisor */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Student
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentThesis?.student?.name || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Supervisor
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentThesis?.supervisor?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Co Supervisor and Research Area */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Co-Supervisor
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentThesis?.coSupervisor?.name || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Research Area
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentThesis?.researchArea || "N/A"}
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
                          currentThesis.status,
                        )}`}
                      >
                        {currentThesis.status || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Deadline
                      </label>

                      <p className="text-sm font-semibold text-slate-900">
                        {currentThesis.deadline
                          ? new Date(
                              currentThesis.deadline,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Thesis Files
                      </label>

                      <span className="text-xs font-medium text-slate-400">
                        {currentThesis.files?.length || 0} Files
                      </span>
                    </div>

                    {(currentThesis.files || []).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                        <FileText className="mx-auto mb-2 h-6 w-6 text-slate-300" />

                        <p className="text-sm text-slate-500">
                          No files uploaded.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentThesis.files.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-[#17a2b8]">
                                <FileText className="h-4 w-4" />
                              </div>

                              <span className="truncate text-sm font-medium text-slate-700">
                                {file.originalName || "Unnamed file"}
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

        {/* Reports modal  */}
        {isReportsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0"
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
                      All Thesis Files
                    </h3>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Search and download thesis documents.
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
                {/* Search */}
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Search Files
                  </label>

                  <input
                    type="text"
                    className="input w-full rounded-xl border-slate-200 bg-slate-50 focus:border-[#17a2b8] focus:ring-[#17a2b8]"
                    placeholder="Search by file name, thesis title or student name..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />
                </div>

                {/* File Count */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Thesis Documents
                  </p>

                  <span className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-[#17a2b8] ring-1 ring-cyan-100">
                    {filteredFiles.length} Files
                  </span>
                </div>

                {/* Files */}
                {filteredFiles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                    <p className="text-sm font-medium text-slate-600">
                      No files found.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try searching with a different keyword.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFiles.map((file) => (
                      <div
                        key={`${file.thesisId}-${file.fileId}`}
                        className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/30"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#17a2b8] ring-1 ring-cyan-100">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-800">
                              {file.originalName || "Unnamed file"}
                            </div>

                            <div className="mt-1 truncate text-xs text-slate-500">
                              {file.thesisTitle || "Unknown Thesis"}
                              {" • "}
                              {file.studentName || "Unknown Student"}
                            </div>

                            {file.uploadedAt && (
                              <div className="mt-1 text-xs text-slate-400">
                                Uploaded:{" "}
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#17a2b8] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#138fa3] hover:shadow-md active:scale-[0.98]"
                          onClick={() => handleDownloadFile(file)}
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

export default ThesisPage;
