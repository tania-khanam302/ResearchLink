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
  Plus,
  Github,
  BookOpen,
  HardDrive,
  MonitorPlay,
} from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();

  const { project, thesis, files } = useSelector(
    (state) => state.student
  );

  const [selectedFiles, setSelectedFiles] = useState([]);

  // Resource Link Form
  const [resourceName, setResourceName] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [resourceCurrentPage, setResourceCurrentPage] = useState(1);

  const filesPerPage = 5;
  const resourceLinksPerPage = 5;

  // File input refs
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);
  const supportingRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Project / Thesis
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Active Work
  |--------------------------------------------------------------------------
  */

  const activeWork = thesis || project;

  /*
  |--------------------------------------------------------------------------
  | File Pick
  |--------------------------------------------------------------------------
  */

  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);

    if (!list.length) return;

    setSelectedFiles((prev) => [...prev, ...list]);

    // Allow selecting same file again
    e.target.value = "";
  };

  /*
  |--------------------------------------------------------------------------
  | Upload Files
  |--------------------------------------------------------------------------
  */

  const handleUpload = async () => {
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
        })
      ).unwrap();

      toast.success("Files uploaded successfully");

      setSelectedFiles([]);

      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Upload failed:", error);

      toast.error(
        error?.message ||
          error ||
          "File upload failed"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Selected File
  |--------------------------------------------------------------------------
  */

  const removeSelected = (index) => {
    setSelectedFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | File Icon
  |--------------------------------------------------------------------------
  */

  const getFileIcon = (fileName = "") => {
    const extension = fileName
      .split(".")
      .pop()
      .toLowerCase();

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
    } else if (
      ["zip", "rar", "tar", "gz"].includes(extension)
    ) {
      Icon = FileCode;
      color = "text-purple-500";
    } else if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "avif",
      ].includes(extension)
    ) {
      Icon = Image;
      color = "text-emerald-500";
    }

    return (
      <Icon className={`w-8 h-8 ${color}`} />
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Add Resource Link
  |--------------------------------------------------------------------------
  */

  const handleAddResourceLink = async () => {
    const name = resourceName.trim();
    const type = resourceType.trim();
    const url = resourceUrl.trim();

    if (!activeWork?._id) {
      toast.error("Project or Thesis not found");
      return;
    }

    if (!name) {
      toast.error("Please enter resource name");
      return;
    }

    if (!type) {
      toast.error("Please select resource type");
      return;
    }

    if (!url) {
      toast.error("Please enter resource URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      await dispatch(
        addResourceLink({
          workId: activeWork._id,
          name,
          type,
          url,
        })
      ).unwrap();

      // toast.success("Resource link added successfully");

      setResourceName("");
      setResourceType("");
      setResourceUrl("");

      setResourceCurrentPage(1);

      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Add link failed:", error);

      toast.error(
        error?.message ||
          error ||
          "Failed to add resource link"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Resource Link
  |--------------------------------------------------------------------------
  */

  const handleDeleteResourceLink = async (linkId) => {
    if (!activeWork?._id) {
      toast.error("Project or Thesis not found");
      return;
    }

    if (!linkId) {
      toast.error("Resource link ID not found");
      return;
    }

    try {
      await dispatch(
        deleteResourceLink({
          workId: activeWork._id,
          linkId,
        })
      ).unwrap();

      // toast.success("Resource link deleted");

      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Delete link failed:", error);

      toast.error(
        error?.message ||
          error ||
          "Failed to delete resource link"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Download File
  |--------------------------------------------------------------------------
  */

  const handleDownloadFile = async (file) => {
    try {
      if (!activeWork?._id) {
        toast.error("Project or Thesis not found");
        return;
      }

      if (!file?._id) {
        toast.error("File ID not found");
        return;
      }

      const result = await dispatch(
        downloadFiles({
          workId: activeWork._id,
          fileId: file._id,
        })
      ).unwrap();

      const { blob } = result;

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        file.originalName || "download";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);

      toast.error(
        error?.message ||
          error ||
          "Download failed"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete File
  |--------------------------------------------------------------------------
  */

  const handleDeleteFile = async (file) => {
    try {
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
        })
      ).unwrap();

      toast.success("File deleted successfully");

      await dispatch(fetchProject()).unwrap();
    } catch (error) {
      console.error("Delete failed:", error);

      toast.error(
        error?.message ||
          error ||
          "Failed to delete file"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const totalFiles = files?.length || 0;

  const totalPages = Math.ceil(
    totalFiles / filesPerPage
  );

  const startIndex =
    (currentPage - 1) * filesPerPage;

  const currentFiles = (files || []).slice(
    startIndex,
    startIndex + filesPerPage
  );

  const resourceLinks =
    activeWork?.resourceLinks || [];

  const totalResourcePages = Math.ceil(
    resourceLinks.length /
      resourceLinksPerPage
  );

  const resourceStartIndex =
    (resourceCurrentPage - 1) *
    resourceLinksPerPage;

  const currentResourceLinks =
    resourceLinks.slice(
      resourceStartIndex,
      resourceStartIndex +
        resourceLinksPerPage
    );

  /*
  |--------------------------------------------------------------------------
  | Pagination Handlers
  |--------------------------------------------------------------------------
  */

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (
      totalResourcePages > 0 &&
      resourceCurrentPage >
        totalResourcePages
    ) {
      setResourceCurrentPage(
        totalResourcePages
      );
    }

    if (totalResourcePages === 0) {
      setResourceCurrentPage(1);
    }
  }, [
    resourceCurrentPage,
    totalResourcePages,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Resource Icon
  |--------------------------------------------------------------------------
  */

  const getResourceIcon = (type = "") => {
    const value = type.toLowerCase();

    if (value.includes("github")) {
      return (
        <Github className="w-5 h-5" />
      );
    }

    if (
      value.includes("research") ||
      value.includes("paper")
    ) {
      return (
        <BookOpen className="w-5 h-5" />
      );
    }

    if (
      value.includes("drive") ||
      value.includes("google")
    ) {
      return (
        <HardDrive className="w-5 h-5" />
      );
    }

    if (
      value.includes("demo") ||
      value.includes("live")
    ) {
      return (
        <MonitorPlay className="w-5 h-5" />
      );
    }

    return (
      <ExternalLink className="w-5 h-5" />
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Resource Type Quick Selection
  |--------------------------------------------------------------------------
  */

  const resourceTypes = [
    "GitHub Repository",
    "Research Paper",
    "Google Drive",
    "Live Demo",
    "OneDrive",
    "Documentation",
    "Other",
  ];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 pb-8">

      {/* ================================================================
          UPLOAD FILES
      ================================================================ */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">

        {/* Header */}

        <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 py-7 sm:px-8">

          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/5" />

          <div className="absolute -bottom-20 right-20 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-sm">

              <FilePlus className="h-7 w-7 text-white" />

            </div>

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Upload Files
              </h1>

              <p className="mt-1.5 text-sm text-white/80 sm:text-base">
                Upload reports, presentations,
                source code and supporting files
                for your project or thesis.
              </p>

            </div>

          </div>

        </div>

        {/* Upload Cards */}

        <div className="p-6 sm:p-8">

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* Report */}

            <div className="group rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center transition-all duration-300 hover:border-[#17a2b8]/50 hover:bg-white hover:shadow-lg">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 transition-transform duration-300 group-hover:scale-105">

                <FileText className="h-8 w-8 text-red-500" />

              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Report
              </h3>

              <p className="mb-5 text-sm leading-6 text-slate-500">
                Upload your final thesis or
                project report.
                <br />

                <span className="text-slate-400">
                  PDF, DOC, DOCX
                </span>
              </p>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-[#17a2b8] hover:text-[#17a2b8]">

                Choose File

                <input
                  ref={reportRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFilePick}
                  multiple
                />

              </label>

            </div>

            {/* Presentation */}

            <div className="group rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center transition-all duration-300 hover:border-[#17a2b8]/50 hover:bg-white hover:shadow-lg">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 transition-transform duration-300 group-hover:scale-105">

                <Archive className="h-8 w-8 text-orange-500" />

              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Presentation
              </h3>

              <p className="mb-5 text-sm leading-6 text-slate-500">
                Upload your presentation
                slides.
                <br />

                <span className="text-slate-400">
                  PPT, PPTX, PDF
                </span>
              </p>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-[#17a2b8] hover:text-[#17a2b8]">

                Choose File

                <input
                  ref={presRef}
                  type="file"
                  className="hidden"
                  accept=".ppt,.pptx,.pdf"
                  onChange={handleFilePick}
                  multiple
                />

              </label>

            </div>

            {/* Source Code */}

            <div className="group rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center transition-all duration-300 hover:border-[#17a2b8]/50 hover:bg-white hover:shadow-lg">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 transition-transform duration-300 group-hover:scale-105">

                <FileCode className="h-8 w-8 text-blue-500" />

              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Source Code
              </h3>

              <p className="mb-5 text-sm leading-6 text-slate-500">
                Upload your source code
                archive.
                <br />

                <span className="text-slate-400">
                  ZIP, RAR, TAR, GZ
                </span>
              </p>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-[#17a2b8] hover:text-[#17a2b8]">

                Choose File

                <input
                  ref={codeRef}
                  type="file"
                  className="hidden"
                  accept=".zip,.rar,.tar,.gz"
                  onChange={handleFilePick}
                  multiple
                />

              </label>

            </div>

            {/* Supporting Files */}

            <div className="group rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center transition-all duration-300 hover:border-[#17a2b8]/50 hover:bg-white hover:shadow-lg">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 transition-transform duration-300 group-hover:scale-105">

                <FolderOpen className="h-8 w-8 text-emerald-500" />

              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Supporting Files
              </h3>

              <p className="mb-5 text-sm leading-6 text-slate-500">
                Dataset, diagrams,
                documentation, etc.
                <br />

                <span className="text-slate-400">
                  Optional
                </span>
              </p>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-[#17a2b8] hover:text-[#17a2b8]">

                Choose File

                <input
                  ref={supportingRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
                  onChange={handleFilePick}
                  multiple
                />

              </label>

            </div>

          </div>

          {/* Upload Guide */}

          <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
            <h3 className="text-xl font-bold text-slate-800">
              What Files Should You Upload?
            </h3>

            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">

              <p>
                <span className="font-semibold text-slate-700">
                  Report:
                </span>{" "}
                Final thesis or project report.
              </p>

              <p>
                <span className="font-semibold text-slate-700">
                  Presentation:
                </span>{" "}
                Presentation slides.
              </p>

              <p>
                <span className="font-semibold text-slate-700">
                  Source Code:
                </span>{" "}
                Source code archive, if applicable.
              </p>

              <p>
                <span className="font-semibold text-slate-700">
                  Supporting Files:
                </span>{" "}
                Dataset, papers, questionnaires,
                diagrams, documentation, etc.
              </p>

            </div>

            {/* <div className="mt-4 rounded-xl border border-cyan-100 bg-white/70 px-4 py-3">

              <p className="text-xs italic leading-6 text-slate-500 sm:text-sm">

                <span className="font-semibold text-slate-700">
                  Note:
                </span>{" "}
                Report is required. Presentation is
                recommended. Source Code is required
                only for programming-related projects
                or theses. Supporting Files are optional.

              </p>

            </div> */}
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
      relevant materials.
    </p>
  </div>

          </div>

        </div>

      </section>

      {/* ================================================================
          READY TO UPLOAD
      ================================================================ */}

      {selectedFiles.length > 0 && (

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Ready to Upload
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review your selected files before uploading.
                </p>

              </div>

              <span className="rounded-full bg-[#17a2b8]/10 px-3 py-1.5 text-sm font-semibold text-[#138496]">
                {selectedFiles.length}{" "}
                {selectedFiles.length === 1
                  ? "File"
                  : "Files"}
              </span>

            </div>

          </div>

          <div className="space-y-3 p-6 sm:p-8">

            {selectedFiles.map((file, index) => (

              <div
                key={`${file.name}-${index}`}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:bg-white sm:flex-row sm:items-center"
              >

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">

                    {getFileIcon(file.name)}

                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-semibold text-slate-800">
                      {file.name}
                    </p>

                    <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">

                      <span>
                        {(
                          file.size /
                          (1024 * 1024)
                        ).toFixed(1)}{" "}
                        MB
                      </span>

                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                      <span className="uppercase">
                        {file.name
                          .split(".")
                          .pop()}
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeSelected(index)
                  }
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-500 hover:bg-red-500 hover:text-white sm:w-auto"
                >
                  Remove
                </button>

              </div>

            ))}

            <div className="flex justify-end border-t border-slate-100 pt-5">

              <button
                type="button"
                onClick={handleUpload}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#138496] sm:w-auto"
              >

                <FilePlus className="h-4 w-4" />

                Upload Selected Files

              </button>

            </div>

          </div>

        </section>

      )}

      {/* ================================================================
          RESEARCH & RESOURCE LINKS
      ================================================================ */}

      <section className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl shadow-cyan-100/40">

        {/* Header */}

        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/70 via-white to-slate-50 px-6 py-6 sm:px-8">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17a2b8] text-white shadow-md">

              <ExternalLink className="h-6 w-6" />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Research & Resource Links
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add important external resources related
                to your project or thesis.
              </p>

            </div>

          </div>

        </div>

        {/* Form */}

        <div className="p-6 sm:p-8">
   {/* Quick Types */}

          <div className="mt-3 mb-7">

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Quick Select
            </p>

            <div className="flex flex-wrap gap-2">

              {resourceTypes.slice(0, 4).map(
                (type) => (

                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setResourceType(type)
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      resourceType === type
                        ? "border-[#17a2b8] bg-[#17a2b8] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                    }`}
                  >
                    {type}
                  </button>

                )
              )}

            </div>

          </div>


          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Resource Name */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Resource Name
              </label>

              <input
                type="text"
                value={resourceName}
                onChange={(e) =>
                  setResourceName(e.target.value)
                }
                placeholder=" e.g. Source Code, Research Paper, Dataset"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#17a2b8] focus:ring-2 focus:ring-[#17a2b8]/10"
              />

            </div>

            {/* Resource Type */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Resource Type
              </label>

              <select
                value={resourceType}
                onChange={(e) =>
                  setResourceType(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#17a2b8] focus:ring-2 focus:ring-[#17a2b8]/10"
              >

                <option value="">
                  Select Resource Type
                </option>

                {resourceTypes.map((type) => (

                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>

                ))}

              </select>

            </div>

            {/* URL */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                URL
              </label>

              <input
                type="url"
                value={resourceUrl}
                onChange={(e) =>
                  setResourceUrl(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    e.preventDefault();

                    handleAddResourceLink();

                  }

                }}
                placeholder=" Paste resource URL here..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#17a2b8] focus:ring-2 focus:ring-[#17a2b8]/10"
              />

            </div>

          </div>

       
          {/* Add Button */}

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={handleAddResourceLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#138496] sm:w-auto"
            >

              <Plus className="h-4 w-4" />

              Add Resource Link

            </button>

          </div>

        </div>

      </section>

      {/* ================================================================
          UPLOADED FILES
      ================================================================ */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">

        {/* Header */}

        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/70 via-white to-slate-50 px-6 py-6 sm:px-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17a2b8] text-white shadow-md">

                <File className="h-6 w-6" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Uploaded Files
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review, download, or remove your files.
                </p>

              </div>

            </div>

            <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#138496] shadow-sm ring-1 ring-cyan-100">

              {totalFiles}{" "}
              {totalFiles === 1
                ? "File"
                : "Files"}

            </div>

          </div>

        </div>

        {/* Content */}

        <div className="p-6 sm:p-8">

          {totalFiles === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-14 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">

                <FilePlus className="h-8 w-8 text-[#17a2b8]/50" />

              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No files uploaded yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your reports, presentations,
                source code, and supporting files
                will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {currentFiles.map((file) => (

                <div
                  key={
                    file._id ||
                    file.fileUrl
                  }
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-md sm:flex-row sm:items-center"
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">

                      {getFileIcon(
                        file.originalName
                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800">
                        {file.originalName}
                      </p>

                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">

                        <span>
                          {file.fileType ||
                            "File"}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadFile(
                          file
                        )
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#17a2b8] hover:text-[#17a2b8] sm:w-auto"
                    >

                      <ArrowDownToLineIcon className="h-4 w-4" />

                      Download

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteFile(
                          file
                        )
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white sm:w-auto"
                    >

                      <Trash2 className="h-4 w-4" />

                      Delete

                    </button>

                  </div>

                </div>

              ))}

              {/* Pagination */}

              {totalPages > 1 && (

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row">

                  <p className="text-sm text-slate-500">

                    Showing{" "}

                    <span className="font-semibold text-slate-700">
                      {startIndex + 1}
                    </span>{" "}

                    to{" "}

                    <span className="font-semibold text-slate-700">
                      {Math.min(
                        startIndex +
                          filesPerPage,
                        totalFiles
                      )}
                    </span>{" "}

                    of{" "}

                    <span className="font-semibold text-slate-700">
                      {totalFiles}
                    </span>{" "}
                    files

                  </p>

                  <div className="flex max-w-full items-center gap-2 overflow-x-auto">

                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(
                          currentPage - 1
                        )
                      }
                      disabled={
                        currentPage === 1
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map((page) => (

                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          handlePageChange(
                            page
                          )
                        }
                        className={`h-9 w-9 shrink-0 rounded-lg text-sm font-semibold ${
                          currentPage === page
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
                        handlePageChange(
                          currentPage + 1
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages
                      }
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

      </section>

      {/* ================================================================
          MY LINKS
      ================================================================ */}

      <section className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl shadow-cyan-100/40">

        {/* Header */}

        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/70 via-white to-slate-50 px-6 py-6 sm:px-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17a2b8] text-white shadow-md">

                <ExternalLink className="h-6 w-6" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  My Links
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  GitHub, research papers, Drive,
                  live demo and other resources.
                </p>

              </div>

            </div>

            <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#138496] shadow-sm ring-1 ring-cyan-100">

              {resourceLinks.length}{" "}
              {resourceLinks.length === 1
                ? "Link"
                : "Links"}

            </div>

          </div>

        </div>

        {/* Links */}

        <div className="p-6 sm:p-8">

          {resourceLinks.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/40 px-4 py-10 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#17a2b8] shadow-sm">

                <ExternalLink className="h-7 w-7" />

              </div>

              <p className="text-sm font-semibold text-slate-600">
                No links added yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add GitHub, Research Paper,
                Google Drive, or Live Demo links
                from the section above.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {currentResourceLinks.map(
                (link) => (

                  <div
                    key={link._id}
                    className="flex flex-col gap-4 rounded-xl border border-cyan-100 bg-cyan-50/40 p-4 transition hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#17a2b8] shadow-sm ring-1 ring-cyan-100">

                        {getResourceIcon(
                          link.type
                        )}

                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-slate-800">

                            {link.name ||
                              "Resource"}
  {/* {link.name || "No Name"} */}

                          </h3>
                     

                          <span className="rounded-full bg-[#17a2b8]/10 px-2.5 py-1 text-xs font-semibold text-[#138496]">

                            {link.type ||
                              "Resource"}

                          </span>

                        </div>

                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                        >

                          <span className="break-all">
                            {link.url}
                          </span>

                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />

                        </a>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteResourceLink(
                          link._id
                        )
                      }
                      className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                    >

                      <Trash2 className="h-4 w-4" />

                      Delete

                    </button>

                  </div>

                )
              )}

              {/* Resource Pagination */}

              {totalResourcePages > 1 && (

                <div className="flex flex-col items-center justify-between gap-4 border-t border-cyan-100 pt-5 sm:flex-row">

                  <p className="text-sm text-slate-500">

                    Showing{" "}

                    <span className="font-semibold text-slate-700">
                      {resourceStartIndex + 1}
                    </span>{" "}

                    to{" "}

                    <span className="font-semibold text-slate-700">
                      {Math.min(
                        resourceStartIndex +
                          resourceLinksPerPage,
                        resourceLinks.length
                      )}
                    </span>{" "}

                    of{" "}

                    <span className="font-semibold text-slate-700">
                      {resourceLinks.length}
                    </span>{" "}
                    links

                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        setResourceCurrentPage(
                          (page) =>
                            Math.max(
                              page - 1,
                              1
                            )
                        )
                      }
                      disabled={
                        resourceCurrentPage ===
                        1
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from(
                      {
                        length:
                          totalResourcePages,
                      },
                      (_, index) =>
                        index + 1
                    ).map((page) => (

                      <button
                        type="button"
                        key={page}
                        onClick={() =>
                          setResourceCurrentPage(
                            page
                          )
                        }
                        className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                          resourceCurrentPage ===
                          page
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
                        setResourceCurrentPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              totalResourcePages
                            )
                        )
                      }
                      disabled={
                        resourceCurrentPage ===
                        totalResourcePages
                      }
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

      </section>

    </div>
  );
};

export default UploadFiles;
