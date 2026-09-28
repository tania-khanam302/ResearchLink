import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, Loader } from "lucide-react";
import { forgotPassword } from "../../store/slices/authSlice";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
 const [isSubmitted, setIsSubmitted] = useState(false);
 const [error, setError] = useState("");
  const { isRequestingForToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setError("");

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      setError(error || "Failed to send reset link. please try again.");
    }
  };

  // ================= Check Your Email =================
  if (isSubmitted) {
    return (
  <div className="common-bg">
  <div className="min-h-screen common-bg-wrapper">
    <div className="login-common-container">

      {/* Header */}
      <div className="login-common-header">

        <div className="login-common-icon success-icon">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1>Check Your Email</h1>

        <p className="sub-title">
          We've sent a password reset link to your email address.
        </p>
      </div>

      {/* Success Card */}
      <div className="login-common-card">

        <div className="text-center">

          <p className="success-message">
            If an account with{" "}
            <strong>{email}</strong>{" "}
            exists, you will receive a password reset link shortly.
          </p>

          <div className="success-actions">

            <Link
              to="/login"
              className="submit-btn"
            >
              Back to Login
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="secondary-btn"
            >
              Try Another Email
            </button>

          </div>
        </div>
      </div>

    </div>
  </div>
</div>

     
    );
  }

  // ============ forgot password? ============
  return (
    <>
 <div className="common-bg">
  <div className="min-h-screen common-bg-wrapper">
    <div className="login-common-container">

      <div className="login-common-header">
        <div className="login-common-icon">
          <KeyRound className="w-6 h-6 text-[#17a2b8]" />
        </div>

        <h1>Forgot Your Password?</h1>

        <p className="sub-title">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <div className="login-common-card">
        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="error-box">
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="label">
              E-mail
            </label>

            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={`custom-input ${
                error ? "input-error" : ""
              }`}
              placeholder="Enter your E-mail"
              disabled={isRequestingForToken}
            />

            {error && (
              <p className="input-error-text">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isRequestingForToken}
            className="submit-btn"
          >
            {isRequestingForToken ? (
              <div className="flex justify-center items-center">
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Sending...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

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

export default ForgotPasswordPage;
