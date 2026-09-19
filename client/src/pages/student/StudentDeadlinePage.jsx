import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  CheckCircle2,
  Upload,
  X,
  Link as LinkIcon,
  ExternalLink,
  Trash2,
  Clock3,
  FileText,
  Eye,
  Download,
  Plus,
  MessageSquare,
  Send,
  Pencil,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getStudentDeadlines,
  submitDeadline,
  deleteDeadlineSubmissionFile,
  deleteDeadlineSubmissionLink,
  replyToDeadlineFeedback,
} from "../../store/slices/deadlineSlice";

const formatDate = (value, includeTime = false) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  if (includeTime) {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatus = (deadline) => {
  const submissionStatus = deadline?.submission?.status;

  if (submissionStatus === "Submitted" || submissionStatus === "Reviewed") {
    return submissionStatus;
  }

  if (submissionStatus === "Overdue") {
    return "Overdue";
  }

  if (deadline?.dueDate && new Date(deadline.dueDate).getTime() < Date.now()) {
    return "Overdue";
  }

  return "Active";
};

const getFileName = (file) => {
  return file?.originalName || file?.fileName || file?.name || "Uploaded file";
};

const StudentDeadlinePage = () => {
  const dispatch = useDispatch();

  const {
    studentDeadlines = [],
    loading,
    submitting,
  } = useSelector((state) => state.deadline);

  const [selectedDeadline, setSelectedDeadline] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [links, setLinks] = useState([
    {
      id: Date.now(),
      title: "",
      url: "",
    },
  ]);

  const [comment, setComment] = useState("");

  const [historyDeadline, setHistoryDeadline] = useState(null);

  const [feedbackReply, setFeedbackReply] = useState("");
  const [replyingSubmissionId, setReplyingSubmissionId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 2;

  useEffect(() => {
    dispatch(getStudentDeadlines());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [studentDeadlines]);

  const closeSubmitModal = () => {
    setSelectedDeadline(null);
    setSelectedFiles([]);
    setComment("");

    setLinks([
      {
        id: Date.now(),
        title: "",
        url: "",
      },
    ]);
  };

  const openSubmitModal = (deadline) => {
    setSelectedDeadline(deadline);

    setSelectedFiles([]);

    setLinks([
      {
        id: Date.now(),
        title: "",
        url: "",
      },
    ]);

    setComment("");
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setSelectedFiles((previous) => [...previous, ...files]);

    event.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const addLinkField = () => {
    setLinks((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        title: "",
        url: "",
      },
    ]);
  };

  const removeLinkField = (id) => {
    setLinks((previous) => {
      const filtered = previous.filter((link) => link.id !== id);

      return filtered.length
        ? filtered
        : [
            {
              id: Date.now(),
              title: "",
              url: "",
            },
          ];
    });
  };

  const updateLink = (id, field, value) => {
    setLinks((previous) =>
      previous.map((link) =>
        link.id === id
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    );
  };

  const validLinks = useMemo(() => {
    return links
      .map((link) => ({
        title: link.title.trim(),
        url: link.url.trim(),
      }))
      .filter((link) => link.title || link.url);
  }, [links]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedDeadline) return;

    if (
      selectedDeadline?.dueDate &&
      new Date(selectedDeadline.dueDate).getTime() < Date.now()
    ) {
      toast.error("This deadline has already passed.");
      return;
    }

    if (
      selectedFiles.length === 0 &&
      validLinks.length === 0 &&
      !comment.trim()
    ) {
      toast.error("Please add at least one file, link, or comment.");
      return;
    }

    for (const link of validLinks) {
      if (!link.title) {
        toast.error("Please enter a title for every link.");
        return;
      }

      if (!link.url) {
        toast.error("Please enter the URL for every link.");
        return;
      }

      try {
        new URL(link.url);
      } catch {
        toast.error(`Invalid URL: ${link.url}`);
        return;
      }
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    if (validLinks.length > 0) {
      formData.append("links", JSON.stringify(validLinks));
    }

    if (comment.trim()) {
      formData.append("studentComment", comment.trim());
    }

    try {
      await dispatch(
        submitDeadline({
          id: selectedDeadline._id,
          formData,
        }),
      ).unwrap();

      closeSubmitModal();

      dispatch(getStudentDeadlines());
    } catch (error) {
      console.error("Deadline submission failed:", error);

      toast.error(error?.message || error || "Failed to submit your work.");
    }
  };

  const handleFeedbackReply = async (deadline, submission) => {
    if (!deadline?._id || !submission?._id) {
      toast.error("Invalid submission information");
      return;
    }

    const reply = feedbackReply.trim();

    if (!reply) {
      toast.error("Please enter a reply.");
      return;
    }

    try {
      const result = await dispatch(
        replyToDeadlineFeedback({
          deadlineId: deadline._id,
          submissionId: submission._id,
          studentReply: reply,
        }),
      ).unwrap();

      setFeedbackReply("");
      setReplyingSubmissionId(null);
      setEditingReplyId(null);

      if (result?._id) {
        setHistoryDeadline(result);
      } else {
        const refreshed = await dispatch(getStudentDeadlines()).unwrap();

        const updatedDeadline = refreshed.find(
          (item) => item._id === deadline._id,
        );

        if (updatedDeadline) {
          setHistoryDeadline(updatedDeadline);
        }
      }
    } catch (error) {
      console.error("Feedback reply error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to send reply",
      );
    }
  };

  const handleDeleteFile = async (deadline, submission, file) => {
    console.log("DELETE FILE DATA:", {
      deadlineId: deadline?._id,
      submissionId: submission?._id,
      fileId: file?._id,
      submission,
      file,
    });
    try {
      if (!deadline?._id || !submission?._id || !file?._id) {
        toast.error("Invalid file information");
        return;
      }

      await dispatch(
        deleteDeadlineSubmissionFile({
          deadlineId: deadline._id,
          submissionId: submission._id,
          fileId: file._id,
        }),
      ).unwrap();

      // Refresh deadline data
      const result = await dispatch(getStudentDeadlines()).unwrap();

      const updatedDeadline = result.find((item) => item._id === deadline._id);

      if (updatedDeadline) {
        setHistoryDeadline(updatedDeadline);
      }

      // toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete file error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to delete file",
      );
    }
  };

  const handleDeleteLink = async (deadline, submission, link) => {
    try {
      if (!deadline?._id || !submission?._id || !link?._id) {
        toast.error("Invalid link information");
        return;
      }

      await dispatch(
        deleteDeadlineSubmissionLink({
          deadlineId: deadline._id,
          submissionId: submission._id,
          linkId: link._id,
        }),
      ).unwrap();

      // Refresh deadline data
      const result = await dispatch(getStudentDeadlines()).unwrap();

      const updatedDeadline = result.find((item) => item._id === deadline._id);

      if (updatedDeadline) {
        setHistoryDeadline(updatedDeadline);
      }

      toast.success("Link deleted successfully");
    } catch (error) {
      console.error("Delete link error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to delete link",
      );
    }
  };
  const getSubmissions = (deadline) => {
    if (
      Array.isArray(deadline?.submissions) &&
      deadline.submissions.length > 0
    ) {
      return deadline.submissions;
    }

    if (deadline?.submission) {
      return [
        {
          ...deadline.submission,
          _id:
            deadline.submission._id || deadline.submission.submissionId || null,
        },
      ];
    }

    return [];
  };

  const canDeleteSubmissionItem = (deadline) => {
    if (!deadline?.dueDate) return true;

    return new Date(deadline.dueDate).getTime() >= Date.now();
  };

  const totalPages = Math.ceil(studentDeadlines.length / ITEMS_PER_PAGE);

  // pagination
  const paginatedDeadlines = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return studentDeadlines.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [studentDeadlines, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statusClasses = {
    Active: "bg-green-100 text-green-700",

    Overdue: "bg-red-100 text-red-700",

    Submitted: "bg-blue-100 text-blue-700",

    Reviewed: "bg-cyan-100 text-cyan-700",
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      {/* My Deadlines header  */}
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 py-7 sm:px-8">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/5" />

          <div className="absolute -bottom-20 right-20 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-sm">
              <CalendarDays className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                My Deadlines
              </h1>
              <p className="mt-1.5 text-sm text-white/80 sm:text-base">
                Complete and submit the milestones assigned by your supervisor.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* deadline list */}
      <section className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-100 border-t-[#17a2b8]" />

            <p className="text-sm text-slate-500">Loading deadlines...</p>
          </div>
        ) : studentDeadlines.length === 0 ? (
          <div className="p-14 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50">
              <CalendarDays className="h-8 w-8 text-[#17a2b8]" />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              No deadlines assigned yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your supervisor has not assigned any deadline yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {paginatedDeadlines.map((deadline) => {
              const status = getStatus(deadline);

              const research = deadline?.project || deadline?.thesis;

              const submissions = getSubmissions(deadline);

              const submissionCount = submissions.length;

              const lastSubmission =
                submissions.length > 0
                  ? submissions[submissions.length - 1]
                  : deadline?.submission;

              const canSubmit = status !== "Overdue";

              return (
                <article
                  key={deadline._id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md mb-5"
                >
                  {/* Status Accent */}
                  <div
                    className={`absolute left-0 top-0 h-full w-1 ${
                      status === "Reviewed"
                        ? "bg-cyan-500"
                        : status === "Submitted"
                          ? "bg-blue-500"
                          : status === "Overdue"
                            ? "bg-red-500"
                            : "bg-emerald-500"
                    }`}
                  />

                  <div className="p-5 pl-6 sm:p-6 sm:pl-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        {/* Deadline Type */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                            {deadline.type || "Deadline"}
                          </span>
                        </div>

                        {/* Deadline Name */}
                        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                          {deadline.name || "Untitled Deadline"}
                        </h2>

                        {/* Research / Project */}
                        <p className="mt-1 text-sm font-medium text-cyan-700">
                          {research?.title || "Project or Thesis"}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${
                          status === "Reviewed"
                            ? "bg-cyan-50 text-cyan-700"
                            : status === "Submitted"
                              ? "bg-blue-50 text-blue-700"
                              : status === "Overdue"
                                ? "bg-red-50 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            status === "Reviewed"
                              ? "bg-cyan-500"
                              : status === "Submitted"
                                ? "bg-blue-500"
                                : status === "Overdue"
                                  ? "bg-red-500"
                                  : "bg-emerald-500"
                          }`}
                        />

                        {status}
                      </span>
                    </div>
                    {deadline.description && (
                      <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-500">
                        {deadline.description}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Due Date */}
                      <div
                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
                          status === "Overdue"
                            ? "border-red-100 bg-red-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            status === "Overdue"
                              ? "bg-red-100 text-red-600"
                              : "bg-white text-cyan-600"
                          }`}
                        >
                          <Clock3 className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Due Date
                          </p>

                          <p
                            className={`mt-0.5 text-xs font-bold ${
                              status === "Overdue"
                                ? "text-red-700"
                                : "text-slate-700"
                            }`}
                          >
                            {formatDate(deadline.dueDate)}
                          </p>
                        </div>
                      </div>

                      {/* Submissions */}
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-500">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Submissions
                          </p>

                          <p className="mt-0.5 text-xs font-bold text-slate-700">
                            {submissionCount}{" "}
                            {submissionCount === 1
                              ? "Submission"
                              : "Submissions"}
                          </p>
                        </div>
                      </div>

                      {/* Last Submitted */}
                      {lastSubmission?.submittedAt ? (
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-500">
                            <CalendarDays className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Last Submitted
                            </p>

                            <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
                              {formatDate(lastSubmission.submittedAt, true)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="hidden rounded-xl border border-dashed border-slate-200 bg-white px-3.5 py-3 lg:block">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Last Submitted
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            No submission yet
                          </p>
                        </div>
                      )}
                    </div>
                    {/* final submission  */}
                    {deadline.finalSubmitDate && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
                        <CalendarDays className="h-4 w-4 text-indigo-500" />

                        <span className="text-xs font-semibold text-indigo-700">
                          Final submission:{" "}
                          {formatDate(deadline.finalSubmitDate)}
                        </span>
                      </div>
                    )}
                    {/* comment and supervisor feedback  */}
                    {(lastSubmission?.studentComment ||
                      lastSubmission?.teacherFeedback) && (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {/* Student Comment */}
                        {lastSubmission?.studentComment && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />

                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Your Comment
                              </p>
                            </div>

                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                              “{lastSubmission.studentComment}”
                            </p>
                          </div>
                        )}

                        {/* Supervisor Feedback */}
                        {lastSubmission?.teacherFeedback && (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-4">
                            {/* Feedback */}
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                Supervisor Feedback
                              </p>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-emerald-800">
                              {lastSubmission.teacherFeedback}
                            </p>

                            {/* Divider */}
                            <div className="my-4 border-t border-emerald-200/70" />

                            {/* Existing Reply */}
                            {/* Student Reply */}
                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-slate-500" />

                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Your Reply
                                  </p>
                                </div>

                                {lastSubmission.studentReply &&
                                  editingReplyId !== lastSubmission._id && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingReplyId(lastSubmission._id);
                                        setReplyingSubmissionId(
                                          lastSubmission._id,
                                        );
                                        setFeedbackReply(
                                          lastSubmission.studentReply,
                                        );
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit Reply
                                    </button>
                                  )}
                              </div>

                              {lastSubmission.studentReply &&
                                editingReplyId !== lastSubmission._id && (
                                  <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3">
                                    <p className="text-sm leading-6 text-slate-700">
                                      {lastSubmission.studentReply}
                                    </p>

                                    {lastSubmission.studentReplyAt && (
                                      <p className="mt-2 text-[11px] font-medium text-slate-400">
                                        Replied{" "}
                                        {formatDate(
                                          lastSubmission.studentReplyAt,
                                          true,
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}

                              {/* REPLY BUTTON */}

                              {!lastSubmission.studentReply &&
                                replyingSubmissionId !== lastSubmission._id && (
                                  <div className="mt-3 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!lastSubmission?._id) {
                                          toast.error(
                                            "Submission ID is missing",
                                          );
                                          return;
                                        }

                                        setReplyingSubmissionId(
                                          lastSubmission._id,
                                        );
                                        setEditingReplyId(null);
                                        setFeedbackReply("");
                                      }}
                                      className="inline-flex items-center gap-2 rounded-lg bg-[#17a2b8] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#138496]"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      Reply to Supervisor
                                    </button>
                                  </div>
                                )}

                              {/* REPLY TEXTAREA */}

                              {!lastSubmission.studentReply &&
                                replyingSubmissionId === lastSubmission._id && (
                                  <div className="mt-3">
                                    <textarea
                                      value={feedbackReply}
                                      onChange={(event) =>
                                        setFeedbackReply(event.target.value)
                                      }
                                      rows={3}
                                      placeholder="Write your reply to the supervisor..."
                                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#17a2b8] focus:bg-white focus:ring-2 focus:ring-[#17a2b8]/10"
                                    />

                                    <div className="mt-3 flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingSubmissionId(null);
                                          setFeedbackReply("");
                                        }}
                                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                      >
                                        Cancel
                                      </button>

                                      <button
                                        type="button"
                                        disabled={!feedbackReply.trim()}
                                        onClick={() =>
                                          handleFeedbackReply(
                                            deadline,
                                            lastSubmission,
                                          )
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#17a2b8] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#138496] disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <Send className="h-3.5 w-3.5" />
                                        Send Reply
                                      </button>
                                    </div>
                                  </div>
                                )}

                              {/* EXISTING REPLY */}

                              {lastSubmission.studentReply &&
                                editingReplyId !== lastSubmission._id && (
                                  <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3">
                                    <p className="text-sm leading-6 text-slate-700">
                                      “{lastSubmission.studentReply}”
                                    </p>

                                    {lastSubmission.studentReplyAt && (
                                      <p className="mt-2 text-[11px] font-medium text-slate-400">
                                        Replied{" "}
                                        {formatDate(
                                          lastSubmission.studentReplyAt,
                                          true,
                                        )}
                                      </p>
                                    )}

                                    <div className="mt-3 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingReplyId(lastSubmission._id);
                                          setReplyingSubmissionId(
                                            lastSubmission._id,
                                          );
                                          setFeedbackReply(
                                            lastSubmission.studentReply,
                                          );
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit Reply
                                      </button>
                                    </div>
                                  </div>
                                )}

                              {/* EDIT REPLY */}

                              {lastSubmission.studentReply &&
                                editingReplyId === lastSubmission._id && (
                                  <div className="mt-3">
                                    <textarea
                                      value={feedbackReply}
                                      onChange={(event) =>
                                        setFeedbackReply(event.target.value)
                                      }
                                      rows={3}
                                      placeholder="Update your reply..."
                                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#17a2b8] focus:bg-white focus:ring-2 focus:ring-[#17a2b8]/10"
                                    />

                                    <div className="mt-3 flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingReplyId(null);
                                          setReplyingSubmissionId(null);
                                          setFeedbackReply("");
                                        }}
                                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                      >
                                        Cancel
                                      </button>

                                      <button
                                        type="button"
                                        disabled={!feedbackReply.trim()}
                                        onClick={() =>
                                          handleFeedbackReply(
                                            deadline,
                                            lastSubmission,
                                          )
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#17a2b8] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#138496] disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <Send className="h-3.5 w-3.5" />
                                        Update Reply
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      {/* Submission Summary */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                        </div>

                        <span>
                          {submissionCount > 0 ? (
                            <>
                              <span className="font-bold text-slate-700">
                                {submissionCount}
                              </span>{" "}
                              {submissionCount === 1
                                ? "submission"
                                : "submissions"}
                            </>
                          ) : (
                            "No submission yet"
                          )}
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="flex w-full gap-2 sm:w-auto">
                        {/* View Submissions */}
                        {submissionCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setHistoryDeadline(deadline)}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 sm:flex-none"
                          >
                            <Eye className="h-4 w-4" />
                            View Submissions
                          </button>
                        )}

                        {/* Submit Work */}
                        {canSubmit ? (
                          <button
                            type="button"
                            onClick={() => openSubmitModal(deadline)}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#17a2b8] px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#138496] hover:shadow-md sm:flex-none"
                          >
                            <Upload className="h-4 w-4" />
                            Submit Work
                          </button>
                        ) : (
                          <div className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-4 text-xs font-bold text-red-600 sm:flex-none">
                            <Clock3 className="h-4 w-4" />
                            Deadline Passed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {/* pagination  */}
        {totalPages > 1 && (
          <div className="mt-[-20px] flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>
              {" - "}
              <span className="font-bold text-slate-700">
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  studentDeadlines.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {studentDeadlines.length}
              </span>{" "}
              deadlines
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-[#17a2b8] text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* submit modal  */}
      {selectedDeadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Submit Your Work
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedDeadline.name}
                  {" • "}
                  {selectedDeadline.type || "Project"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSubmitModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="max-h-[75vh] overflow-y-auto p-6">
              {/* FILES */}

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    Upload Files
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    Multiple files allowed
                  </span>
                </div>

                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/40 px-5 py-8 text-center transition hover:border-[#17a2b8] hover:bg-cyan-50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#17a2b8] shadow-sm">
                    <Upload className="h-6 w-6" />
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    Choose multiple files
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PDF, DOC, DOCX, ZIP, PPT, images and other supported files
                  </p>

                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {/* SELECTED FILES */}

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#17a2b8] shadow-sm">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-700">
                              {file.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LINKS */}

              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    Research / Project Links
                  </label>

                  <button
                    type="button"
                    onClick={addLinkField}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-2 text-xs font-semibold text-[#138496] transition hover:bg-cyan-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Another Link
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {links.map((link, index) => (
                    <div
                      key={link.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Link {index + 1}
                        </span>

                        {links.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLinkField(link.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={link.title}
                        onChange={(event) =>
                          updateLink(link.id, "title", event.target.value)
                        }
                        placeholder="Link title"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#17a2b8] focus:ring-2 focus:ring-[#17a2b8]/10"
                      />

                      <div className="relative mt-3">
                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="url"
                          value={link.url}
                          onChange={(event) =>
                            updateLink(link.id, "url", event.target.value)
                          }
                          placeholder="https://..."
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#17a2b8] focus:ring-2 focus:ring-[#17a2b8]/10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMMENT */}

              <div className="mt-7">
                <label className="text-sm font-bold text-slate-800">
                  Comment
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  placeholder="Add a submission comment..."
                  className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-[#17a2b8] focus:ring-2 focus:ring-[#17a2b8]/10"
                />
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeSubmitModal}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  (selectedFiles.length === 0 &&
                    validLinks.length === 0 &&
                    !comment.trim())
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#138496] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />

                {submitting ? "Submitting..." : "Submit Work"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* submission modal  */}
      {historyDeadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Submission History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {historyDeadline.name}
                  {" • "}
                  {historyDeadline.type || "Project"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHistoryDeadline(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto bg-slate-50/40 p-6">
              {getSubmissions(historyDeadline)
                .slice()
                .reverse()
                .map((submission, index) => {
                  const files = submission?.files || [];

                  const submissionLinks = submission?.links || [];

                  const submissionDate =
                    submission?.submittedAt || submission?.createdAt;

                  return (
                    <div
                      key={submission?._id || index}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-white px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            {/* Folder Icon */}

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#17a2b8]/10 text-[#17a2b8]">
                              <CalendarDays className="h-5 w-5" />
                            </div>

                            <div>
                              <h3 className="text-base font-bold text-slate-800">
                                {formatDate(submissionDate)}
                              </h3>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Submitted at {formatDate(submissionDate, true)}
                              </p>
                            </div>
                          </div>

                          {/* Submission Number */}

                          <span className="w-fit rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-[#138496]">
                            Submission{" "}
                            {submission?.submissionNumber ||
                              getSubmissions(historyDeadline).length - index}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-5 p-5">
                        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/30 p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#17a2b8] shadow-sm">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  Files
                                </h4>

                                <p className="text-xs text-slate-500">
                                  {files.length}{" "}
                                  {files.length === 1 ? "file" : "files"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {files.length > 0 ? (
                            <div className="space-y-2">
                              {files.map((file) => (
                                <div
                                  key={file._id || file.fileUrl}
                                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                  {/* FILE INFO */}

                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-[#17a2b8]">
                                      <FileText className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-700">
                                        {getFileName(file)}
                                      </p>

                                      {file.fileType && (
                                        <p className="mt-0.5 text-xs text-slate-400">
                                          {file.fileType}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* FILE ACTIONS */}

                                  <div className="flex shrink-0 flex-wrap gap-2">
                                    {file.fileUrl && (
                                      <a
                                        href={file.fileUrl}
                                        download
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#17a2b8] hover:text-[#17a2b8]"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                      </a>
                                    )}

                                    {canDeleteSubmissionItem(
                                      historyDeadline,
                                    ) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteFile(
                                            historyDeadline,
                                            submission,
                                            file,
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-cyan-200 bg-white px-4 py-5 text-center">
                              <p className="text-xs text-slate-400">
                                No files submitted
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-sm">
                                <LinkIcon className="h-5 w-5" />
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  Links
                                </h4>

                                <p className="text-xs text-slate-500">
                                  {submissionLinks.length}{" "}
                                  {submissionLinks.length === 1
                                    ? "link"
                                    : "links"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {submissionLinks.length > 0 ? (
                            <div className="space-y-2">
                              {submissionLinks.map((link) => (
                                <div
                                  key={link._id || link.url}
                                  className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                  {/* LINK INFO */}

                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                                      <LinkIcon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-700">
                                        {link.title ||
                                          link.name ||
                                          "Resource Link"}
                                      </p>

                                      <p className="truncate text-xs text-slate-500">
                                        {link.url}
                                      </p>
                                    </div>
                                  </div>

                                  {/* LINK ACTIONS */}

                                  <div className="flex shrink-0 flex-wrap gap-2">
                                    {link.url && (
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Open
                                      </a>
                                    )}

                                    {canDeleteSubmissionItem(
                                      historyDeadline,
                                    ) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteLink(
                                            historyDeadline,
                                            submission,
                                            link,
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-indigo-200 bg-white px-4 py-5 text-center">
                              <p className="text-xs text-slate-400">
                                No links submitted
                              </p>
                            </div>
                          )}
                        </div>

                        {submission?.studentComment && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Student Comment
                            </p>

                            <p className="mt-1 text-sm italic text-slate-600">
                              “{submission.studentComment}”
                            </p>
                          </div>
                        )}

                        {/* {submission?.teacherFeedback && (
                          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                              Supervisor Feedback
                            </p>

                            <p className="mt-1 text-sm text-green-800">
                              {submission.teacherFeedback}
                            </p>
                          </div>
                        )} */}

                        {/* SUPERVISOR FEEDBACK + STUDENT REPLY - READ ONLY */}

                        {(submission?.teacherFeedback ||
                          submission?.studentReply) && (
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                            {/* Supervisor Feedback */}
                            {submission?.teacherFeedback && (
                              <div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                    Supervisor Feedback
                                  </p>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-emerald-800">
                                  {submission.teacherFeedback}
                                </p>
                              </div>
                            )}

                            {/* Divider */}
                            {submission?.teacherFeedback && (
                              <div className="my-4 border-t border-emerald-200/70" />
                            )}

                            {/* Your Reply */}
                            <div>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-slate-500" />

                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Your Reply
                                </p>
                              </div>

                              {submission?.studentReply ? (
                                <div className="mt-2 rounded-xl bg-white px-4 py-3">
                                  <p className="text-sm leading-6 text-slate-700">
                                    “{submission.studentReply}”
                                  </p>

                                  {submission.studentReplyAt && (
                                    <p className="mt-2 text-[11px] font-medium text-slate-400">
                                      Replied{" "}
                                      {formatDate(
                                        submission.studentReplyAt,
                                        true,
                                      )}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3">
                                  <p className="text-sm text-slate-400">
                                    No reply yet
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setHistoryDeadline(null)}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDeadlinePage;
