import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ExternalLink,
  Link2,
  Search,
  FolderOpen,
  Users,
  FileText,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAssignedStudents } from "../../store/slices/teacherSlice";
import TeacherPageHeader from "../../components/PageHeader/TeacherPageHeader";

const TeacherResearchLink = () => {
  const dispatch = useDispatch();

  const { assignedStudents = [] } = useSelector(
    (state) => state.teacher
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Student card pagination
  const [studentPage, setStudentPage] = useState(1);

  // Link pagination for each student
  const [linkPages, setLinkPages] = useState({});

  // Pagination settings
  const studentsPerPage = 3;
  const linksPerPage = 5;

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  // Reset student page when search/filter changes
  useEffect(() => {
    setStudentPage(1);
  }, [search, typeFilter]);

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return assignedStudents.filter((student) => {
      const work = student.thesis || student.project;

      if (!work) return false;

      const type = student.thesis ? "Thesis" : "Project";

      const matchesType =
        typeFilter === "All" || type === typeFilter;

      const matchesSearch =
        !query ||
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        work.title?.toLowerCase().includes(query) ||
        work.resourceLinks?.some((link) =>
          link.url?.toLowerCase().includes(query)
        );

      return matchesType && matchesSearch;
    });
  }, [assignedStudents, search, typeFilter]);

  // -----------------------------
  // Student Pagination
  // -----------------------------

  const totalStudentPages = Math.ceil(
    filteredStudents.length / studentsPerPage
  );

  const studentStartIndex =
    (studentPage - 1) * studentsPerPage;

  const paginatedStudents = filteredStudents.slice(
    studentStartIndex,
    studentStartIndex + studentsPerPage
  );

  // -----------------------------
  // Link Pagination
  // -----------------------------

  const getCurrentLinkPage = (studentId) => {
    return linkPages[studentId] || 1;
  };

  const handleLinkPageChange = (studentId, page) => {
    setLinkPages((prev) => ({
      ...prev,
      [studentId]: page,
    }));
  };

  const getPaginatedLinks = (studentId, links) => {
    const currentPage = getCurrentLinkPage(studentId);

    const startIndex =
      (currentPage - 1) * linksPerPage;

    return links.slice(
      startIndex,
      startIndex + linksPerPage
    );
  };

  const getTotalLinkPages = (links) => {
    return Math.ceil(links.length / linksPerPage);
  };

  // -----------------------------
  // Stats
  // -----------------------------

  const totalLinks = assignedStudents.reduce((total, student) => {
    const work = student.thesis || student.project;

    return total + (work?.resourceLinks?.length || 0);
  }, 0);

  const totalThesis = assignedStudents.filter(
    (student) => student.thesis
  ).length;

  const totalProjects = assignedStudents.filter(
    (student) => student.project
  ).length;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">

      {/* header and search*/}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
{/* research links header  */}
    <TeacherPageHeader
  icon={Link2}
  title="Research Links"
  description="Review research resources shared by your assigned students."
/>

        {/* Search */}
        <div className="p-6 sm:p-8">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, thesis/project or link..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-[#17a2b8] focus:ring-2 focus:ring-[#17a2b8]/10"
              />

            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#17a2b8]"
            >
              <option value="All">All Types</option>
              <option value="Thesis">Thesis</option>
              <option value="Project">Project</option>
            </select>

          </div>

        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="Students"
          value={assignedStudents.length}
          color="cyan"
        />

        <StatCard
          icon={<Link2 className="h-6 w-6" />}
          title="Research Links"
          value={totalLinks}
          color="indigo"
        />

        <StatCard
          icon={<FileText className="h-6 w-6" />}
          title="Thesis"
          value={totalThesis}
          color="purple"
        />

        <StatCard
          icon={<BriefcaseBusiness className="h-6 w-6" />}
          title="Projects"
          value={totalProjects}
          color="emerald"
        />

      </div>

      {/* Student Research Links */}
      <div className="space-y-5">

        {filteredStudents.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50">
              <Link2 className="h-8 w-8 text-[#17a2b8]" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              No Research Links Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No research resources match your current search or filter.
            </p>

          </div>

        ) : (

          <>
            {paginatedStudents.map((student) => {

              const work =
                student.thesis || student.project;

              const links =
                work?.resourceLinks || [];

              const type =
                student.thesis ? "Thesis" : "Project";

              const currentLinkPage =
                getCurrentLinkPage(student._id);

              const totalLinkPages =
                getTotalLinkPages(links);

              const paginatedLinks =
                getPaginatedLinks(student._id, links);

              return (
                <div
                  key={student._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/30"
                >

                  {/* Student Header */}
                  <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/60 via-white to-slate-50 px-6 py-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#17a2b8]/10 text-[#138496] font-bold">
                          {student.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                          }
                        </div>

                        <div>

                          <h2 className="font-bold text-slate-800">
                            {student.name}
                          </h2>

                          <p className="text-sm text-slate-500">
                            {student.email}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                          type === "Thesis"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {type}
                      </span>

                    </div>

                    <div className="mt-4">

                      <h3 className="font-semibold text-slate-800">
                        {work.title}
                      </h3>

                    </div>

                  </div>

                  {/* Links */}
                  <div className="p-6">

                    {links.length === 0 ? (

                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center">

                        <FolderOpen className="mx-auto h-8 w-8 text-slate-300" />

                        <p className="mt-3 text-sm font-medium text-slate-500">
                          No research links added yet.
                        </p>

                      </div>

                    ) : (

                      <>
                        <div className="space-y-3">

                          {paginatedLinks.map((link) => (

                            <div
                              key={link._id}
                              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                            >

                              <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50">
                                  <ExternalLink className="h-5 w-5 text-[#17a2b8]" />
                                </div>

                                <div className="min-w-0">

                            <p className="text-sm font-semibold text-slate-700">
  {link.name || link.title || "Research Resource"}
</p>

<p className="mt-1 break-all text-xs text-slate-400">
  {link.url}
</p>

                                </div>

                              </div>

                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#17a2b8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#138496]"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open Link
                              </a>

                            </div>

                          ))}

                        </div>

                        {/* Link Pagination */}
                        {totalLinkPages > 1 && (
                          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm text-slate-500">
                              Showing{" "}
                              <span className="font-semibold text-slate-700">
                                {(currentLinkPage - 1) * linksPerPage + 1}
                              </span>
                              {" - "}
                              <span className="font-semibold text-slate-700">
                                {Math.min(
                                  currentLinkPage * linksPerPage,
                                  links.length
                                )}
                              </span>
                              {" of "}
                              <span className="font-semibold text-slate-700">
                                {links.length}
                              </span>
                              {" links"}
                            </p>

                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                disabled={currentLinkPage === 1}
                                onClick={() =>
                                  handleLinkPageChange(
                                    student._id,
                                    currentLinkPage - 1
                                  )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#17a2b8] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>

                              {Array.from(
                                { length: totalLinkPages },
                                (_, index) => index + 1
                              ).map((page) => (

                                <button
                                  key={page}
                                  type="button"
                                  onClick={() =>
                                    handleLinkPageChange(
                                      student._id,
                                      page
                                    )
                                  }
                                  className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                                    currentLinkPage === page
                                      ? "bg-[#17a2b8] text-white"
                                      : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#17a2b8]"
                                  }`}
                                >
                                  {page}
                                </button>

                              ))}

                              <button
                                type="button"
                                disabled={
                                  currentLinkPage === totalLinkPages
                                }
                                onClick={() =>
                                  handleLinkPageChange(
                                    student._id,
                                    currentLinkPage + 1
                                  )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#17a2b8] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>

                            </div>

                          </div>
                        )}

                      </>

                    )}

                  </div>

                </div>
              );
            })}

            {/* Student Card Pagination */}
            {totalStudentPages > 1 && (
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/30 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {studentStartIndex + 1}
                  </span>
                  {" - "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      studentStartIndex + studentsPerPage,
                      filteredStudents.length
                    )}
                  </span>
                  {" of "}
                  <span className="font-semibold text-slate-700">
                    {filteredStudents.length}
                  </span>
                  {" students"}
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={studentPage === 1}
                    onClick={() =>
                      setStudentPage((prev) => prev - 1)
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#17a2b8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from(
                    { length: totalStudentPages },
                    (_, index) => index + 1
                  ).map((page) => (

                    <button
                      key={page}
                      type="button"
                      onClick={() => setStudentPage(page)}
                      className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
                        studentPage === page
                          ? "bg-[#17a2b8] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#17a2b8]"
                      }`}
                    >
                      {page}
                    </button>

                  ))}

                  <button
                    type="button"
                    disabled={studentPage === totalStudentPages}
                    onClick={() =>
                      setStudentPage((prev) => prev + 1)
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#17a2b8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                </div>

              </div>
            )}

          </>

        )}

      </div>

    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  color,
}) => {

  const colors = {
    cyan: "bg-cyan-50 text-cyan-600",
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/30">

      <div className="flex items-center gap-4">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};

export default TeacherResearchLink;
