import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createStudent, createTeacher } from "../../store/slices/adminSlice";
import {
  toggleStudentModal,
  toggleTeacherModal,
} from "../../store/slices/popupSlice";
import { Eye, EyeOff, X } from "lucide-react";

const AddTeacher = () => {
  const dispatch = useDispatch();
  // showPassword and showConfirmPassword ===================
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    expertise: "",
    maxStudents: 1,
  });

  // add teacher function
  const handleCreateTeacher = (e) => {
    e.preventDefault();
    dispatch(createTeacher(formData));
    setFormData({
      name: "",
      email: "",
      department: "",
      password: "",
      expertise: "",
      maxStudents: 1,
    });
    dispatch(toggleTeacherModal());
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 !mt-0 !pt-0">
        <div className="bg-white rounded-sm w-full max-w-md mx-4 max-h-[90vh] ">
          <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-slate-900">
              {" "}
              
              Add Teacher
            </h3>
            <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="text-slate-400 hover:text-slate-600" // hover:to-slate-600 ঠিক করে hover:text-slate-600 করা হয়েছে
            >
              <X className="w-6 h-6 text-[#17a2b8]" />
            </button>
          </div>

          <div className="p-5 mb-2">
            <form onSubmit={handleCreateTeacher} className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
                  className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
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
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
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
                <label className="block text-sm font-medium text-slate-700">
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
                   <option value="" disabled>
                    Select Department
                  </option>
                  <option value="Computer Science">Computer Science</option>
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
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">
                    Business Administration
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
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
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Software Development">
                    Software Development
                  </option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Computer Networking">
                    Computer Networking
                  </option>
                  <option value="Operating System">Operating System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
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
              <div className="flex justify-end space-x-3 mt-2 pt-1">
                <button
                  type="button"
                  onClick={() => dispatch(toggleTeacherModal())}
                  className="btn-danger text-white px-4 font-medium h-9 rounded-md flex items-center space-x-2 mt-2 md:mt-0 shadow-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-9 rounded-md flex items-center space-x-2 mt-2 md:mt-0 shadow-md"
                >
                  Add Teacher
                </button>
              </div>
        
    </form>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;
