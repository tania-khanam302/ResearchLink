import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  FileText,
  X,
} from "lucide-react";

const ThesisPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");

  const [isReportsOpen, setReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [currentThesis, setCurrentThesis] = useState(null);

  const [theses] = useState([
    {
      _id: "1",
      title: "AI Based Healthcare Management System",
      description:
        "A smart healthcare platform that uses artificial intelligence to improve patient management and medical services.",
      student: {
        name: "Samia Akter",
      },
      supervisor: {
        name: "Dr. Farzana Yasmin",
      },
      coSupervisor: {
        name: "Dr. Rahman",
      },
      researchArea: "Artificial Intelligence",
      deadline: "2026-09-20",
      status: "pending",
      updatedAt: "2026-08-15",
      files: [
        {
          _id: "f1",
          originalName: "Thesis Proposal.pdf",
          uploadedAt: "2026-08-15",
        },
      ],
    },
    {
      _id: "2",
      title: "Machine Learning Based Student Performance Prediction",
      description:
        "A machine learning system to predict student academic performance based on historical academic data.",
      student: {
        name: "Kaniz Fatema",
      },
      supervisor: {
        name: "Dr. Farzana Yasmin",
      },
      coSupervisor: null,
      researchArea: "Machine Learning",
      deadline: "2026-08-30",
      status: "approved",
      updatedAt: "2026-08-10",
      files: [
        {
          _id: "f2",
          originalName: "Research Proposal.pdf",
          uploadedAt: "2026-08-10",
        },
      ],
    },
    {
      _id: "3",
      title: "IoT Based Smart Agriculture System",
      description:
        "An IoT based smart agriculture solution for monitoring soil, temperature, humidity and crop conditions.",
      student: {
        name: "Sarin Sultana",
      },
      supervisor: {
        name: "Dr. Rahim Ahmed",
      },
      coSupervisor: null,
      researchArea: "Internet of Things",
      deadline: "2026-08-28",
      status: "rejected",
      updatedAt: "2026-08-09",
      files: [],
    },
  ]);

  // Supervisor list
  const supervisors = useMemo(() => {
    const set = new Set(
      theses
        ?.map((thesis) => thesis?.supervisor?.name)
        .filter(Boolean)
    );

    return Array.from(set);
  }, [theses]);

  // Filter thesis
  const filteredTheses = theses?.filter((thesis) => {
    const matchesSearch =
      (thesis.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (thesis.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      thesis.status === filterStatus;

    const matchesSupervisor =
      filterSupervisor === "all" ||
      thesis.supervisor?.name === filterSupervisor;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSupervisor
    );
  });

  // All thesis files
  const files = useMemo(() => {
    return (theses || []).flatMap((thesis) =>
      (thesis.files || []).map((file) => ({
        thesisId: thesis._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        thesisTitle: thesis.title,
        studentName: thesis.student?.name,
      }))
    );
  }, [theses]);

  // Filter files
  const filteredFiles = files.filter(
    (file) =>
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.thesisTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase())
  );

  // Status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";

      case "approved":
        return "bg-blue-100 text-blue-800";

      case "pending":
        return "bg-orange-100 text-orange-800";

      case "rejected":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Thesis stats
  const thesisStats = [
    {
      title: "Total Theses",
      value: theses.length,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: FileText,
    },
    {
      title: "Pending Review",
      value: theses.filter(
        (thesis) => thesis.status === "pending"
      ).length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },
    {
      title: "Completed",
      value: theses.filter(
        (thesis) => thesis.status === "completed"
      ).length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: theses.filter(
        (thesis) => thesis.status === "rejected"
      ).length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];

  // Approve / Reject
  const handleStatusChange = async (
    thesisId,
    newStatus
  ) => {
    console.log(
      "Thesis ID:",
      thesisId,
      "New Status:",
      newStatus
    );

    // পরে Redux action বসাবে
    //
    // if (newStatus === "approved") {
    //   await dispatch(approveThesis(thesisId));
    // }
    //
    // if (newStatus === "rejected") {
    //   await dispatch(rejectThesis(thesisId));
    // }
  };

  // Download file
  const handleDownloadFile = async (file) => {
    console.log("Download:", file);

    // পরে API connect করবে
  };

  return (
    <>
      <div className="space-y-4">

        {/* HEADER */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">
                All Theses
              </h1>

              <p className="card-subtitle">
                View and manage all students thesis
                across the platform.
              </p>
            </div>

            <div className="flex gap-2 mt-4 md:mt-0">

              {/* Add Thesis */}
              <button
                className="btn-primary flex items-center space-x-2"
                onClick={() =>
                  alert("Add Thesis form will open here")
                }
              >
                <FileText className="w-5 h-5" />
                <span>Add Thesis</span>
              </button>

              {/* Reports */}
              <button
                onClick={() =>
                  setReportsOpen(true)
                }
                className="btn-secondary flex items-center space-x-2"
              >
                <FileDown className="w-5 h-5" />
                <span>Download Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {thesisStats.map((item, index) => {
            const Icon = item.Icon;

            return (
              <div
                key={index}
                className="card"
              >
                <div className="flex items-center">

                  <div
                    className={`p-2 rounded-lg ${item.bg}`}
                  >
                    <Icon
                      className={`w-6 h-6 ${item.iconColor}`}
                    />
                  </div>

                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {item.title}
                    </p>

                    <p className="text-lg font-semibold text-slate-800">
                      {item.value}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}

        </div>

        {/* SEARCH & FILTER */}
        <div className="card">

          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Theses
              </label>

              <input
                type="text"
                className="input w-full"
                placeholder="Search by thesis title or student name..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

            </div>

            {/* Status */}
            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>

              <select
                className="input w-full"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
              >
                <option value="all">
                  All Theses
                </option>

                <option value="pending">
                  Pending Theses
                </option>

                <option value="approved">
                  Approved Theses
                </option>

                <option value="completed">
                  Completed Theses
                </option>

                <option value="rejected">
                  Rejected Theses
                </option>
              </select>

            </div>

            {/* Supervisor */}
            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter Supervisor
              </label>

              <select
                className="input w-full"
                value={filterSupervisor}
                onChange={(e) =>
                  setFilterSupervisor(e.target.value)
                }
              >
                <option value="all">
                  All Supervisors
                </option>

                {supervisors.map((supervisor) => (
                  <option
                    key={supervisor}
                    value={supervisor}
                  >
                    {supervisor}
                  </option>
                ))}
              </select>

            </div>

          </div>

        </div>

        {/* THESIS TABLE */}
        <div className="card">

          <div className="card-header">
            <h2 className="card-title">
              Thesis Overview
            </h2>
          </div>

<div className="overflow-x-auto overflow-y-auto  max-h-[500px] scrollbar-thin">
<table className="w-full min-w-[900px] table-fixed">


              <thead className="bg-slate-50">

                <tr>

                  <th className="px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-[25%]">
                    Thesis Details
                  </th>

                  <th className="px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student
                  </th>

                  <th className="px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supervisor
                  </th>

                  <th className="px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Deadline
                  </th>

                  <th className="px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="bg-white divide-y divide-slate-200">

                {filteredTheses.map((thesis) => (

                  <tr
                    key={thesis._id}
                    className="hover:bg-slate-50"
                  >

                    {/* Thesis Details */}
                    <td className="px-2 py-3 w-[25%]">

                      <div>

                        <div className="text-sm font-medium text-slate-900">
                          {thesis.title}
                        </div>

                        <div className="text-sm text-slate-500 max-w-xs truncate">
                          {thesis.description}
                        </div>

                        <div className="text-xs text-purple-600 mt-1">
                          Research Area:{" "}
                          {thesis.researchArea || "N/A"}
                        </div>

                      </div>

                    </td>

                    {/* Student */}
                    <td className="px-2 py-3 flex flex-wrap whitespace-nowrap">

                      <div className="text-sm font-medium text-slate-900">
                        {thesis.student?.name ||
                          "N/A"}
                      </div>

                      <div className="text-xs text-slate-500">
                        Last Updated:{" "}
                        {thesis.updatedAt
                          ? new Date(
                              thesis.updatedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </div>

                    </td>

                    {/* Supervisor */}
                    <td className="px-2 py-3  whitespace-nowrap">

                      {thesis.supervisor?.name ? (

                        <div>

                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {thesis.supervisor.name}
                          </span>

                          {thesis.coSupervisor?.name && (
                            <div className="text-xs text-slate-500 mt-1">
                              Co:{" "}
                              {thesis.coSupervisor.name}
                            </div>
                          )}

                        </div>

                      ) : (

                        <span className="text-sm text-slate-500">
                          Unassigned
                        </span>

                      )}

                    </td>

                    {/* Deadline */}
                    <td className="px-2 py-3  whitespace-nowrap text-sm text-slate-700">

                      {thesis.deadline
                        ? new Date(
                            thesis.deadline
                          ).toLocaleDateString()
                        : "N/A"}

                    </td>

                    {/* Status */}
                    <td className="px-2 py-3 w-[30px]  whitespace-nowrap">

                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          thesis.status
                        )}`}
                      >
                        {thesis.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-2 py-3  whitespace-nowrap text-sm font-medium ">

                      <div className="flex flex-wrap space-x-2">

                        {/* View */}
                        <button
                          onClick={() => {
                            setCurrentThesis(
                              thesis
                            );
                            setShowViewModal(true);
                          }}
                          className="btn-primary mb-2"
                        >
                          View
                        </button>

                        {/* Approve / Reject */}
                        {thesis.status ===
                          "pending" && (
                          <>
                            <button
                              className="btn-secondary mb-2"
                              onClick={() =>
                                handleStatusChange(
                                  thesis._id,
                                  "approved"
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="btn-danger mb-2"
                              onClick={() =>
                                handleStatusChange(
                                  thesis._id,
                                  "rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Empty State */}
          {filteredTheses.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No theses found matching the criteria.
            </div>
          )}

        </div>

        {/* VIEW THESIS MODAL */}
        {showViewModal &&
          currentThesis && (

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">

                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">

                  <h3 className="text-lg font-semibold text-slate-900">
                    Thesis Details
                  </h3>

                  <button
                    onClick={() =>
                      setShowViewModal(false)
                    }
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>

                </div>

                <div className="space-y-4">

                  {/* Title */}
                  <div>
                    <label className="label">
                      Thesis Title
                    </label>

                    <div className="input bg-slate-50">
                      {currentThesis.title ||
                        "-"}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="label">
                      Abstract / Description
                    </label>

                    <div className="input bg-slate-50 min-h-[100px]">
                      {currentThesis.description ||
                        "-"}
                    </div>
                  </div>

                  {/* Student / Supervisor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="label">
                        Student
                      </label>

                      <div className="input bg-slate-50">
                        {currentThesis
                          ?.student?.name ||
                          "-"}
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        Supervisor
                      </label>

                      <div className="input bg-slate-50">
                        {currentThesis
                          ?.supervisor?.name ||
                          "-"}
                      </div>
                    </div>

                  </div>

                  {/* Co Supervisor / Research Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="label">
                        Co-Supervisor
                      </label>

                      <div className="input bg-slate-50">
                        {currentThesis
                          ?.coSupervisor
                          ?.name || "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        Research Area
                      </label>

                      <div className="input bg-slate-50">
                        {currentThesis
                          ?.researchArea ||
                          "N/A"}
                      </div>
                    </div>

                  </div>

                  {/* Status / Deadline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="label">
                        Status
                      </label>

                      <div className="input bg-slate-50 capitalize">
                        {currentThesis.status ||
                          "-"}
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        Deadline
                      </label>

                      <div className="input bg-slate-50">
                        {currentThesis.deadline
                          ? new Date(
                              currentThesis.deadline
                            ).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>

                  </div>

                  {/* Files */}
                  <div>

                    <label className="label">
                      Thesis Files
                    </label>

                    {(currentThesis.files || [])
                      .length === 0 ? (

                      <div className="text-slate-500 text-sm">
                        No files uploaded.
                      </div>

                    ) : (

                      <ul className="space-y-2">

                        {currentThesis.files.map(
                          (file) => (

                            <li
                              key={file._id}
                              className="flex items-center justify-between bg-slate-50 p-3 rounded"
                            >

                              <span className="text-sm text-slate-700">
                                {file.originalName ||
                                  "Unnamed file"}
                              </span>

                              <button
                                className="btn-outline btn-small"
                                onClick={() =>
                                  handleDownloadFile(
                                    file
                                  )
                                }
                              >
                                Download
                              </button>

                            </li>

                          )
                        )}

                      </ul>

                    )}

                  </div>

                </div>

              </div>

            </div>

          )}

        {/* REPORTS MODAL */}
        {isReportsOpen && (

          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">

              <div className="flex justify-between items-center mb-4">

                <h3 className="text-lg font-semibold text-slate-900">
                  All Thesis Files
                </h3>

                <button
                  onClick={() =>
                    setReportsOpen(false)
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>

              </div>

              {/* Search Files */}
              <div className="mb-4">

                <input
                  type="text"
                  className="input w-full"
                  placeholder="Search by file name, thesis title or student name..."
                  value={reportSearch}
                  onChange={(e) =>
                    setReportSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Files */}
              {filteredFiles.length === 0 ? (

                <div className="text-slate-500">
                  No files found.
                </div>

              ) : (

                <div className="space-y-2">

                  {filteredFiles.map((file) => (

                    <div
                      key={`${file.thesisId}-${file.fileId}`}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded"
                    >

                      <div>

                        <div className="font-medium text-slate-800">
                          {file.originalName}
                        </div>

                        <div className="text-sm text-slate-500">
                          {file.thesisTitle} -{" "}
                          {file.studentName}
                        </div>

                      </div>

                      <button
                        className="btn-outline btn-small"
                        onClick={() =>
                          handleDownloadFile(
                            file
                          )
                        }
                      >
                        Download
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        )}

      </div>
    </>
  );
};

export default ThesisPage;
