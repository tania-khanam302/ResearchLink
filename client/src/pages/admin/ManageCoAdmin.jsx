import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, UserPlus, Search, ShieldCheck, X, AlertTriangle } from "lucide-react";
import {
  getAllUsers,
  updateCoAdmin,
  deleteCoAdmin,
} from "../../store/slices/adminSlice";

// import { toggleCoAdminModal } from "../../store/slices/popupSlice";
// import AddCoAdmin from "../../components/modal/AddCoAdmin";

const ManageCoAdmin = () => {
  const dispatch = useDispatch();

  const { users } = useSelector((state) => state.admin);
  const { isCreateCoAdminModalOpen } = useSelector(
  (state) => state.popup
);

  const [search, setSearch] = useState("");
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
  dispatch(getAllUsers());
}, [dispatch]);
const coAdmins = useMemo(() => {
  return (users || []).filter(
    (u) => u.role?.toLowerCase() === "co-admin"
  );
}, [users]);

  const filteredAdmins = useMemo(() => {
  return (coAdmins || []).filter((c) =>
    c.name?.toLowerCase()?.includes(search.toLowerCase())
  );
}, [coAdmins, search]);

  // edit
  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      department: admin.department,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const result = await dispatch(
    updateCoAdmin({
      id: editingAdmin._id,
      data: formData,
    })
  );

  if (updateCoAdmin.fulfilled.match(result)) {
    setEditingAdmin(null);
  }
};

  // delete
  const handleDelete = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(deleteCoAdmin(adminToDelete._id));
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };


  return (
    <>
    
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* header section  */}
      <div className="card shadow-lg rounded-md">
        <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
              Manage Co-Admins
            </h1>
            <p className="card-subtitle text-[#17a2b8]">
              Add, edit and manage co-admin accounts
            </p>
          </div>
      
          <button
            onClick={() => dispatch(toggleCoAdminModal())}
            className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add New Co-Admin</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ManageCoAdmin;