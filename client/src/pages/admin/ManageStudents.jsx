import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import {
  createStudent,
  deleteStudent,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";

import {
  AlertTriangle,
  CheckCircle,
  Plus,
  TriangleAlert,
  Users,UserPlus,
  X,
} from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // students get
  const students = useMemo(() => {
    const studentUsers = (users || []).filter(
      (u) => u.role?.toLowerCase() === "student",
    );

    return studentUsers.map((student) => {
      // const studentProject = (projects || []).find(
      //   (p) => p.student === student._id,
      // );
      // return {
      //   ...student,
      //   projectTitle: studentProject?.title || null,
      //   supervisor: studentProject?.supervisor || null,
      //   projectStatus: studentProject?.status || null,
      // };
      const studentProject = (projects || []).find(
  (p) =>
    p.student?._id === student._id ||
    p.student === student._id
);

return {
  ...student,
  projectTitle: studentProject?.title || "No Project",
  supervisor:
    studentProject?.supervisor?._id ||
    studentProject?.supervisor ||
    null,
  projectStatus: studentProject?.status || null,
};
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set(
      (students || []).map((s) => s.department).filter(Boolean),
    );
    return Array.from(set);
  }, [students]);

  // search and filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterDepartment === "all" || student.department === filterDepartment;
      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, filterDepartment]); 

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    }   
    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
    });
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <>
      <div className="space-y-6 bg-[url('/bg.jpg')] bg-auto bg-repeat bg-fixed">
        {/*header */}
        <div className="card shadow-lg rounded-md">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
                Manage Students
              </h1>
              <p className="card-subtitle text-[#17a2b8]">
                Add, edit, and manage student accounts
              </p>
            </div>
            <button
              onClick={() => dispatch(toggleStudentModal())}
              className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add New Student</span>
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
                  Total Students
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card shadow-lg rounded-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Completed Projects
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.filter((s) => s.projectStatus === "completed").length}
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
                <p className="text-sm font-medium text-slate-600">Unassigned</p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.filter((s) => !s.supervisor).length}
                </p>
              </div>
            </div>
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

        {/* Students List */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="card-header">
            <h2 className="card-title text-[20px] font-semibold text-[#17a2b8]">
              Students List
            </h2>
          </div> 
          <div className="w-full max-w-full overflow-auto max-h-[500px]
          
      [&::-webkit-scrollbar]:w-1.5
      [&::-webkit-scrollbar-track]:bg-slate-100
      [&::-webkit-scrollbar-thumb]:bg-[#b0cbcf]
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb:hover]:bg-[#8fb8be]">
            {filteredStudents && filteredStudents.length > 0 ? ( 
      <table className="min-w-auto w-full text-left border-collapse">
        <thead className="bg-slate-200 sticky top-0 z-10">
              <tr className="text-[#138496] text-[12px] font-semibold uppercase">
                <th className="px-2 py-6">Student Info</th>
                <th className="px-2 py-6">Department & Year</th>
                <th className="px-2 py-6">Supervisor</th>
                <th className="px-2 py-6">Project / Thesis Title</th>
                <th className="px-2 py-6">Action</th>
              </tr>
            </thead>
                <tbody className=" bg-slate-50 divide-y divide-slate-200">
                  {filteredStudents.map((student) => {
                    return (
                      <tr key={student._id} className="hover:bg-white">
                        {/* student info  */}
                        <td className="px-2 py-6 font-xl">
                          <div>
                            <div className="text-[16px] font-medium text-slate-900">
                              {student.name}
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {student.email}
                            </div>
                          </div>
                        </td>

{/* department  */}
                        <td className="px-2 py-4 whitespace-nowrapp">
                          <div className="text-[16px] text-slate-900">
                            {student.department || "-"}
                          </div>

                          <div className="text-sm text-slate-500">
                            {student.createdAt
                              ? new Date(student.createdAt).getFullYear()
                              : "-"}
                          </div>
                        </td>

{/* supervisor  */}
                        <td className="px-2 py-4 whitespace-nowrapp text-center">
                          {student.supervisor ? (
                            <span className="inline-flex flex-wrap items-center px-2 py-0.9 rounded-full text-center w-[130px] text-green-800 bg-gray-200 text-[14px] font-medium">
                            
                                {users?.find(
                                  (u)=>u._id === student?.supervisor
                                )?.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                              {student.projectStatus === "rejected"
                                ? "Rejected"
                                : "Not Assigned"}
                            </span>
                          )}
                        </td>

{/* project title */}
                        <td className="px-2 py-4">
                          <div className="text-[16px] text-slate-900">
                            {student.projectTitle}
                          </div>
                          
                        </td>

                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-[#17a2b8] hover:text-blue-900 pe-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
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
              filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No students found matching your criteria.
                </div>
              )
            )}
          </div>
          {/* edit student model */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-sm w-full max-w-md mx-4">
                <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900 ">
                    Edit Student
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">
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

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="btn-danger text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn-secondary bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                      >
                        Update Student
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* delete student */}
          {showDeleteModal && studentToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="card bg-white rounded-sm w-full max-w-md mx-4 shadow-xl">
                <div className="grid items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className=" w-6 h-6 text-red-600" />
                  </div>

                  <div className="text-center ">
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Delete Student
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Are you sure you want to delete this student{" "}
                      <span>
                        {studentToDelete.name}? This action cannot be undone.
                      </span>
                    </p>

                    {/* stdent name font bold */}
                    {/* <p className="text-sm text-slate-500 mb-4">Are you sure you want to delete this student
                      {" "} <span  className="font-bold text-slate-700">{studentToDelete.name}? </span>This action cannot be undone.
                    </p> */}
                    {/* <p>Are you sure you want to delete</p> */}

                    <div className="flex justify-center space-x-3">
                      <button onClick={cancelDelete} className="btn-secondary text-white px-4 font-medium h-11 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md">
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
          {isCreateStudentModalOpen && <AddStudent />}
        </div>
      </div>
    </>
  );
};
export default ManageStudents;

