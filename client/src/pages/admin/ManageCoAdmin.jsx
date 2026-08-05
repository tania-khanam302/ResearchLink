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

        {/* edit co-admin model */}
        {editingAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            {/* overlay*/}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-40"></div>

            <div className="relative inset-0 z-50 w-full max-w-md mx-4 animate-fadeIn">
              <div className="bg-white rounded-sm w-full max-w-md mx-4">
                <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit Co-Admin
                  </h3>

                  <button
                    onClick={() => setEditingAdmin(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6 text-[#17a2b8]" />
                  </button>
                </div>

                <div className="p-6 mb-2">
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
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border-b border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email
                      </label>

                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-2 border-b border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Department
                      </label>

                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        className="w-full p-2 border-b border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingAdmin(null)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 font-medium h-11 rounded-md shadow-md"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-11 rounded-md shadow-md"
                      >
                        Update Co-Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* show and delete */}
        {showDeleteModal && adminToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* overlay*/}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

            <div className="relative inset-0 z-50 w-full max-w-md mx-4 animate-fadeIn">
              <div className="card bg-white rounded-sm w-full max-w-md mx-4 shadow-xl">
                <div className="grid items-center mb-4 p-6">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Delete Co-Admin
                    </h3>

                    <p className="text-sm text-slate-500 mb-4">
                      Are you sure you want to delete this co-admin{" "}
                      <span className="font-semibold">
                        {adminToDelete.name}
                      </span>
                      ? This action cannot be undone.
                    </p>

                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setAdminToDelete(null);
                        }}
                        className="bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-11 rounded-md shadow-md"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={confirmDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 font-medium h-11 rounded-md shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* add model */}
        {isCreateCoAdminModalOpen && <AddCoAdmin />}
      </div>
    </>
  );
};

export default ManageCoAdmin;
