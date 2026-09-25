import { useState } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import { toggleCoAdminModal } from "../../store/slices/popupSlice";
import { createCoAdmin } from "../../store/slices/adminSlice";

const AddCoAdmin = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(createCoAdmin(formData));

    setFormData({
      name: "",
      email: "",
      department: "",
      password: "",
    });

    dispatch(toggleCoAdminModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => dispatch(toggleCoAdminModal())}
      ></div>

      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 animate-fadeIn">
        <div className="bg-white rounded-sm w-full shadow-xl overflow-hidden">

          {/* Header */}
          <div className="card-header rounded-t-lg py-4 px-4 mb-0 bg-blue-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Co-Admin
            </h3>

            <button
              type="button"
              onClick={() => dispatch(toggleCoAdminModal())}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-6 h-6 text-[#17a2b8]" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 mb-2">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
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
                  className="w-full p-2 border-b border-slate-400 focus:outline-none focus:border-[#17a2b8] transition"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
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
                  className="w-full p-2 border-b border-slate-400 focus:outline-none focus:border-[#17a2b8] transition"
                  placeholder="Enter email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full p-2 border-b border-slate-400 focus:outline-none focus:border-[#17a2b8] transition"
                  placeholder="Enter password"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>

                <select
                  required
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department: e.target.value,
                    })
                  }
                  className="w-full p-2 border-b border-slate-400 bg-white focus:outline-none focus:border-[#17a2b8] transition"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science & Engineering">
                    Computer Science & Engineering
                  </option>
                  <option value="Electrical & Electronic Engineering">
                    Electrical & Electronic Engineering
                  </option>
                  <option value="Civil Engineering">
                    Civil Engineering
                  </option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => dispatch(toggleCoAdminModal())}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 font-medium h-11 rounded-md shadow-md transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-11 rounded-md shadow-md transition"
                >
                  Add Co-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCoAdmin;
