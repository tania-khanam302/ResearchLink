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
  const { project, supervisors = [], supervisor } = useSelector(
  (state) => state.student
);

  const safeSupervisors = Array.isArray(supervisors) ? supervisors : [];

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
          <div className="bg-white rounded-2xl shadow-md overflow-hidden ">
            <div className="bg-gradient-to-r from-[#17a2b8] via-[#1599ad] to-[#138496] px-6 py-5 mb-3">
              <h1 className="card-title text-2xl font-bold text-white mb-2">
                Project Details
              </h1>
            </div>

            <div className="space-y-6 px-6 py-6 mb-3">
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              )} */}


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

          
// <div className="bg-white rounded-2xl shadow-lg p-6">
//   {/* Header */}
//   <div className="border-b pb-4 mb-6">
//     <h2 className="text-2xl font-bold text-slate-800">
//       {project?.title || "Untitled Project"}
//     </h2>

//     <span
//       className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize
//       ${
//         project.status === "approved"
//           ? "bg-green-100 text-green-700"
//           : project.status === "pending"
//             ? "bg-yellow-100 text-yellow-700"
//             : project.status === "rejected"
//               ? "bg-red-100 text-red-700"
//               : "bg-gray-100 text-gray-700"
//       }`}
//     >
//       {project?.status}
//     </span>
//   </div>

//   {/* Info Grid */}
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//     <div className="bg-slate-50 rounded-xl p-4">
//       <p className="text-sm text-slate-500">Deadline</p>
//       <p className="text-lg font-semibold text-slate-800 mt-1">
//         {project?.deadline
//           ? formatDeadline(project.deadline)
//           : "No deadline"}
//       </p>
//     </div>

//     <div className="bg-slate-50 rounded-xl p-4">
//       <p className="text-sm text-slate-500">Created At</p>
//       <p className="text-lg font-semibold text-slate-800 mt-1">
//         {project?.createdAt
//           ? formatDeadline(project.createdAt)
//           : "Unknown"}
//       </p>
//     </div>
//   </div>

//   {/* Description */}
//   {project?.description && (
//     <div className="mt-6">
//       <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
//         Description
//       </h3>

//       <div className="bg-slate-50 rounded-xl p-4">
//         <p className="text-slate-700 leading-relaxed">
//           {project.description}
//         </p>
//       </div>
//     </div>
//   )}
// </div>
          


// <div className="bg-white rounded-2xl shadow-md overflow-hidden">
//   {/* Top Banner */}
//   <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
//     <h2 className="text-2xl font-bold">
//       {project?.title || "Untitled Project"}
//     </h2>

//     <div className="mt-3">
//       <span
//         className={`px-4 py-1 rounded-full text-sm font-medium capitalize
//         ${
//           project?.status === "approved"
//             ? "bg-green-500"
//             : project?.status === "pending"
//             ? "bg-yellow-500"
//             : project?.status === "rejected"
//             ? "bg-red-500"
//             : "bg-gray-500"
//         }`}
//       >
//         {project?.status || "Unknown"}
//       </span>
//     </div>
//   </div>

//   {/* Content */}
//   <div className="p-6">
//     <div className="space-y-6">
//       {/* Deadline */}
//       <div className="flex gap-4">
//         <div className="w-3 h-3 rounded-full bg-cyan-500 mt-2"></div>

//         <div>
//           <h4 className="text-sm uppercase text-gray-500 font-medium">
//             Deadline
//           </h4>
//           <p className="text-lg font-semibold text-gray-800">
//             {project?.deadline
//               ? formatDeadline(project.deadline)
//               : "No deadline set"}
//           </p>
//         </div>
//       </div>

//       {/* Created */}
//       <div className="flex gap-4">
//         <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>

//         <div>
//           <h4 className="text-sm uppercase text-gray-500 font-medium">
//             Created At
//           </h4>
//           <p className="text-lg font-semibold text-gray-800">
//             {project?.createdAt
//               ? formatDeadline(project.createdAt)
//               : "Unknown"}
//           </p>
//         </div>
//       </div>

//       {/* Description */}
//       {project?.description && (
//         <div className="flex gap-4">
//           <div className="w-3 h-3 rounded-full bg-purple-500 mt-2"></div>

//           <div className="flex-1">
//             <h4 className="text-sm uppercase text-gray-500 font-medium">
//               Description
//             </h4>

//             <div className="mt-2 bg-gray-50 border rounded-xl p-4">
//               <p className="text-gray-700 leading-relaxed">
//                 {project.description}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   </div>
// </div>



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
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#17a2b8] via-[#1599ad] to-[#138496] px-6 py-5">
              <h2 className="text-3xl font-bold text-white">
                Available Supervisors
              </h2>
              <p className="text-sm text-slate-100 mt-1">
                Explore faculty members and request supervision based on their
                expertise and research interests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-7 sh">
              {
                //supervisor &&
                // safeSupervisors.map((sup) => (
                  supervisors.map((sup) => (
                  <div
                    key={sup._id}
                    // className="border border-slate-200 rounded-lg p-4 hover:shadow-lg shadow-md transition-shadow"
                    className="group bg-white border border-slate-200 rounded-xl p-5 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Profile Section */}
                    {/* <div className="flex items-center space-x-3 mb-3">
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
                    </div> */}

                    {/* or */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#17a2b8] via-[#1599ad] to-[#138496] flex items-center justify-center text-white text-lg font-bold uppercase shadow-md">
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
                      {/* OR  */}
                      {/* <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                          Email
                        </p>
                        <p className="text-sm text-slate-700 font-medium break-all">
                          {sup.email || "-"}
                        </p>
                      </div> */}

                      {/* Expertise */}
                      <div>
                        {/* <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                          Expertise
                        </label>
                        <p className="text-sm font-medium text-slate-700">
                          {Array.isArray(sup?.expertise)
                            ? sup.expertise.join(",")
                            : sup?.expertise || "-"}
                        </p> */}
                        <div>
  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 block">
    Expertise
  </label>

  <div className="flex flex-wrap gap-2">
    {sup?.expertise ? (
      (Array.isArray(sup.expertise)
        ? sup.expertise
        : [sup.expertise]
      ).map((item, idx) => (
        <span
          key={idx}
          className="px-2.5 py-1 text-xs font-medium bg-[#17a2b8]/10 text-[#138496] rounded-full border border-[#17a2b8]/20"
        >
          {item}
        </span>
      ))
    ) : (
      <span className="text-sm text-slate-400">-</span>
    )}
  </div>
</div>
                      </div>

                      {/* or  */}
                      <div>
                        {/* <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Expertise
            </p> */}

                        {/* <div className="flex flex-wrap gap-2">
              {Array.isArray(sup?.expertise) &&
              sup.expertise.length > 0 ? (
                sup.expertise.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-medium bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">-</span>
              )}
            </div> */}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenRequest(sup)}
                      className="w-full mt-6 bg-gradient-to-r from-[#17a2b8] via-[#1599ad] to-[#138496] hover:from-[#138496] hover:to-[#11707f] text-white font-semibold py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-2"
                    >
                      <UserPlus size={18} />
                      <span>Request Supervisor</span>
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Request Modal*/}
        {showRequestModal && selectedSupervisor && (
          // <div className="modal-overlay  !mt-0 !pt-0">
          //   <div className="modal-content mt-0">
          //     <div className="p-6">
          //       <div className="flex items-center justify-between mb-4">
          //         <h3 className="text-lg font-semibold text-slate-800">
          //           Request Supervision{" "}
          //         </h3>

          //         <button
          //           className="text-slate-400 hover:text-slate-600"
          //           onClick={() => {
          //             setShowRequestModal(false);
          //             setSelectedSupervisor(null);
          //             setRequestMessage("");
          //           }}
          //         >
          //           <X className="w-5 h-5  text-[#17a2b8]" />
          //         </button>
          //       </div>

          //       <div className="space-y-4">
          //         <div className="p-4 bg-[#17a2b8]/5 rounded-md">
          //           <p className="text-sm text-slate-700">
          //             {selectedSupervisor?.name}{" "}
          //           </p>
          //         </div>

          //         <div>
          //           <label className="label">Message to Supervisor</label>
          //           <textarea
          //             className="input min-h-[120px] placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
          //             required
          //             value={requestMessage}
          //             onChange={(e) => setRequestMessage(e.target.value)}
          //             placeholder="Introduce yourself and explain why you'd like this professor to supervise your project. . ."
          //           />
          //         </div>

          //         <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          //           <button
          //             onClick={() => {
          //               setShowRequestModal(false);
          //               setSelectedSupervisor(null);
          //               setRequestMessage("");
          //             }}
          //             className="border-2 border-[#17a2b8] text-[#17a2b8] px-4 rounded-lg hover:bg-[#17a3b81c] transition-colors duration-200 font-medium"
          //           >
          //             Cancel
          //           </button>

          //           <button
          //             onClick={submitRequest}
          //             className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium rounded-md flex items-center space-x-2 mt-4 md:mt-0"
          //             disabled={!requestMessage.trim()}
          //           >
          //             Send Request
          //           </button>
          //         </div>
          //       </div>
          //     </div>
          //   </div>
          // </div>

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
                    // placeholder="Introduce yourself and explain why you'd like this professor to supervise your"
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
