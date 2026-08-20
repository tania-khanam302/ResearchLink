import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  ArrowDownToLineIcon,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  getFiles,
  downloadTeacherFiles,
} from "./../../store/slices/teacherSlice";

const TeacherFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const fileFromStore = useSelector((state) => state.teacher.files) || [];

  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  const deriveTypeFormatName = (name) => {
    if (!name) return "other";
    const parts = name.split(".");
    return (parts[parts.length - 1] || "").toLowerCase();
  };

  const normalizeFile = (f) => {
    const originalName = f.originalName || "";
    const type = deriveTypeFormatName(originalName) || f.fileType || "other";

    let category = "other";

    if (["pdf", "doc", "docx", "txt", "text"].includes(type)) {
      category = "report";
    } else if (["ppt", "pptx"].includes(type)) {
      category = "presentation";
    } else if (
      ["zip", "rar", "7z", "js", "ts", "html", "css", "json"].includes(type)
    ) {
      category = "code";
    } else if (["jpeg", "jpg", "png", "avif", "gif", "webp"].includes(type)) {
      category = "image";
    }

    return {
      id: f._id,
      name: originalName,
      type: type.toUpperCase(),
      size: f.size || "-",
      student: f.studentName || "_",
      uploadDate: f.uploadedAt || f.createdAt,
      category,
      projectId: f.projectId,
      fileId: f._id,
    };
  };

  const files = useMemo(
    () => (fileFromStore || []).map(normalizeFile),
    [fileFromStore],
  );

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;

      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;

      case "ppt":
      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;

      case "zip":
      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;

      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesType = filterType === "all" || file.category === filterType;

    const matchesSearch = file.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch && matchesType;
  });

  const handleDownloadFile = async (file) => {
    try {
      const { blob } = await dispatch(
        downloadTeacherFiles({
          projectId: file.projectId,
          fileId: file.fileId,
        }),
      ).unwrap();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const fileStats = [
    {
      label: "Total Files",
      count: files.length,
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-700",
    },
    {
      label: "Reports",
      count: files.filter((f) => f.category === "report").length,
      bg: "bg-green-50",
      text: "text-green-600",
      value: "text-green-700",
    },
    {
      label: "Presentations",
      count: files.filter((f) => f.category === "presentation").length,
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-700",
    },
    {
      label: "Code Files",
      count: files.filter((f) => f.category === "code").length,
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-700",
    },
    {
      label: "Images",
      count: files.filter((f) => f.category === "image").length,
      bg: "bg-pink-50",
      text: "text-pink-600",
      value: "text-pink-700",
    },
  ];
  const tableHeadData = [
    "File Name",
    "Student",
    "Type",
    "Upload Date",
    "Actions",
  ];

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h1 className="card-title">Student Files</h1>
              <p className="card-subtitle">
                Manage files shared with and received from students
              </p>
            </div>
          </div>

          {/* CONTROLER */}
          <div className="flex flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <select
                className="input w-56"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Files</option>
                <option value="report">Reports</option>
                <option value="presentation">Presentation</option>
                <option value="code">Code</option>
                <option value="image">Image</option>
              </select>

              <input
                type="text"
                className="input w-96"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* FILE STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            {fileStats.map((item, i) => {
              return (
                <div key={i} className={`${item.bg} p-4 rounded-lg`}>
                  <p className={`text-sm ${item.text}`}>{item.label}</p>
                  <p className={`text-2xl ${item.text} font-bold`}>
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILES DISPLAY */}
        {viewMode === "grid" ? (
          <div className="card bg-gray-50 pe-4 pl-4  px-5 py-5">
            <div
              className="
    max-h-[650px]
    overflow-y-auto
    overflow-x-hidden
    pr-2
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-slate-100
    [&::-webkit-scrollbar-thumb]:bg-[#17a2b8]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb:hover]:bg-[#138496]
  "
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-md hover:shadow-lg hover:border-[#17a2b8]/40 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* File Icon */}
                      <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                        {getFileIcon(file.type)}
                      </div>

                      {/* File Name */}
                      <h3
                        className="font-semibold text-slate-800 mb-2 truncate w-full"
                        title={file.name}
                      >
                        {file.name}
                      </h3>

                      {/* Student */}
                      <p
                        className="text-sm text-slate-600 truncate w-full mb-2"
                        title={file.student}
                      >
                        {file.student}
                      </p>

                      {/* File Info */}
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100">
                          {file.type}
                        </span>

                        {/* <span>•</span>
            <span>{file.size}</span> */}
                      </div>

                      {/* Upload Date */}
                      <p className="text-xs text-slate-400 mb-5">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>

                      {/* Download Button */}
                      <div className="w-full">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="rounded-lg text-white hover:bg-[#138496] bg-[#17a2b8] text-sm font-medium w-full flex items-center justify-center py-2.5 gap-2 transition-all duration-300"
                        >
                          <ArrowDownToLineIcon size={20} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-4">
            <div className="max-h-[500px] overflow-auto">
              <table className="min-w-[900px] w-full border-collapse">
                <thead className="bg-slate-50 text-slate-700 sticky">
                  <tr>
                    {tableHeadData.map((t, i) => (
                      <th
                        key={i}
                        className="sticky top-0 z-30 bg-white py-3 px-4 text-left font-semibold border-b border-slate-200 shadow-sm"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="border-t hover:bg-slate-50 transition-colors"
                    >
                      {/* file name  */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </td>

                      {/* student name  */}
                      <td className="py-3 px-4">{file.student}</td>

                      {/* file type  */}
                      <td className="py-3 px-4">{file.type}</td>

                      <td className="py-3 px-4">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>

                      {/* <td className="py-3 px-4">
                {file.size}
              </td> */}

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="btn-primary btn-small hover:bg-[#138496] bg-[#17a2b8]"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default TeacherFiles;
