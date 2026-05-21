import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, Loader } from "lucide-react";
import { forgotPassword } from "../../store/slices/authSlice";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(""); // useState er vitore false suggest kore seta e dichi✅ isSubmitted এর type string করা হয়েছে যাতে success message দেখানো যায়
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
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-auto bg-repeat bg-fixed">
        <div className="max-w-md w-full mx-auto px-4 ">
          {/* Header */}
          <div className="text-center mb-8 pt-[60px] p-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-full m-4">
              <svg
                className="w-6 h-6 text-white"
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
            <h1 className="text-2xl font-bold ">Check Your E-mail</h1>
            {/* <p className="text-gray-600 mt-2"> */}
            <p className="text-[#17a2b8] mt-2">
              We've sent a password reset link to your email address.
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg border shadow-[0px_0px_40px_rgba(0,0,0,0.35)]">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                If an account with <strong>{email}</strong> exists, you will
                receive a password reset link shortly.
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full bg-[#17a2b8] hover:bg-[#138496] focus:ring-2 focus:ring-offset-2 focus:ring-[#17a2b8] text-white  py-2 rounded-lg transition-all tracking-wider text-mediam font-semibold"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="block w-full border border-[#17a2b8] hover:bg-[#138496] hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-[#17a2b8] text-[#17a2b8] py-2 rounded-lg transition-all tracking-wider text-medium font-semibold"
                >
                  Try Another Email
                </button>
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
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-auto bg-repeat bg-fixed">
        <div className="max-w-md w-full mx-auto px-4 ">
          {/* Header */}
          <div className="text-center mb-8 pt-[40px] p-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#17a2b8] rounded-full m-4">
              <KeyRound className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Forgot Your Password?
            </h1>
            <p className="text-[#17a2b8] mt-2">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {/* forgot password form */}
          <div className="bg-white p-5 rounded-lg shadow-sm border shadow-[0px_0px_40px_rgba(0,0,0,0.35)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="label text-base font-medium text-slate-700 mb-2 mt-1">
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
                  className={`input mb-2 focus:ring-1 focus:ring-[#17a2b8] ${error ? "input-error" : ""}`}
                  placeholder="Enter your E-mail"
                  disabled={isRequestingForToken}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRequestingForToken}
                className="w-full bg-[#17a2b8] hover:bg-[#138496] focus:ring-2 focus:ring-offset-2 focus:ring-[#17a2b8] text-white  py-2 rounded-lg transition-all tracking-wider text-mediam font-semibold"
              >
                {isRequestingForToken ? (
                  <div className="flex justify-center intems-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
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

export default ForgotPasswordPage;
