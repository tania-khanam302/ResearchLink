import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getAllUsers,
  updateCoAdmin,
  deleteCoAdmin,
} from "../../store/slices/adminSlice";

import { toggleCoAdminModal } from "../../store/slices/popupSlice";
import AddCoAdmin from "../../components/modal/AddCoAdmin";

const ManageCoAdmin = () => {
  const dispatch = useDispatch();

  const { users } = useSelector((state) => state.admin);
  const { isCreateCoAdminModalOpen } = useSelector((state) => state.popup);

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
    return (users || []).filter((u) => u.role?.toLowerCase() === "co-admin");
  }, [users]);

  const filteredAdmins = useMemo(() => {
    return (coAdmins || []).filter((c) =>
      c.name?.toLowerCase()?.includes(search.toLowerCase()),
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
      }),
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

        {/* total co-admins active and inactive co-admins */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <p>Total</p>
            <h2 className="text-xl font-bold">{filteredAdmins.length}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p>Active</p>
            <h2 className="text-xl font-bold text-green-600">
              {
                filteredAdmins.filter(
                  (a) => a.status?.toLowerCase() === "active",
                ).length
              }
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p>Inactive</p>
            <h2 className="text-xl font-bold text-red-500">
              {
                filteredAdmins.filter(
                  (a) => a.status?.toLowerCase() === "inactive",
                ).length
              }
            </h2>
          </div>
        </div>

        {/* Search Co-Admins Section */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">
          <label className="block mb-2 card-title text-md font-semibold text-[#17a2b8]">
            Search Co-Admins
          </label>
          <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-2 border border-slate-200">
            <Search className="w-4 h-4 text-[#17a2b8]" />
            <input
              className="w-full outline-none text-sm"
              placeholder="Search co-admin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Co-Admin list section */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="card-header">
            <h2 className="card-title text-lg font-semibold text-[#17a2b8]">
              Co-Admin List
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100">
                <tr className="text-[#138496] text-xs font-semibold uppercase">
                  <th className="px-6 py-4">Co-Admin Info</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {admin.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-900">
                      {admin.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-900">
                      {admin.department || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Co-Admin
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="text-[#17a2b8] hover:text-blue-900 pe-3"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(admin)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAdmins.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No co-admin found.
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default ManageCoAdmin;
