import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";
const ManageCoAdmin = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header replace  */}

      <div className="card bg-white shadow-lg rounded-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
              Manage Co-Admins
            </h1>
            <p className="card-subtitle text-[#17a2b8]">
              Add, edit and manage co-admin accounts
            </p>
          </div>

          <button className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0">
            <UserPlus className="w-5 h-5" />
            <span>Add New Co-Admin</span>
          </button>
        </div>
      </div>

      {/* Add New Co-Admin */}
      {/* <div className="fixed inset-0 z-50 flex items-center justify-center ">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-40"></div>
        <div className="relative inset-0 z-50 w-full max-w-md mx-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#138496] to-[#17a2b8]">
              <h3 className="text-white text-lg font-semibold">Add Co-Admin</h3>
              <button className="text-white hover:text-red-200 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="p-5 space-y-4">
              <div>
                <label className="text-sm text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-[#17a2b8] outline-none"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input
                  type="email"
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-[#17a2b8] outline-none"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Password</label>
                <input
                  type="password"
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-[#17a2b8] outline-none"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Department</label>
                <select
                  required
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
      </div> */}
      {/* Stats*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card shadow-lg rounded-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-[#17a2b8]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">
                Total Co-Admins
              </p>
              <p className="text-lg font-semibold text-slate-800"></p>
            </div>
          </div>
        </div>

        <div className="card shadow-lg rounded-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>

            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active</p>
              <p className="text-lg font-semibold text-slate-800"></p>
            </div>
          </div>
        </div>

        <div className="card shadow-lg rounded-md">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-red-600" />
            </div>

            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Inactive</p>
              <p className="text-lg font-semibold text-slate-800"></p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section Replace */}
      <div className="card bg-white rounded-md shadow-[0_0.5rem_2rem_rgba(0,0,0,0.15)]">
        <label className="block mb-2 card-title text-md font-semibold text-[#17a2b8]">
          Search Co-Admins
        </label>

        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-2 border border-slate-200">
          <Search className="w-4 h-4 text-[#17a2b8]" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Search co-admin..."
          />
        </div>
      </div>

      {/* Co-Admin List */}
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
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">
                    Yasmin Akter
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-900">
                  yasmin@gmail.com
                </td>

                <td className="px-6 py-4 text-sm text-slate-900">
                  Computer Science
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Co-Admin
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[#17a2b8] hover:text-blue-900 pe-3">
                    Edit
                  </button>

                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          {/* No co-admin found. */}
          <div className="text-center py-8 text-slate-500">
            No co-admin found.
          </div>
        </div>
      </div>

      {/* overly Edit Co-Admin*/}
      {/* <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-40"></div>
      <div className="relative inset-0 z-50 w-full max-w-md mx-4 animate-fadeIn">
        <div className="bg-white rounded-sm w-full max-w-md mx-4"> 
          <div className="card-header rounded-t-lg py-4 p-3 mb-0 bg-blue-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">
              Edit Co-Admin
            </h3>
    
            <button
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6 text-[#17a2b8]" />
            </button>
          </div>
    
          <div className="p-6 mb-2">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
    
                <input
                  type="text"
                  required
                
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
               
                  className="w-full p-2 border-b border-slate-400 focus:outline-none"
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
    
                <input
                  type="text"
               
                  className="w-full p-2 border-b border-slate-400 focus:outline-none"
                />
              </div>
    
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
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
      </div> */}

      {/* overly Delete Co-Admin*/}
      {/* <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                Are you sure you want to delete this co-admin
                <span className="font-semibold">
                </span>
                ? This action cannot be undone.
              </p>
    
              <div className="flex justify-center space-x-3">
                <button
                  className="bg-[#138496] hover:bg-[#17a2b8] text-white px-4 font-medium h-11 rounded-md shadow-md"
                >
                  Cancel
                </button>
    
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 font-medium h-11 rounded-md shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div> */}
    </div>
  );
};

export default ManageCoAdmin;
