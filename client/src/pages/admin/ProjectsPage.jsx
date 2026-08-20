import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AlertTriangle, CheckCircle2, FileDown, Folder, X } from 'lucide-react';

const ProjectsPage = () => {
  const [searchTearm, setsearchTearm] = useState("");
const [filterStatus, setFilterStatus] = useState("all");const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [isReportsOpen, setReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

const [showViewModal, setShowViewModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [currentProject, setCurrentProject] = useState(null);
const [editFrom, setEditFrom] = useState({
    title:"",
    description: "",
    deadline: "",
});

const [isSaving, setIsSaving] = useState(false);

   const dispatch = useDispatch();
     const {projects } = useSelector((state) => state.admin);

  const supervisor = useMemo(() => {
  const set = new Set(
    projects?.map((p) => p?.supervisor?.name).filter(Boolean)
  );
  return Array.from(set);
}, [projects]);


const filteredProjects = projects?.filter((project) => {
 const matchesSearch =
        (project.title || "").toLowerCase().includes(searchTearm.toLowerCase()) ||
        (project.student?.name || "")
          .toLowerCase()
          .includes(searchTearm.toLowerCase());

      const matchesStatus =
         filterStatus === "all" || project.status === filterStatus;
       const matchesSupervisor =
         filterSupervisor === "all" ||
         project.supervisor === filterSupervisor;      
       return matchesSearch && matchesStatus && matchesSupervisor;  
    });

    const files = useMemo(() => {
  return (projects || []).flatMap((p) =>
    (p.files || []).map((f) => ({
      projectId: p._id,
      fileId: f._id,
      originalName: f.originalName,
      uploadedAt: f.uploadedAt,
      projectTitle: p.title,
      studentName: p.student?.name,
    }))
  );
}, [projects]);


const filterfiles = files?.filter((file) =>
  (file.originalName || "")
    .toLowerCase()
    .includes(reportSearch.toLowerCase()) ||

  (file.projectTitle || "")
    .toLowerCase()
    .includes(reportSearch.toLowerCase()) ||

  (file.studentName || "")
    .toLowerCase()
    .includes(reportSearch.toLowerCase())
);

     const handleDownloadFile = async (file) => {
     //   const res = await dispatch
     //   DownloadFile({projectId: project._id,fileId: file._id})
     // ).then((res) => {
     //   const { blob } = res.playload;
     //   const url = window.URL.createObjectURL(new Blob([blob]));
     //   const link = document.createElement("a");
     //   link.href = url;
     //    link.setAttribute("download",file.name || "download");
     //   document.body.appenChild(link);
     //   link.click();
     //   link.paraNode.removeChild(link);
     //   window.URL.removeObjectURL(url);
    // });
     };

     
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

      const handleStatusChange = async (projectId, newStatus) => {
        if(newStatus === "approved"){
            await dispatch(approveProject(projectId));
        }   else if (newStatus === "rejected") {
            await dispatch(rejectProject(projectId));
        } 
     };



const projectStats = [
    {
      title: "Total Projects",
      value: projects.length,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: Folder,
    },
    {
      title: "Pending Review",
      value: projects.filter((p) => p.status === "pending").length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },
    {
      title: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: projects.filter((p) => p.status === "rejected").length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];





  return <>

       <div className="space-y-4">
        {/* header */}
        <div className="card">
            <div className="card-header flex flex-col mid:flex-row justify-between items-start mid:items-center">
               <h1 className="card-title">All Projects</h1>
               <p className="card-subtitle">
                View and manage all students projects across the platform.
                </p>
              </div>

              <button
                onClick={() => setIsReportsOpen(true)}
                className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
              >
                <FileDown className="w-5 h-5" />
                <span>Download Reports</span>
              </button>
        </div>
 
        {/* STATS */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {projectStats.map((item, index) => {
    const Icon = item.Icon;

    return (
      <div key={index} className="card">
        <div className="flex items-center">
          <div>
            <Icon className={`w-6 h-6 ${item.iconColor}`} />
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

{/* Search Projects */}
<div className="card">
  <div className="flex flex-col md:flex-row gap-4">

    {/* Search project */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Search Projects
      </label>

      <input
        type="text"
        className="input w-full"
        placeholder="Search by project title or student name..."
        value={searchTearm}
        onChange={(e) => setsearchTearm(e.target.value)}
      />
    </div>

    {/* Status Filter */}
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Filter by Status
      </label>

      <select
        className="input w-full"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">All Projects</option>
        <option value="pending">Pending Projects</option>
        <option value="approved">Approved Projects</option>
        <option value="completed">Completed Projects</option>
        <option value="rejected">Rejected Projects</option>
      </select>
    </div>

    {/* Supervisor Filter */}
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Filter Supervisor
      </label>

      <select
        className="input w-full"
        value={filterSupervisor}
        onChange={(e) => setFilterSupervisor(e.target.value)}
      >
        <option value="all">All Supervisors</option>

        {supervisor.map((supervisor) => {
          return (
            <option key={supervisor} value={supervisor}>
              {supervisor}
            </option>
          );
        })}
      </select>
    </div>

  </div>
</div>



{/* PROJECT TABLE */}
<div className="card">
  <div className="card-header">
    <h2 className="card-title">Projects Overview</h2>
  </div>

<div className="overflow-x-auto overflow-y-auto  max-h-\[500px] scrollbar-thin">
<table className="w-full min-w-\[900px] table-fixed">

      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Project Details
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Student
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Supervisor
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Deadline
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Status
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-slate-200">
        {filteredProjects.map((project) => (
          <tr
            key={project._id}
            className="hover:bg-slate-50"
          >
            {/* Project Details */}
            <td className="px-6 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {project.title}
                </div>

                <div className="text-sm text-slate-500 max-w-xs truncate">
                  {project.description}
                </div>

                <div className="text-xs text-slate-400">
                  Due:{" "}
                  {project.deadline
                    ? project.deadline.split("T")[0]
                    : "N/A"}
                </div>
              </div>
            </td>

            {/* Student */}
            <td className="px-6 py-3 whitespace-nowrap">
              <div className="text-sm font-medium text-slate-900">
                {project.student?.name || "N/A"}
              </div>

              <div className="text-xs text-slate-500">
                Last Updated:{" "}
                {project.updatedAt
                  ? new Date(project.updatedAt).toLocaleDateString()
                  : "N/A"}
              </div>
            </td>

            {/* Supervisor */}
            <td className="px-6 py-3 whitespace-nowrap">
              {project.supervisor?.name ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {project.supervisor.name}
                </span>
              ) : (
                <span className="text-sm text-slate-500">
                  Unassigned
                </span>
              )}
            </td>

            {/* Deadline */}
            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-700">
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : "N/A"}
            </td>

            {/* Status */}
            <td className="px-6 py-3 whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </td>

            {/* Actions */}
            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
              <div className="flex flex-wrap space-x-2">
                {/* View */}
                <button
                  onClick={async () => {
                    // const res = await dispatch(getProject(project._id));

                    // if (!getProject.fulfilled.match(res)) return;

                    // const details = res.payload?.project || res.payload;

                    // setCurrentProject(details);
                    // setShowViewModal(true);
                  }}
                  className="btn-primary mb-2"
                >
                  View
                </button>

                {/* Approve / Reject */}
                {project.status === "pending" && (
                  <>
                    <button
                      className="btn-secondary mb-2"
                      onClick={() =>
                        handleStatusChange(
                          project._id,
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
                          project._id,
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
  {filteredProjects.length === 0 && (
    <div className="text-center py-8 text-slate-500">
      No projects found matching the criteria.
    </div>
  )}
</div>



{/* VIEW MODAL */}
{showViewModal && currentProject && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Project Details
        </h3>

        <button
          onClick={() => setShowViewModal(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <div className="input bg-slate-50">
            {currentProject.title || "-"}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <div className="input bg-slate-50">
            {currentProject.description || "-"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="label">Student</label>
            <div className="input bg-slate-50">
              {currentProject?.student?.name || "-"}
            </div>
          </div>

          <div>
            <label className="label">Supervisor</label>
            <div className="input bg-slate-50">
              {currentProject?.supervisor?.name || "-"}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="label">Status</label>
            <div className="input bg-slate-50 capitalize">
              {currentProject?.status || "-"}
            </div>
          </div>

          <div>
            <label className="label">Deadline</label>
            <div className="input bg-slate-50">
              {currentProject?.deadline
                ? new Date(currentProject.deadline).toLocaleDateString()
                : "N/A"}
            </div>
          </div>

        </div>

        <div>
          <label className="label">Files</label>

          {(currentProject.files || []).length === 0 ? (
            <div className="text-slate-500 text-sm">
              No files uploaded.
            </div>
          ) : (
            <ul className="list-disc list-inside text-sm text-slate-700">
              {currentProject.files.map((file) => (
                <li key={file.\_id}>
                  {file.originalName || file.name || "Unnamed file"}
                </li>
              ))}
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
          All Files
        </h3>

        <button
          onClick={() => setReportsOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Search by files name, project title or student name"
          value={reportSearch}
          onChange={(e) => setReportSearch(e.target.value)}
        />
      </div>

      {filterfiles.length === 0 ? (
        <div className="text-slate-500">
          No files found.
        </div>
      ) : (
        <div className="space-y-2">
          {filterfiles.map((f) => {
            return (
              <div
                key={`${f.projectId}-${f.fileId}`}
                className="flex items-center justify-between p-3 bg-slate-50 rounded"
              >
                <div>
                  <div className="font-medium text-slate-800">
                    {f.originalName}
                  </div>

                  <div className="text-sm text-slate-500">
                    {f.projectTitle} - {f.studentName}
                  </div>
                </div>

                <button
                  className="btn-outline btn-small"
                  onClick={() => handleDownloadFile(f)}
                >
                  Download
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}




        </div>
  
  </>;
};

export default ProjectsPage;
