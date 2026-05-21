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
                    <p className="text-lg font-semibold text-slate-800 mt-1
                    ">
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
                Browse and request supervision from available faculty members.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 sh">
              {
                //supervisor &&
                supervisors.map((sup) => (
                  <div
                    key={sup._id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-lg shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-auto  bg-slate-300 mb-3">
                        <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-600">
                            {sup.name || "Anonymous"}
                          </span>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">
                            {sup.name}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {sup.department}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500">
                          E-mail
                        </label>
                        <p className="text-sm font-medium text-slate-700">
                          {sup.email || "-"}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500">
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
                      className="btn-primary w-full bg-[#17a2b8] hover:bg-[#138496] text-white text-center font-medium p-0 h-9 rounded-md items-center space-x-2 mt-4 md:mt-0"
                    >
                      Request Supervisor
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Request Modal*/}
        {showRequestModal && selectedSupervisor && (
          <div className="modal-overlay  !mt-0 !pt-0">
            <div className="modal-content mt-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Request Supervision{" "}
                  </h3>

                  <button
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedSupervisor(null);
                      setRequestMessage("");
                    }}
                  >
                    <X className="w-5 h-5  text-[#17a2b8]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#17a2b8]/5 rounded-md">
                    <p className="text-sm text-slate-700">
                      {selectedSupervisor?.name}{" "}
                    </p>
                  </div>

                  <div>
                    <label className="label">Message to Supervisor</label>
                    <textarea
                      className="input min-h-[120px] placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
                      required
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you'd like this professor to supervise your project. . ."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowRequestModal(false);
                        setSelectedSupervisor(null);
                        setRequestMessage("");
                      }}
                      className="border-2 border-[#17a2b8] text-[#17a2b8] px-4 rounded-lg hover:bg-[#17a3b81c] transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={submitRequest}
                      className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium rounded-md flex items-center space-x-2 mt-4 md:mt-0"
                      disabled={!requestMessage.trim()}
                    >
                      Send Request
                    </button>
                  </div>
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
