import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisor,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";

import {
  AlertCircle,
  FileText,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";



const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);

  const {
    project,
    thesis,
    proposal,
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

  const work = thesis || project || proposal || null;
  const workType = thesis
    ? "Thesis"
    : proposal?.type?.toLowerCase() === "thesis"
      ? "Thesis"
      : "Project";
  const hasWork = !!work?._id;

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
      }),
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
        {/* Current Supervisor section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* current supervisor header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 sm:px-8 py-7">
            <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Current Supervisor
                  </h1>
                  {hasSupervisor && (
                    <span className="badge badge-approved">Assigned</span>
                  )}
                </div>
                <p className="mt-1.5 text-sm sm:text-base text-white/80">
                  View your currently assigned supervisor and supervision
                  details.
                </p>
              </div>
            </div>
          </div>

          {/* Supervisor Details */}
          {hasSupervisor ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-3 p-[30px]">
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
            <div className="px-6 py-10 sm:px-8">
              <div className="mx-auto max-w-xl text-center">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#17a2b8]/20 bg-[#e8f7fa]">
                  <UserCheck className="h-6  w-6 text-[#138496]" />
                </div>

                {/* Status */}
                <span className="mb-3 inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-600 ring-1 ring-inset ring-amber-200">
                  Not Assigned
                </span>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800">
                  Supervisor Not Assigned Yet
                </h3>

                {/* Description */}
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                  A supervisor has not been assigned to your thesis or project
                  yet. Please wait until a supervisor is assigned.
                </p>

                {/* Bottom line */}
                <div className="mx-auto mt-6 h-px w-20 bg-[#17a2b8]/30" />
              </div>
            </div>
          )}
        </div>

        {/* Project Details section*/}
        {hasWork && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Thesis and Project Details  Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 sm:px-8 py-7">
              <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-white/5" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {workType === "Thesis"
                      ? "Thesis Details"
                      : "Project Details"}
                  </h1>
                  <p className="mt-1.5 text-sm sm:text-base text-white/80">
                    View and manage your{" "}
                    {workType === "Thesis" ? "thesis" : "project"} information.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Project Title */}
                <div className="bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    {workType === "Thesis" ? "Thesis Title" : "Project Title"}
                  </p>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">
                    {work?.title || "-"}
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
                          // project?.status === "approved"
                          work?.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : work?.status === "pending"
                              ? // : project?.status === "pending"
                                "bg-yellow-100 text-yellow-700"
                              : work?.status === "rejected"
                                ? // : project?.status === "rejected"
                                  "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }
                        
                        `}
                    >
                      {work?.status || "Invalid"}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Deadline
                  </p>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">
                    {work?.deadline
                      ? formatDeadline(work.deadline)
                      : "No deadline set"}
                  </h3>
                </div>

                {/* Created */}
                <div className="bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8]">
                    Created
                  </p>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">
                    {work?.createdAt
                      ? formatDeadline(work.createdAt)
                      : "Unknown"}
                  </h3>
                </div>
              </div>

              {/* Description */}
              {work?.description && (
                <div className="mt-5 bg-slate-50 border rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#17a2b8] mb-3">
                    Description
                  </p>
                  <p className="text-slate-700 leading-7">{work.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* If not project */}
        {!hasWork && (
          <div className="overflow-hidden rounded-md bg-white shadow-lg">
            {/* Project Requirement Header */}
            <div className="relative overflow-hidden bg-[#d9f3f7] px-6 py-7 sm:px-8">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#17a2b8]/15" />
              <div className="absolute -bottom-20 right-20 h-32 w-32 rounded-full bg-[#138496]/10" />
              <div className="absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-[#17a2b8]/10" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#17a2b8]/25 bg-white shadow-sm">
                  <FileText className="h-7 w-7 text-[#087f8c]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#087f8c] sm:text-3xl">
                    Project Requirement
                  </h1>
                  <p className="mt-1.5 text-sm font-medium text-[#176b75] sm:text-base">
                    Submit your project proposal before requesting a supervisor.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Proposal Required
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      You haven't submitted any proposal yet, so you cannot
                      request a supervisor. Please submit your project proposal
                      first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* available supervisors */}
        {hasWork && !hasSupervisor && (
          <div className=" bg-slate-50 rounded-2xl">
            <div className=" mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-6">
              {/* Available Supervisors header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 sm:px-8 py-7">
                <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Available Supervisors
                    </h1>
                    <p className="mt-1.5 text-sm sm:text-base text-white/80">
                      Explore faculty members and request a supervisor based on
                      their expertise and research interests.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {supervisors.map((sup) => (
                    <div
                      key={sup._id}
                      className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#138496] to-[#17a2b8]"></div>

                      <div className="relative">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#138496] to-[#17a2b8] flex items-center justify-center text-white font-bold text-lg shadow-md">
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
                                      className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-50 to-cyan-50 text-[#17a2b8] border border-indigo-100 shadow-sm hover:scale-105 transition"
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
                            Click to request Supervisor
                          </span>

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
                              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#138496] to-[#17a2b8] text-white text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all"
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
              {/* Request Supervisor Header */}
              <div className="bg-gradient-to-r from-[#17a2b8] via-[#1599ad] to-[#138496] px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Request Supervisor
                  </h3>
                  <p className="text-sm text-slate-100 mt-1">
                    Send a professional Supervisor request to your preferred
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
