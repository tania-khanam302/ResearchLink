import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { getAllProjects, getAllTheses } from "../../store/slices/adminSlice";
import { CalendarDays, Search, X } from "lucide-react";

const DeadlinesPage = () => {
  const dispatch = useDispatch();

  const { projects, theses } = useSelector((state) => state.admin);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    title: "",
    deadlineDate: "",
  });

  // Selected Project OR Thesis
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState("");

  // Load Projects and Theses
  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllTheses());
  }, [dispatch]);

  // Combine Project and Thesis
  const allItems = useMemo(() => {
    const projectData = Array.isArray(projects)
      ? projects.map((project) => ({
          ...project,
          type: "Project",
        }))
      : [];

    const thesisData = Array.isArray(theses)
      ? theses.map((thesis) => ({
          ...thesis,
          type: "Thesis",
        }))
      : [];

    return [...projectData, ...thesisData];
  }, [projects, theses]);

  // Table Rows
  const deadlineRows = useMemo(() => {
    return allItems.map((item) => ({
      _id: item._id,
      title: item.title || "-",
      type: item.type,

      studentName: item.student?.name || "-",
      studentEmail: item.student?.email || "-",
      studentDept: item.student?.department || "-",

      supervisor: item.supervisor?.name || "-",

      deadlineDate: item.deadline
        ? new Date(item.deadline).toISOString().slice(0, 10)
        : "-",

      updatedAt: item.updatedAt
        ? new Date(item.updatedAt).toISOString().slice(0, 10)
        : "-",

      row: item,
    }));
  }, [allItems]);

  // Search and Filter
  const filteredRows = deadlineRows.filter((row) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      row.title.toLowerCase().includes(search) ||
      row.studentName.toLowerCase().includes(search);

    const matchesType = filterType === "all" || row.type === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Search inside Modal
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const search = query.toLowerCase().trim();
    return allItems
      .filter((item) => {
        const title = String(item.title || "").toLowerCase();
        const studentName = String(item.student?.name || "").toLowerCase();

        return title.includes(search) || studentName.includes(search);
      })
      .slice(0, 8);
  }, [query, allItems]);

  // Select Project / Thesis
  const handleSelectItem = (item) => {
    setSelectedItem(item);

    setQuery(item.title || "");

    setFormData({
      title: item.title || "",
      deadlineDate: item.deadline
        ? new Date(item.deadline).toISOString().slice(0, 10)
        : "",
    });
  };

  // Submit Deadline
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem || !formData.deadlineDate) {
      return;
    }

    const deadlineData = {
      name: selectedItem.student?.name || "",
      dueDate: formData.deadlineDate,

      ...(selectedItem.type === "Thesis"
        ? { thesis: selectedItem._id }
        : { project: selectedItem._id }),
    };

    try {
      const updated = await dispatch(
        createDeadline({
          id: selectedItem._id,
          data: deadlineData,
        }),
      ).unwrap();

      console.log("Deadline response:", updated);

      const updatedItem = updated?.project || updated?.thesis || updated;

      if (updatedItem?._id) {
        await Promise.all([
          dispatch(getAllProjects()),
          dispatch(getAllTheses()),
        ]);
      }

      closeModal();
    } catch (error) {
      console.error("Deadline save error:", error);
    }
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);

    setSelectedItem(null);

    setQuery("");

    setFormData({
      title: "",
      deadlineDate: "",
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Manage Deadlines  header */}
<div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  {/* Top Accent */}
  <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />

  <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      {/* Title */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
          <CalendarDays className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Manage Deadlines
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Create and monitor project and thesis deadlines
          </p>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17a2b8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#138496] hover:shadow-md"
      >
        <CalendarDays className="h-4 w-4" />
        <span>Create or Update Deadline</span>
      </button>

    </div>
  </div>

  {/* Decorative Circles */}
  <div className="pointer-events-none absolute -right-16 -bottom-20 h-52 w-52 rounded-full bg-cyan-100/50 blur-3xl" />

  <div className="pointer-events-none absolute right-16 -bottom-10 h-28 w-28 rounded-full border border-cyan-200/40 bg-cyan-50/30" />

  <div className="pointer-events-none absolute right-8 bottom-8 h-10 w-10 rounded-full bg-teal-400/10" />

  <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-indigo-500/5" />
</div>


        {/* Search Deadlines */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">
          <label className="block mb-2 card-title text-md font-semibold text-[#17a2b8]">
            Search Deadlines
          </label>
          <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-2 border border-slate-200">
            <Search className="w-4 h-4 text-[#17a2b8]" />
            <input
              className="w-full outline-none text-sm"
              placeholder="Search by project, thesis or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Thesis & Project Deadlines table  */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <h2 className="card-title text-md font-semibold text-[#17a2b8]">
              Thesis & Project Deadlines
            </h2>
            {/* Filter Type */}
            <div className="mt-4 md:mt-0 w-full md:w-40">
              <label className="block mb-2 text-sm font-semibold text-[#17a2b8]">
                Filter Type
              </label>

              <select
                className="input-field w-full outline-none p-2 border border-slate-300 rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>

                <option value="Project">Project</option>

                <option value="Thesis">Thesis</option>
              </select>
            </div>
          </div>

          <div
            className="
              w-full
              max-w-full
              overflow-auto
              max-h-[500px]
              [&::-webkit-scrollbar]:w-1.1
              [&::-webkit-scrollbar-track]:bg-slate-100
              [&::-webkit-scrollbar-thumb]:bg-[#b0cbcf]
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb:hover]:bg-[#8fb8be]
            "
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-200 sticky top-0 z-10">
                <tr className="text-[#138496] text-xs font-semibold uppercase">
                  <th className="px-2 py-6">Student</th>

                  <th className="px-2 py-6">Type</th>

                  <th className="px-2 py-6">Thesis/Project Title</th>

                  <th className="px-2 py-6">Supervisor</th>

                  <th className="px-2 py-6">Deadline</th>

                  <th className="px-2 py-6">Updated</th>
                </tr>
              </thead>

              <tbody className="bg-slate-50 divide-y divide-slate-200">
                {paginatedRows.map((row) => (
                  <tr key={`${row.type}-${row._id}`} className="hover:bg-white">
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

                    {/* Type */}
                    <td className="px-2 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.type === "Thesis"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-2 py-4 text-[14px]">{row.title}</td>

                    {/* Supervisor */}
                    <td className="px-2 py-4 whitespace-nowrap">
                      {row.supervisor !== "-" ? (
                        <span
                          className="
                            inline-flex
                            items-center
                            px-2.5
                            py-0.5
                            rounded-full
                            text-xs
                            font-medium
                            bg-green-100
                            text-green-800
                          "
                        >
                          {row.supervisor}
                        </span>
                      ) : (
                        <span
                          className="
                            inline-flex
                            items-center
                            px-2.5
                            py-0.5
                            rounded-full
                            text-xs
                            font-medium
                            bg-red-100
                            text-red-800
                          "
                        >
                          Not Assigned
                        </span>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="px-2 py-4 text-[14px]">
                      {row.deadlineDate}
                    </td>

                    {/* Updated */}
                    <td className="px-2 py-4 text-[14px]">{row.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* pagination  */}
            {filteredRows.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(startIndex + itemsPerPage, filteredRows.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredRows.length}
                  </span>{" "}
                  {filteredRows.length === 1 ? "item" : "items"}
                </p>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      currentPage === 1
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[38px] rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        currentPage === page
                          ? "border-[#17a2b8] bg-[#17a2b8] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      currentPage === totalPages
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#17a2b8] hover:text-[#17a2b8]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* No projects or theses found matching your criteria. */}
          {filteredRows.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No projects or theses found matching your criteria.
            </div>
          )}
        </div>

        {/* showModal */}
        {showModal && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/40
              backdrop-blur-sm
              px-4
              !mt-0
              !pt-0
            "
          >
            <div
              className="
                bg-white
                rounded-2xl
                shadow-2xl
                w-full
                max-w-3xl
                max-h-[90vh]
                overflow-hidden
                flex
                flex-col
              "
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Create or Update Deadline
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a project or thesis student
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="
                    w-8
                    h-8
                    flex
                    items-center
                    justify-center
                    rounded-full
                    hover:bg-slate-100
                    text-slate-500
                    hover:text-slate-700
                    transition
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Project / Thesis Title
                    </label>

                    <input
                      type="text"
                      className="
                        w-full
                        px-4
                        py-2.5
                        border
                        border-slate-300
                        rounded-lg
                        outline-none
                        focus:ring-2
                        focus:ring-[#17a2b8]
                        focus:border-transparent
                        transition
                        shadow-sm
                      "
                      placeholder="Search by project, thesis or student..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedItem(null);

                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                          deadlineDate: "",
                        }));
                      }}
                    />

                    {query.trim() && !selectedItem && (
                      <div
                        className="
                          mt-2
                          border
                          border-slate-200
                          rounded-lg
                          max-h-64
                          overflow-y-auto
                          bg-white
                          shadow-lg
                        "
                      >
                        {searchResults.length > 0 ? (
                          searchResults.map((item) => (
                            <button
                              type="button"
                              key={`${item.type}-${item._id}`}
                              className="
                                w-full
                                text-left
                                px-4
                                py-3
                                hover:bg-slate-50
                                transition
                                border-b
                                last:border-b-0
                              "
                              onClick={() => handleSelectItem(item)}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-medium text-slate-800 truncate">
                                  {item.title || "-"}
                                </div>

                                <span
                                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    item.type === "Thesis"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {item.type}
                                </span>
                              </div>

                              <div className="text-xs text-slate-500 truncate mt-1">
                                {item.student?.name || "-"}
                                {" • "}
                                {item.student?.email || "-"}
                              </div>

                              <div className="text-xs text-slate-400 truncate mt-0.5">
                                Supervisor:{" "}
                                {item.supervisor?.name || "Not Assigned"}
                              </div>
                            </button>
                          ))
                        ) : (
                          // No project or thesis found.
                          <div className="px-4 py-4 text-sm text-slate-500 text-center">
                            No project or thesis found.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* selectedItem */}
                  {selectedItem && (
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            Selected
                          </div>

                          <div className="text-sm font-semibold text-slate-900">
                            {selectedItem.title || "-"}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            selectedItem.type === "Thesis"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {selectedItem.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Student */}
                        <div>
                          <div className="text-xs text-slate-500">Student</div>

                          <div className="text-sm font-medium text-slate-800">
                            {selectedItem.student?.name || "-"}
                          </div>

                          <div className="text-xs text-slate-500">
                            {selectedItem.student?.email || "-"}
                          </div>

                          <div className="text-xs text-slate-500">
                            {selectedItem.student?.department || "-"}
                          </div>
                        </div>

                        {/* Supervisor */}
                        <div>
                          <div className="text-xs text-slate-500">
                            Supervisor
                          </div>

                          <div className="text-sm font-medium text-slate-800">
                            {selectedItem.supervisor?.name || "Not Assigned"}
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <div className="text-xs text-slate-500">Status</div>

                          <div className="text-sm font-medium text-slate-800">
                            {selectedItem.status || "Unknown"}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <div className="text-xs text-slate-500">
                            Description
                          </div>

                          <div
                            className="text-sm text-slate-700 mt-1"
                            title={selectedItem.description || ""}
                          >
                            {(selectedItem.description || "").length > 160
                              ? `${selectedItem.description.slice(0, 160)}...`
                              : selectedItem.description || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Deadline */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Deadline
                    </label>

                    <input
                      type="date"
                      className={`
                        w-full
                        px-4
                        py-2.5
                        border
                        rounded-lg
                        outline-none
                        transition

                        ${
                          !selectedItem
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#17a2b8] focus:border-transparent"
                        }
                      `}
                      disabled={!selectedItem}
                      value={formData.deadlineDate || ""}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          deadlineDate: e.target.value,
                        }));
                      }}
                    />

                    {!selectedItem && (
                      <p className="mt-1 text-xs text-slate-500">
                        Please select a project or thesis first.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!selectedItem || !formData.deadlineDate}
                      className={`
                        btn-primary
                        text-white
                        px-4
                        py-2
                        rounded-md

                        ${
                          !selectedItem || !formData.deadlineDate
                            ? "bg-slate-300 cursor-not-allowed"
                            : "bg-[#17a2b8] hover:bg-[#138496]"
                        }
                      `}
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
