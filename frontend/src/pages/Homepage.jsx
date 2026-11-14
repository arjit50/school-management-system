import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Users,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const modules = [
  {
    title: "Student Management",
    description: "Manage student records, admissions and profiles with ease.",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Attendance",
    description: "Record and track daily attendance with detailed summaries.",
    icon: CalendarCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Examinations",
    description: "Create exams, enter marks and generate student report cards.",
    icon: GraduationCap,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Fee Management",
    description: "Create invoices, record payments and track outstanding dues.",
    icon: CreditCard,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Reports & Analytics",
    description: "Access attendance, academic and fee reports in one place.",
    icon: BarChart3,
    color: "bg-sky-50 text-sky-600",
  },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const roleRoutes = {
    admin: "/admin/dashboard",
    teacher: "/teacher/dashboard",
    guardian: "/guardian/dashboard",
    student: "/student/dashboard",
  };

  const dashboardUrl = user ? (roleRoutes[user.role] || "/admin/dashboard") : "/login";

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Modules", href: "#modules" },
    { name: "About", href: "#about" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap size={38} className="text-blue-600" strokeWidth={2.5} />
            <span className="text-2xl font-extrabold tracking-tight">
              School<span className="text-blue-600">MS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons / User Profile */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  Hi, <span className="font-bold text-slate-900">{user.name}</span>
                </span>
                <Link
                  to={dashboardUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  title="Sign out"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-blue-600 px-6 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-slate-700 hover:text-blue-600"
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Signed in as {user.name} ({user.role})
                    </p>
                    <Link
                      to={dashboardUrl}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-center font-bold text-white shadow-md shadow-blue-200"
                    >
                      <LayoutDashboard size={18} />
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-center font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 rounded-lg border border-blue-600 py-2.5 text-center font-semibold text-blue-600"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center font-semibold text-white"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section
        id="home"
        className="overflow-hidden bg-linear-to-br from-blue-50 via-white to-sky-50"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2 lg:gap-8 lg:px-8">
          {/* Hero Content */}
          <div className="text-center lg:text-left">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Smart School Management Platform
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Complete School Management{" "}
              <span className="text-blue-600">System</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
              A unified platform to manage students, teachers, attendance,
              examinations, fees and more — for a smarter and more efficient
              school.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              {user ? (
                <Link
                  to={dashboardUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700"
                >
                  <LayoutDashboard size={20} />
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700"
                >
                  Get Started
                  <ArrowRight size={20} />
                </Link>
              )}

              <a
                href="#modules"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-8 py-4 font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Learn More
                <ChevronRight size={20} />
              </a>
            </div>

            {/* Features */}
            <div
              id="features"
              className="mt-12 flex flex-wrap justify-center gap-5 lg:justify-start"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="text-blue-600" size={21} />
                Role-Based Access
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BarChart3 className="text-blue-600" size={21} />
                Reports & Analytics
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Smartphone className="text-blue-600" size={21} />
                Responsive Design
              </div>
            </div>
          </div>

          {/* Actual School Illustration */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-8 rounded-full bg-blue-200/40 blur-3xl" />
            <img
              src="/image.png"
              alt="School building illustration"
              className="relative h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ================= MODULES SECTION ================= */}
      <section id="modules" className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Heading */}
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              What We Offer
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Key Modules
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
              Everything you need to run your school efficiently in one place.
            </p>
          </div>

          {/* Module Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.title}
                  className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-100 hover:shadow-xl"
                >
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${module.color}`}
                  >
                    <Icon size={29} strokeWidth={2} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>

                  <Link
                    to={dashboardUrl}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-blue-600 transition group-hover:gap-2"
                  >
                    Explore
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="bg-blue-50 px-5 py-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Making School Management Easier
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Bring your school's daily operations together with a single platform
              designed for administrators, teachers, students and guardians.
            </p>
          </div>

          <Link
            to={dashboardUrl}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            {user ? "Open Dashboard" : "Access Your Account"}
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 px-5 py-10 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          {/* Footer Logo */}
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap size={32} className="text-blue-400" />
            <span className="text-xl font-extrabold">
              School<span className="text-blue-400">MS</span>
            </span>
          </Link>

          <p className="text-center text-sm text-slate-400">
            © {new Date().getFullYear()} SchoolMS. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#modules" className="hover:text-white">
              Modules
            </a>
            <a href="#about" className="hover:text-white">
              About
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
