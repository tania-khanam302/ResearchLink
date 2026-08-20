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

  
  </>;
};

export default ProjectsPage;
