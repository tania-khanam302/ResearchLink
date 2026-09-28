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
     <div className="common-bg">
  <div className="min-h-screen common-bg-wrapper">
    <div className="login-common-container">

      {/* Header */}
      <div className="login-common-header">
        <div className="login-common-icon">
          <KeyRound className="w-6 h-6 text-[#17a2b8]" />
        </div>

        <h1>Reset Password</h1>

        <p className="sub-title">
          Enter a new password for your account.
        </p>
      </div>

      {/* Reset Password Form */}
      <div className="login-common-card">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* New Password */}
          <div>
            <label className="label">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`custom-input pr-10 ${
                  errors.password ? "input-error" : ""
                }`}
                placeholder="Enter new password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                    className="text-[#17a2b8]"
                  />
                ) : (
                  <Eye
                    size={18}
                    className="text-gray-400"
                  />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="input-error-text">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`custom-input pr-10 ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
                placeholder="Enter your confirm password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="password-toggle"
              >
                {showConfirmPassword ? (
                  <EyeOff
                    size={18}
                    className="text-[#17a2b8]"
                  />
                ) : (
                  <Eye
                    size={18}
                    className="text-gray-400"
                  />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="input-error-text">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="submit-btn"
          >
            {isUpdatingPassword
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-link">
          <p>
            Remember your password?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  </div>
</div>

    </>
  );
};
export default ResetPasswordPage;
