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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

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

  const departments = useMemo(() => {
    return [
      ...new Set(coAdmins.map((admin) => admin.department).filter(Boolean)),
    ];
  }, [coAdmins]);

  const filteredAdmins = useMemo(() => {
    return coAdmins.filter((admin) => {
      const matchesSearch = admin.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || admin.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [coAdmins, search, departmentFilter]);

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter]);

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
      <div className="space-y-6 ">
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

        {/* total co-admins and deaprtment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Co-Admins
                </p>
                <h2 className="text-2xl font-bold text-slate-800 mt-2">
                  {coAdmins.length}
                </h2>
              </div>

              <div className="w-10 h-10 rounded-lg bg-[#17a2b8]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#17a2b8]" />
              </div>
            </div>
          </div>

          {/* Total Departments */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Departments
                </p>

                <h2 className="text-2xl font-bold text-slate-800 mt-2">
                  {departments.length}
                </h2>
              </div>

              <div className="w-10 h-10 rounded-lg bg-[#138496]/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#138496]" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Co-Admins Section */}
        <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#17a2b8]">
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

            {/* Department Filter */}
            <div>
              <label className="block mb-2 text-md font-semibold text-[#17a2b8]">
                Filter by Department
              </label>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="
          w-full
          p-3
          text-sm
          bg-white
          border
          border-slate-200
          rounded-xl
          outline-none
          shadow-sm
          focus:border-[#17a2b8]
          focus:ring-1
          focus:ring-[#17a2b8]
          transition
        "
              >
                <option value="all">All Departments</option>

                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
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
                {paginatedAdmins.map((admin) => (
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

            {filteredAdmins.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(startIndex + itemsPerPage, filteredAdmins.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredAdmins.length}
                  </span>{" "}
                  co-admins
                </p>

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

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[38px] rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        currentPage === page
                          ? "border-[#17a2b8] bg-[#17a2b8] text-white"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            {/* overlay*/}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-40"></div>

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
