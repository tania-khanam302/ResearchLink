import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";
import { deleteTeacher, getAllUsers, updateTeacher } from "../../store/slices/adminSlice";
import { AlertTriangle, BadgeCheck, Plus, TriangleAlert, Users, X } from "lucide-react";
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

  // NOTE ata remove kore dite hobe 
  // useEffect(() => {
  //   dispatch(getAllUsers());
  // }, [dispatch]);

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
      </div>
    </>
  );
};

export default ManageTeachers;
