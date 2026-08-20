import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  FolderKanban,
  UserCheck,
  Clock,
  PlusIcon,
  FileTextIcon,
  X,
} from "lucide-react";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { getAllUsers, getAllProjects } from "../../store/slices/adminSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";
import {
  toggleStudentModal,
  toggleTeacherModal,
} from "../../store/slices/popupSlice";

const CoAdminDashboard = () => {
  const dispatch = useDispatch();

  // popup
  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector(
    (state) => state.popup,
  );

  const { users = [], projects = [] } = useSelector((state) => state.admin);

  //  report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  // Fetch users and Project
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
  }, [dispatch]);

  // students
  const students = useMemo(() => {
    return (users || []).filter((u) => u.role?.toLowerCase() === "student");
  }, [users]);

  // teachers
  const teachers = useMemo(() => {
    return (users || []).filter((u) => u.role?.toLowerCase() === "teacher");
  }, [users]);

  // assigned students
  const assignedStudents = useMemo(() => {
    return students.filter((student) =>
      (projects || []).some((project) => {
        const projectStudentId =
          project.student?._id || project.student?.id || project.studentId;

        return (
          projectStudentId && String(projectStudentId) === String(student._id)
        );
      }),
    );
  }, [students, projects]);

  // unassigned students
  const unassignedStudents = students.length - assignedStudents.length;

  // project status
  const completedProjects = useMemo(() => {
    return (projects || []).filter(
      (project) => project.status?.toLowerCase() === "completed",
    ).length;
  }, [projects]);

  const pendingProjects = (projects || []).length - completedProjects;

  // project files and reports
  const files = useMemo(() => {
    return (projects || []).flatMap((project) =>
      (project.files || []).map((file) => ({
        projectId: project._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        projectTitle: project.title,
        studentName: project.student?.name,
      })),
    );
  }, [projects]);

  // filterd files
  const filteredFiles = files.filter((file) => {
    const search = reportSearch.toLowerCase();

    return (
      (file.originalName || "").toLowerCase().includes(search) ||
      (file.projectTitle || "").toLowerCase().includes(search) ||
      (file.studentName || "").toLowerCase().includes(search)
    );
  });

  // download reports
  const handleDownload = async (projectId, fileId, name) => {
    const res = await dispatch(downloadProjectFile({ projectId, fileId })).then(
      (res) => {
        const { blob } = res.payload;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", name || "download");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Co-Admin Header section */}
        <div className="bg-gradient-to-r from-[#17a2b8] to-purple-500 rounded-lg text-white p-4">
          <h1 className="text-2xl font-bold mb-2">Co-Admin Dashboard</h1>
          <p className="text-blue-100">
            Monitor students, projects and supervision activities.
          </p>
        </div>

        {/* Co-Admin stats section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Total Teachers */}
          <div className="relative overflow-hidden bg-green-100 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition">
            <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Teachers</p>
                <p className="text-2xl font-bold text-slate-800">
                  {teachers.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 shadow-sm">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="relative overflow-hidden bg-blue-100 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition">
            <div className="absolute left-0 top-0 h-full w-1 bg-[#17a2b8]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-2xl font-bold text-slate-800">
                  {students.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 shadow-sm">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Assigned Students*/}
          <div className="relative overflow-hidden bg-green-100 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition">
            <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Assigned Students</p>
                <p className="text-2xl font-bold text-slate-800">
                  {assignedStudents.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 shadow-sm">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Unassigned Students */}
          <div className="relative overflow-hidden bg-yellow-100 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition">
            <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Unassigned Students</p>
                <p className="text-2xl font-bold text-slate-800">
                  {unassignedStudents}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 shadow-sm">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Projects */}
          <div className="relative overflow-hidden bg-purple-100 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition">
            <div className="absolute left-0 top-0 h-full w-1 bg-purple-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Projects</p>
                <p className="text-2xl font-bold text-slate-800">
                  {projects.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 shadow-sm">
                <FolderKanban className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Project status section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Overview</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Completed Projects</span>
                <span className="font-bold text-green-600">
                  {completedProjects}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pending Projects</span>
                <span className="font-bold text-yellow-600">
                  {pendingProjects}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Projects</h3>
            </div>
            <div
              className="
      p-5
      space-y-3
      h-[300px]
      overflow-y-auto
      overflow-x-hidden
      pr-3

      [&::-webkit-scrollbar]:w-1.5
      [&::-webkit-scrollbar-track]:bg-slate-100
      [&::-webkit-scrollbar-thumb]:bg-[#b0cbcf]
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb:hover]:bg-[#8fb8be]
    "
            >
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <div key={project._id} className="border-b pb-2">
                    <p className="font-medium text-slate-800">
                      {project.title || project.name || "Untitled Project"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {project.student?.name ||
                        project.studentName ||
                        "No Student"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No projects found</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions section  */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* add student */}
            <button
              className="btn-primary bg-[#17a2b8] hover:bg-[#138496] flex items-center justify-center space-x-2"
              onClick={() => dispatch(toggleStudentModal())}
            >
              <PlusIcon className="w-5 h-5" />

              <span>Add Student</span>
            </button>

            {/* add techer */}
            <button
              className="btn-secondary flex items-center justify-center space-x-2"
              onClick={() => dispatch(toggleTeacherModal())}
            >
              <PlusIcon className="w-5 h-5" />

              <span>Add Teacher</span>
            </button>

            {/* View Reports */}
            <button
              className="btn-outline border-[#17a2b8] text-[#17a2b8] flex items-center justify-center space-x-2"
              onClick={() => setIsReportModalOpen(true)}
            >
              <FileTextIcon className="w-5 h-5" />

              <span>View Reports</span>
            </button>
          </div>
        </div>

        {/* report modal  */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
            <div className="bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden shadow-xl">
              {/* modal header */}
              <div className="card-header py-4 px-4 bg-blue-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    All Files
                  </h3>
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* search */}
                <div className="mt-4">
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Search by file name, project title, or student name"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* file list */}
              {filteredFiles.length === 0 ? (
                <div className="text-slate-500 p-5">No files found.</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto p-4">
                  {filteredFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate">
                          {file.originalName}
                        </div>

                        <div className="text-sm text-slate-500 truncate">
                          {file.projectTitle || "No Project"} -{" "}
                          {file.studentName || "No Student"}
                        </div>
                      </div>

                      <button
                        className="btn-outline btn-small shrink-0"
                        onClick={() =>
                          handleDownload(
                            file.projectId,
                            file.fileId,
                            file.originalName,
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

        {/* Add student modal  */}
        {isCreateStudentModalOpen && <AddStudent />}

        {/* Add teacher modal  */}
        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </>
  );
};

export default CoAdminDashboard;
