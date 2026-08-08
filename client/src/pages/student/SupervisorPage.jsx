import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisor,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";

import { UserPlus, X } from "lucide-react";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  // const { project, supervisors, supervisor } = useSelector(
  //   (state) => state.student,
  // );
  const {
    project,
    supervisors = [],
    supervisor,
  } = useSelector((state) => state.student);

  const safeSupervisors = Array.isArray(supervisors) ? supervisors : [];

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [requestedSupervisorId, setRequestedSupervisorId] = useState(null);

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisor());
  }, [dispatch]);

  const hasSupervisor = useMemo(
    () => !!(supervisor && supervisor._id),
    [supervisor],
  );

  const hasProject = useMemo(() => !!(project && project._id), [project]);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    const day = date.getDate();
    const j = day % 10,
      k = day % 100;
    const suffix =
      j === 1 && k !== 11
        ? "st"
        : j === 2 && k !== 12
          ? "nd"
          : j === 3 && k !== 13
            ? "rd"
            : "th";
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${suffix} ${month} ${year}`;
  };

  const handleOpenRequest = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

  // const submitRequest = () => {
  //   if (!selectedSupervisor) return;
  //   const message =
  //     requestMessage?.trim() ||
  //     `${authUser.name || "Student"} has request ${
  //       selectedSupervisor.name
  //     } to be their supervisor.`;
  //   dispatch(
  //     requestSupervisor({ teacherId: selectedSupervisor._id, message })
  //   ).then(res=>{
  //     if(res.type === "student/requestSupervisor/fulfilled"){
  //       setShowRequestModal(false);
  //     }
  //   });
  // };



const submitRequest = async () => {
  if (!selectedSupervisor) return;

  const message =
    requestMessage?.trim() ||
    `${authUser.name || "Student"} has requested ${
      selectedSupervisor.name
    } to be their supervisor.`;

  const res = await dispatch(
    requestSupervisor({
      teacherId: selectedSupervisor._id,
      message,
    })
  );

  if (requestSupervisor.fulfilled.match(res)) {
    // supervisor request pending
    setRequestedSupervisorId(selectedSupervisor._id);

    // modal close
    setShowRequestModal(false);
    setSelectedSupervisor(null);
    setRequestMessage("");
  }
};

  
  return (
    <>
      <div className="space-y-6">
        {/* Current Supervisor */}
        <div className="card shadow-lg rounded-md">
          <div className="card-header">
            <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
              Current Supervisor
            </h1>
            {hasSupervisor && (
              <span className="badge badge-approved">Assigned</span>
            )}
          </div>

          {/* Supervisor Details */}
          {hasSupervisor ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <img
                  src="/placeholder.jpg"
                  alt="Supervisor Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {supervisor?.name || "-"}
                    </h3>
                    <p className="text-lg text-slate-600">
                      {supervisor?.department || "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-slate-800 font-medium">
                        {supervisor?.email || "-"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Expertise
                      </label>
                      <p className="text-slate-800 font-medium">
                        {Array.isArray(supervisor?.expertise)
                          ? supervisor.expertise.join(",")
                          : supervisor?.expertise || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                Supervisor not assigned yet.
              </p>
            </div>
          )}
        </div>

        {/* Project Details */}
        {hasProject && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden ">
            <div className="bg-gradient-to-r from-[#17a2b8] via-[#1599ad] to-[#138496] px-6 py-5 mb-3">
              <h1 className="card-title text-3xl font-bold text-white mb-2">
                Project Details
              </h1>
            </div>

            <div className="space-y-6 px-6 py-6 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Project Title */}
                <div className="bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Project Title
                  </p>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">
                    {project?.title || "-"}
                  </h3>
                </div>

                {/* Status */}
                <div className="bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Status
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium capitalize
                        ${
                          project?.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : project?.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : project?.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {project?.status || "Invalid"}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Deadline
                  </p>

                  <h3 className="text-xl font-bold text-slate-800 mt-2">
                    {project?.deadline
                      ? formatDeadline(project.deadline)
                      : "No deadline set"}
                  </h3>
                </div>

                {/* Created */}
                <div className="bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Created
                  </p>

                  <h3 className="text-xl font-bold text-slate-800 mt-2">
                    {project?.createdAt
                      ? formatDeadline(project.createdAt)
                      : "Unknown"}
                  </h3>
                </div>
              </div>

              {/* Description */}
              {project?.description && (
                <div className="mt-5 bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8] mb-3">
                    Description
                  </p>

                  <p className="text-slate-700 leading-7">
                    {project.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* If not project */}
        {!hasProject && (
          <div className="card shadow-lg rounded-md">
            <div className="Card-header">
              <h2 className="card-title text-2xl font-bold text-slate-800 mb-2">
                Project Requirement
              </h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                You haven't submitted any project proposal yet, so you cannot
                request a supervisor.
              </p>
            </div>
          </div>
        )}

        {/* available supervisors */}
        {hasProject && !hasSupervisor && (
          <div className=" bg-slate-50 rounded-2xl">
            {/* header */}
            <div className=" mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-6">
              <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-600 px-8 py-6">
                <h2 className="text-3xl font-bold text-white">
                  Available Supervisors
                </h2>
                <p className="text-cyan-50 mt-2 text-sm">
                  Explore faculty members and request supervision based on their
                  expertise and research interests.
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {supervisors.map((sup) => (
                    <div
                      key={sup._id}
                      className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500"></div>

                      <div className="relative">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {sup?.name?.charAt(0) || "A"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-slate-800 truncate">
                              {sup.name || "Anonymous"}
                            </h3>
                            <p className="text-sm text-slate-500 truncate">
                              {sup.department || "No Department"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-5 border-t border-slate-100 pt-5">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                              Email
                            </p>
                            <p className="text-sm text-slate-700 break-all">
                              {sup.email || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                              Research Expertise
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {sup?.expertise ? (
                                (Array.isArray(sup.expertise)
                                  ? sup.expertise
                                  : [sup.expertise]
                                )
                                  .slice(0, 3)
                                  .map((item, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-50 to-cyan-50 text-indigo-700 border border-indigo-100 shadow-sm hover:scale-105 transition"
                                    >
                                      {item}
                                    </span>
                                  ))
                              ) : (
                                <span className="text-slate-400 text-sm">
                                  No expertise
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM */}
                        <div className="flex items-center justify-between mt-7 pt-4 border-t border-slate-100">
                          <span className="text-[13px] text-slate-400">
                            Click to request supervision
                          </span>

                          {/* <button
                            onClick={() => handleOpenRequest(sup)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all"
                          >
                            <UserPlus size={16} />
                            Request
                          </button> */}
                          {requestedSupervisorId === sup._id ? (
  <button
    disabled
    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-100 text-yellow-700 text-sm font-semibold cursor-not-allowed"
  >
    Request Pending
  </button>
) : (
  <button
    onClick={() => handleOpenRequest(sup)}
    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all"
  >
    <UserPlus size={16} />
    Request
  </button>
)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Modal*/}
        {showRequestModal && selectedSupervisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#17a2b8] via-[#1599ad] to-[#138496] px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Request Supervision
                  </h3>
                  <p className="text-sm text-slate-100 mt-1">
                    Send a professional supervision request to your preferred
                    faculty member.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedSupervisor(null);
                    setRequestMessage("");
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Selected Supervisor */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#17a2b8] to-[#138496] flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {selectedSupervisor?.name?.charAt(0) || "S"}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-800">
                      {selectedSupervisor?.name}
                    </h4>

                    <p className="text-sm text-slate-500">
                      {selectedSupervisor?.department ||
                        "Department Not Available"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {selectedSupervisor?.email}
                    </p>
                  </div>
                </div>

                {/* Message Box */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Message to Supervisor
                  </label>

                  <textarea
                    required
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Introduce yourself, describe your project interests, and explain why you'd like this professor to supervise your work..."
                    className="w-full min-h-[150px] rounded-xl border border-[#17a2b8]/30 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none outline-none focus:ring-0.5 focus:ring-[#17a2b8] focus:border-[#17a2b8] transition-all duration-200 resize-none"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedSupervisor(null);
                      setRequestMessage("");
                    }}
                    className="px-5 py-2.5 rounded-xl border border-[#17a2b8] text-[#138496] font-medium hover:bg-[#17a2b8]/10 transition duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitRequest}
                    disabled={!requestMessage.trim()}
                    className={`px-5 py-2.5 rounded-xl text-white font-semibold shadow-md transition duration-200
                      ${
                        requestMessage.trim()
                        ? "bg-gradient-to-r from-[#17a2b8] via-[#1599ad] to-[#138496] hover:from-[#138496] hover:to-[#11707f]"
                        : "bg-slate-300 cursor-not-allowed"
                      }`}
                  >
                    Send Request
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

export default SupervisorPage;
