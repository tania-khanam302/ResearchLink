import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, ChevronDown, Eye, EyeOff } from "lucide-react";
import { login } from "../../store/slices/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // showPassword ===================
  const [showPassword, setShowPassword] = useState(false);

  const { authUser, isLoggingIn } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});

  // Dropdown open/close state
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const roles = ["Student", "Teacher", "Admin"];

  // useEffect always top level এ hobe
  // useEffect(() => {
  //   if (authUser) {
  //     if (formData.role === "Student") navigate("/student");
  //     else if (formData.role === "Teacher") navigate("/teacher");
  //     else if (formData.role === "Admin") navigate("/admin");
  //   }
  // }, [authUser, navigate]);

  useEffect(() => {
    if (authUser) {
      // switch (formData.role) change switch (formData.role) to  authUser.role
      switch (authUser.role) {
        case "Student":
          navigate("/student");
          break;
        case "Teacher":
          navigate("/teacher");
          break;
        case "Admin":
          navigate("/admin");
          break;

        default:
          navigate("/login");
      }
    }
  }, [authUser]);

  // login Continue with Google
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    //  JSON use kora hoyeche (FormData না)
    const data = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    dispatch(login(data));
  };
  // handleGoogleLogin
  // const handleGoogleLogin = () => {
  //   window.location.href = "http://localhost:5000/api/auth/google";
  // };

  return (
    <>
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-auto bg-repeat bg-fixed bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#17a2b8] rounded-full mb-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Research Link</h1>
            <p className="text-[#17a2b8] mt-2">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="bg-white p-7 rounded-lg border shadow-[0px_0px_40px_rgba(0,0,0,0.35)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role - custom dropdown*/}
              <div className="relative">
                <label className="block text-base font-medium text-slate-700 mb-1">
                  Select Role
                </label>
                <div
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className={`w-full px-3 py-2 border rounded-md flex justify-between items-center cursor-pointer transition-all duration-200 outline-none ${
                    isSelectOpen
                      ? "border-[#17a2b8] ring-0 ring-[#17a2b8]" // ক্লিক করলে এই বর্ডার এবং রিং কালার আসবে
                      : "border-slate-300"
                  }`}
                >
                  <span className="text-slate-700">{formData.role}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#17a2b8] stroke-[2px] transition-transform duration-300 ${
                      isSelectOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Options Menu */}
                {isSelectOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
                    {roles.map((role) => (
                      <div
                        key={role}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-[#17a2b8] hover:text-white transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, role: role });
                          setIsSelectOpen(false);
                        }}
                      >
                        {role}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* <div>
                <label className="label">Select Role</label>
                
                <select
                
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
  className="input focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
>
                  <option value="Student bg-white hover:bg-[#17a2b8]">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div> */}

              {/* Email Address*/}
              <div>
                <label className="label text-base font-medium text-slate-700 mb-1 mt-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8] ${errors.email ? "input-error" : ""}`}
                  placeholder="Enter your E-mail"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label text-base font-medium text-slate-700 mb-1 mt-1">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input placeholder-gray-400 w-full pr-10 focus:outline-none focus:ring-1 focus:ring-[#17a2b8] ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#17a2b8]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-[#17a2b8]" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-[#17a2b8]">
                  Forgot your password?
                </Link>
              </div>

              {/* Button */}
              <button
                type="submit"
                style={{
                  fontFamily: "Arial, sans-serif",
                }}
                disabled={isLoggingIn}
                // className="w-full bg-[#17a2b8] hover:bg-[#138496] focus:ring-2 focus:ring-offset-2 focus:ring-[#17a2b8] text-white  py-2 rounded-lg transition-all tracking-wider text-mediam font-semibold"

                className="w-full py-2 rounded-lg text-white tracking-[1px] text-[16px] transition-all
  bg-[#17a2b8] hover:bg-[#138496]"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4">
              <button
                type="button"
                // onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 shadow-sm"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              {/* <button onClick={handleGoogleLogin}>Continue with Google</button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
