import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Search,
  X,
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";

import {
  createDeadline,
  getTeacherDeadlines,
  getTeacherResearch,
} from "../../store/slices/deadlineSlice";

const TeacherDeadlinesPage = () => {
  const dispatch = useDispatch();

  // ----------------------------------------------------
  // Redux
  // ----------------------------------------------------

  const { projects = [], theses = [] } = useSelector(
    (state) => state.deadline.research || {},
  );

  const {
    deadlines = [],
    loading,
    error,
  } = useSelector((state) => state.deadline);

  // ----------------------------------------------------
  // Local State
  // ----------------------------------------------------

  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterType, setFilterType] =
    useState("all");

  const [filterStatus, setFilterStatus] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [query, setQuery] = useState("");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const itemsPerPage = 5;

  // ----------------------------------------------------
  // Form
  // ----------------------------------------------------

  const [formData, setFormData] = useState({
    title: "",
    deadlineType: "Weekly Progress",
    description: "",
    deadlineDate: "",
    finalSubmitDate: "",
  });

  // ----------------------------------------------------
  // Load Data
  // ----------------------------------------------------

  useEffect(() => {
    dispatch(getTeacherDeadlines());
    dispatch(getTeacherResearch());
  }, [dispatch]);

  // ----------------------------------------------------
  // Combine Projects + Theses
  // ----------------------------------------------------

  const allItems = useMemo(() => {
    const projectData = Array.isArray(projects)
      ? projects.map((project) => ({
          ...project,
          type: "Project",
        }))
      : [];

    const thesisData = Array.isArray(theses)
      ? theses.map((thesis) => ({
          ...thesis,
          type: "Thesis",
        }))
      : [];

    return [...projectData, ...thesisData];
  }, [projects, theses]);

  // ----------------------------------------------------
  // Date Helper
  // ----------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----------------------------------------------------
  // Date Input Helper
  // ----------------------------------------------------

  const formatInputDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(
      parsed.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      parsed.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ----------------------------------------------------
  // Today
  // ----------------------------------------------------

  const todayString = new Date()
    .toISOString()
    .split("T")[0];

  // ----------------------------------------------------
  // Deadline Status
  // ----------------------------------------------------

  const getDeadlineStatus = (
    deadlineDate,
    finalSubmitDate,
  ) => {
    if (!deadlineDate) {
      return "Not Set";
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const deadline = new Date(
      deadlineDate,
    );

    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return "Expired";
    }

    const diffTime =
      deadline.getTime() -
      today.getTime();

    const diffDays = Math.ceil(
      diffTime /
        (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 3) {
      return "Due Soon";
    }

    return "Active";
  };

  // ----------------------------------------------------
  // Transform Deadline Data
  // ----------------------------------------------------

  const deadlineRows = useMemo(() => {
    if (!Array.isArray(deadlines)) {
      return [];
    }

    return deadlines.map((deadline) => {
      const research =
        deadline.project ||
        deadline.thesis ||
        {};

      const type = deadline.project
        ? "Project"
        : "Thesis";

      const submission =
        deadline.submission || {};

      const files = Array.isArray(
        submission.files,
      )
        ? submission.files
        : [];

      return {
        _id: deadline._id,

        title:
          research.title || "-",

        type,

        studentName:
          deadline.student?.name ||
          research.student?.name ||
          "-",

        studentEmail:
          deadline.student?.email ||
          research.student?.email ||
          "-",

        studentDept:
          deadline.student?.department ||
          research.student?.department ||
          "-",

        supervisor:
          research.supervisor?.name ||
          "-",

        deadlineDate:
          deadline.dueDate,

        finalSubmitDate:
          deadline.finalSubmitDate ||
          null,

        deadlineType:
          deadline.type ||
          "Weekly Progress",

        description:
          deadline.description ||
          "",

        name: deadline.name || "-",

        submissionFiles: files,

        submissionFile:
          files[0]?.fileUrl || null,

        submissionComment:
          submission.studentComment ||
          "",

        submittedAt:
          submission.submittedAt ||
          null,

        submissionStatus:
          submission.status ||
          "Not Submitted",

        status: getDeadlineStatus(
          deadline.dueDate,
          deadline.finalSubmitDate,
        ),

        createdAt:
          deadline.createdAt,

        row: deadline,
      };
    });
  }, [deadlines]);

  // ----------------------------------------------------
  // Search + Filter
  // ----------------------------------------------------

  const filteredRows = useMemo(() => {
    const search =
      searchTerm
        .toLowerCase()
        .trim();

    return deadlineRows.filter(
      (row) => {
        const matchesSearch =
          !search ||
          row.title
            .toLowerCase()
            .includes(search) ||
          row.studentName
            .toLowerCase()
            .includes(search) ||
          row.studentEmail
            .toLowerCase()
            .includes(search) ||
          row.deadlineType
            .toLowerCase()
            .includes(search);

        const matchesType =
          filterType === "all" ||
          row.type === filterType;

        const matchesStatus =
          filterStatus === "all" ||
          row.status === filterStatus;

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        );
      },
    );
  }, [
    deadlineRows,
    searchTerm,
    filterType,
    filterStatus,
  ]);

  // ----------------------------------------------------
  // Pagination
  // ----------------------------------------------------

  const totalPages = Math.ceil(
    filteredRows.length /
      itemsPerPage,
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const paginatedRows =
    filteredRows.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterType,
    filterStatus,
  ]);

  // ----------------------------------------------------
  // Modal Search
  // ----------------------------------------------------

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const search =
      query
        .toLowerCase()
        .trim();

    return allItems
      .filter((item) => {
        const title = String(
          item.title || "",
        ).toLowerCase();

        const studentName =
          String(
            item.student?.name ||
              "",
          ).toLowerCase();

        const email =
          String(
            item.student?.email ||
              "",
          ).toLowerCase();

        return (
          title.includes(search) ||
          studentName.includes(
            search,
          ) ||
          email.includes(search)
        );
      })
      .slice(0, 8);
  }, [query, allItems]);

  // ----------------------------------------------------
  // Select Project / Thesis
  // ----------------------------------------------------

  const handleSelectItem = (item) => {
    setSelectedItem(item);

    setQuery(item.title || "");

    setFormData({
      title: "",
      deadlineType: "Weekly Progress",
      description: "",
      deadlineDate: "",
      finalSubmitDate: "",
    });
  };

  // ----------------------------------------------------
  // Submit Deadline
  // ----------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      alert(
        "Please select a project or thesis.",
      );

      return;
    }

    if (!formData.title.trim()) {
      alert(
        "Please enter a milestone title.",
      );

      return;
    }

    if (!formData.deadlineDate) {
      alert(
        "Please select a deadline date.",
      );

      return;
    }

    if (!formData.finalSubmitDate) {
      alert(
        "Please select final submission date.",
      );

      return;
    }

    const deadlineDate = new Date(
      formData.deadlineDate,
    );

    const finalDate = new Date(
      formData.finalSubmitDate,
    );

    deadlineDate.setHours(0, 0, 0, 0);
    finalDate.setHours(0, 0, 0, 0);

    if (finalDate < deadlineDate) {
      alert(
        "Final submission date cannot be earlier than the milestone deadline.",
      );

      return;
    }

    const deadlineData = {
      name: formData.title.trim(),

      type: formData.deadlineType,

      description:
        formData.description.trim(),

      dueDate:
        formData.deadlineDate,

      finalSubmitDate:
        formData.finalSubmitDate,

      ...(selectedItem.type === "Thesis"
        ? {
            thesis:
              selectedItem._id,
          }
        : {
            project:
              selectedItem._id,
          }),
    };

    try {
      setSaving(true);

      await dispatch(
        createDeadline(deadlineData),
      ).unwrap();

      // Reload deadlines
      await dispatch(
        getTeacherDeadlines(),
      ).unwrap();

      closeModal();
    } catch (error) {
      console.error(
        "Deadline save error:",
        error,
      );

      alert(
        typeof error === "string"
          ? error
          : "Failed to save deadline.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // Close Modal
  // ----------------------------------------------------

  const closeModal = () => {
    setShowModal(false);

    setSelectedItem(null);

    setQuery("");

    setFormData({
      title: "",
      deadlineType: "Weekly Progress",
      description: "",
      deadlineDate: "",
      finalSubmitDate: "",
    });
  };

  // ----------------------------------------------------
  // Status Badge
  // ----------------------------------------------------

  const renderStatus = (status) => {
    const config = {
      Active: {
        className:
          "bg-green-100 text-green-700",
        icon: CheckCircle2,
      },

      "Due Soon": {
        className:
          "bg-amber-100 text-amber-700",
        icon: Clock3,
      },

      Expired: {
        className:
          "bg-red-100 text-red-700",
        icon: AlertCircle,
      },

      "Not Set": {
        className:
          "bg-slate-100 text-slate-600",
        icon: AlertCircle,
      },
    };

    const item =
      config[status] ||
      config["Not Set"];

    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}
      >
        <Icon className="h-3.5 w-3.5" />

        {status}
      </span>
    );
  };

  // ----------------------------------------------------
  // Submission Badge
  // ----------------------------------------------------

  const renderSubmissionStatus = (
    status,
  ) => {
    const config = {
      "Not Submitted": {
        className:
          "bg-slate-100 text-slate-600",
      },

      Submitted: {
        className:
          "bg-blue-100 text-blue-700",
      },

      Reviewed: {
        className:
          "bg-green-100 text-green-700",
      },

      Overdue: {
        className:
          "bg-red-100 text-red-700",
      },
    };

    const item =
      config[status] ||
      config["Not Submitted"];

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}
      >
        {status}
      </span>
    );
  };

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />

        <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                <CalendarDays className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Manage Deadlines
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Create weekly milestones,
                  task deadlines and final
                  submission dates for your
                  students.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#138496] hover:shadow-md"
            >
              <CalendarDays className="h-4 w-4" />

              Create Deadline
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-cyan-100/50 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-10 right-16 h-28 w-28 rounded-full border border-cyan-200/40 bg-cyan-50/30" />
      </div>

      {/* =====================================================
          INFO CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {deadlineRows.length}
              </p>
            </div>

            <div className="rounded-lg bg-cyan-50 p-3 text-cyan-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Active */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Active
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {
                  deadlineRows.filter(
                    (item) =>
                      item.status ===
                      "Active",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Due Soon */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Due Soon
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {
                  deadlineRows.filter(
                    (item) =>
                      item.status ===
                      "Due Soon",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Expired */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Expired
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {
                  deadlineRows.filter(
                    (item) =>
                      item.status ===
                      "Expired",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH + FILTER
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Search */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
              <Search className="h-4 w-4 text-[#17a2b8]" />

              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search project, thesis or student..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value,
                  )
                }
              />
            </div>
          </div>

          {/* Type */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Type
            </label>

            <select
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-[#17a2b8] focus:ring-2 focus:ring-cyan-100"
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value,
                )
              }
            >
              <option value="all">
                All Types
              </option>

              <option value="Project">
                Project
              </option>

              <option value="Thesis">
                Thesis
              </option>
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-[#17a2b8] focus:ring-2 focus:ring-cyan-100"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value,
                )
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Due Soon">
                Due Soon
              </option>

              <option value="Expired">
                Expired
              </option>

              <option value="Not Set">
                Not Set
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-[#17a2b8]">
            Thesis / Project Deadlines
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Each weekly milestone is shown
            separately. Students can submit
            files or links for each deadline.
          </p>
        </div>

        <div className="w-full overflow-auto">
          <table className="w-full min-w-[1250px] border-collapse text-left">
            <thead className="bg-slate-100">
              <tr className="text-xs font-semibold uppercase text-[#138496]">
                <th className="px-4 py-4">
                  Student
                </th>

                <th className="px-4 py-4">
                  Type
                </th>

                <th className="px-4 py-4">
                  Project / Thesis
                </th>

                <th className="px-4 py-4">
                  Milestone
                </th>

                <th className="px-4 py-4">
                  Deadline
                </th>

                <th className="px-4 py-4">
                  Final Submit
                </th>

                <th className="px-4 py-4">
                  Submission
                </th>

                <th className="px-4 py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-200 border-t-[#17a2b8]" />

                      Loading deadlines...
                    </div>
                  </td>
                </tr>
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map(
                  (row) => (
                    <tr
                      key={row._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Student */}

                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {
                            row.studentName
                          }
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {
                            row.studentEmail
                          }
                        </div>
                      </td>

                      {/* Type */}

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            row.type ===
                            "Thesis"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>

                      {/* Project / Thesis */}

                      <td className="max-w-[230px] px-4 py-4">
                        <div className="truncate text-sm font-medium text-slate-800">
                          {row.title}
                        </div>
                      </td>

                      {/* Milestone */}

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                            {
                              row.deadlineType
                            }
                          </span>

                          {row.description && (
                            <span className="max-w-[210px] truncate text-xs text-slate-500">
                              {
                                row.description
                              }
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Deadline */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <CalendarDays className="h-4 w-4 text-[#17a2b8]" />

                          {formatDate(
                            row.deadlineDate,
                          )}
                        </div>
                      </td>

                      {/* Final */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Upload className="h-4 w-4 text-indigo-500" />

                          {formatDate(
                            row.finalSubmitDate,
                          )}
                        </div>
                      </td>

                      {/* Submission */}

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          {renderSubmissionStatus(
                            row.submissionStatus,
                          )}

                          {row.submissionFiles.map(
                            (file) => (
                              <a
                                key={file._id}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-fit items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                              >
                                <FileText className="h-3.5 w-3.5" />

                                {file.originalName ||
                                  "View File"}
                              </a>
                            ),
                          )}

                          {row.submissionComment && (
                            <span className="max-w-[210px] truncate text-[11px] text-slate-500">
                              {row.submissionComment}
                            </span>
                          )}

                          {row.submittedAt && (
                            <span className="text-[11px] text-slate-400">
                              Submitted:{" "}
                              {formatDate(
                                row.submittedAt,
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}

                      <td className="px-4 py-4">
                        {renderStatus(
                          row.status,
                        )}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center"
                  >
                    <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No deadlines found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a deadline for a
                      project or thesis to see
                      it here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Error */}

        {error && !loading && (
          <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Pagination */}

        {!loading &&
          filteredRows.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    startIndex +
                      itemsPerPage,
                    filteredRows.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredRows.length}
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.max(
                          prev - 1,
                          1,
                        ),
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setCurrentPage(
                        page,
                      )
                    }
                    className={`min-w-[38px] rounded-lg border px-3 py-2 text-sm font-semibold ${
                      currentPage ===
                      page
                        ? "border-[#17a2b8] bg-[#17a2b8] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.min(
                          prev + 1,
                          totalPages,
                        ),
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          CREATE DEADLINE MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm !mt-0 !pt-0">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Create Deadline
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Create a weekly milestone or final
                  submission deadline for a student.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}

            <div className="overflow-y-auto p-6">
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Select Project / Thesis */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Project / Thesis
                  </label>

                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#17a2b8]"
                    placeholder="Search project, thesis or student..."
                    value={query}
                    onChange={(e) => {
                      setQuery(
                        e.target.value,
                      );

                      setSelectedItem(
                        null,
                      );

                      setFormData(
                        (prev) => ({
                          ...prev,
                          title: "",
                          deadlineDate:
                            "",
                          finalSubmitDate:
                            "",
                        }),
                      );
                    }}
                  />

                  {query.trim() &&
                    !selectedItem && (
                      <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                        {searchResults.length >
                        0 ? (
                          searchResults.map(
                            (item) => (
                              <button
                                type="button"
                                key={`${item.type}-${item._id}`}
                                className="w-full border-b px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                                onClick={() =>
                                  handleSelectItem(
                                    item,
                                  )
                                }
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="truncate text-sm font-medium text-slate-800">
                                    {
                                      item.title
                                    }
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                      item.type ===
                                      "Thesis"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {
                                      item.type
                                    }
                                  </span>
                                </div>

                                <div className="mt-1 truncate text-xs text-slate-500">
                                  {
                                    item
                                      .student
                                      ?.name
                                  }{" "}
                                  •{" "}
                                  {
                                    item
                                      .student
                                      ?.email
                                  }
                                </div>

                                <div className="mt-0.5 truncate text-xs text-slate-400">
                                  Supervisor:{" "}
                                  {
                                    item
                                      .supervisor
                                      ?.name
                                  }
                                </div>
                              </button>
                            ),
                          )
                        ) : (
                          <div className="px-4 py-4 text-center text-sm text-slate-500">
                            No project or thesis
                            found.
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Selected */}

                {selectedItem && (
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-1 text-xs text-slate-500">
                          Selected Student
                        </div>

                        <div className="text-sm font-semibold text-slate-900">
                          {
                            selectedItem
                              .student
                              ?.name
                          }
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {
                            selectedItem
                              .student
                              ?.email
                          }
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          selectedItem.type ===
                          "Thesis"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {
                          selectedItem.type
                        }
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-slate-500">
                          Project / Thesis
                        </div>

                        <div className="mt-1 text-sm font-medium text-slate-800">
                          {
                            selectedItem.title
                          }
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">
                          Supervisor
                        </div>

                        <div className="mt-1 text-sm font-medium text-slate-800">
                          {
                            selectedItem
                              .supervisor
                              ?.name
                          }
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">
                          Department
                        </div>

                        <div className="mt-1 text-sm font-medium text-slate-800">
                          {
                            selectedItem
                              .student
                              ?.department
                          }
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">
                          Current Status
                        </div>

                        <div className="mt-1 text-sm font-medium text-slate-800">
                          {
                            selectedItem.status ||
                            "Unknown"
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone Title */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Milestone / Task Title
                  </label>

                  <input
                    type="text"
                    disabled={!selectedItem}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          title:
                            e.target.value,
                        }),
                      )
                    }
                    placeholder="Example: Week 1 Literature Review"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#17a2b8] disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {/* Deadline Type */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Deadline Type
                  </label>

                  <select
                    disabled={!selectedItem}
                    value={
                      formData.deadlineType
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          deadlineType:
                            e.target.value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#17a2b8] disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="Weekly Progress">
                      Weekly Progress
                    </option>

                    <option value="Draft Report">
                      Draft Report
                    </option>

                    <option value="Research Methodology">
                      Research Methodology
                    </option>

                    <option value="Data Collection">
                      Data Collection
                    </option>

                    <option value="Analysis">
                      Analysis
                    </option>

                    <option value="Presentation">
                      Presentation
                    </option>

                    <option value="Final Report">
                      Final Report
                    </option>

                    <option value="Final Submission">
                      Final Submission
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Description */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Task Instructions
                  </label>

                  <textarea
                    disabled={!selectedItem}
                    rows={4}
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          description:
                            e.target.value,
                        }),
                      )
                    }
                    placeholder="Tell the student what they need to complete and submit..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#17a2b8] disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {/* Dates */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Deadline */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Milestone Deadline
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17a2b8]" />

                      <input
                        type="date"
                        disabled={
                          !selectedItem
                        }
                        value={
                          formData.deadlineDate
                        }
                        min={todayString}
                        onChange={(e) =>
                          setFormData(
                            (prev) => ({
                              ...prev,
                              deadlineDate:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#17a2b8] disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500">
                      Example: Week 1 work should
                      be completed by this date.
                    </p>
                  </div>

                  {/* Final */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Final Submission Date
                    </label>

                    <div className="relative">
                      <Upload className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />

                      <input
                        type="date"
                        disabled={
                          !selectedItem
                        }
                        value={
                          formData.finalSubmitDate
                        }
                        min={
                          formData.deadlineDate ||
                          todayString
                        }
                        onChange={(e) =>
                          setFormData(
                            (prev) => ({
                              ...prev,
                              finalSubmitDate:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500">
                      The complete project/thesis must
                      be submitted by this date.
                    </p>
                  </div>
                </div>

                {/* Student Submission Info */}

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                      <Upload className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-indigo-900">
                        Student Submission
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-indigo-700">
                        After the deadline is created,
                        the student will see this
                        milestone in their panel and
                        can submit a file or external
                        link.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !selectedItem ||
                      !formData.title.trim() ||
                      !formData.deadlineDate ||
                      !formData.finalSubmitDate
                    }
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
                      saving ||
                      !selectedItem ||
                      !formData.title.trim() ||
                      !formData.deadlineDate ||
                      !formData.finalSubmitDate
                        ? "cursor-not-allowed bg-slate-300"
                        : "bg-[#17a2b8] hover:bg-[#138496]"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                        Saving...
                      </>
                    ) : (
                      <>
                        <CalendarDays className="h-4 w-4" />

                        Save Deadline
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDeadlinesPage;
