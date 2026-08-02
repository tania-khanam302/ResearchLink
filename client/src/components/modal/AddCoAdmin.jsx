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

  // submit
  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(createCoAdmin(formData));

    // reset and colsed close modal
    setFormData({
      name: "",
      email: "",
      department: "",
      password: "",
    });

    dispatch(toggleCoAdminModal());
  };

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-40"></div>
     
      <div className="relative inset-0 z-50 w-full max-w-md mx-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* header section */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#138496] to-[#17a2b8]">
            <h3 className="text-white text-lg font-semibold">Add Co-Admin</h3>
            <button
              onClick={() => dispatch(toggleCoAdminModal())}
              className="text-white hover:text-red-200 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-[#17a2b8] outline-none"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-[#17a2b8] outline-none"
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-600">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-[#17a2b8] outline-none"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-600">Department</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-[#17a2b8] outline-none"
                >
                  <option value="">Select Department</option>
                  <option>Computer Science</option>
                  <option>Software Engineering</option>
                  <option>Information Technology</option>
                  <option>Data Science</option>
                  <option>Electrical Engineering</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => dispatch(toggleCoAdminModal())}
                  // className="px-4 py-2 bg-gray-400 text-white rounded"
                  className="h-11 px-6 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium
                hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200
                active:scale-95"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  
                  className="h-11 px-6 rounded-xl text-white font-semibold
              bg-gradient-to-r from-[#0f8a9d] via-[#17a2b8] to-[#0f8a9d]
               bg-[length:200%_100%] bg-left hover:bg-right
               shadow-md hover:shadow-lg transition-all duration-300
               active:scale-95"
                  >
                  Add Co-Admin
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>

  );
};

export default AddCoAdmin;
