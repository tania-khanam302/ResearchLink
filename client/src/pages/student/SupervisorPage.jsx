import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisor,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";

import { X } from "lucide-react";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisors, supervisor } = useSelector(
    (state) => state.student,
  );

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

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

  const submitRequest = () => {
    if (!selectedSupervisor) return;
    const message =
      requestMessage?.trim() ||
      `${authUser.name || "Student"} has request ${selectedSupervisor.name} to be their supervisor.`;
    dispatch(requestSupervisor({ teacherId: selectedSupervisor._id, message }));
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

        {/* Project Details -Only show if project exit */}
        {hasProject && (
          <div className="card shadow-lg rounded-md">
            <div className="card-header">
              <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
                Project Details
              </h1>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#17a2b8] uppercase tracking-wide">
                      Project Title
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project.title || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#17a2b8] uppercase tracking-wide">
                      status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full font-medium
                 capitalize text-sm ${
                   project.status === "approved"
                     ? "bg-green-100 text-green-800"
                     : project.status === "pending"
                       ? "bg-yellow-100 text-yellow-800"
                       : project.status === "rejected"
                         ? "bg-red-100 text-red-800"
                         : "bg-gray-100 text-gray-800"
                 }`}
                      >
                        {project?.status || "Invalid"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Deadline
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.deadline
                        ? formatDeadline(project.deadline)
                        : "No deadline set"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Created
                    </label>
                    <p
                      className="text-lg font-semibold text-slate-800 mt-1
                    "
                    >
                      {project.createdAt
                        ? formatDeadline(project.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {project?.description && (
                <div>
                  <label className="text-sm-medium text-slate-500 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-slate-700 mt-2 leading-relaxed">
                    {project?.description || "-"}
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

        {/* available supervisors- only when project exists and no supervisor assigned */}
        {hasProject && !hasSupervisor && (
          <div className="card shadow-lg rounded-md">
            <div className="Card-header">
              <h2 className="card-title text-2xl font-bold text-slate-800 mb-2">
                Available Supervisors
              </h2>
              <p className="card-subtitle">
                Explore faculty members and request supervision based on their
                expertise and research interests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 sh">
              {supervisors.map((sup) => (
                <div
                  key={sup._id}
                  className="group bg-white border border-slate-200 rounded-xl p-5 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-sky-700 flex items-center justify-center text-white text-lg font-bold uppercase shadow-md">
                      {sup?.name?.charAt(0) || "A"}
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        {sup.name || "Anonymous"}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {sup.department || "Department Not Available"}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {/* E-mail */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                        E-mail
                      </label>
                      <p className="text-sm font-medium text-slate-700">
                        {sup.email || "-"}
                      </p>
                    </div>

                    {/* Expertise */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                        Expertise
                      </label>
                      <p className="text-sm font-medium text-slate-700">
                        {Array.isArray(sup?.expertise)
                          ? sup.expertise.join(",")
                          : sup?.expertise || "-"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenRequest(sup)}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Request Supervisor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Modal*/}
        {showRequestModal && selectedSupervisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-600 to-sky-700 px-6 py-5 flex items-center justify-between">
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-sky-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
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
                    className="w-full min-h-[150px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-none"
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
                    className="px-5 py-2.5 rounded-xl border border-cyan-600 text-cyan-700 font-medium hover:bg-cyan-50 transition duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitRequest}
                    disabled={!requestMessage.trim()}
                    className={`px-5 py-2.5 rounded-xl text-white font-semibold shadow-md transition duration-200
            ${
              requestMessage.trim()
                ? "bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-700 hover:to-sky-800"
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
