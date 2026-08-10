import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  downloadFiles,
  fetchProject,
  uploadFiles,
} from "../../store/slices/studentSlice";
import { Archive, File, FileText, FileCode, FilePlus } from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();

  const { project, files } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch]);

  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  const handleUpload = (e) => {
    const activeProject = project;
    if (selectedFiles.length === 0) return;
    dispatch(uploadFiles({ projectId: project?._id, files: selectedFiles }));
    setSelectedFiles([]);
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  // const getFileIcon = (fileName) => {
  //   const extension = fileName.split(".").pop().toLowerCase();
  //   const Icon = ({ className }) => <File className={className} />;
  //   const color =
  //     extension === "pdf"
  //       ? "text-red-500"
  //       : ["doc", "docx"].includes(extension)
  //         ? "text-blue-500"
  //         : ["ppt", "pptx"].includes(extension)
  //           ? "text-orange-500"
  //           : "text-slate-500";
  //   return <Icon className={`w-8 h-8 ${color}`} />;
  // };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    let Icon = File;

    if (extension === "pdf") {
      Icon = FileText;
    } else if (["doc", "docx"].includes(extension)) {
      Icon = FileText;
    } else if (["ppt", "pptx"].includes(extension)) {
      Icon = Archive;
    } else if (["zip", "rar", "tar", "gz"].includes(extension)) {
      Icon = FileCode;
    }

    const color =
      extension === "pdf"
        ? "text-red-500"
        : ["doc", "docx"].includes(extension)
          ? "text-blue-500"
          : ["ppt", "pptx"].includes(extension)
            ? "text-orange-500"
            : "text-slate-500";

    return <Icon className={`w-8 h-8 ${color}`} />;
  };

  // const handleDownloadFile = async (file) => {
  //   const res = await dispatch(
  //     downloadFiles({ projectId: project._id, fileId: file._id }),
  //   ).then((res) => {
  //     const { blob } = res.payload;
  //     const url = window.URL.createObjectURL(new Blob([blob]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", file.name || "download");
  //     document.body.appendChild(link);
  //     link.click();
  //     link.parentNode.removeChild(link);
  //     window.URL.revokeObjectURL(url);
  //   });
  // };

  const handleDownloadFile = async (file) => {
  try {
    const result = await dispatch(
      downloadFiles({
        projectId: project._id,
        fileId: file._id,
      })
    ).unwrap();

    const { blob } = result;

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = file.originalName || "download";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};
  return (
    <>

    </>
  );
};

export default UploadFiles;
