import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import TeacherPageHeader from "../../components/PageHeader/TeacherPageHeader";
import { FileText, Search } from "lucide-react";
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
  const itemsPerPage = 4;

  const [requestsLoading, setRequestsLoading] = useState(true);
const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   dispatch(getTeacherRequests(authUser?._id));
  // }, [dispatch, authUser?._id]);
  useEffect(() => {
  if (!authUser?._id) return;

  const loadRequests = async () => {
    setRequestsLoading(true);

    try {
      await dispatch(getTeacherRequests(authUser._id)).unwrap();
    } catch (error) {
      console.error("Failed to load teacher requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  loadRequests();
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
  } catch (error) {
    console.error("Reject failed:", error);
  } finally {
    setLoading(id, "rejecting", false);
  }
};



  const handleDelete = async (request) => {
  const id = request._id;


  setLoading(id, "deleting", true);

  try {
    await dispatch(deleteRequest(id)).unwrap();


    await dispatch(getTeacherRequests(authUser?._id)).unwrap();
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error(error?.message || "Failed to delete request");
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

      const requestType = thesis ? "thesis" : project ? "project" : null;

      const matchesType = filterType === "all" || requestType === filterType;

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
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Pending Supervisor Requests header */}
         <TeacherPageHeader
  icon={FileText}
  label={null}
  title="Pending Supervisor Requests"
  description="Review and respond to student supervision requests"
/>


          {/* search & filter */}
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row gap-3">
<div className="relative flex-1">
  <div className="custom-input flex items-center gap-2">
    <Search className="h-4 w-4 shrink-0 text-[#17a2b8]" />

    <input
      type="search"
      placeholder="Search by student name or thesis/project title..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
    />
  </div>
</div>



              <div className="w-full md:w-52">
             <select
  className="custom-select"
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
                  className="custom-select"
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
        </section>

        {/* request cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        
  {/* Loading */}
  {requestsLoading ? (
    <div className="col-span-full w-full rounded-xl text-center py-14 px-4 shadow-sm">
      <div className="flex justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#17a2b8] animate-spin" />
      </div>
    </div>
  ) : (
    <>
          {currentRequests.map((req) => {
            const id = req._id;

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

            // let bgclass = "bg-white";
            // let statusMessage = "";

            // if (projectStatus === "approved" && !supervisorAssigned) {
            //   bgclass = "bg-blue-50 border-blue-300";
            //   statusMessage = "Supervisor already assigned";
            // } else if (projectStatus === "rejected") {
            //   bgclass = "bg-red-50 border-red-300";
            //   statusMessage = "Project rejected";
            // } else if (projectStatus === "pending") {
            //   bgclass = "bg-yellow-50 border-yellow-300";
            //   statusMessage = "Thesis/project pending";
            // }

            let bgclass = "bg-white border-slate-200";
let statusMessage = "";

if (req.status === "accepted") {
  bgclass = "bg-green-50 border-green-300";
  statusMessage = "Supervisor request accepted";
} else if (req.status === "rejected") {
  bgclass = "bg-red-50 border-red-300";
  statusMessage = "Supervisor request rejected";
} else if (req.status === "pending") {
  bgclass = "bg-yellow-50 border-yellow-300";
  statusMessage = "Waiting for your response";
}


            return (
              <div
                key={id}
                className={`w-full min-w-0 border rounded-xl shadow-sm transition-all ${bgclass}`}
              >
                <div className="flex flex-col h-full p-3 sm:p-4">
                  {/* ================= INFO ================= */}
                  <div className="flex-1 min-w-0">
                    {/* Student + Status */}
                    <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between gap-2 mb-3">
                      {/* Student Name */}
                      <h3 className="min-w-0 flex-1 text-base sm:text-lg font-semibold text-slate-800 break-words leading-6">
                        {req?.student?.name || "Unknown Student"}
                      </h3>

                      {/* Request Status */}
                      <span
                        className={`badge shrink-0 self-start whitespace-nowrap ${
                          req.status === "pending"
                            ? "badge-pending"
                            : req.status === "accepted"
                              ? "badge-approved"
                              : "badge-rejected"
                        }`}
                      >
                        {req.status
                          ? req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)
                          : "Unknown"}
                      </span>
                    </div>

                    {/* Email */}
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 break-all leading-5">
                      {req?.student?.email || "No email"}
                    </p>

                    {/* Thesis / Project */}
                    <h4 className="text-sm sm:text-base font-medium text-slate-700 mb-3 leading-6 break-words line-clamp-2">
                      {work?.title
                        ? `${workType}: ${work.title}`
                        : "No thesis/project title"}
                    </h4>

                    {/* Submitted */}
                    <p className="text-xs sm:text-sm text-slate-500 break-words">
                      <span className="font-medium">Submitted:</span>{" "}
                      {req?.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "_"}
                    </p>

                    {/* Status Message */}
                    {statusMessage && (
                      <p className="mt-3 text-xs sm:text-sm font-medium text-slate-700 leading-5 break-words">
                        {statusMessage}
                      </p>
                    )}
                  </div>

                  {/* action */}
                  <div className="mt-5 pt-3 border-t border-slate-200">
                    {req.status === "pending" ? (
                      <div className="grid grid-cols-3 gap-2">
                        {/* Accept */}
                        <button
                          className={`w-full px-2 sm:px-4 py-2 text-xs sm:text-sm
          rounded-lg font-medium transition-colors
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

                        {/* Reject */}
                        <button
                          className="w-full px-2 sm:px-4 py-2 text-xs sm:text-sm
          rounded-lg font-medium
          bg-orange-500 hover:bg-orange-600 text-white
          disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={lm.rejecting}
                          onClick={() => handleReject(req)}
                        >
                          {lm.rejecting ? "Rejecting..." : "Reject"}
                        </button>

                        {/* Delete */}
                        <button
                          className="w-full px-2 sm:px-4 py-2 text-xs sm:text-sm
          rounded-lg font-medium
          bg-red-700 hover:bg-red-800 text-white
          disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={lm.deleting}
                          onClick={() => handleDelete(req)}
                        >
                          {lm.deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          className="w-full sm:w-auto px-5 py-2 text-xs sm:text-sm
          rounded-lg font-medium
          bg-red-700 hover:bg-red-800 text-white
          disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={lm.deleting}
                          onClick={() => handleDelete(req)}
                        >
                          {lm.deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
{/* no request  */}
          {filteredRequests.length === 0 && (
            <div className="col-span-full w-full bg-white border border-slate-200 rounded-xl text-center py-10 px-4 sm:px-6 shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#17a2b8]/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#17a2b8]" />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                No requests found
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 break-words">
                No Supervisor requests match your filters.
              </p>
            </div>
              )}
         </>
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
