import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";
import { deleteTeacher, getAllUsers, updateTeacher } from "../../store/slices/adminSlice";
import { AlertTriangle, BadgeCheck, Plus, TriangleAlert, UserPlus, Users, X } from "lucide-react";
import { toggleTeacherModal } from "../../store/slices/popupSlice";

const ManageTeachers = () => {
  const { users } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    expertise: "",
    maxStudents: 10,
  });

  const dispatch = useDispatch();

  // teachers get
  const teachers = useMemo(() => {
    return (users || []).filter((u) => u.role?.toLowerCase() === "teacher");
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set(
      (teachers || []).map((t) => t.department).filter(Boolean),
    );
    return Array.from(set);
  }, [teachers]);

  // filter teachers [akhane chane kora hoyeche]
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterDepartment === "all" || teacher.department === filterDepartment;
      return matchesSearch && matchesFilter;
    });
  }, [teachers, searchTerm, filterDepartment]);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      expertise: "",
      maxStudents: 10,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTeacher) {
      dispatch(updateTeacher({ id: editingTeacher._id, data: formData }));
    }
    handleCloseModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      expertise: Array.isArray(teacher.expertise)
        ? teacher.expertise[0]
        : teacher.expertise,
      maxStudents:
        typeof teacher.maxStudents === "number" ? teacher.maxStudents : 10,
    });
    setShowModal(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete._id));
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  return (
    <>
    <div className="space-y-6 bg-[url('/bg.jpg')] bg-auto bg-repeat bg-fixed">
        {/*header */}
        <div className="card shadow-lg rounded-md">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
                Manage Teachers
              </h1>
              <p className="card-subtitle text-[#17a2b8]">
                Add, edit, and manage teacher accounts
              </p>
            </div>
            <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add New Teacher</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card shadow-lg rounded-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-[#17a2b8]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Teachers
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card shadow-lg rounded-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BadgeCheck className="w-6 h-6 text-purple-600" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Assigned Student
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.reduce(
                    (sum, t) => sum + (t.assignedStudents?.length || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="card shadow-lg rounded-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TriangleAlert className="w-6 h-6 text-yellow-600" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Departments
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {departments.length} 
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)] flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-2 card-title text-md font-semibold text-[#17a2b8]">
              Search Teachers
            </label>

            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-field outline-none p-1 border border-slate-300 w-[250px] "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block mb-2 text-md font-semibold text-[#17a2b8]">
              Filter Department
            </label>
            <select
              className="input-field w-full outline-none p-1 border border-slate-300"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option value={dept} key={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Teachers table */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="card-header">
            <h2 className="card-title text-lg font-semibold text-[#17a2b8]">
              Teachers List
            </h2>
          </div>
          <div className="overflow-x-auto">
            {filteredTeachers && filteredTeachers.length > 0 ? (
              <table className="w-full text-left border-collapse overflow-x-hidden">
                <thead className="bg-slate-100">
                  <tr className=" text-[#138496] text-xs font-semibold uppercase">
                    <th className="px-6 py-3 text-left tracking-wide">
                      Teacher Info
                    </th>
                    <th className="px-6 py-5 text-left ">E-mail</th>
                    <th className="px-6 py-5 text-left ">Department</th>
                    <th className="px-6 py-5 text-left ">Expertise</th>
                    <th className="px-6 py-5 text-left ">Join Date</th>
                    <th className="px-6 py-5 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTeachers.map((teacher) => {
                    return (
                      <tr key={teacher._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {teacher.name}
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {teacher.email}
                            </div>
                          </div>
                        </td>

                        {/* extra */}
                        <td className="text-sm  text-slate-900">
                          {teacher.email}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrapp">
                          <div className="text-sm text-slate-900">
                            {teacher.department || "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrapp">
                          {Array.isArray(teacher.expertise)
                            ? teacher.expertise.join(", ")
                            : teacher.expertise}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">
                            {teacher.createdAt
                              ? new Date(teacher.createdAt).toLocaleString()
                              : "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-[#17a2b8] hover:text-blue-900 pe-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No teachers found matching your criteria.
                </div>
              )
            )}
          </div>
          {/* edit teacher model */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-sm w-full max-w-md mx-4">
                <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900 ">
                    Edit Teacher
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:to-slate-600"
                  >
                    <X className="w-6 h-6 text-[#17a2b8]" />
                  </button>
                </div>

                <div className="p-6  mb-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="input-feild w-full p-2 border-b border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input-feild w-full p-2 border-b border-slate-400 focus:outline-none"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Department
                      </label>

                      <select
                        className="input-feild w-full p-2 border-b border-slate-400 focus:outline-none"
                        required
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                      >
                        <option value="Select Department">
                          Select Department
                        </option>
                        <option value="Computer Science">
                          Computer Science
                        </option>
                        <option value="Software Engineering">
                          Software Engineering
                        </option>
                        <option value="Information Technology">
                          Information Technology
                        </option>
                        <option value="Data Science">Data Science</option>
                        <option value="Electrical Engineering">
                          Electrical Engineering
                        </option>
                        <option value="Mechanical Engineering">
                          Mechanical Engineering
                        </option>
                        <option value="Civil Engineering">
                          Civil Engineering
                        </option>
                        <option value="Business Administration">
                          Business Administration
                        </option>
                      </select>
                    </div>

                    {/* expertise */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Expertise
                      </label>

                      <select
                        className="input-feild w-full p-2 border-b border-slate-400 focus:outline-none"
                        required
                        value={formData.expertise}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expertise: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Expertise</option>
                        <option value="Artificial Intelligence">
                          Artificial Intelligence
                        </option>
                        <option value="Machine Learning">
                          Machine Learning
                        </option>
                        <option value="Data Science">Data Science</option>
                        <option value="Software Development">
                          Software Development
                        </option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Computer Networking">
                          Computer Networking
                        </option>
                        <option value="Operating System">
                          Operating System
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Max Students
                      </label>
                      <input
                        type="number"
                        required
                        // min 1 and max 10 for student
                        max={10}
                        min={1}
                        value={formData.maxStudents}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxStudents: e.target.value,
                          })
                        }
                        className="input-feild w-full p-2 border-b border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="btn-danger text-white px-4 font-medium h-11 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                        // className="px-4 py-2 border rounded text-slate-600"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn-secondary bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-11 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                      >
                        Update Teacher
                      </button>
                      {/* <button type="submit" onClick={handleCloseModal} className="
                      btn-secondary">Update Teacher</button> */}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* delete teacher */}
          {showDeleteModal && teacherToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="card bg-white rounded-sm w-full max-w-md mx-4 shadow-xl">
                <div className="grid items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className=" w-6 h-6 text-red-600" />
                  </div>

                  <div className="text-center ">
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Delete Teacher
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Are you sure you want to delete this teacher{" "}
                      <span>
                        {teacherToDelete.name}? This action cannot be undone.
                      </span>
                    </p>

                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={cancelDelete}
                        className="btn-secondary text-white px-4 font-medium h-11 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                      >
                        Cancel
                      </button>
                      {/* btn-danger  */}
                      <button
                        onClick={confirmDelete}
                        className="py-2 bg-red-500 text-white hover:bg-red-600 px-4 font-medium h-11 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Student Modal */}
          {isCreateTeacherModalOpen && <AddTeacher />}
        </div>
      </div>


    </>
  );
};

export default ManageTeachers;
