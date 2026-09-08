import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLineIcon,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  List,
  Trash2,
  Image,
} from "lucide-react";
import {
  getFiles,
  downloadTeacherFiles,
  deleteTeacherFile,
} from "./../../store/slices/teacherSlice";

const TeacherFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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

    // return {
    //   id: f._id,
    //   name: originalName,
    //   type: type.toUpperCase(),
    //   size: f.size || "-",
    //   student: f.studentName || "_",
    //   uploadDate: f.uploadedAt || f.createdAt,
    //   category,
    //   projectId: f.projectId,
    //   fileId: f._id,
    // };

    return {
      id: f._id,
      name: originalName,
      type: type.toUpperCase(),
      size: f.size || "-",
      student: f.studentName || "_",
      uploadDate: f.uploadedAt || f.createdAt,
      category,

      // Important
      workId: f.workId,
      fileId: f._id,
      workType: f.workType,
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
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "avif":
        return <Image className="w-8 h-8 text-emerald-500" />;

      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesType = filterType === "all" || file.category === filterType;

    const matchesWorkType =
      workTypeFilter === "all" || file.workType === workTypeFilter;

    const matchesSearch = file.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch && matchesType && matchesWorkType;
  });

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentFiles = filteredFiles.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Search or filter change return to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, workTypeFilter]);

  // const handleDownloadFile = async (file) => {
  //   try {
  //     const { blob } = await dispatch(
  //       downloadTeacherFiles({
  //         projectId: file.projectId,
  //         fileId: file.fileId,
  //       }),
  //     ).unwrap();

  //     const url = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = file.name || "download";

  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();

  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //   }
  // };

  const handleDownloadFile = async (file) => {
    try {
      const { blob } = await dispatch(
        downloadTeacherFiles({
          workId: file.workId,
          fileId: file.fileId,
          workType: file.workType,
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
  const handleDeleteFile = async (file) => {
    try {
      await dispatch(
        deleteTeacherFile({
          workId: file.workId,
          fileId: file.fileId,
          workType: file.workType,
        }),
      ).unwrap();

      await dispatch(getFiles()).unwrap();
    } catch (error) {
      console.error("Delete failed:", error);
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
        {/* header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="relative px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white overflow-hidden">
            <div className="absolute -right-10 -top-16 w-36 h-36 rounded-full bg-[#17a2b8]/5" />
            <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-[#17a2b8]/5" />

            <div className="relative flex items-center gap-4">
              <div
                className="w-11 h-11 shrink-0 rounded-lg
                   bg-[#17a2b8]/10
                   border border-[#17a2b8]/20
                   flex items-center justify-center"
              >
                <FileText className="w-5 h-5 text-[#138496]" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                  Student Files
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage files shared with and received from students
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Project / Thesis Filter */}
                <select
                  className="w-full sm:w-44 h-10 px-3 text-sm text-slate-700
      bg-white border border-slate-300 rounded-lg
      outline-none cursor-pointer
      focus:border-[#17a2b8]
      focus:ring-2 focus:ring-[#17a2b8]/10
      transition-all"
                  value={workTypeFilter}
                  onChange={(e) => setWorkTypeFilter(e.target.value)}
                >
                  <option value="all">All Work</option>
                  <option value="project">Projects</option>
                  <option value="thesis">Thesis</option>
                </select>

                {/* File Type Filter */}
                <select
                  className="w-full sm:w-52 h-10 px-3 text-sm text-slate-700
      bg-white border border-slate-300 rounded-lg
      outline-none cursor-pointer
      focus:border-[#17a2b8]
      focus:ring-2 focus:ring-[#17a2b8]/10
      transition-all"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Files</option>
                  <option value="report">Reports</option>
                  <option value="presentation">Presentation</option>
                  <option value="code">Code</option>
                  <option value="image">Image</option>
                </select>

                {/* Search */}
                <input
                  type="text"
                  className="w-full sm:w-80 h-10 px-3 text-sm text-slate-700
      bg-white border border-slate-300 rounded-lg
      outline-none placeholder:text-slate-400
      focus:border-[#17a2b8]
      focus:ring-2 focus:ring-[#17a2b8]/10
      transition-all"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-[#138496] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white text-[#138496] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* files section */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {fileStats.map((item, i) => {
                return (
                  <div
                    key={i}
                    className={`${item.bg} p-4 rounded-lg border border-white/60`}
                  >
                    <p className={`text-sm ${item.text}`}>{item.label}</p>

                    <p className={`text-2xl ${item.text} font-bold mt-1`}>
                      {item.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* files display */}
          {viewMode === "grid" ? (
            <div className="bg-gray-50 px-5 py-5">
              {currentFiles.length > 0 ? (
                <>
                  {/* File Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                    {currentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="group relative bg-white rounded-2xl border border-slate-200
      shadow-sm hover:shadow-xl hover:-translate-y-1
      transition-all duration-300 overflow-hidden"
                      >
                        {/* Top Accent */}
                        <div
                          className={`h-1.5 w-full ${
                            file.workType === "thesis"
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                              : "bg-gradient-to-r from-[#17a2b8] to-[#138496]"
                          }`}
                        />

                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            {/* File Icon */}
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center
            border ${
              file.workType === "thesis"
                ? "bg-purple-50 border-purple-100"
                : "bg-cyan-50 border-cyan-100"
            }`}
                            >
                              {getFileIcon(file.type)}
                            </div>

                            {/* Thesis and Project Badge */}
                            <span
                              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px]
            font-bold uppercase tracking-wide ${
              file.workType === "thesis"
                ? "bg-purple-100 text-purple-700"
                : "bg-cyan-100 text-cyan-700"
            }`}
                            >
                              {file.workType === "thesis"
                                ? "Thesis"
                                : "Project"}
                            </span>
                          </div>

                          {/* File Information */}
                          <div className="mb-5">
                            <h3
                              className="font-bold text-slate-800 text-base truncate mb-1"
                              title={file.name}
                            >
                              {file.name}
                            </h3>

                            <p className="text-xs text-slate-400">
                              Research / academic document
                            </p>
                          </div>

                          {/* Student Box */}
                          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Student
                            </p>

                            <p
                              className="text-sm font-semibold text-slate-700 truncate"
                              title={file.student}
                            >
                              {file.student}
                            </p>
                          </div>

                          {/* File Meta */}
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            {/* Type */}
                            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Type
                              </p>

                              <p className="text-sm font-bold text-slate-700">
                                {file.type}
                              </p>
                            </div>

                            {/* Uploaded */}
                            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Uploaded
                              </p>

                              <p className="text-sm font-bold text-slate-700">
                                {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* Download */}
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="flex-1 inline-flex items-center justify-center gap-2
            px-0 py-2 rounded-md
            bg-[#17a2b8] hover:bg-[#138496]
            text-white text-sm font-semibold
            shadow-sm hover:shadow-md
            transition-all duration-200"
                            >
                              <ArrowDownToLineIcon className="w-4 h-4" />
                              Download
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="inline-flex items-center justify-center gap-2
             px-5 py-2  rounded-md
            border border-red-200
            bg-red-50 text-red-600
            hover:bg-red-500 hover:text-white
            hover:border-red-500
            text-sm font-semibold
            transition-all duration-200"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-5 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">
                          Showing{" "}
                          <span className="font-medium text-slate-700">
                            {startIndex + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium text-slate-700">
                            {Math.min(
                              startIndex + itemsPerPage,
                              filteredFiles.length,
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium text-slate-700">
                            {filteredFiles.length}
                          </span>{" "}
                          files
                        </p>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            Previous
                          </button>

                          {Array.from({ length: totalPages }, (_, index) => {
                            const page = index + 1;

                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`
                        min-w-9 h-9 px-3 text-sm font-medium rounded-lg border transition
                        ${
                          currentPage === page
                            ? "bg-[#17a2b8] text-white border-[#17a2b8] shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-[#f0fbfc] hover:text-[#138496]"
                        }
                      `}
                              >
                                {page}
                              </button>
                            );
                          })}

                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* No files */
                <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-700">
                    No files found
                  </h3>

                  <p className="mt-1 text-sm text-slate-400 text-center">
                    {searchTerm ||
                    filterType !== "all" ||
                    workTypeFilter !== "all"
                      ? "No files match your current search or filters."
                      : "There are no files available at the moment."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // list grid table view
            <div className="card p-4">
              <div className="max-h-[500px] overflow-auto">
                <table className="min-w-[1100px] w-full border-collapse">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      {[
                        "File Name",
                        "Student",
                        "Work",
                        "Type",
                        "Upload Date",
                        "Actions",
                      ].map((t, i) => (
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
                    {currentFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="border-t hover:bg-slate-50 transition-colors"
                      >
                        {/* File Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                file.workType === "thesis"
                                  ? "bg-purple-50"
                                  : "bg-cyan-50"
                              }`}
                            >
                              {getFileIcon(file.type)}
                            </div>

                            <span
                              className="font-medium text-slate-700 truncate max-w-[200px]"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                          </div>
                        </td>

                        {/* Student */}
                        <td className="py-3 px-4">
                          <span
                            className="font-medium text-slate-700 truncate block max-w-[160px]"
                            title={file.student}
                          >
                            {file.student}
                          </span>
                        </td>

                        {/* Project / Thesis */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full
                text-xs font-bold uppercase tracking-wide ${
                  file.workType === "thesis"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-cyan-100 text-cyan-700"
                }`}
                          >
                            {file.workType === "thesis" ? "Thesis" : "Project"}
                          </span>
                        </td>

                        {/* File Type */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-600">
                            {file.type}
                          </span>
                        </td>

                        {/* Upload Date */}
                        <td className="py-3 px-4 text-slate-600">
                          {file.uploadDate
                            ? new Date(file.uploadDate).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 ">
                          <div className="flex items-center gap-2">
                            {/* Download */}
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="inline-flex items-center justify-center gap-2
                  px-3 py-2 rounded-lg
                  bg-[#17a2b8] hover:bg-[#138496]
                  text-white text-sm font-medium
                  transition-all"
                              title="Download file"
                            >
                              <ArrowDownToLineIcon className="w-4 h-4" />
                              <span>Download</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="inline-flex items-center justify-center gap-2
                  px-3 py-2 rounded-lg
                  bg-red-50 text-red-600
                  border border-red-200
                  hover:bg-red-500 hover:text-white
                  hover:border-red-500
                  text-sm font-medium
                  transition-all"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {currentFiles.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-300 mb-3" />

                  <h3 className="text-lg font-semibold text-slate-600">
                    No files found
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    No files match your current filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default TeacherFiles;
