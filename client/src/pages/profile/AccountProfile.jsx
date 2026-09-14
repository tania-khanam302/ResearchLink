import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AtSign,
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Save,
  UserRound,
} from "lucide-react";
import {
  changePassword,
  updateProfile,
  uploadProfilePicture,
} from "../../store/slices/authSlice";

const AccountProfile = () => {
  const dispatch = useDispatch();
  const { authUser, isUpdatingPassword, isUpdatingProfile } = useSelector(
    (state) => state.auth,
  );
  const [profileData, setProfileData] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({});

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    await dispatch(updateProfile(profileData)).unwrap();
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await dispatch(uploadProfilePicture(file)).unwrap();
    event.target.value = "";
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
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
              <img src={authUser.profilePicture} alt="Profile" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-cyan-200" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                <UserRound className="h-8 w-8" />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-cyan-600 text-white shadow-md hover:bg-cyan-700" title="Add profile picture">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePictureChange} className="hidden" />
            </label>
          </div>
          <div>
            {/* <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Account Profile</p> */}
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{authUser?.name || "Profile"}</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your account information and security.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
        <p className="mt-1 text-sm text-slate-500">Update your name and email address.</p>
        <form onSubmit={handleProfileSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
          {[["name", "Name", "text", UserRound], ["email", "Email", "email", AtSign]].map(([name, label, type, Icon]) => (
            <div key={name}>
              <label className="label">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input required type={type} name={name} value={profileData[name]} onChange={handleProfileChange} className="input w-full pl-10 placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]" />
              </div>
            </div>
          ))}
          <div className="sm:col-span-2">
            <button type="submit" disabled={isUpdatingProfile} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60 sm:w-auto">
              <Save className="h-4 w-4" />
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600"><LockKeyhole className="h-5 w-5" /></div>
          <div><h2 className="text-xl font-bold text-slate-900">Change Password</h2><p className="mt-1 text-sm text-slate-500">Use a strong password to protect your account.</p></div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="mt-6 max-w-2xl space-y-5">
          {[["currentPassword", "Current Password"], ["newPassword", "New Password"], ["confirmPassword", "Confirm New Password"]].map(([name, label]) => (
            <div key={name}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input required minLength={8} type={showPasswords[name] ? "text" : "password"} name={name} value={passwords[name]} onChange={handlePasswordChange} placeholder={`Enter ${label.toLowerCase()}`} className="input w-full py-3 pl-10 pr-11 placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]" />
                <button type="button" onClick={() => togglePassword(name)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600">
                  {showPasswords[name] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={isUpdatingPassword} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">
            <LockKeyhole className="h-4 w-4" />
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AccountProfile;