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
    <div className="w-full space-y-6">

      {/* ================= UPLOAD SECTION ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 sm:px-8 py-7">
          <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <FilePlus className="w-7 h-7 text-white" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                 Upload Project & Thesis Files
              </h1>

              <p className="mt-1.5 text-sm sm:text-base text-white/80">
              Upload your thesis or project documents, presentations, and source code.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Cards */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Report */}
            <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-white hover:border-[#17a2b8]/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-8 h-8 text-red-500" />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Report / Document
              </h3>

              <p className="text-sm leading-6 text-slate-500 mb-5">
                Upload your project report
                <br />
                <span className="text-slate-400">
                  PDF, DOC, DOCX
                </span>
              </p>

              <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 cursor-pointer hover:border-[#17a2b8] hover:text-[#17a2b8] hover:shadow-sm transition-all duration-200">
                Choose File

                <input
                  type="file"
                  ref={reportRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>

            {/* Presentation */}
            <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-white hover:border-[#17a2b8]/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Archive className="w-8 h-8 text-orange-500" />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Presentation
              </h3>

              <p className="text-sm leading-6 text-slate-500 mb-5">
                Upload your presentation
                <br />
                <span className="text-slate-400">
                  PPT, PPTX, PDF
                </span>
              </p>

              <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 cursor-pointer hover:border-[#17a2b8] hover:text-[#17a2b8] hover:shadow-sm transition-all duration-200">
                Choose File

                <input
                  type="file"
                  ref={presRef}
                  className="hidden"
                  accept=".ppt,.pptx,.pdf"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>

            {/* Code Files */}
            <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-white hover:border-[#17a2b8]/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FileCode className="w-8 h-8 text-blue-500" />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Source Code
              </h3>

              <p className="text-sm leading-6 text-slate-500 mb-5">
                Upload your source code
                <br />
                <span className="text-slate-400">
                  ZIP, RAR, TAR, GZ
                </span>
              </p>

              <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 cursor-pointer hover:border-[#17a2b8] hover:text-[#17a2b8] hover:shadow-sm transition-all duration-200">
                Choose File

                <input
                  type="file"
                  ref={codeRef}
                  className="hidden"
                  accept=".zip,.rar,.tar,.gz"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={handleUpload}
              className="inline-flex items-center justify-center gap-2 bg-[#17a2b8] hover:bg-[#138496] active:bg-[#117a8b] text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-[#17a2b8]/20 hover:shadow-lg hover:shadow-[#17a2b8]/25 transition-all duration-200"
            >
              <FilePlus className="w-5 h-5" />
              Upload Selected Files
            </button>
          </div>
        </div>
      </div>

      {/* ================= SELECTED FILES ================= */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/30 overflow-hidden">

          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Ready to Upload
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review the files before uploading.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-full bg-[#17a2b8]/10 text-[#138496] text-sm font-semibold">
                {selectedFiles.length} File
                {selectedFiles.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-3">
            {selectedFiles.map((file) => {
              return (
                <div
                  key={file.name}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      {getFileIcon(file.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {file.name}
                      </p>

                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>

                        <span className="w-1 h-1 rounded-full bg-slate-300" />

                        <span className="uppercase">
                          {file.name.split(".").pop()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full sm:w-auto px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                    onClick={() => removeSelected(file.name)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= UPLOADED FILES ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/30 overflow-hidden">

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#17a2b8]/10 flex items-center justify-center">
              <File className="w-5 h-5 text-[#17a2b8]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Uploaded Files
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Manage your uploaded thesis and project files.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {(files || []).length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FilePlus className="w-9 h-9 text-slate-300" />
              </div>

              <h3 className="text-lg font-semibold text-slate-700">
                No files uploaded yet
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Your thesis or project files will appear here.
              </p>
            </div>
          ) : ( <div className="overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
     
              {files.map((file) => (
                <div
                  key={file._id || file.fileUrl}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      {getFileIcon(file.originalName)}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {file.originalName}
                      </p>

                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>
                          {file.fileType || "File"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-[#17a2b8] hover:text-[#17a2b8] hover:shadow-sm transition-all duration-200"
                    onClick={() => handleDownloadFile(file)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>

                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
