import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createStudent } from "../../store/slices/adminSlice";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import { Eye, EyeOff, X } from "lucide-react";

const AddStudent = () => {


  const dispatch = useDispatch();
  // showPassword and showConfirmPassword ===================
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  });

    // add student function
  const handleCreateStudent = (e) => {
    e.preventDefault(); 
    dispatch(createStudent(formData));
    setFormData({
      name: "",
      email: "",
      department: "",
      password: "",
    });
    dispatch(toggleStudentModal());
  };

  return (
 <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-sm w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Student
            </h3>
            <button
              onClick={() => dispatch(toggleStudentModal())}
              className="text-slate-400 hover:text-slate-600" 
            >
              <X className="w-6 h-6 text-[#17a2b8]" />
            </button>
          </div>

          <div className="p-6 mb-2">
            <form onSubmit={handleCreateStudent} className="space-y-4">
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
                  className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
                  placeholder="Enter student full name"
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
                  className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
                  placeholder="Enter student email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input-field w-full p-2 border-b border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8] pr-10"
                  //   className={`input w-full focus:ring-1 focus:ring-[#17a2b8] pr-10 ${
                  //   errors.password ? "input-error" : ""
                  // }`}
                  placeholder="Enter password"
                />
                   <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>

                <select
                  className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
                  required
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department: e.target.value,
                    })
                  }
                >
                  {/* ব্যবহারকারীকে বাধ্য করতে একটি ডিফল্ট ফাঁকা অপশন যোগ করা হয়েছে */}
                  <option value="" disabled>Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => dispatch(toggleStudentModal())}
                  className="btn-danger text-white px-4 font-medium h-11 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-11 rounded-md flex items-center space-x-2 mt-4 md:mt-0 shadow-md"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddStudent;
