import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  downloadFiles,
  fetchProject,
  uploadFiles,
  deleteFile,
  addResourceLink,
  deleteResourceLink,
} from "../../store/slices/studentSlice";
import {
  Archive,
  File,
  FileText,
  FileCode,
  FilePlus,
  FolderOpen,
  Trash2,
  ArrowDownToLineIcon,
  Image,
  ExternalLink,
} from "lucide-react";



const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, thesis, files } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resourceUrl, setResourceUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resourceCurrentPage, setResourceCurrentPage] = useState(1);
  const filesPerPage = 5;
  const resourceLinksPerPage = 5;

  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);
  const supportingRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  // handleFilePick
  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  // handleUpload
  const handleUpload = async () => {
    const activeWork = thesis || project;

    if (!activeWork?._id) {
      toast.error("Project or Thesis not found");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please select files first");
      return;
    }

    try {
      await dispatch(
        uploadFiles({
          workId: activeWork._id,
          files: selectedFiles,
        }),
      ).unwrap();

      setSelectedFiles([]);
      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error || "File upload failed");
    }
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleAddResourceLink = async () => {
    const activeWork = thesis || project;
    const url = resourceUrl.trim();

    if (!activeWork?._id) {
      toast.error("Project or Thesis not found");
      return;
    }

    if (!url) {
      toast.error("Please enter a link");
      return;
    }

    try {
      await dispatch(addResourceLink({ workId: activeWork._id, url })).unwrap();
      setResourceUrl("");
      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Add link failed:", error);
    }
  };

  const handleDeleteResourceLink = async (linkId) => {
    const activeWork = thesis || project;
    if (!activeWork?._id) return;

    try {
      await dispatch(
        deleteResourceLink({ workId: activeWork._id, linkId }),
      ).unwrap();
      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Delete link failed:", error);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    let Icon = File;
    let color = "text-slate-500";

    if (extension === "pdf") {
      Icon = FileText;
      color = "text-red-500";
    } else if (["doc", "docx"].includes(extension)) {
      Icon = FileText;
      color = "text-blue-500";
    } else if (["ppt", "pptx"].includes(extension)) {
      Icon = Archive;
      color = "text-orange-500";
    } else if (["zip", "rar", "tar", "gz"].includes(extension)) {
      Icon = FileCode;
      color = "text-purple-500";
    } else if (
      ["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(extension)
    ) {
      Icon = Image;
      color = "text-emerald-500";
    }

    return <Icon className={`w-8 h-8 ${color}`} />;
  };

  // pagination
  const totalFiles = files?.length || 0;
  const totalPages = Math.ceil(totalFiles / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const currentFiles = (files || []).slice(
    startIndex,
    startIndex + filesPerPage,
  );
  const resourceLinks = (thesis || project)?.resourceLinks || [];
  const totalResourcePages = Math.ceil(
    resourceLinks.length / resourceLinksPerPage,
  );
  const resourceStartIndex =
    (resourceCurrentPage - 1) * resourceLinksPerPage;
  const currentResourceLinks = resourceLinks.slice(
    resourceStartIndex,
    resourceStartIndex + resourceLinksPerPage,
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (resourceCurrentPage > totalResourcePages && totalResourcePages > 0) {
      setResourceCurrentPage(totalResourcePages);
    }
  }, [resourceCurrentPage, totalResourcePages]);

  // handleDownloadFile
  const handleDownloadFile = async (file) => {
    try {
      const activeWork = thesis || project;

      if (!activeWork?._id) {
        toast.error("Project or Thesis not found");
        return;
      }

      const result = await dispatch(
        downloadFiles({
          workId: activeWork._id,
          fileId: file._id,
        }),
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
      toast.error(error || "Download failed");
    }
  };

  const handleDeleteFile = async (file) => {
    try {
      const activeWork = thesis || project;

      if (!activeWork?._id) {
        toast.error("Project or Thesis not found");
        return;
      }

      if (!file?._id) {
        toast.error("File ID not found");
        return;
      }

      await dispatch(
        deleteFile({
          workId: activeWork._id,
          fileId: file._id,
        }),
      ).unwrap();

      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error || "Failed to delete file");
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* upload section  */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Upload Project & Thesis Files Header */}
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
                Upload your thesis or project documents, presentations, and
                source code.
              </p>
            </div>
          </div>
        </div>
{/* Upload Cards */}
<div className="p-6 sm:p-8">
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

    {/* Report */}
    <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-white hover:border-[#17a2b8]/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <FileText className="w-8 h-8 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Report / Document
      </h3>

      <p className="text-sm leading-6 text-slate-500 mb-5">
        Upload your thesis or project report
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

    {/* Source Code */}
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

    {/* Supporting Files */}
    <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-white hover:border-[#17a2b8]/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <FolderOpen className="w-8 h-8 text-emerald-500" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Supporting Files
      </h3>

      <p className="text-sm leading-6 text-slate-500 mb-5">
        Upload datasets, research materials,
        <br />
        diagrams, documentation, or other files.
        <br />
        <span className="text-slate-400">
          Optional
        </span>
      </p>

      <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 cursor-pointer hover:border-[#17a2b8] hover:text-[#17a2b8] hover:shadow-sm transition-all duration-200">
        Choose File
        <input
          type="file"
          ref={supportingRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
          onChange={handleFilePick}
          multiple
        />
      </label>
    </div>

    {/* Add external resource link */}
    <div className="group border-2 border-dashed border-cyan-200 rounded-2xl p-6 text-center bg-cyan-50/40 hover:bg-white hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-100/60 transition-all duration-300">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-cyan-100 flex items-center justify-center">
        <ExternalLink className="w-8 h-8 text-[#17a2b8]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Add Resource Link
      </h3>
      <p className="text-sm leading-6 text-slate-500 mb-5">
        Add GitHub, Drive, OneDrive, or live demo links.
      </p>
      <input
        type="url"
        value={resourceUrl}
        onChange={(e) => setResourceUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddResourceLink();
          }
        }}
        placeholder="Paste your GitHub, Drive, or demo link"
        className="input mb-3 w-full placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
      />
      <button type="button" onClick={handleAddResourceLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#17a2b8] hover:text-[#17a2b8] hover:shadow-sm">
        <ExternalLink className="h-4 w-4" />
        Add Link
      </button>
    </div>

  </div>

  {/* ================= FILE UPLOAD GUIDE ================= */}
  <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
    <div className="flex items-start gap-3">
      <div>
        <h3 className="text-base font-bold text-slate-800">
          What Files Should You Upload?
        </h3>

        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-700">
              Report:
            </span>{" "}
            Final thesis or project report
          </p>

          <p>
            <span className="font-semibold text-slate-700">
              Presentation:
            </span>{" "}
            Presentation slides
          </p>

          <p>
            <span className="font-semibold text-slate-700">
              Source Code:
            </span>{" "}
            Your source code, if applicable
          </p>

          <p>
            <span className="font-semibold text-slate-700">
              Supporting Files:
            </span>{" "}
            Dataset, research paper, questionnaire, diagram,
            database, documentation, screenshots, etc.
          </p>
              <p>
      <span className="font-semibold text-slate-700">
        Uploaded Files Link:
      </span>{" "}
      GitHub repository, Google Drive, OneDrive, live demo,
      research paper, documentation, or any other relevant
      project resource link.
    </p>

        </div>
 <div className="mt-4 rounded-xl bg-white/70 border border-cyan-100 px-4 py-3">
    <p className="text-xs sm:text-sm text-slate-500 leading-6 italic text-justify">
      <span className="font-semibold text-slate-700">
        Note:
      </span>{" "}
      Report is required. Presentation is recommended.
      Source Code is required only for projects/theses that
      involve programming. Supporting Files may include
      datasets, research papers, questionnaires, diagrams,
      database files, documentation, screenshots, or other
      relevant materials. Uploaded Files Link is optional and
      can be used to provide additional project resources such
      as GitHub, Google Drive, OneDrive, live demo, or
      documentation links.
    </p>
  </div>
      </div>
    </div>
  </div>

</div>

      </div>

      {/* selected files section  */}
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
                        <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>

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

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                onClick={handleUpload}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-5 py-3 font-semibold text-white shadow-md shadow-[#17a2b8]/20 transition-all duration-200 hover:bg-[#138496] hover:shadow-lg sm:w-auto"
              >
                <FilePlus className="h-4 w-4" />
                Upload Selected Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* upload files section  */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        {/* Uploaded Files Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/70 via-white to-slate-50 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17a2b8] text-white shadow-md shadow-[#17a2b8]/20">
                <File className="h-6 w-6" />
              </div>
              <div>
                <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                  Uploaded Files
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review, download, or remove your submitted files.
                </p>
              </div>
            </div>
            <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#138496] shadow-sm ring-1 ring-cyan-100">
              {totalFiles} {totalFiles === 1 ? "File" : "Files"}
            </div>
          </div>

        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {(files || []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-14 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <FilePlus className="h-8 w-8 text-[#17a2b8]/50" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                No files uploaded yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your submitted reports, presentations, source code, and supporting files will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {currentFiles.map((file) => (
                <div
                  key={file._id || file.fileUrl}
                  className="group flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-all duration-200 hover:border-cyan-200 hover:bg-white hover:shadow-md sm:flex-row sm:items-center"
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
                        <span>{file.fileType || "File"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-[#17a2b8] hover:text-[#17a2b8] transition-all"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <ArrowDownToLineIcon className="w-4 h-4" />
                      Download
                    </button>

                    <button
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all"
                      onClick={() => handleDeleteFile(file)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-700">
                      {Math.min(startIndex + filesPerPage, totalFiles)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {totalFiles}
                    </span>{" "}
                    files
                  </p>

                  <div className="flex items-center gap-2 max-w-full overflow-x-auto">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-semibold ${
                            currentPage === page
                              ? "bg-[#17a2b8] text-white"
                              : "bg-white border border-slate-200 text-slate-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files Link */}
      <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl shadow-cyan-100/40">
        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/70 via-white to-slate-50 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17a2b8] text-white shadow-md shadow-[#17a2b8]/20">
                <ExternalLink className="h-6 w-6" />
              </div>
              <div>
                <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Uploaded Files Link</h2>
                <p className="mt-1 text-sm text-slate-500">Review and manage your GitHub, Drive, OneDrive, or demo links.</p>
              </div>
            </div>
            <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#138496] shadow-sm ring-1 ring-cyan-100">
              {resourceLinks.length} {resourceLinks.length === 1 ? "Link" : "Links"}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {resourceLinks.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-600">No external links added yet.</p>
              <p className="mt-1 text-xs text-slate-400">Add a GitHub repository, Drive folder, or live demo link from the card above.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3 border-t border-indigo-100 pt-5">
              {currentResourceLinks.map((link) => (
                <div key={link._id} className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <a href={link.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-start gap-2 text-sm font-medium leading-6 text-indigo-600 hover:underline">
                    <ExternalLink className="mt-1 h-4 w-4 shrink-0" />
                    <span className="break-all">{link.url}</span>
                  </a>
                  <button type="button" onClick={() => handleDeleteResourceLink(link._id)} className="w-full shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto">Delete</button>
                </div>
              ))}

              {totalResourcePages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-indigo-100 pt-5 sm:flex-row">
                  <p className="text-sm text-slate-500">
                    Showing {resourceStartIndex + 1} to{" "}
                    {Math.min(
                      resourceStartIndex + resourceLinksPerPage,
                      resourceLinks.length,
                    )}{" "}
                    of {resourceLinks.length} links
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setResourceCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={resourceCurrentPage === 1}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    {Array.from(
                      { length: totalResourcePages },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        type="button"
                        key={page}
                        onClick={() => setResourceCurrentPage(page)}
                        className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                          resourceCurrentPage === page
                            ? "bg-[#17a2b8] text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setResourceCurrentPage((page) =>
                          Math.min(page + 1, totalResourcePages),
                        )
                      }
                      disabled={resourceCurrentPage === totalResourcePages}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default UploadFiles;
