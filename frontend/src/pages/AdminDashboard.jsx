import { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [feesSummary, setFeesSummary] = useState(null);
  const [guardiansList, setGuardiansList] = useState([]);

  // Modals state
  const [showClassModal, setShowClassModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  // Form states
  const [newClass, setNewClass] = useState({ className: '', section: '', classTeacher: '' });
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    subject: '',
    phone: '',
    assignedClasses: [],
  });
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    admissionNumber: '',
    classId: '',
    guardianId: '',
    gender: 'Male',
    phone: '',
    address: '',
  });
  const [newFee, setNewFee] = useState({
    targetType: 'class', // 'class' or 'student'
    classId: '',
    studentId: '',
    amount: '',
    dueDate: '',
  });

  // Filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers');
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const params = {};
      if (studentClassFilter) params.classId = studentClassFilter;
      if (studentSearch) params.search = studentSearch;
      const res = await api.get('/students', { params });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFees = async () => {
    try {
      const params = {};
      if (feeStatusFilter) params.status = feeStatusFilter;
      const res = await api.get('/fees', { params });
      setFees(res.data.fees || []);
      setFeesSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGuardians = async () => {
    try {
      const res = await api.get('/users?role=guardian');
      setGuardiansList(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchClasses(),
      fetchTeachers(),
      fetchStudents(),
      fetchFees(),
      fetchGuardians(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [studentClassFilter, studentSearch]);

  useEffect(() => {
    fetchFees();
  }, [feeStatusFilter]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/classes', newClass);
      setSuccess('Class created successfully!');
      setShowClassModal(false);
      setNewClass({ className: '', section: '', classTeacher: '' });
      fetchClasses();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      setSuccess('Class deleted');
      fetchClasses();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/teachers', newTeacher);
      setSuccess('Teacher account created successfully!');
      setShowTeacherModal(false);
      setNewTeacher({
        name: '',
        email: '',
        password: '',
        employeeId: '',
        subject: '',
        phone: '',
        assignedClasses: [],
      });
      fetchTeachers();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      setSuccess('Teacher deleted');
      fetchTeachers();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete teacher');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/students', newStudent);
      setSuccess('Student admitted successfully!');
      setShowStudentModal(false);
      setNewStudent({
        name: '',
        email: '',
        password: '',
        admissionNumber: '',
        classId: '',
        guardianId: '',
        gender: 'Male',
        phone: '',
        address: '',
      });
      fetchStudents();
      fetchClasses();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to admit student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure? This will delete the student and their attendance, exam, and fee records.'))
      return;
    try {
      await api.delete(`/students/${id}`);
      setSuccess('Student deleted');
      fetchStudents();
      fetchClasses();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = {
        amount: newFee.amount,
        dueDate: newFee.dueDate,
        ...(newFee.targetType === 'class' ? { classId: newFee.classId } : { studentId: newFee.studentId }),
      };
      await api.post('/fees', payload);
      setSuccess('Fee invoice generated!');
      setShowFeeModal(false);
      setNewFee({ targetType: 'class', classId: '', studentId: '', amount: '', dueDate: '' });
      fetchFees();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create fee');
    }
  };

  const handleToggleFeeStatus = async (feeId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
      await api.patch(`/fees/${feeId}/status`, { status: nextStatus });
      fetchFees();
      fetchStats();
    } catch (err) {
      setError('Failed to update fee status');
    }
  };

  const handleDeleteFee = async (id) => {
    if (!window.confirm('Delete this fee record?')) return;
    try {
      await api.delete(`/fees/${id}`);
      fetchFees();
      fetchStats();
    } catch (err) {
      setError('Failed to delete fee');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: School },
    { id: 'classes', label: 'Classes & Sections', icon: GraduationCap, badge: classes.length },
    { id: 'teachers', label: 'Faculty / Teachers', icon: Users, badge: teachers.length },
    { id: 'students', label: 'Student Directory', icon: Users, badge: stats?.totalStudents },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
  ];

  return (
    <DashboardLayout
      title="Admin Dashboard"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setError('');
        setSuccess('');
      }}
    >
      {/* Alert Banners */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ================= TAB: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Total Students</p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{stats?.totalStudents || 0}</h3>
                  <p className="mt-1 text-xs text-slate-400">Enrolled across all classes</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Teachers</p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{stats?.totalTeachers || 0}</h3>
                  <p className="mt-1 text-xs text-slate-400">Active faculty staff</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Classes</p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <School className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{stats?.totalClasses || 0}</h3>
                  <p className="mt-1 text-xs text-slate-400">Class sections</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Pending Fees</p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <CreditCard className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
                    ${(stats?.pendingFeesAmount || 0).toLocaleString()}
                  </h3>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">
                    ${(stats?.paidFeesAmount || 0).toLocaleString()} collected
                  </p>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                <h4 className="text-base font-bold text-slate-900">Quick Administrative Actions</h4>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowStudentModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" /> Enroll Student
                  </button>
                  <button
                    onClick={() => setShowTeacherModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" /> Add Teacher
                  </button>
                  <button
                    onClick={() => setShowClassModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Add Class
                  </button>
                  <button
                    onClick={() => setShowFeeModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-amber-700"
                  >
                    <Plus className="h-4 w-4" /> Issue Fee
                  </button>
                </div>
              </div>

              {/* Recent Enrollments */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">Recently Enrolled Students</h4>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View All Students →
                  </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                      <tr>
                        <th className="py-3">Admission #</th>
                        <th className="py-3">Name</th>
                        <th className="py-3">Email</th>
                        <th className="py-3">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats?.recentStudents?.length > 0 ? (
                        stats.recentStudents.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-slate-900">{s.admissionNumber}</td>
                            <td className="py-3 font-medium text-slate-800">{s.user?.name}</td>
                            <td className="py-3 text-slate-500">{s.user?.email}</td>
                            <td className="py-3">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                                {s.class?.className} - {s.class?.section}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            No students enrolled yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: CLASSES ================= */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Classes & Sections</h2>
                  <p className="text-sm text-slate-500">Manage class grades, sections and class teachers</p>
                </div>
                <button
                  onClick={() => setShowClassModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" /> Add New Class
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((c) => (
                  <div
                    key={c._id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-xs transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-600">
                          Section {c.section}
                        </span>
                        <button
                          onClick={() => handleDeleteClass(c._id)}
                          className="text-slate-400 hover:text-red-600"
                          title="Delete class"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="mt-3 text-2xl font-extrabold text-slate-900">{c.className}</h3>
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Class Teacher:{' '}
                        <span className="font-bold text-slate-800">
                          {c.classTeacher?.name || 'Not assigned'}
                        </span>
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-semibold text-slate-400">Enrolled Students</span>
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-800">
                        {c.studentCount || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: TEACHERS ================= */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Faculty Members</h2>
                  <p className="text-sm text-slate-500">View and manage teaching staff</p>
                </div>
                <button
                  onClick={() => setShowTeacherModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" /> Add Teacher
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Employee ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Assigned Classes</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.length > 0 ? (
                        teachers.map((t) => (
                          <tr key={t._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-semibold text-slate-900">{t.employeeId}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{t.user?.name}</td>
                            <td className="px-6 py-4 text-slate-500">{t.user?.email}</td>
                            <td className="px-6 py-4">
                              <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                                {t.subject}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{t.phone || '—'}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {t.assignedClasses?.length > 0 ? (
                                  t.assignedClasses.map((ac) => (
                                    <span
                                      key={ac._id}
                                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                                    >
                                      {ac.className}-{ac.section}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">None</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteTeacher(t._id)}
                                className="text-slate-400 hover:text-red-600"
                                title="Delete teacher"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No teachers registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: STUDENTS ================= */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Student Directory</h2>
                  <p className="text-sm text-slate-500">Manage enrolled student profiles</p>
                </div>
                <button
                  onClick={() => setShowStudentModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" /> Enroll New Student
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by name, admission #, or email..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className} - {c.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Admission #</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4">Guardian</th>
                        <th className="px-6 py-4">Gender</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.length > 0 ? (
                        students.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-semibold text-slate-900">{s.admissionNumber}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{s.user?.name}</td>
                            <td className="px-6 py-4 text-slate-500">{s.user?.email}</td>
                            <td className="px-6 py-4">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                                {s.class?.className} - {s.class?.section}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{s.guardian?.name || '—'}</td>
                            <td className="px-6 py-4 text-slate-500">{s.gender}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteStudent(s._id)}
                                className="text-slate-400 hover:text-red-600"
                                title="Delete student"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: FEES ================= */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Fee Invoices & Billing</h2>
                  <p className="text-sm text-slate-500">Track paid and outstanding tuition fees</p>
                </div>
                <button
                  onClick={() => setShowFeeModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4" /> Issue Fee Invoice
                </button>
              </div>

              {/* Fee summary stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-white p-5">
                  <p className="text-xs font-bold uppercase text-slate-400">Total Billed</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                    ${(feesSummary?.totalAmount || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <p className="text-xs font-bold uppercase text-emerald-600">Total Collected</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-emerald-700">
                    ${(feesSummary?.paidAmount || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
                  <p className="text-xs font-bold uppercase text-amber-600">Outstanding Balance</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-amber-700">
                    ${(feesSummary?.pendingAmount || 0).toLocaleString()}
                  </h3>
                </div>
              </div>

              {/* Status filter buttons */}
              <div className="flex gap-2">
                {['', 'Pending', 'Paid'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFeeStatusFilter(st)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      feeStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === '' ? 'All Invoices' : st}
                  </button>
                ))}
              </div>

              {/* Fees Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fees.length > 0 ? (
                        fees.map((f) => (
                          <tr key={f._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">{f.student?.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-400">Adm: {f.student?.admissionNumber}</p>
                            </td>
                            <td className="px-6 py-4">
                              {f.student?.class
                                ? `${f.student.class.className} - ${f.student.class.section}`
                                : '—'}
                            </td>
                            <td className="px-6 py-4 font-extrabold text-slate-900">${f.amount}</td>
                            <td className="px-6 py-4 text-slate-500">
                              {new Date(f.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleFeeStatus(f._id, f.status)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition ${
                                  f.status === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                }`}
                              >
                                {f.status === 'Paid' ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <Clock className="h-3.5 w-3.5" />
                                )}
                                {f.status} (Click to toggle)
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteFee(f._id)}
                                className="text-slate-400 hover:text-red-600"
                                title="Delete fee"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No fees found for this criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= MODAL: ADD CLASS ================= */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add New Class</h3>
            <form onSubmit={handleCreateClass} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Class Name / Grade</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10"
                  value={newClass.className}
                  onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Section</label>
                <input
                  type="text"
                  placeholder="e.g. A"
                  value={newClass.section}
                  onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Class Teacher (Optional)</label>
                <select
                  value={newClass.classTeacher}
                  onChange={(e) => setNewClass({ ...newClass, classTeacher: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">No Teacher Assigned</option>
                  {teachers.map((t) => (
                    <option key={t.user?._id} value={t.user?._id}>
                      {t.user?.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TEACHER ================= */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add Teacher</h3>
            <form onSubmit={handleCreateTeacher} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
                  <input
                    type="text"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-101"
                    value={newTeacher.employeeId}
                    onChange={(e) => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Password</label>
                  <input
                    type="password"
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                    required
                    placeholder="Min. 8 characters"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Primary Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Phone</label>
                  <input
                    type="text"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Assign Classes</label>
                <div className="mt-2 grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                  {classes.map((cls) => {
                    const isChecked = newTeacher.assignedClasses.includes(cls._id);
                    return (
                      <label key={cls._id} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTeacher({
                                ...newTeacher,
                                assignedClasses: [...newTeacher.assignedClasses, cls._id],
                              });
                            } else {
                              setNewTeacher({
                                ...newTeacher,
                                assignedClasses: newTeacher.assignedClasses.filter((id) => id !== cls._id),
                              });
                            }
                          }}
                          className="rounded text-purple-600"
                        />
                        {cls.className} - {cls.section}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700"
                >
                  Create Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STUDENT ================= */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Enroll New Student</h3>
            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Student Name</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Admission #</label>
                  <input
                    type="text"
                    placeholder="e.g. STU-2026-001"
                    value={newStudent.admissionNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, admissionNumber: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Password</label>
                  <input
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    required
                    placeholder="Min. 8 characters"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Class & Section</label>
                  <select
                    value={newStudent.classId}
                    onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Guardian / Parent (Optional)</label>
                  <select
                    value={newStudent.guardianId}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">No Guardian Linked</option>
                    {guardiansList.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name} ({g.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Gender</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Phone</label>
                  <input
                    type="text"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Residential Address</label>
                <input
                  type="text"
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE FEE INVOICE ================= */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Issue Fee Invoice</h3>
            <form onSubmit={handleCreateFee} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Issue Fee To</label>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="radio"
                      name="targetType"
                      checked={newFee.targetType === 'class'}
                      onChange={() => setNewFee({ ...newFee, targetType: 'class' })}
                    />
                    Entire Class
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="radio"
                      name="targetType"
                      checked={newFee.targetType === 'student'}
                      onChange={() => setNewFee({ ...newFee, targetType: 'student' })}
                    />
                    Single Student
                  </label>
                </div>
              </div>

              {newFee.targetType === 'class' ? (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Select Class</label>
                  <select
                    value={newFee.classId}
                    onChange={(e) => setNewFee({ ...newFee, classId: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-amber-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} - {cls.section} ({cls.studentCount || 0} students)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Select Student</label>
                  <select
                    value={newFee.studentId}
                    onChange={(e) => setNewFee({ ...newFee, studentId: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-amber-500"
                  >
                    <option value="">Select Student</option>
                    {students.map((stu) => (
                      <option key={stu._id} value={stu._id}>
                        {stu.user?.name} ({stu.admissionNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 250"
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Due Date</label>
                  <input
                    type="date"
                    value={newFee.dueDate}
                    onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
