import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AtSign,
  BookOpen,
  Building2,
  Camera,
  CalendarDays,
  Phone,
  Eye,
  EyeOff,
  IdCard,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  Mars,
  Save,
  UserRound,
} from "lucide-react";
import { changePassword, updateProfile, uploadProfilePicture } from "../../store/slices/authSlice";

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { authUser, isUpdatingPassword, isUpdatingProfile } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState({
    name: authUser?.name || "",
    studentId: authUser?.studentId || "",
    email: authUser?.email || "",
    contact: authUser?.contact || "",
    gender: authUser?.gender || "",
    department: authUser?.department || "",
    semester: authUser?.semester || "",
    year: authUser?.year || "",
    type: authUser?.type || "Project",
  });
  const [showPasswords, setShowPasswords] = useState({});
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await dispatch(uploadProfilePicture(file)).unwrap();
    event.target.value = "";
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    await dispatch(updateProfile(profileData)).unwrap();
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await dispatch(changePassword(passwords)).unwrap();
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const togglePassword = (name) => {
    setShowPasswords((previous) => ({ ...previous, [name]: !previous[name] }));
  };

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500" />
        <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div className="relative h-16 w-16 shrink-0">
            {authUser?.profilePicture ? (
              <img src={authUser.profilePicture} alt="Student profile" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-cyan-200" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                <UserRound className="h-8 w-8" />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-cyan-600 text-white shadow-md transition hover:bg-cyan-700" title="Add profile picture">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePictureChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Student Account</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {authUser?.name || "Student Profile"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">View your academic information and manage account security.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600"><GraduationCap className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Student Information</h2>
            <p className="mt-1 text-sm text-slate-500">Your registered academic details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Student ID</label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="studentId"
                value={profileData.studentId}
                onChange={handleProfileChange}
                placeholder="Enter your Student ID"
                className="input w-full pl-10 placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
              />
            </div>
          </div>

          {[
            ["name", "Name", "text", UserRound],
            ["email", "Email", "email", AtSign],
          ].map(([name, label, type, Icon]) => (
            <div key={name}>
              <label className="label">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required={name === "name" || name === "email"}
                  type={type}
                  name={name}
                  value={profileData[name]}
                  onChange={handleProfileChange}
                  className={`input w-full pl-10 placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]`}
                />
              </div>
            </div>
          ))}

          <div>
            <label className="label">Department</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="department"
                value={profileData.department}
                onChange={handleProfileChange}
                placeholder="Enter your department"
                className="input w-full pl-10 placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
              />
            </div>
          </div>

          <div>
            <label className="label">Contact</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="contact"
                value={profileData.contact}
                onChange={handleProfileChange}
                placeholder="Enter your mobile number"
                className="input w-full pl-10 placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
              />
            </div>
          </div>

          <div>
            <label className="label">Semester</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select name="semester" value={profileData.semester} onChange={handleProfileChange} className="input w-full pl-10 focus:ring-1 focus:ring-[#17a2b8]">
                <option value="">Select semester</option>
                {Array.from({ length: 8 }, (_, index) => {
                  const semester = `${index + 1}${["st", "nd", "rd"][index] || "th"} Semester`;
                  return <option key={semester} value={semester}>{semester}</option>;
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Year</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select name="year" value={profileData.year} onChange={handleProfileChange} className="input w-full pl-10 focus:ring-1 focus:ring-[#17a2b8]">
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Type</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select name="type" value={profileData.type} onChange={handleProfileChange} className="input w-full pl-10 focus:ring-1 focus:ring-[#17a2b8]">
                <option value="Project">Project</option>
                <option value="Thesis">Thesis</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Gender</label>
            <div className="flex min-h-[44px] items-center gap-5 px-1 py-2.5">
              {["Male", "Female", "Other"].map((gender) => (
                <label key={gender} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={profileData.gender === gender}
                    onChange={handleProfileChange}
                    className="h-4 w-4 accent-[#17a2b8]"
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={isUpdatingProfile} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              <Save className="h-4 w-4" />
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600"><LockKeyhole className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
            <p className="mt-1 text-sm text-slate-500">Use a strong password to protect your account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          {[
            ["currentPassword", "Current Password"],
            ["newPassword", "New Password"],
            ["confirmPassword", "Confirm New Password"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  minLength={8}
                  type={showPasswords[name] ? "text" : "password"}
                  name={name}
                  value={passwords[name]}
                  onChange={handlePasswordChange}
                  className="input w-full pl-10 placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
                <button type="button" aria-label={`Show ${label}`} onClick={() => togglePassword(name)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600">
                  {showPasswords[name] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          ))}

          <button type="submit" disabled={isUpdatingPassword} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60">
            <LockKeyhole className="h-4 w-4" />
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default StudentProfile;
