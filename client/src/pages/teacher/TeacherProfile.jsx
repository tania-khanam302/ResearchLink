import React, { useState } from "react";
import { useSelector } from "react-redux";

const TeacherProfile = () => {
  const { authUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Updated teacher profile:", formData);

  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Teacher Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update your profile information
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17a2b8]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17a2b8]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>

            <input
              type="text"
              value={authUser?.role || "Teacher"}
              disabled
              className="w-full px-4 py-3 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="px-5 py-3 bg-[#17a2b8] text-white font-medium rounded-lg hover:bg-[#138496] transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfile;
