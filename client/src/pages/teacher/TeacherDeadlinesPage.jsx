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
  Eye,
  ExternalLink,
  Download,
  MessageSquare,
} from "lucide-react";

import {
  createDeadline,
  getTeacherDeadlines,
  reviewDeadline,
} from "../../store/slices/deadlineSlice";
import TeacherPageHeader from "../../components/PageHeader/TeacherPageHeader";
import { getAssignedStudents } from "../../store/slices/teacherSlice";

const TeacherDeadlinesPage = () => {
  const dispatch = useDispatch();

 
  const { assignedStudents = [] } = useSelector((state) => state.teacher);
  const {
    deadlines = [],
    loading,
    error,
  } = useSelector((state) => state.deadline);


  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterType, setFilterType] = useState("all");

  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [query, setQuery] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    title: "",
    deadlineType: "Weekly Progress",
    description: "",
    deadlineDate: "",
    finalSubmitDate: "",
  });

  useEffect(() => {
    dispatch(getTeacherDeadlines());
    dispatch(getAssignedStudents());
  }, [dispatch]);

  
  const allItems = useMemo(() => {
    if (!Array.isArray(assignedStudents)) {
      return [];
    }

    return assignedStudents
      .map((student) => {
        const project = student.project;
        const thesis = student.thesis;

        let work = null;
        let type = "";

        if (project && thesis) {
          const projectDate = new Date(
            project.updatedAt || project.createdAt || 0,
          );

          const thesisDate = new Date(
            thesis.updatedAt || thesis.createdAt || 0,
          );

          if (thesisDate > projectDate) {
            work = thesis;
            type = "Thesis";
          } else {
            work = project;
            type = "Project";
          }
        } else if (thesis) {
          work = thesis;
          type = "Thesis";
        } else if (project) {
          work = project;
          type = "Project";
        }

        if (!work) {
          return null;
        }

        return {
          ...work,
          type,
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            department: student.department,
          },
          supervisor: work.supervisor || student.supervisor || null,
        };
      })
      .filter(Boolean);
  }, [assignedStudents]);

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

  const formatInputDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");

    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayString = new Date().toISOString().split("T")[0];

  const getDeadlineStatus = (deadlineDate, finalSubmitDate) => {
    if (!deadlineDate) {
      return "Not Set";
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const deadline = new Date(deadlineDate);

    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return "Expired";
    }

    const diffTime = deadline.getTime() - today.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      return "Due Soon";
    }

    return "Active";
  };

  const deadlineRows = useMemo(() => {
    if (!Array.isArray(deadlines)) {
      return [];
    }

    return deadlines.map((deadline) => {
      const research = deadline.project || deadline.thesis || {};

      const type = deadline.project ? "Project" : "Thesis";

      // All submissions

      const submissions =
        Array.isArray(deadline.submissions) && deadline.submissions.length > 0
          ? deadline.submissions
          : deadline.submission
            ? [deadline.submission]
            : [];

      // Latest submission
      const latestSubmission =
        submissions.length > 0 ? submissions[submissions.length - 1] : null;

      const files = Array.isArray(latestSubmission?.files)
        ? latestSubmission.files
        : [];

      const links = Array.isArray(latestSubmission?.links)
        ? latestSubmission.links
        : [];

      return {
        _id: deadline._id,

        title: research.title || "-",

        type,

        studentName: deadline.student?.name || research.student?.name || "-",

        studentEmail: deadline.student?.email || research.student?.email || "-",

        studentDept:
          deadline.student?.department || research.student?.department || "-",

        supervisor: research.supervisor?.name || "-",

        deadlineDate: deadline.dueDate,

        finalSubmitDate: deadline.finalSubmitDate || null,

        deadlineType: deadline.type || "Weekly Progress",

        description: deadline.description || "",

        name: deadline.name || "-",

        // Important
        submissions,

        latestSubmission,

        submissionFiles: files,

        submissionLinks: links,

        submissionComment: latestSubmission?.studentComment || "",

        submittedAt: latestSubmission?.submittedAt || null,

        submissionStatus: latestSubmission?.status || "Not Submitted",

        status: getDeadlineStatus(deadline.dueDate, deadline.finalSubmitDate),

        createdAt: deadline.createdAt,

        row: deadline,
      };
    });
  }, [deadlines]);

  const getSubmissionList = (row) => {
    if (Array.isArray(row?.submissions) && row.submissions.length > 0) {
      return row.submissions;
    }

    if (row?.latestSubmission) {
      return [row.latestSubmission];
    }

    return [];
  };

  const filteredRows = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return deadlineRows.filter((row) => {
      const matchesSearch =
        !search ||
        row.title.toLowerCase().includes(search) ||
        row.studentName.toLowerCase().includes(search) ||
        row.studentEmail.toLowerCase().includes(search) ||
        row.deadlineType.toLowerCase().includes(search);

      const matchesType = filterType === "all" || row.type === filterType;

      const matchesStatus =
        filterStatus === "all" || row.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [deadlineRows, searchTerm, filterType, filterStatus]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedRows = filteredRows.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const search = query.toLowerCase().trim();

    return allItems
      .filter((item) => {
        const title = String(item.title || "").toLowerCase();

        const studentName = String(item.student?.name || "").toLowerCase();

        const email = String(item.student?.email || "").toLowerCase();

        return (
          title.includes(search) ||
          studentName.includes(search) ||
          email.includes(search)
        );
      })
      .slice(0, 8);
  }, [query, allItems]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      alert("Please select a project or thesis.");

      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter a milestone title.");

      return;
    }

    if (!formData.deadlineDate) {
      alert("Please select a deadline date.");

      return;
    }


    const deadlineDate = new Date(formData.deadlineDate);

    deadlineDate.setHours(0, 0, 0, 0);

    if (formData.finalSubmitDate) {
      const finalDate = new Date(formData.finalSubmitDate);

      finalDate.setHours(0, 0, 0, 0);

      if (finalDate < deadlineDate) {
        alert(
          "Final submission date cannot be earlier than the milestone deadline.",
        );

        return;
      }
    }


    const deadlineData = {
      name: formData.title.trim(),

      type: formData.deadlineType,

      description: formData.description.trim(),

      dueDate: formData.deadlineDate,

      ...(formData.finalSubmitDate
        ? {
            finalSubmitDate: formData.finalSubmitDate,
          }
        : {}),

      ...(selectedItem.type === "Thesis"
        ? {
            thesis: selectedItem._id,
          }
        : {
            project: selectedItem._id,
          }),
    };

    try {
      setSaving(true);

      await dispatch(createDeadline(deadlineData)).unwrap();

      // Reload deadlines
      await dispatch(getTeacherDeadlines()).unwrap();

      closeModal();
    } catch (error) {
      console.error("Deadline save error:", error);

      alert(typeof error === "string" ? error : "Failed to save deadline.");
    } finally {
      setSaving(false);
    }
  };
  const handleSubmitFeedback = async (deadlineId) => {
    const feedback = teacherFeedback.trim();

    if (!feedback) {
      alert("Please write feedback first.");
      return;
    }

    try {
      await dispatch(
        reviewDeadline({
          id: deadlineId,
          feedback,
        }),
      ).unwrap();

      setTeacherFeedback("");

      // Refresh teacher deadlines
      await dispatch(getTeacherDeadlines()).unwrap();
    } catch (error) {
      console.error("Feedback submit error:", error);
    }
  };

 

  const handleViewSubmission = (row) => {
    if (!row) return;

    setSelectedSubmission(row);

    // Latest submission initially expanded
    const submissions =
      Array.isArray(row.submissions) && row.submissions.length > 0
        ? row.submissions
        : row.latestSubmission
          ? [row.latestSubmission]
          : [];

    if (submissions.length > 0) {
      const latest = submissions[submissions.length - 1];

      setExpandedSubmissionId(
        latest._id || `submission-${submissions.length - 1}`,
      );
    }

    // Scroll to Submission History
    setTimeout(() => {
      document.getElementById("submission-history")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

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

  const renderStatus = (status) => {
    const config = {
      Active: {
        className: "bg-green-100 text-green-700",
        icon: CheckCircle2,
      },

      "Due Soon": {
        className: "bg-amber-100 text-amber-700",
        icon: Clock3,
      },

      Expired: {
        className: "bg-red-100 text-red-700",
        icon: AlertCircle,
      },

      "Not Set": {
        className: "bg-slate-100 text-slate-600",
        icon: AlertCircle,
      },
    };

    const item = config[status] || config["Not Set"];

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

  const renderSubmissionStatus = (status) => {
    const config = {
      "Not Submitted": {
        className: "bg-slate-100 text-slate-600",
      },

      Submitted: {
        className: "bg-blue-100 text-blue-700",
      },

      Reviewed: {
        className: "bg-green-100 text-green-700",
      },

      Overdue: {
        className: "bg-red-100 text-red-700",
      },
    };

    const item = config[status] || config["Not Submitted"];

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* manage deadlines header  */}
<TeacherPageHeader
  icon={CalendarDays}
  title="Manage Deadlines"
  description="Create weekly milestones, task deadlines and final submission dates for your students."
  action={
    <button
      onClick={() => setShowModal(true)}
      className="inline-flex items-center justify-center gap-2 main-btn "
    >
      <CalendarDays className="h-4 w-4 shrink-0" />
      <span>Create Deadline</span>
    </button>
  }
/>



      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {deadlineRows.length}
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-cyan-50 p-3 text-cyan-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Active
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {deadlineRows.filter((item) => item.status === "Active").length}
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-green-50 p-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Due Soon */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Due Soon
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {
                  deadlineRows.filter((item) => item.status === "Due Soon")
                    .length
                }
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-amber-50 p-3 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Expired */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Expired
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {
                  deadlineRows.filter((item) => item.status === "Expired")
                    .length
                }
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter*/}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Search */}

         <div>
  <label className="custom-label">
    Search
  </label>

  <div className="custom-input flex items-center gap-2">
    <Search className="h-4 w-4 shrink-0 text-[#17a2b8]" />

    <input
      type="search"
      placeholder="Search project, thesis or student..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
    />
  </div>
</div>

          {/* Type */}

          <div>
            <label className="custom-label ">
              Type
            </label>

            <select
              className="custom-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>

              <option value="Project">Project</option>

              <option value="Thesis">Thesis</option>
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              className="custom-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>

              <option value="Active">Active</option>

              <option value="Due Soon">Due Soon</option>

              <option value="Expired">Expired</option>

              <option value="Not Set">Not Set</option>
            </select>
          </div>
        </div>
      </div>

      {/* deadline table  */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <TeacherPageHeader
  subHeader
  icon={CalendarDays}
  title="Thesis / Project Deadlines"
  description="Manage milestone deadlines and view student submissions"
  action={
    <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200 sm:text-xs">
      {filteredRows.length} Deadline
      {filteredRows.length !== 1 ? "s" : ""}
    </div>
  }
/>

        <div className="hidden w-full min-w-0 md:block">
          <div className="w-full overflow-x-auto overscroll-x-contain">
            <table className="min-w-full w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px]  whitespace-nowrap uppercase tracking-wider text-slate-500 font-bold bg-slate-50/80">
                  <th className="px-2 py-4 ">Student</th>

                  <th className="px-2 py-4">Type</th>

                  <th className="px-2 py-4">Project / Thesis</th>

                  <th className="px-2 py-4">Milestone</th>

                  <th className="px-2 py-4">Deadline</th>

                  <th className="px-2 py-4">Final Submit</th>

                  <th className="px-2 py-4 bg-bule-800">Submission</th>

                  <th className="px-2 py-4">Action</th>

                  <th className="px-2 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-200 border-t-[#17a2b8]" />
                        Loading deadlines...
                      </div>
                    </td>
                  </tr>
                ) : paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => {
                    const submissions = getSubmissionList(row);
                    const submissionCount = submissions.length;
                    const latestSubmission = submissions[submissionCount - 1];

                    return (
                      <tr
                        key={row._id}
                        className="group transition-colors hover:bg-cyan-50/30"
                      >
                        {/* STUDENT */}
                        <td className="px-2 py-2 max-w-[120px]">
                          <div className="min-w-[120px] ">
                            <p className="truncate text-[12px] font-semibold text-slate-800">
                              {row.studentName}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {row.studentEmail}
                            </p>
                          </div>
                        </td>

                        {/* TYPE */}
                        <td className="px-2 py-2 max-w-[60px]">
                          <span
                            className={`inline-flex items-center whitespace-nowrap text-[11px] font-bold ${
                              row.type === "Thesis"
                                ? "text-purple-700"
                                : "text-blue-700"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>

                        {/* PROJECT / THESIS */}
                        <td className="max-w-[120px] px-2 py-2">
                          <p
                            title={row.title}
                            className="line-clamp-2 break-words text-[11px] font-bold leading-5 text-slate-800"
                          >
                            {row.title}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {row.type} Work
                          </p>
                        </td>

                        {/* MILESTONE */}
                        <td className="max-w-[120px] px-2 py-2">
                          <div className="space-y-1.5">
                            <span className="inline-flex max-w-full text-[11px] font-bold text-cyan-700">
                              <span className="truncate">
                                {row.deadlineType}
                              </span>
                            </span>

                            {row.description ? (
                              <p
                                title={row.description}
                                className="line-clamp-2 break-words text-[11px] leading-4 text-slate-400"
                              >
                                {row.description}
                              </p>
                            ) : (
                              <p className="text-[11px] italic text-slate-300">
                                No instructions
                              </p>
                            )}
                          </div>
                        </td>

                        {/* DEADLINE */}
                        <td className="px-2 py-2 max-w-[90px]">
                          <div className="flex min-w-[125px] items-center gap-2">
                            <div>
                              <p className="whitespace-nowrap text-xs font-semibold text-slate-700">
                                {formatDate(row.deadlineDate)}
                              </p>

                              <p className="mt-0.5 whitespace-nowrap text-[10px] text-slate-400">
                                Milestone deadline
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* FINAL SUBMIT */}
                        <td className="px-2 py-2 max-w-[70px] bg-bule-200">
                          <div className="min-w-[120px]">
                            {row.finalSubmitDate ? (
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="whitespace-nowrap text-xs font-semibold text-slate-700">
                                    {formatDate(row.finalSubmitDate)}
                                  </p>

                                  <p className="mt-0.5 whitespace-nowrap font-bold text-[11px] text-indigo-500">
                                    Final submission
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] italic font-bold text-slate-400">
                                Not set
                              </span>
                            )}
                          </div>
                        </td>

                        {/* SUBMISSION */}
                        <td className="px-2 py-2 max-w-[60px] ">
                          <div className="min-w-[120px]">
                            {submissionCount === 0 ? (
                              <span className="text-xs font-semibold text-slate-500">
                                Not Submitted
                              </span>
                            ) : (
                              <>
                                <span className="inline-flex whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                  {submissionCount} Submitted
                                </span>

                                {latestSubmission?.submittedAt && (
                                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <Clock3 className="h-3 w-3 shrink-0" />

                                    <span className="whitespace-nowrap">
                                      {new Date(
                                        latestSubmission.submittedAt,
                                      ).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="px-2 py-2 max-w-[100px]">
                          {submissionCount > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleViewSubmission(row)}
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#17a2b8] px-1.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#138496] w-[100px] hover:shadow-md"
                            >
                              View Submission
                            </button>
                          ) : (
                            <span className="whitespace-nowrap text-[12px] font-semibold text-red-500">
                              No action
                            </span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-2 py-2 ">
                          {renderStatus(row.status)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                        <CalendarDays className="h-7 w-7 text-slate-300" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-600">
                        No deadlines found
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                        Create a deadline for a project or thesis to see it
                        here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="block w-full min-w-0 p-2 sm:p-3 md:hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500">
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-cyan-200 border-t-[#17a2b8]" />
              Loading deadlines...
            </div>
          ) : paginatedRows.length > 0 ? (
            <div className="space-y-3">
              {paginatedRows.map((row) => {
                const submissions = getSubmissionList(row);
                const submissionCount = submissions.length;
                const latestSubmission = submissions[submissionCount - 1];

                return (
                  <div
                    key={row._id}
                    className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {row.studentName}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">
                            {row.studentEmail}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {renderStatus(row.status)}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-3 p-3 sm:p-4">
                      {/* Project / Thesis */}

                      <div className="min-w-0">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Project / Thesis
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              row.type === "Thesis"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {row.type}
                          </span>
                        </div>

                        <p
                          title={row.title}
                          className="break-words text-sm font-semibold leading-5 text-slate-800"
                        >
                          {row.title}
                        </p>
                      </div>

                      {/* Milestone */}

                      <div className="min-w-0 rounded-lg border border-cyan-100 bg-cyan-50/50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
                          Milestone
                        </p>

                        <p className="mt-1 break-words text-xs font-bold text-slate-800 sm:text-sm">
                          {row.deadlineType}
                        </p>

                        {row.description ? (
                          <p className="mt-1.5 break-words text-[11px] leading-4 text-slate-500 sm:text-xs">
                            {row.description}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-[11px] italic text-slate-400">
                            No instructions
                          </p>
                        )}
                      </div>

                      {/* Dates */}

                      <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-2">
                        {/* Deadline */}

                        <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 p-2.5 sm:p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Deadline
                          </p>

                          <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#17a2b8]" />

                            <p className="truncate text-[11px] font-semibold text-slate-700 sm:text-xs">
                              {formatDate(row.deadlineDate)}
                            </p>
                          </div>
                        </div>

                        {/* Final Submission */}

                        <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 p-2.5 sm:p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Final Submit
                          </p>

                          <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                            <Upload className="h-3.5 w-3.5 shrink-0 text-indigo-500" />

                            <p className="truncate text-[11px] font-semibold text-slate-700 sm:text-xs">
                              {row.finalSubmitDate
                                ? formatDate(row.finalSubmitDate)
                                : "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Submission */}

                      <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-3">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Submission
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-700 sm:text-sm">
                              {submissionCount > 0
                                ? `${submissionCount} Submitted`
                                : "Not Submitted"}
                            </p>
                          </div>

                          {submissionCount > 0 && (
                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[9px] font-bold text-blue-700">
                              Submitted
                            </span>
                          )}
                        </div>

                        {latestSubmission?.submittedAt && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Clock3 className="h-3 w-3 shrink-0" />

                            <span className="truncate">
                              {new Date(
                                latestSubmission.submittedAt,
                              ).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action */}

                      {submissionCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleViewSubmission(row)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#17a2b8] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#138496] active:scale-[0.98]"
                        >
                          <Eye className="h-4 w-4" />
                          View Submission
                        </button>
                      ) : (
                        <div className="w-full rounded-lg bg-red-50 px-3 py-2.5 text-center text-[11px] font-semibold text-red-500">
                          No action available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <CalendarDays className="h-6 w-6 text-slate-300" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-600">
                No deadlines found
              </p>

              <p className="mx-auto mt-1 max-w-xs text-[11px] leading-5 text-slate-400">
                Create a deadline for a project or thesis to see it here.
              </p>
            </div>
          )}
        </div>

        {error && !loading && (
          <div className="border-t border-red-100 bg-red-50 px-3 py-3 text-xs text-red-600 sm:px-5 sm:text-sm">
            {error}
          </div>
        )}

        {/* pagination  */}
        {!loading && filteredRows.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Showing */}

              <p className="text-center text-[10px] text-slate-500 sm:text-left sm:text-xs">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + itemsPerPage, filteredRows.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredRows.length}
                </span>
              </p>

              {/* Pagination buttons */}

              <div className="flex w-full items-center justify-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:justify-end">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-[#17a2b8] hover:text-[#17a2b8] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
                >
                  Previous
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[30px] rounded-lg border px-2 py-2 text-[10px] font-bold transition sm:min-w-[36px] sm:px-3 sm:text-xs ${
                        currentPage === page
                          ? "border-[#17a2b8] bg-[#17a2b8] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-[#17a2b8] hover:text-[#17a2b8] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div
          id="submission-history"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
      <TeacherPageHeader
  subHeader
  icon={FileText}
  title="Submission History"
  description="All submissions made for this deadline."
  action={
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
        {getSubmissionList(selectedSubmission).length} Submission
        {getSubmissionList(selectedSubmission).length === 1 ? "" : "s"}
      </span>

      <button
        type="button"
        onClick={() => {
          setSelectedSubmission(null);
          setExpandedSubmissionId(null);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <X className="h-3.5 w-3.5" />
        Close
      </button>
    </div>
  }
/>

          {/* Student / Research Information */}

          <div className="border-b border-slate-100 px-5 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* Student */}

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Student
                </p>

                <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">
                  {selectedSubmission.studentName}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {selectedSubmission.studentEmail}
                </p>
              </div>

              {/* Type */}

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Type
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    selectedSubmission.type === "Thesis"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedSubmission.type}
                </span>
              </div>

              {/* Project / Thesis */}

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Project / Thesis
                </p>

                <p
                  title={selectedSubmission.title}
                  className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-slate-800"
                >
                  {selectedSubmission.title}
                </p>
              </div>

              {/* Milestone */}

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Milestone
                </p>

                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  {selectedSubmission.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Deadline: {formatDate(selectedSubmission.deadlineDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Submission Cards */}

          <div className="p-5">
            {getSubmissionList(selectedSubmission).length > 0 ? (
              <div className="space-y-3">
                {getSubmissionList(selectedSubmission).map(
                  (submission, index) => {
                    const files = Array.isArray(submission.files)
                      ? submission.files
                      : [];

                    const links = Array.isArray(submission.links)
                      ? submission.links
                      : [];

                    const submissionId =
                      submission._id || `submission-${index}`;

                    const isExpanded = expandedSubmissionId === submissionId;

                    return (
                      <div
                        key={submissionId}
                        className={`overflow-hidden rounded-xl border transition-all ${
                          isExpanded
                            ? "border-cyan-200 bg-white shadow-sm"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSubmissionId(
                              isExpanded ? null : submissionId,
                            )
                          }
                          className="w-full px-5 py-4 text-left transition hover:bg-cyan-50/40"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  isExpanded
                                    ? "bg-cyan-50 text-[#17a2b8]"
                                    : "bg-slate-50 text-slate-500"
                                }`}
                              >
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-bold text-slate-800">
                                    Submission #
                                    {submission.submissionNumber || index + 1}
                                  </p>

                                  {renderSubmissionStatus(
                                    submission.status || "Submitted",
                                  )}
                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                  {submission.submittedAt
                                    ? `Submitted: ${new Date(
                                        submission.submittedAt,
                                      ).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}`
                                    : "Submission time not available"}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
                                <span>{files.length} Files</span>

                                <span>•</span>

                                <span>{links.length} Links</span>
                              </div>

                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                  isExpanded
                                    ? "rotate-180 bg-cyan-50 text-[#17a2b8]"
                                    : "bg-slate-50 text-slate-400"
                                }`}
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/40 px-5 pb-5">
                            {/* Files */}

                            <div className="pt-5">
                              <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="rounded-lg bg-cyan-50 p-2 text-[#17a2b8]">
                                    <FileText className="h-4 w-4" />
                                  </div>

                                  <h4 className="text-sm font-bold text-slate-800">
                                    Files ({files.length})
                                  </h4>
                                </div>

                                {files.length > 0 && (
                                  <span className="text-[13px] font-medium text-slate-400">
                                    Downloadable files
                                  </span>
                                )}
                              </div>

                              {files.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                  {files.map((file, fileIndex) => {
                                    const fileName =
                                      file.originalName ||
                                      `File ${fileIndex + 1}`;

                                    const extension = fileName.includes(".")
                                      ? fileName.split(".").pop()?.toUpperCase()
                                      : "FILE";

                                    return (
                                      <div
                                        key={
                                          file._id || file.fileUrl || fileIndex
                                        }
                                        className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-3 transition hover:border-cyan-200 hover:shadow-sm"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-[#17a2b8]">
                                            <FileText className="h-5 w-5" />
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p
                                              title={fileName}
                                              className="truncate text-sm font-semibold text-slate-700"
                                            >
                                              {fileName}
                                            </p>

                                            <span className="text-[10px] font-bold text-slate-400">
                                              {extension}
                                            </span>
                                          </div>
                                        </div>

                                        {file.fileUrl && (
                                          <a
                                            href={file.fileUrl}
                                            download={fileName}
                                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#17a2b8] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#138496]"
                                          >
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                          </a>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                                    <FileText className="h-5 w-5 text-slate-300" />
                                  </div>

                                  <p className="mt-2 text-xs font-semibold text-slate-500">
                                    No files submitted
                                  </p>

                                  <p className="mt-1 text-[10px] text-slate-400">
                                    The student did not attach any files to this
                                    submission.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Links */}

                            <div className="mt-6">
                              <div className="mb-3 flex items-center gap-2">
                                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                  <ExternalLink className="h-4 w-4" />
                                </div>

                                <h4 className="text-sm font-bold text-slate-800">
                                  Links ({links.length})
                                </h4>
                              </div>

                              {links.length > 0 ? (
                                <div className="space-y-2">
                                  {links.map((link) => (
                                    <div
                                      key={link._id || link.url}
                                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-700">
                                          {link.title || "Submitted Link"}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-slate-400">
                                          {link.url}
                                        </p>
                                      </div>

                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex shrink-0 items-center justify-center gap-1.5  btn-small "
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Open
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-400">
                                  No links submitted.
                                </div>
                              )}
                            </div>

                            {/* Student Comment */}

                            <div className="mt-6">
                              <div className="mb-3 flex items-center gap-2">
                                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                                  <MessageSquare className="h-4 w-4" />
                                </div>

                                <h4 className="text-sm font-bold text-slate-800">
                                  Student Comment
                                </h4>
                              </div>

                              {submission.studentComment ? (
                                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                                  <p className="text-sm leading-6 text-amber-900">
                                    {submission.studentComment}
                                  </p>
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-4 text-xs italic text-slate-400">
                                  No comment provided by the student.
                                </div>
                              )}
                            </div>

                            {/* Teacher Feedback */}

                            <div className="mt-6">
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="rounded-lg bg-green-50 p-2 text-green-600">
                                    <MessageSquare className="h-4 w-4" />
                                  </div>

                                  <h4 className="text-sm font-bold text-slate-800">
                                    Teacher Feedback
                                  </h4>
                                </div>

                                <span className="text-[10px] font-medium text-slate-400">
                                  Reply to this submission
                                </span>
                              </div>

                              {submission.teacherFeedback ? (
                                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                                  <p className="text-sm leading-6 text-green-900">
                                    {submission.teacherFeedback}
                                  </p>

                                  <p className="mt-2 text-[10px] text-green-600">
                                    Teacher feedback submitted
                                  </p>
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-green-200 bg-white p-4">
                                  <textarea
                                    rows={3}
                                    value={teacherFeedback}
                                    onChange={(e) =>
                                      setTeacherFeedback(e.target.value)
                                    }
                                    placeholder="Write feedback or reply to the student's submission..."
                                    className="custom-textarea"
                                  />

                                  <div className="mt-3 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSubmitFeedback(
                                          selectedSubmission._id,
                                        )
                                      }
                                      disabled={!teacherFeedback.trim()}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#17a2b8] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#138496] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      Submit Feedback
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FileText className="h-7 w-7 text-slate-300" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-600">
                  No submission found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  The student has not submitted any work for this deadline yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Deadline Modal  */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 backdrop-blur-sm !mt-0 !pt-0 sm:px-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 px-3 py-3 sm:items-center sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
                  Create Deadline
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Create a weekly milestone or final submission deadline for a
                  student.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
  className="icon-btn">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Modal Body */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden  custom-scrollbar  p-3  sm:space-y-6 sm:p-6">
                {/* Select Project / Thesis */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 sm:mb-2">
                    Project / Thesis
                  </label>

                  <input
                    type="text"
                    className="block w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2  outline-none transition text-sm focus:border-transparent focus:ring-1 focus:ring-[#17a2b8] sm:px-3 sm:py-2.5 sm:text-[14px]"
                    placeholder="Search project, thesis or student..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);

                      setSelectedItem(null);

                      setFormData((prev) => ({
                        ...prev,
                        title: "",
                        deadlineDate: "",
                        finalSubmitDate: "",
                      }));
                    }}
                  />

                  {query.trim() && !selectedItem && (
                    <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg sm:max-h-64">
                      {searchResults.length > 0 ? (
                        searchResults.map((item) => (
                          <button
                            type="button"
                            key={`${item.type}-${item._id}`}
                            className="w-full border-b px-3 py-2.5 text-left transition last:border-b-0 hover:bg-slate-50 sm:px-4 sm:py-3"
                            onClick={() => handleSelectItem(item)}
                          >
                            <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-3">
                              <div className="min-w-0 break-words text-sm font-medium text-slate-800 sm:truncate">
                                {item.title}
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  item.type === "Thesis"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {item.type}
                              </span>
                            </div>

                            <div className="mt-1 break-all text-xs text-slate-500 sm:truncate sm:break-normal">
                              {item.student?.name} • {item.student?.email}
                            </div>

                            <div className="mt-0.5 break-words text-xs text-slate-400 sm:truncate">
                              Supervisor: {item.supervisor?.name}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center text-sm text-slate-500">
                          No project or thesis found.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected */}
                {selectedItem && (
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3 sm:p-4">
                    <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 text-xs text-slate-500">
                          Selected Student
                        </div>

                        <div className="break-words text-sm font-semibold text-slate-900">
                          {selectedItem.student?.name}
                        </div>

                        <div className="mt-0.5 break-all text-xs text-slate-500">
                          {selectedItem.student?.email}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          selectedItem.type === "Thesis"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {selectedItem.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <div className="min-w-0">
                        <div className="text-xs text-slate-500">
                          Project / Thesis
                        </div>

                        <div className="mt-1 break-words text-sm font-medium text-slate-800">
                          {selectedItem.title}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs text-slate-500">Supervisor</div>

                        <div className="mt-1 break-words text-sm font-medium text-slate-800">
                          {selectedItem.supervisor?.name}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs text-slate-500">Department</div>

                        <div className="mt-1 break-words text-sm font-medium text-slate-800">
                          {selectedItem.student?.department}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs text-slate-500">
                          Current Status
                        </div>

                        <div className="mt-1 break-words text-sm font-medium text-slate-800">
                          {selectedItem.status || "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone Title */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 sm:mb-2">
                    Milestone / Task Title
                  </label>

                  <input
                    type="text"
                    disabled={!selectedItem}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Example: Week 1 Literature Review"
                    className="block w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2  outline-none transition text-sm focus:border-transparent focus:ring-1 focus:ring-[#17a2b8] sm:px-3 sm:py-2.5 sm:text-[14px] disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {/* Deadline Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 sm:mb-2">
                    Deadline Type
                  </label>

                  <select
                    disabled={!selectedItem}
                    value={formData.deadlineType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deadlineType: e.target.value,
                      }))
                    }
                    className="disabled:cursor-not-allowed disabled:bg-slate-100 
              
              block w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2  outline-none transition text-sm focus:border-transparent focus:ring-1 focus:ring-[#17a2b8] sm:px-3 sm:py-2.5 sm:text-[14px] 
              
              
              "
                  >
                    <option value="Weekly Progress">Weekly Progress</option>
                    <option value="Draft Report">Draft Report</option>
                    <option value="Research Methodology">
                      Research Methodology
                    </option>
                    <option value="Data Collection">Data Collection</option>
                    <option value="Analysis">Analysis</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Final Report">Final Report</option>
                    <option value="Final Submission">Final Submission</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 sm:mb-2">
                    Task Instructions
                  </label>

                  <textarea
                    disabled={!selectedItem}
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Tell the student what they need to complete and submit..."
                    className="disabled:cursor-not-allowed disabled:bg-slate-100 
                block w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2  outline-none transition text-sm focus:border-transparent focus:ring-1 focus:ring-[#17a2b8] sm:px-3 sm:py-2.5 sm:text-[14px]"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  {/* Deadline */}
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 sm:mb-2">
                      Milestone Deadline
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17a2b8]" />

                      <input
                        type="date"
                        disabled={!selectedItem}
                        value={formData.deadlineDate}
                        min={todayString}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            deadlineDate: e.target.value,
                          }))
                        }
                        className="max-w-full disabled:cursor-not-allowed disabled:bg-slate-100
                    block w-full min-w-0 rounded-lg border border-slate-300 px-7 py-2  outline-none transition text-sm focus:border-transparent focus:ring-1 focus:ring-[#17a2b8] sm:px-7 sm:py-2.5 sm:text-[14px]"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500">
                      Example: Week 1 work should be completed by this date.
                    </p>
                  </div>

                  {/* Final */}
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 sm:mb-2">
                      Final Submission Date
                    </label>

                    <div className="relative">
                      <Upload className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />

                      <input
                        type="date"
                        disabled={!selectedItem}
                        value={formData.finalSubmitDate}
                        min={formData.deadlineDate || todayString}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            finalSubmitDate: e.target.value,
                          }))
                        }
                        className=" max-w-full    pl-9 pr-2disabled:cursor-not-allowed disabled:bg-slate-100  sm:pl-10 sm:pr-4 sm:text-sm
                  
                  
                  block w-full min-w-0 rounded-lg border border-slate-300 px-7 py-1.5  outline-none transition text-sm focus:border-transparent focus:ring-1 focus:ring-[#17a2b8] sm:px-7 sm:py-2.5 sm:text-[14px]"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500">
                      The complete project/thesis must be submitted by this
                      date.
                    </p>
                  </div>
                </div>

                {/* Student Submission Info */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="shrink-0 rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                      <Upload className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-indigo-900">
                        Student Submission
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-indigo-700">
                        After the deadline is created, the student will see this
                        milestone in their panel and can submit a file or
                        external link.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white p-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="w-full whitespace-nowrap rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !selectedItem ||
                    !formData.title.trim() ||
                    !formData.deadlineDate
                  }
                  className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition sm:w-auto ${
                    saving ||
                    !selectedItem ||
                    !formData.title.trim() ||
                    !formData.deadlineDate
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
      )}
    </div>
  );
};

export default TeacherDeadlinesPage;
