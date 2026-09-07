import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Loader,
  CheckCircle2,
  MessageSquareIcon,
  Users,
} from "lucide-react";
import {
  addFeedback,
  getAssignedStudents,
  markComplete,
} from "../../store/slices/teacherSlice";

const AssignedStudents = () => {
  const [sortBy, setSortBy] = useState("name");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const dispatch = useDispatch();

  const { assignedStudents, loading, error } = useSelector(
    (state) => state.teacher,
  );

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  const normalizeStatus = (status) => {
    if (!status) return null;

    return String(status)
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_");
  };

  // Get Thesis and Project information
  const getWorkInfo = (student) => {
    if (!student) {
      return {
        type: "Project",
        typeKey: "project",
        title: "No project title",
        id: null,
        status: null,
        deadline: null,
        updatedAt: null,
      };
    }

    const project = student.project;
    const thesis = student.thesis;

    let work = null;
    let isThesis = false;

    if (project && thesis) {
      const projectDate = new Date(project.updatedAt || project.createdAt || 0);

      const thesisDate = new Date(thesis.updatedAt || thesis.createdAt || 0);

      if (thesisDate > projectDate) {
        work = thesis;
        isThesis = true;
      } else {
        work = project;
        isThesis = false;
      }
    } else if (thesis) {
      work = thesis;
      isThesis = true;
    } else if (project) {
      work = project;
      isThesis = false;
    }

    if (!work) {
      return {
        type: "Project",
        typeKey: "project",
        title: "No project title",
        id: null,
        status: null,
        deadline: null,
        updatedAt: null,
      };
    }

    return {
      type: isThesis ? "Thesis" : "Project",
      typeKey: isThesis ? "thesis" : "project",
      title:
        work.title ||
        work.name ||
        (isThesis ? "No thesis title" : "No project title"),
      id: work._id,
      status: normalizeStatus(work.status),
      deadline: work.deadline || null,
      updatedAt: work.updatedAt || work.createdAt || null,
    };
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = normalizeStatus(status);

    switch (normalizedStatus) {
      case "completed":
        return "bg-green-100 text-green-700 border border-green-300";

      case "approved":
        return "bg-blue-100 text-blue-700 border border-blue-300";

      case "in_progress":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";

      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "completed") {
      return "Completed";
    }

    if (normalizedStatus === "approved") {
      return "Approved";
    }

    if (normalizedStatus === "in_progress") {
      return "In Progress";
    }

    return "Pending";
  };

  const handleFeedback = (student) => {
    setSelectedStudent(student);

    setFeedbackData({
      title: "",
      message: "",
      type: "general",
    });

    setShowFeedbackModal(true);
  };

  const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModal(true);
  };

  const closeModal = () => {
    setShowFeedbackModal(false);
    setShowCompleteModal(false);
    setSelectedStudent(null);

    setFeedbackData({
      title: "",
      message: "",
      type: "general",
    });
  };

  const submitFeedback = () => {
    const workInfo = getWorkInfo(selectedStudent);

    console.log("SELECTED STUDENT:", selectedStudent);
    console.log("WORK INFO:", workInfo);
    console.log("WORK ID:", workInfo.id);
    console.log("WORK TYPE:", workInfo.typeKey);

    if (
      workInfo.id &&
      feedbackData.title.trim() &&
      feedbackData.message.trim()
    ) {
      dispatch(
        addFeedback({
          workId: workInfo.id,
          workType: workInfo.typeKey,
          payload: feedbackData,
        }),
      );

      closeModal();
    }
  };

  const confirmMarkComplete = () => {
    const workInfo = getWorkInfo(selectedStudent);

    if (workInfo.id) {
      dispatch(
        markComplete({
          workId: workInfo.id,
          workType: workInfo.typeKey,
        }),
      );

      closeModal();
    }
  };

  const sortedStudents = [...(assignedStudents || [])].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");

      case "lastActivity":
        return (
          new Date(getWorkInfo(b).updatedAt || 0).getTime() -
          new Date(getWorkInfo(a).updatedAt || 0).getTime()
        );

      default:
        return 0;
    }
  });
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentStudents = sortedStudents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const stats = [
    {
      label: "Total Students",
      value: sortedStudents.length,
      bg: "bg-blue-50",
      text: "text-blue-700",
      sub: "text-blue-600",
    },
    {
      label: "Projects Completed",
      value: sortedStudents.filter((s) => getWorkInfo(s).status === "completed")
        .length,
      bg: "bg-green-50",
      text: "text-green-700",
      sub: "text-green-600",
    },
    {
      label: "In Progress",
      value: sortedStudents.filter(
        (s) => getWorkInfo(s).status === "in_progress",
      ).length,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      sub: "text-yellow-600",
    },
    {
      label: "Total Research Works",
      value: sortedStudents.length,
      bg: "bg-purple-50",
      text: "text-purple-700",
      sub: "text-purple-600",
    },
  ];

  // error
  if (error) {
    return (
      <div className="text-center py-10 text-red-600 font-medium">
        Error loading students
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="relative px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white overflow-hidden">
            <div className="absolute -right-10 -top-16 w-36 h-36 rounded-full bg-[#17a2b8]/5" />
            <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-[#17a2b8]/5" />

            <div className="relative flex items-center gap-4">
              <div
                className="
                  w-11 h-11 shrink-0 rounded-lg
                  bg-[#17a2b8]/10
                  border border-[#17a2b8]/20
                  flex items-center justify-center
                "
              >
                <Users className="w-5 h-5 text-[#138496]" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                  Assigned Students
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your assigned students and their thesis/projects
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className={`${item.bg} p-4 rounded-lg border border-white/60`}
                >
                  <p className={`text-sm ${item.sub}`}>{item.label}</p>

                  <p className={`text-2xl ${item.text} font-bold mt-1`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* student grid  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentStudents.map((student) => {
            const workInfo = getWorkInfo(student);

            return (
              <div
                key={student._id}
                className="card hover:shadow-lg transition-all duration-300"
              >
                {/* Student Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {/* Profile */}
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">
                        {student.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "S"}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {student.name}
                      </h3>

                      <p className="text-sm text-slate-600">{student.email}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      workInfo.status,
                    )}`}
                  >
                    {getStatusText(workInfo.status)}
                  </span>
                </div>
 {/* Thesis / Project Information */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#138496]">
                      {workInfo.type}
                    </span>
                  </div>

                  <h4 className="font-medium text-slate-700">
                    {workInfo.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Last Update:{" "}
                    {workInfo.updatedAt
                      ? new Date(workInfo.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleFeedback(student)}
                    className="
    flex items-center justify-center gap-2
    px-4 py-2
     bg-[#17a2b8] text-white
    text-sm rounded-lg
    hover:bg-[#138496]
    transition duration-200
  "
                  >
                    <MessageSquareIcon className="w-4 h-4" />
                    Feedback
                  </button>

                  <button
                    onClick={() => handleMarkComplete(student)}
                    disabled={workInfo.status === "completed"}
                    className={`
                      flex items-center justify-center gap-2
                      px-4 py-2
                      bg-green-600 text-white
                      text-sm rounded-lg
                      transition
                      ${
                        workInfo.status === "completed"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-green-700"
                      }
                    `}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Complete
                  </button>
                </div>
              </div>
            );
          })}

          {sortedStudents.length === 0 && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center px-6 py-14 sm:py-16">
                  {/* Icon */}
                  <div
                    className=" w-14 h-14 rounded-2xl bg-[#17a2b8]/10  border border-[#17a2b8]/20 flex items-center justify-center mb-5">
                    <Users className="w-6 h-6 text-[#138496]" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-slate-800">
                    No Assigned Students
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    You currently don't have any students assigned to you. Once
                    students are assigned, their thesis or project information
                    will appear here.
                  </p>

                  <div
                    className=" mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-500 "
                  >
                    <Users className="w-3.5 h-3.5" />
                    No students to display
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {sortedStudents.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            {/* Showing Info */}
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {Math.min(startIndex + itemsPerPage, sortedStudents.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {sortedStudents.length}
              </span>{" "}
              students
            </p>

            {/* Pagination */}
            <div className="flex items-center gap-1">
              {/* Previous */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="
          px-3 py-2
          text-sm font-medium
          rounded-lg
          border border-slate-200
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

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
              min-w-9 h-9
              px-3
              text-sm font-medium
              rounded-lg
              border
              transition

              ${
                currentPage === page
                  ? "bg-[#17a2b8] text-white border-[#17a2b8] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-[#f0fbfc] hover:text-[#138496]"
              }
            `}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="
          px-3 py-2
          text-sm font-medium
          rounded-lg
          border border-slate-200
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
        )}

        {/* feedback modal  */}
        {showFeedbackModal && selectedStudent && (
          <div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-black/40 backdrop-blur-sm
              px-4 !mt-0 !pt-0
            "
            onClick={closeModal}
          >
            <div
              className="
                bg-white rounded-xl shadow-2xl
                w-full max-w-md
                transition-all
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Provide Feedback
                  </h2>

                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Work Info */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Type:</span>

                      <span className="ml-2 text-[#138496] font-medium">
                        {getWorkInfo(selectedStudent).type}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-600">Title:</span>

                      <span className="ml-2 text-slate-800">
                        {getWorkInfo(selectedStudent).title}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-600">
                        Student:
                      </span>

                      <span className="ml-2 text-slate-800">
                        {selectedStudent.name}
                      </span>
                    </div>

                    {getWorkInfo(selectedStudent).deadline && (
                      <div>
                        <span className="font-medium text-slate-600">
                          Deadline:
                        </span>

                        <span className="ml-2 text-slate-800">
                          {new Date(
                            getWorkInfo(selectedStudent).deadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-slate-600">
                        Last Updated:
                      </span>

                      <span className="ml-2 text-slate-800">
                        {getWorkInfo(selectedStudent).updatedAt
                          ? new Date(
                              getWorkInfo(selectedStudent).updatedAt,
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feedback Form */}
                <div className="space-y-4">
                  {/* Feedback Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Title
                    </label>

                    <input
                      type="text"
                      value={feedbackData.title}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          title: e.target.value,
                        })
                      }
                      className="
                        w-full px-3 py-2
                        border border-slate-300
                        rounded-lg outline-none
                        focus:ring-1 focus:ring-blue-500
                      "
                      placeholder="Enter feedback title"
                    />
                  </div>

                  {/* Feedback Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Type
                    </label>

                    <select
                      value={feedbackData.type}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          type: e.target.value,
                        })
                      }
                      className="
                        w-full px-3 py-2
                        border border-slate-300
                        rounded-lg outline-none
                        focus:ring-1 focus:ring-blue-500
                        focus:border-transparent
                      "
                    >
                      <option value="general">General</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>

                  {/* Feedback Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Message
                    </label>

                    <textarea
                      value={feedbackData.message}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          message: e.target.value,
                        })
                      }
                      rows={4}
                      className="
                        w-full px-3 py-2
                        border border-slate-300
                        rounded-lg outline-none
                        focus:ring-1 focus:ring-blue-500
                        focus:border-transparent
                      "
                      placeholder="Enter your feedback message..."
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="btn-danger">
                    Cancel
                  </button>

                  <button
                    className="btn-primary bg-[#138496] hover:bg-[#17a2b8]"
                    onClick={submitFeedback}
                    disabled={
                      !feedbackData.title.trim() || !feedbackData.message.trim()
                    }
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* complete modal */}
        {showCompleteModal && selectedStudent && (
          <div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-black/40 backdrop-blur-sm
              px-4 !mt-0 !pt-0
            "
            onClick={closeModal}
          >
            <div
              className="
                bg-white rounded-xl shadow-2xl
                w-full max-w-md
                transition-all
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Mark {getWorkInfo(selectedStudent).type.toLowerCase()} as
                    completed?
                  </h2>

                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Work Info */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">
                        Student:
                      </span>

                      <span className="ml-2 text-slate-800">
                        {selectedStudent.name}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-600">
                        {getWorkInfo(selectedStudent).type}:
                      </span>

                      <span className="ml-2 text-slate-800">
                        {getWorkInfo(selectedStudent).title}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-6">
                  Are you sure you want to mark this{" "}
                  {getWorkInfo(selectedStudent).type.toLowerCase()} as
                  completed? This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="btn-danger">
                    Cancel
                  </button>

                  <button
                    onClick={confirmMarkComplete}
                    className="
    flex items-center justify-center gap-2
    px-4 py-2
     bg-[#17a2b8] text-white
    text-sm rounded-lg
    hover:bg-[#138496]
    transition duration-200
  "
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssignedStudents;
