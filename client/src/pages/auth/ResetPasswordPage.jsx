import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { resetPassword } from "../../store/slices/authSlice";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();

  // showPassword and showConfirmPassword ===================
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { isUpdatingPassword } = useSelector((state) => state.auth);
  const token = searchParams.get("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      ).unwrap();

      navigation("/login");
    } catch (error) {
      setErrors({
        general: error || "Failed to reset password. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-auto bg-repeat bg-fixed bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#17a2b8] rounded-full mb-2">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Reset Password
            </h1>
            <p className="text-[#17a2b8] mt-2">
              Enter your new password below.
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-white p-7 rounded-lg border shadow-[0px_0px_40px_rgba(0,0,0,0.35)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* new password*/}
              {/* <div>
                <label className="label text-base font-medium text-slate-700 mb-1 mt-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input focus:ring-1 focus:ring-[#17a2b8] ${errors.password ? "input-error" : ""}`}
                  placeholder="Enter new password"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div> */}

              <label className="label text-base font-medium text-slate-700 mb-1 mt-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input placeholder-gray-400 w-full focus:ring-1 focus:ring-[#17a2b8] pr-10 ${
                    errors.password ? "input-error" : ""
                  }`}
                  placeholder="Enter new password "
                />

                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 "
                >
                  {showPassword ? <EyeOff size={18} className="text-[#17a2b8]" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label text-base font-medium text-slate-700 mb-1 mt-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    // type="password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#17a2b8] ${errors.password ? "input-error" : ""}`}
                    // placeholder="Enter your password"
                    placeholder="Enter your confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-[#17a2b8]" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Password button*/}
              <button
                type="submit"
                style={{
                  fontFamily: "Arial, sans-serif",
                }}
                disabled={isUpdatingPassword}
                className="w-full py-2 rounded-lg text-white tracking-[1px] text-[16px] transition-all bg-[#17a2b8] hover:bg-[#138496]"
              >
                {isUpdatingPassword ? "Reseting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Remember your password?{" "}
                <Link
                  to={"/login"}
                  className="text-[#17a2b8] hover:text-blue-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ResetPasswordPage;
