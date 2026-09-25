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
  const [showExpertise, setShowExpertise] = useState(false);


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
    <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[95vh] flex flex-col overflow-hidden ">

      {/* Add Teacher Header */}
      <div className="card-header rounded-t-lg py-4 px-3 bg-blue-50 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-semibold text-slate-900">
          Add Teacher
        </h3>
        <button
          type="button"
          onClick={() => dispatch(toggleTeacherModal())}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6 text-[#17a2b8]" />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleCreateTeacher}
        className="flex flex-col min-h-0"
      >

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700">
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
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
              placeholder="Enter email"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
              className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
              placeholder="Enter password"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2/3 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
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
              className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
            >
              <option value="" disabled>
                Select Department
              </option>

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

 <div className="relative">
  <label className="block text-sm font-medium text-slate-700">
    Expertise
  </label>

  {/* Dropdown Button */}
  <button
    type="button"
    onClick={() => setShowExpertise(!showExpertise)}
    className="w-full p-2 mt-1 border-b border-slate-400 focus:outline-none flex items-center justify-between text-left"
  >
    <span
      className={
        formData.expertise.length > 0
          ? "text-slate-700"
          : "text-slate-400"
      }
    >
      {formData.expertise.length > 0
        ? `${formData.expertise.length} expertise selected`
        : "Select Expertise"}
    </span>

    <span className="text-slate-500">
      ▼
    </span>
  </button>

  {/* Dropdown Options */}
  {showExpertise && (
    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg p-2">

      {[
        "Machine Learning & Cyber Security",
        "Artificial Intelligence",
        "Computer Networks",
        "Power Systems",
        "Structural Engineering",
      ].map((expertise) => (
        <label
          key={expertise}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={formData.expertise.includes(expertise)}
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({
                  ...formData,
                  expertise: [
                    ...formData.expertise,
                    expertise,
                  ],
                });
              } else {
                setFormData({
                  ...formData,
                  expertise: formData.expertise.filter(
                    (item) => item !== expertise
                  ),
                });
              }
            }}
            className="w-4 h-4 accent-[#17a2b8]"
          />

          <span className="text-sm text-slate-700">
            {expertise}
          </span>
        </label>
      ))}
    </div>
  )}
</div>



          <div>
            <label className="block text-sm font-medium text-slate-700">
              Max Students
            </label>

            <input
              type="number"
              required
              max={10}
              min={1}
              value={formData.maxStudents}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxStudents: e.target.value,
                })
              }
              className="input-field w-full p-2 border-b border-slate-400 focus:outline-none"
            />
          </div>

        </div>

        <div className="shrink-0 sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 flex justify-end space-x-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">

          <button
            type="button"
            onClick={() => dispatch(toggleTeacherModal())}
            className="btn-danger text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 shadow-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 shadow-md"
          >
            Add Teacher
          </button>

        </div>
      </form>
    </div>
  </div>

    </>
  );
};

export default AddTeacher;
