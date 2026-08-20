import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});

  const { users, projects } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (u) => (u.role || "").toLowerCase() === "teacher",
    );

    return teacherUsers.map((t) => ({
      ...t,
      assignedCount: Array.isArray(t.assignStudents)
        ? t.assignStudents.length
        : 0,
      capacityLeft:
        (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignStudents) ? t.assignStudents.length : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((p) => !!p.student?._id)
      .map((p) => ({
        projectId: p._id,
        title: p.title,
        status: p.status,
        supervisor: p.supervisor?.name || null,
        supervisorId: p.supervisor?._id || null,
        // studentId: p.student?.name || "unknown",
        studentId: p.student?._id,
        studentName: p.student?.name || "-",
        studentEmail: p.student?.email || "-",
        deadline: p.deadline
          ? new Date(p.deadline).toISOString().slice(0, 10)
          : "-",
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-",
        isApproved: p.status === "approved",
      }));
  }, [projects]);

  const filtered = studentProjects.filter((row) => {
    const matchesSearch =
      (row.studentName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase());

    const status = row.supervisorId ? "assigned" : "unassigned";
    const matchesFilter = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesFilter;
    // const matchesStatus = filterStatus === "all" || status === filterStatus;
    // return matchesSearch && matchesStatus;
  });

  const [pendingFor, setPendingFor] = useState(null);

  // const handleAssignSupervisor = (projectId, supervisorId) => {
  //   setSelectedSupervisor((prev) => ({
  //     ...prev,
  //     [projectId]: supervisorId,
  //   }));
  // };
  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];

    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }

    if (projectStatus === "rejected") {
      toast.error("Cannot assign a supervisor to a rejected project");
      return;
    }
    setPendingFor(projectId);
    const res = await dispatch(
      assignSupervisorThunk({ studentId, supervisorId }),
    );

    setPendingFor(null);

    if (assignSupervisorThunk.fulfilled.match(res)) {
      toast.success("Supervisor assigned successfully");

      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });

      dispatch(getAllUsers());
    } else {
      toast.error("Failed to assign supervisor");
    }
  };

  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisor).length,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0),
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  // table header
  const headers = [
    "Student",
    "Thesis and Project Title",
    "Supervisor",
    "Deadline",
    "Updated",
    "Assign Supervisor",
    "Actions",
  ];

  const Badge = ({ color, children }) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {children}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* heading  */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assign Supervisor</h1>
            <p className="card-subtitle">
              Manage supervisor assignments for projects
            </p>
          </div>
        </div>

        {/* Search Students */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)] flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-2 card-title text-md font-semibold text-[#17a2b8]">
              Search Students
            </label>

            <input
              type="text"
              placeholder="Search by student name or project title..."
              className="input-field outline-none p-1 border border-slate-300 w-[350px] "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block mb-2 text-md font-semibold text-[#17a2b8]">
              Filter Status
            </label>
            <select
              className="input-field w-full outline-none p-1 border border-slate-300"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* student assignments table */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="card-header">
            <h2 className="card-title text-lg font-semibold text-[#17a2b8]">
              Student Assignments
            </h2>
          </div>

          <div className="w-full max-w-full overflow-auto max-h-[500px]
          
      [&::-webkit-scrollbar]:w-1.5
      [&::-webkit-scrollbar-track]:bg-slate-100
      [&::-webkit-scrollbar-thumb]:bg-[#b0cbcf]
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb:hover]:bg-[#8fb8be]">
      <table className="min-w-auto w-full text-left border-collapse">
        <thead className="bg-slate-200 sticky top-0 z-10">
                <tr>
                  {headers.map((h) => {
                    return (
                      <th
                        key={h}
                        className="px-2 py-6 text-[#138496] text-xs font-semibold uppercase"
                      >
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
                <tbody className=" bg-slate-50 divide-y divide-slate-200">
                {filtered.map((row) => (
                  <tr key={row.projectId} className="hover:bg-white">
                    {/* Student */}
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {row.studentName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {row.studentEmail}
                        </div>
                      </div>
                    </td>

                    {/* Project Title */}
                    <td className="px-2 py-4">{row.title}</td>

                    {/* Supervisor */}
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className=" whitespace-nowrap">
                        {row.supervisor ? (
                          <Badge
                            color={"bg-green-100 text-green-800"}
                            children={row.supervisor}
                          />
                        ) : (
                          <Badge
                            color={"bg-red-100 text-red-800"}
                            children={
                              row.status === "rejected"
                                ? "Rejected"
                                : "Not Assigned"
                            }
                          />
                        )}
                      </div>
                    </td>

                    {/* deadline */}
                    <td className="px-2 py-4 text-[14px]">{row.deadline}</td>

                    {/* update date  */}
                    <td className="px-2 py-4 text-[14px]">{row.updatedAt}</td>

                    {/* Assign Supervisor */}
<td className="px-2 py-4 whitespace-nowrap">
  <select
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm outline-none transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
    value={selectedSupervisor[row.projectId] || ""}
    disabled={
      !!row.supervisor ||
      row.status === "rejected" ||
      !row.isApproved
    }
    onChange={(e) =>
      handleAssignSupervisor(row.projectId, e.target.value)
    }
  >
    <option value="" disabled>
      Select Supervisor
    </option>

    {teachers
      .filter((t) => t.capacityLeft > 0)
      .map((t) => (
        <option value={t._id} key={t._id} >
          {t.name} ({t.capacityLeft} slots left)
        </option>
      ))}
  </select>
</td>


                    {/* Action */}
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                      {/* <button
                        className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-[13px] w-[110px] px-0 pe-0"
                        onClick={() =>
                          handleAssign(row.studentId, row.status, row.projectId)
                        }
                        disabled={
                          pendingFor === row.projectId ||
                          !!row.supervisor ||
                          row.status === "rejected" ||
                          !row.isApproved ||
                          !selectedSupervisor[row.projectId]
                        }
                      >
                        {pendingFor === row.projectId
                          ? "ASsigning..."
                          : row.supervisor
                            ? "Assigned"
                            : row.status === "rejected"
                              ? "Rejected"
                              : !row.isApproved
                                ? "Not Approved"
                                : "Assign"}
                      </button> */}
                      <button
                        className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-[13px] w-[110px] px-0 pe-0"
                        onClick={() =>
                          handleAssign(row.studentId, row.status, row.projectId)
                        }
                        disabled={
                          pendingFor === row.projectId ||
                          !!row.supervisor ||
                          row.status === "rejected" ||
                          !row.isApproved ||
                          !selectedSupervisor[row.projectId]
                        }
                      >
                        {pendingFor === row.projectId
                          ? "Assigning..."
                          : row.supervisor
                            ? "Assigned"
                            : row.status === "rejected"
                              ? "Rejected"
                              : !row.isApproved
                                ? "Not Approved"
                                : "Assign"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No students found matching your criteria
              </div>
            )}
          </div>
        </div>

        {/* summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 ${card.bg} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AssignSupervisor;
