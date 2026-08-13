import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileText } from 'lucide-react';
import {
  getTeacherRequests,
  acceptRequest,
  rejectRequest,
} from "../../store/slices/teacherSlice";

const PendingRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherRequests(authUser?._id));
  }, [dispatch, authUser?._id]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  };
  const handleAccept = async (request) => {
    const id = request._id;
    setLoading(id, "accept", true);
    try {
      await dispatch(acceptRequest(id)).unwrap();
    } finally {
      setLoading(id, "accept", false);
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

  const filteredRequests =
    list.filter((request) => {
      //   console.log("request:", project);
      // const matchesSearch =
      //   (request?.student?.name || "")
      //     .toLowerCase()
      //     .includes(searchTerm.toLowerCase()) ||
      //   (request?.project?.title || "")
      //     .toLowerCase()
      //     .includes(searchTerm.toLowerCase()) ||
      //   request?.latestproject?.title ||
      //   "";

      const matchesSearch =
  (request?.student?.name || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase()) ||
  (request?.project?.title || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase()) ||
  (request?.latestProject?.title || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || request.status === filterStatus;
      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <>
      <div className="space-y-6">
        {/* heading  */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Pending Supervisor Requests</h1>
            <p className="card-subtitle">
              Review and respond to student supervision requests
            </p>
          </div>
          {/* search filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 mt-2">
            <div className="flex-1">
              {/* <label className="block mb-2 card-title text-md font-semibold text-[#17a2b8]">
              Search Student Name or Project Title
            </label> */}
              <input
                type="text"
                placeholder="Search by student name or project title..."
                className="input-field outline-none p-1 border border-slate-300 w-[320px] "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48">
              {/* <label className="block mb-2 text-md font-semibold text-[#17a2b8]">
              Filter All Requests
            </label> */}
              <select
                className="input-field w-full outline-none p-1 border border-slate-300"
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

        {/* request */}
        <div className="space-y-4">
          {
            filteredRequests.map(req=>{
            const id = req._id;
            const project = req.latestProject;
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
              statusMessage = "Project pending";
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
                    <h4 className="font-medium text-slate-700 mb-2">
                      {project?.title || "No project title"}
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

                  {/* ACTIONS */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-3 mt-3">
                      {/* <button
                       
                        className="px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white"
                       disabled={lm.rejecting || !canAccept}
                        onClick={() => handleReject(req)}
                      >
                        {lm.rejecting ? "Rejecting" : "Reject"}
                      </button> */}
                      <button
  className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors
    duration-200 ${
      canAccept
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
  disabled={lm.accepting || !canAccept}
  onClick={() => handleAccept(req)}
>
  {lm.accepting ? "Accepting" : "Accept"}
</button>

<button
  className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors
    duration-200 disabled:opacity-60 bg-red-600 hover:bg-red-700 text-white  disabled:cursor-not-allowed `}
  disabled={lm.rejecting}
  onClick={() => handleReject(req)}
>
  {lm.rejecting ? "Rejecting" : "Reject"}
</button>
                    </div>
                  )}
                </div>
              </div>
            );
            })
          }
             {/* not request */}
         {filteredRequests.length === 0 && (
            <div className="card text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No requests found
              </h3>{" "}
              <p className="text-slate">
                No Supervisor requests match your filters.
              </p>
            </div>
          )} 
        </div>
      </div>
    </>
  );
};

export default PendingRequests;
