import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const DashboardLayout = ({ title, navItems, activeTab, onTabChange, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels = {
    admin: 'Administrator',
    teacher: 'Teacher Portal',
    student: 'Student Portal',
    guardian: 'Guardian Portal',
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    teacher: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    student: 'bg-blue-100 text-blue-700 border-blue-200',
    guardian: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR - DESKTOP */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        {/* App Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <Link to="/" className="text-xl font-extrabold text-slate-900">
            School<span className="text-blue-600">MS</span>
          </Link>
        </div>

        {/* User Role Badge */}
        <div className="p-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signed in as</p>
            <p className="truncate font-bold text-slate-800">{user?.name}</p>
            <span
              className={`mt-1.5 inline-block rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${
                roleColors[user?.role] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {roleLabels[user?.role] || user?.role}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (onTabChange) {
                    onTabChange(item.id);
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Bottom */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex w-72 flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-blue-600" />
                <span className="text-xl font-extrabold text-slate-900">
                  School<span className="text-blue-600">MS</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signed in as</p>
                <p className="truncate font-bold text-slate-800">{user?.name}</p>
                <span
                  className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${
                    roleColors[user?.role] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else if (onTabChange) {
                        onTabChange(item.id);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
              <UserIcon className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
