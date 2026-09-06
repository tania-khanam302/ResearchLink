import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileText } from "lucide-react";
import {
  getTeacherRequests,
  acceptRequest,
  rejectRequest,
  deleteRequest,
} from "../../store/slices/teacherSlice";

const PendingRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherRequests(authUser?._id));
  }, [dispatch, authUser?._id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  };

  const handleAccept = async (request) => {
    console.log("REQUEST:", request);
    console.log("REQUEST ID:", request._id);
    console.log("TEACHER ID:", authUser?._id);
    const id = request._id;
    setLoading(id, "accepting", true);
    try {
      await dispatch(acceptRequest(id)).unwrap();
    } finally {
      setLoading(id, "accepting", false);
    }
  };

  const handleReject = async (request) => {
    const id = request._id;
    setLoading(id, "rejecting", true);
    try {
      await dispatch(rejectRequest(id)).unwrap();
    } finally {
      setLoading(id, "rejecting", false);
    }
  };

  const handleDelete = async (request) => {
    const id = request._id;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this request?",
    );

    if (!confirmDelete) return;

    setLoading(id, "deleting", true);

    try {
      await dispatch(deleteRequest(id)).unwrap();
    } finally {
      setLoading(id, "deleting", false);
    }
  };

const filteredRequests =
  (list || []).filter((request) => {
    const matchesSearch =
      (request?.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request?.project?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request?.latestProject?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request?.thesis?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request?.latestThesis?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;

    // Type Filter Logic
    const thesis = request.latestThesis || request.thesis;
    const project = request.latestProject || request.project;

    const requestType = thesis
      ? "thesis"
      : project
        ? "project"
        : null;

    const matchesType =
      filterType === "all" || requestType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Pending Supervisor Requests header */}
          <div className="relative px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white overflow-hidden">
            <div className="absolute -right-10 -top-16 w-36 h-36 rounded-full bg-[#17a2b8]/5" />
            <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-[#17a2b8]/5" />

            <div className="relative flex items-center gap-4">
              <div className="w-11 h-11 shrink-0 rounded-lg bg-[#17a2b8]/10 border border-[#17a2b8]/20 flex items-center justify-center">
                <FileText className="w-5.5 h-5.5 text-[#138496]" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                  Pending Supervisor Requests
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Review and respond to student supervision requests
                </p>
              </div>
            </div>
          </div>

          {/* search & filter */}
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by student name or thesis/project title..."
                  className="w-full h-10 px-3
                     text-sm
                     text-slate-700
                     bg-white
                     border border-slate-300
                     rounded-lg
                     outline-none
                     placeholder:text-slate-400
                     transition-all
                     focus:border-[#17a2b8]
                     focus:ring-2
                     focus:ring-[#17a2b8]/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-52">
                <select
                  className="w-full h-10
      px-3
      text-sm
      text-slate-700
      bg-white
      border border-slate-300
      rounded-lg
      outline-none
      cursor-pointer
      transition-all
      focus:border-[#17a2b8]
      focus:ring-2
      focus:ring-[#17a2b8]/10"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="thesis">Thesis</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div className="w-full md:w-52">
                <select
                  className="w-full h-10
                     px-3
                     text-sm
                     text-slate-700
                     bg-white
                     border border-slate-300
                     rounded-lg
                     outline-none
                     cursor-pointer
                     transition-all
                     focus:border-[#17a2b8]
                     focus:ring-2
                     focus:ring-[#17a2b8]/10"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* request */}
        <div className="space-y-4">
          {currentRequests.map((req) => {
            console.log("TEACHER REQUEST DATA:", req);
            const id = req._id;
            // const project = req.latestProject;
            //             const project =
            //   req.latestProject?.title || req.latestProject?.status
            //     ? req.latestProject
            //     : req.project;

            // const workType =
            //   project?.workType ||
            //   project?.type ||
            //   "Project";

            const thesis = req.latestThesis || req.thesis;
            const project = req.latestProject || req.project;
            const work = thesis || project;

            const workType = thesis
              ? "Thesis"
              : project?.workType || project?.type || "Project";

            const projectStatus = project?.status?.toLowerCase() || "pending";
            const supervisorAssigned = !!project?.supervisor;
            const canAccept =
              projectStatus === "approved" && !supervisorAssigned;
            const lm = loadingMap[id] || {};
            let bgclass = "bg-white";
            let statusMessage = "";

            if (projectStatus === "approved" && !supervisorAssigned) {
              bgclass = "bg-blue-50 border-blue-300";
              statusMessage = "Supervisor already assigned";
            } else if (projectStatus === "rejected") {
              bgclass = "bg-red-50 border-red-300";
              statusMessage = "Project rejected";
            } else if (projectStatus === "pending") {
              bgclass = "bg-yellow-50 border-yellow-300";
              statusMessage = "Thesis/project pending";
            }
            return (
              <div key={id} className={`card border ${bgclass} transition-all`}>
                <div className="flex flex-col lg:flex-row justify-between">
                  {/* info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {req?.student?.name || "Unknown Student"}
                      </h3>
                      <span
                        className={`badge ${
                          req.status === "pending"
                            ? "badge-pending"
                            : req.status === "accepted"
                              ? "badge-approved"
                              : "badge-rejected"
                        }`}
                      >
                        {req.status?.charAt(0).toUpperCase() +
                          req.status?.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm  text-slate-600 mb-2">
                      {req?.student?.email || "No email"}
                    </p>
                    {/* <h4 className="font-medium text-slate-700 mb-2">
  {project?.title
    ? `${workType}: ${project.title}`
    : "No thesis/project title"}
</h4> */}

                    <h4 className="font-medium text-slate-700 mb-2">
                      {work?.title
                        ? `${workType}: ${work.title}`
                        : "No thesis/project title"}
                    </h4>

                    <p className="text-sm text-slate-500">
                      Submitted:{" "}
                      {req?.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "_"}
                    </p>

                    {statusMessage && (
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {statusMessage}
                      </p>
                    )}
                  </div>
                  {/* actions */}
                  <div className="flex items-center gap-3 mt-3">
                    {req.status === "pending" && (
                      <>
                        <button
                          className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 
                            ${
                              canAccept
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          disabled={lm.accepting || !canAccept}
                          onClick={() => handleAccept(req)}
                        >
                          {lm.accepting ? "Accepting..." : "Accept"}
                        </button>
                        {/* reject  */}
                        <button
                          className="px-4 py-1.5 text-sm rounded-lg font-medium bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={lm.rejecting}
                          onClick={() => handleReject(req)}
                        >
                          {lm.rejecting ? "Rejecting..." : "Reject"}
                        </button>
                      </>
                    )}
                    {/* delete  */}
                    <button
                      className="px-4 py-1.5 text-sm rounded-lg font-medium bg-red-700 hover:bg-red-800 text-white  disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={lm.deleting}
                      onClick={() => handleDelete(req)}
                    >
                      {lm.deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {/* not request */}
          {filteredRequests.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl text-center py-10 px-6 shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#17a2b8]/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#17a2b8]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No requests found
              </h3>{" "}
              <p className="text-slate">
                No Supervisor requests match your filters.
              </p>
            </div>
          )}
        </div>
        {filteredRequests.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === index + 1
                    ? "bg-[#17a2b8] text-white border-[#17a2b8]"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PendingRequests;
