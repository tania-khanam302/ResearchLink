
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  FolderKanban,
  UserCheck,
  Clock,
} from "lucide-react";

const CoAdminDashboard = () => {
  const { users, projects } = useSelector((state) => state.admin);

  const students = useMemo(() => {
    return (users || []).filter(
      (u) => u.role?.toLowerCase() === "student"
    );
  }, [users]);

  const assignedStudents = useMemo(() => {
    return students.filter((student) =>
      projects?.some((p) => p.student?._id === student._id)
    );
  }, [students, projects]);

  const unassignedStudents = students.length - assignedStudents.length;

  const completedProjects = (projects || []).filter(
    (p) => p.status === "completed"
  ).length;

  const pendingProjects = (projects || []).filter(
    (p) => p.status !== "completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-5 rounded-lg">
        <h1 className="text-2xl font-bold">
          Co-Admin Dashboard
        </h1>
        <p>
          Monitor students, projects and supervision activities.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p>Total Students</p>
              <h2 className="text-2xl font-bold">
                {students.length}
              </h2>
            </div>
            <Users size={32} />
          </div>
        </div>

        <div className="bg-green-500 text-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p>Assigned Students</p>
              <h2 className="text-2xl font-bold">
                {assignedStudents.length}
              </h2>
            </div>
            <UserCheck size={32} />
          </div>
        </div>

        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p>Unassigned Students</p>
              <h2 className="text-2xl font-bold">
                {unassignedStudents}
              </h2>
            </div>
            <Clock size={32} />
          </div>
        </div>

        <div className="bg-purple-500 text-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p>Total Projects</p>
              <h2 className="text-2xl font-bold">
                {projects?.length || 0}
              </h2>
            </div>
            <FolderKanban size={32} />
          </div>
        </div>

      </div>

      {/* PROJECT STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-lg mb-3">
            Project Overview
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Completed Projects</span>
              <span className="font-bold text-green-600">
                {completedProjects}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Pending Projects</span>
              <span className="font-bold text-yellow-600">
                {pendingProjects}
              </span>
            </div>
          </div>
        </div>

        {/* RECENT PROJECTS */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-lg mb-3">
            Recent Projects
          </h3>

          <div className="space-y-3">
            {projects?.slice(0, 5).map((project) => (
              <div
                key={project._id}
                className="border-b pb-2"
              >
                <p className="font-medium">
                  {project.title}
                </p>

                <p className="text-sm text-gray-500">
                  {project.student?.name || "No Student"}
                </p>
              </div>
            ))}

            {projects?.length === 0 && (
              <p className="text-gray-500">
                No projects found
              </p>
            )}
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-lg mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            View Students
          </button>

          <button className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
            View Projects
          </button>

          <button className="bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
            Generate Reports
          </button>

        </div>
      </div>
    </div>
  );
};

export default CoAdminDashboard;