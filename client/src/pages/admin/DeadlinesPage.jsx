import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { data } from "react-router-dom";
import { Search, X } from "lucide-react";

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromData, setFromData] = useState({
    projectTitle: "",
    studentName: "",
    supervisor: "",
    deadlineDate: "",
    description: "",
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);
  const [viewProjects, setViewProjects] = useState(projects || []);
  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  const projectRows = useMemo(() => {
    return (viewProjects || []).map((p) => ({
      _id: p._id,
      title: p.title,
      studentName: p.student?.name || "-",
      studentEmail: p.student?.email || "-",
      studentDept: p.student?.department || "-",
      supervisor: p.supervisor?.name || "-",
      // deadlineDate: p.deadlineDate
      deadlineDate: p.deadline
        ? new Date(p.deadline).toISOString().slice(0, 10)
        : "-",
      updatedAt: p.updatedAt
        ? new Date(p.updatedAt).toLocaleDateString().slice(0, 10)
        : "-",
      row: p,
    }));
  }, [viewProjects]);
// console.log("PROJECT ROWS:", projectRows);
  const filterProjects = projectRows.filter((row) => {
    const matchesSearch =
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !fromData.deadlineDate) return;

    let deadlineDate = {
      name: selectedProject?.student?.name,
      // dueDate: selectedProject?.deadline,
      dueDate: fromData.deadlineDate,
      project: selectedProject?._id,
    };
    try {
      const updated = await dispatch(
        createDeadline({ id: selectedProject._id, data: deadlineDate }),
      ).unwrap();
      const updatedProject = updated?.project || updated;

      if (updatedProject?._id) {
        setViewProjects((prev) =>
          prev.map((p) =>
            p._id === updatedProject._id ? { ...p, ...updatedProject } : p,
          ),
        );
      }
    } finally {
      setShowModal(false);
      setFromData({
        projectTitle: "",
        studentName: "",
        supervisor: "",
        deadlineDate: "",
        description: "",
      });
      setSelectedProject(null);
      setQuery("");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* card Header */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
                Manage Deadlines
              </h1>
              <p className="card-subtitle text-[#17a2b8]">
                Create and monitor project deadlines
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0"
            >
              Create or Update Deadline
            </button>
          </div>
        </div>

        {/* Search Deadline */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">
          <label className="block mb-2 card-title text-md font-semibold text-[#17a2b8]">
            Search Deadlines
          </label>
          <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-2 border border-slate-200">
            <Search className="w-4 h-4 text-[#17a2b8]" />
            <input
              className="w-full outline-none text-sm"
              placeholder="Search by projet or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Project Deadlines */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-md font-semibold text-[#17a2b8]">
              Project Deadlines
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
                <tr className=" text-[#138496] text-xs font-semibold uppercase">
                  <th className="px-2 py-6 text-left tracking-wide ">
                    Student
                  </th>
                  <th className="px-2 py-6 text-left "> Project Title</th>
                  <th className="px-2 py-6 text-left ">Supervisor</th>
                  <th className="px-2 py-6 text-left ">Deadline</th>
                  <th className="px-2 py-6 text-left">Updated</th>
                </tr>
              </thead>

                <tbody className=" bg-slate-50 divide-y divide-slate-200">
                {filterProjects.map((row) => {
                  return (
                    <tr key={row._id} className="hover:bg-white">
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

                      <td className="px-2 py-4 text-[14px]">{row.title}</td>

                      <td className="px-2 py-4 whitespace-nowrap">
                        {row.supervisor !== "-" ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                                font-medium bg-green-100 text-green-800"
                          >
                            {row.supervisor}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                                font-medium bg-red-100 text-red-800"
                          >
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-4 text-[14px]">
                        {row.deadlineDate}
                      </td>

                      <td className="px-2 py-4 text-[14px]">{row.updatedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filterProjects.length === 0 && (
            <div className="text-center py-8 text-slate">
              No projects found matching your criteria.
            </div>
          )}
        </div>

        {/* show modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
            <div className=" bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">
                  Create or Update Deadline
                </h3>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Project Title */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Project Title
                    </label>

                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#17a2b8] focus:border-transparent transition shadow-sm"
                      placeholder="Start typing to search projects..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedProject(null);
                        setFromData({
                          ...fromData,
                          projectTitle: e.target.value,
                        });
                      }}
                    />

                    {/* {query && !selectedProject && (
                      <div className="mt-2 border border-slate-200 rounded-lg max-h-56 overflow-y-auto bg-white shadow-lg">
                        {(projects || [])
                          .filter((p) =>
                            (p.title || "")
                              .toLowerCase()
                              .includes(query.toLowerCase()),
                          )
                          .slice(0, 8)
                          .map((p) => (
                            <button
                              type="button"
                              key={p._id}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition border-b last:border-b-0"
                              onClick={() => {
                                setSelectedProject(p);
                                setQuery(p.title);
                                setFromData({
                                  ...fromData,
                                  projectTitle: p.title,
                                  deadlineDate: p.deadline
                                    ? new Date(p.deadline)
                                        .toISOString()
                                        .slice(0, 10)
                                    : "",
                                });
                              }}
                              title={p.title}
                            >
                              <div className="text-sm font-medium text-slate-800 truncate">
                                {p.title}
                              </div>

                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                {p.student?.name || "-"} •{" "}
                                {p.supervisor?.name || "-"}
                              </div>
                            </button>
                          ))}
                      </div>
                    )} */}

                    {query.trim() && !selectedProject && (
                      <div className="mt-2 border border-slate-200 rounded-lg max-h-56 overflow-y-auto bg-white shadow-lg">
                        {viewProjects
                          .filter((p) => {
                            const title = String(p.title || "").toLowerCase().trim();
                            const studentName = String(p.student?.name || "")
                              .toLowerCase()
                              .trim();

                            const search = query.toLowerCase().trim();

                            return (
                              title.includes(search) ||
                              studentName.includes(search)
                            );
                          })
                          .slice(0, 8)
                          .map((p) => (
                            <button
                              type="button"
                              key={p._id}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition border-b last:border-b-0"
                              onClick={() => {
                                setSelectedProject(p);
                                setQuery(p.title || "");

                                setFromData((prev) => ({
                                  ...prev,
                                  projectTitle: p.title || "",
                                  deadlineDate: p.deadline
                                    ? new Date(p.deadline).toISOString().slice(0, 10)
                                    : "",
                                }));
                              }}
                              title={p.title || ""}
                            >
                              <div className="text-sm font-medium text-slate-800 truncate">
                                {p.title || "-"}
                              </div>

                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                {p.student?.name || "-"} •{" "}
                                {p.supervisor?.name || "-"}
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                  </div>

                  {/* <div>
                    <label className="label">Deadline</label>
                    <input
                      type="date"
                      className="input-field w-full"
                      disabled={!selectedProject}
                      value={fromData.deadlineDate}
                        onChange={(e) =>
                          setFromData({
                            ...fromData,
                            deadlineDate: e.target.value,
                          })
                        }
                    />
                  </div> */}
                  <div>
  <label className="block mb-2 text-sm font-semibold text-slate-700">
    Deadline
  </label>

  <input
    type="date" 
    className={`w-full px-4 py-2.5 border rounded-lg outline-none transition
      ${
        !selectedProject
          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
          : "bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#17a2b8] focus:border-transparent"
      }
    `}
    disabled={!selectedProject}
    value={fromData.deadlineDate || ""}
    min={new Date().toISOString().split("T")[0]}
    onChange={(e) => {
      setFromData((prev) => ({
        ...prev,
        deadlineDate: e.target.value,
      }));
    }}
  />

  {!selectedProject && (
    <p className="mt-1 text-xs text-slate-500">
      Please select a project first.
    </p>
  )}
</div>

                  {selectedProject && (
                    <div className="mt-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="mb-2">
                        <div className="text-sm font-medium text-slate-900">
                          Project Details
                        </div>
                        <div
                          className="text-sm turncate text-slate-700"
                          title={selectedProject.description || ""}
                        >
                          {(selectedProject.description || "").length > 160
                            ? `${selectedProject.description.slice(0, 160)}...`
                            : selectedProject.description}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs to-slate-500">Status</div>
                          <div className="text-sm font-medium to-slate-800">
                            {selectedProject.status || "Unknown"}
                          </div>
                        </div>

                        {/* <div className="md:col-span-2">
                          <div className="text-xs to-slate-500">Student</div>
                          <div className="text-sm font-medium to-slate-800">
                            {(selectedProject.student?.name || "-")
                            (selectedProject.student?.email || "-",)
                            (selectedProject.student?.department || "-")}
                          </div>
                        </div> */}

                        <div className="md:col-span-2">
  <div className="text-xs text-slate-500">Student</div>

  <div className="text-sm font-medium text-slate-800">
    {selectedProject.student?.name || "-"}
  </div>

  <div className="text-xs text-slate-500">
    {selectedProject.student?.email || "-"}
  </div>

  <div className="text-xs text-slate-500">
    {selectedProject.student?.department || "-"}
  </div>
</div>

                        <div>
                          <div className="text-xs to-slate-500">Supervisor</div>
                          <div className="text-sm font-medium to-slate-800">
                            {selectedProject.supervisor?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary  bg-[#17a2b8] hover:bg-[#138496] text-white"
                    >
                      Save Deadline
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeadlinesPage;
