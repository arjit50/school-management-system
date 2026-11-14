
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  BookOpen,
} from "lucide-react";

import api from "../services/api";
import useAuth from "../hooks/useAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUser = (role) => {
    const routes = {
      admin: "/admin/dashboard",
      teacher: "/teacher/dashboard",
      guardian: "/guardian/dashboard",
      student: "/student/dashboard",
    };

    navigate(routes[role] || "/");
  };

  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }

    if (password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });

      const { user: registeredUser, token } = res.data;
      loginUser(registeredUser, token);
      redirectUser(registeredUser.role);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* LEFT SIDE */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-blue-700 to-blue-500 p-12 lg:flex lg:flex-col lg:justify-between">

        <Link to="/" className="relative z-10 flex items-center gap-2 text-white">
          <GraduationCap size={40} />
          <span className="text-2xl font-extrabold">
            SchoolMS
          </span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
            Join SchoolMS
          </span>

          <h1 className="mt-7 text-5xl font-extrabold leading-tight text-white">
            Start Your
            <br />
            Learning Journey.
          </h1>

          <p className="mt-6 text-lg leading-8 text-blue-100">
            Become part of a smarter school community.
            Manage your academic activities through one
            simple and secure platform.
          </p>

          <div className="mt-10 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <Users size={22} />
              <span>Connected school community</span>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen size={22} />
              <span>Organized academic management</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={22} />
              <span>Secure role-based accounts</span>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-sm text-blue-100">
          © 2026 SchoolMS. All rights reserved.
        </p>

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full items-center justify-center px-5 py-12 lg:w-1/2">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <Link
            to="/"
            className="mb-10 flex items-center justify-center gap-2 lg:hidden"
          >
            <GraduationCap size={36} className="text-blue-600" />
            <span className="text-2xl font-extrabold">
              School<span className="text-blue-600">MS</span>
            </span>
          </Link>

          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Create Account
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Join SchoolMS Today
            </h2>

            <p className="mt-3 text-slate-500">
              Enter your details to create your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Register As
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="student">Student</option>
                <option value="guardian">Guardian</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight size={19} />}
            </button>

          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </p>

          <Link
            to="/"
            className="mt-7 block text-center text-sm font-medium text-slate-400 transition hover:text-blue-600"
          >
            ← Back to Home
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Signup;
