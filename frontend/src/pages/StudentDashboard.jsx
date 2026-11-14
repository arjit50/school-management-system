import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  GraduationCap,
  CreditCard,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Award,
} from 'lucide-react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState({ summary: {}, records: [] });
  const [examData, setExamData] = useState({ summary: {}, exams: {} });
  const [feeData, setFeeData] = useState({ summary: {}, fees: [] });

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/students/me');
      const studentProfile = profileRes.data.student;
      setStudent(studentProfile);

      if (studentProfile?._id) {
        const [attRes, examRes, feeRes] = await Promise.all([
          api.get(`/attendance/student/${studentProfile._id}`),
          api.get(`/exams/student/${studentProfile._id}`),
          api.get(`/fees/student/${studentProfile._id}`),
        ]);

        setAttendanceData(attRes.data);
        setExamData(examRes.data);
        setFeeData(feeRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'My Profile & Summary', icon: User },
    {
      id: 'attendance',
      label: 'Attendance History',
      icon: CalendarCheck,
      badge: `${attendanceData.summary?.percentage || 100}%`,
    },
    { id: 'exams', label: 'Exam Report Card', icon: GraduationCap },
    {
      id: 'fees',
      label: 'Fee Status',
      icon: CreditCard,
      badge: feeData.summary?.pendingAmount > 0 ? `$${feeData.summary.pendingAmount}` : undefined,
    },
  ];

  return (
    <DashboardLayout
      title="Student Portal"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
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
              {/* Hero Banner */}
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-md">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-100">
                  Student Profile
                </span>
                <h2 className="mt-4 text-3xl font-extrabold">{student?.user?.name}</h2>
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-blue-100">
                  <div>
                    <span className="text-blue-200">Admission No: </span>
                    <span className="font-bold text-white">{student?.admissionNumber}</span>
                  </div>
                  <div>
                    <span className="text-blue-200">Class: </span>
                    <span className="font-bold text-white">
                      {student?.class?.className} - {student?.class?.section}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-200">Guardian: </span>
                    <span className="font-bold text-white">{student?.guardian?.name || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-blue-200">Email: </span>
                    <span className="font-bold text-white">{student?.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-6 sm:grid-cols-3">
                {/* Attendance Summary */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Attendance Rate</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                    {attendanceData.summary?.percentage ?? 100}%
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {attendanceData.summary?.presentCount || 0} days present of{' '}
                    {attendanceData.summary?.totalDays || 0} recorded
                  </p>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View Attendance Records →
                  </button>
                </div>

                {/* Academic Grade */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Academic Standing</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Award className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold text-purple-600">
                    Grade {examData.summary?.overallGrade || '—'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {examData.summary?.overallPercentage || 0}% overall marks (
                    {examData.summary?.totalSubjects || 0} exams taken)
                  </p>
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View Report Card →
                  </button>
                </div>

                {/* Fee Status */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Tuition Fees</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                    ${feeData.summary?.pendingAmount || 0}
                  </h3>
                  <p className="mt-1 text-xs text-amber-600 font-semibold">
                    {feeData.summary?.pendingAmount > 0 ? 'Payment outstanding' : 'All fees paid up to date'}
                  </p>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View Invoices →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: ATTENDANCE ================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Attendance Log</h2>
                  <p className="text-sm text-slate-500">Personal daily attendance record</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-white p-5">
                  <p className="text-xs font-bold uppercase text-slate-400">Overall Rate</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-blue-600">
                    {attendanceData.summary?.percentage ?? 100}%
                  </h3>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <p className="text-xs font-bold uppercase text-emerald-600">Days Present</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-emerald-700">
                    {attendanceData.summary?.presentCount || 0}
                  </h3>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
                  <p className="text-xs font-bold uppercase text-amber-600">Days Late</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-amber-700">
                    {attendanceData.summary?.lateCount || 0}
                  </h3>
                </div>
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-5">
                  <p className="text-xs font-bold uppercase text-red-600">Days Absent</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-red-700">
                    {attendanceData.summary?.absentCount || 0}
                  </h3>
                </div>
              </div>

              {/* Records List */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Class</th>
                      <th className="px-6 py-4">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceData.records?.length > 0 ? (
                      attendanceData.records.map((rec) => (
                        <tr key={rec._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {new Date(rec.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {rec.class ? `${rec.class.className} - ${rec.class.section}` : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                                rec.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : rec.status === 'Late'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {rec.status === 'Present' && <CheckCircle className="h-3.5 w-3.5" />}
                              {rec.status === 'Late' && <Clock className="h-3.5 w-3.5" />}
                              {rec.status === 'Absent' && <XCircle className="h-3.5 w-3.5" />}
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400">
                          No attendance records entered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB: EXAMS ================= */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Academic Report Card</h2>
                  <p className="text-sm text-slate-500">Official grades and examination marks</p>
                </div>
                {examData.summary?.overallGrade && (
                  <div className="flex items-center gap-3 rounded-2xl bg-purple-50 px-5 py-3 border border-purple-100">
                    <span className="text-xs font-bold text-purple-700 uppercase">Overall Grade:</span>
                    <span className="text-2xl font-black text-purple-700">
                      {examData.summary.overallGrade}
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      ({examData.summary.overallPercentage}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Grouped Exams */}
              {Object.keys(examData.exams || {}).length > 0 ? (
                Object.entries(examData.exams).map(([examTitle, subjects]) => (
                  <div
                    key={examTitle}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs"
                  >
                    <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                      <h3 className="font-extrabold text-slate-900">{examTitle}</h3>
                    </div>
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-3">Subject</th>
                          <th className="px-6 py-3">Obtained Marks</th>
                          <th className="px-6 py-3">Total Marks</th>
                          <th className="px-6 py-3">Percentage</th>
                          <th className="px-6 py-3">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {subjects.map((sub) => (
                          <tr key={sub._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-800">{sub.subject}</td>
                            <td className="px-6 py-4 font-extrabold text-slate-900">{sub.obtainedMarks}</td>
                            <td className="px-6 py-4 text-slate-500">{sub.totalMarks}</td>
                            <td className="px-6 py-4 font-semibold text-slate-700">{sub.percentage}%</td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-md px-2.5 py-1 text-xs font-black ${
                                  sub.grade === 'A+' || sub.grade === 'A'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : sub.grade === 'B' || sub.grade === 'C'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {sub.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-400">
                  No exam results have been posted yet.
                </div>
              )}
            </div>
          )}

          {/* ================= TAB: FEES ================= */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tuition & Fee Statements</h2>
                  <p className="text-sm text-slate-500">Track invoices and payment status</p>
                </div>
              </div>

              {/* Fee summary cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-white p-5">
                  <p className="text-xs font-bold uppercase text-slate-400">Total Billed</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                    ${feeData.summary?.totalAmount || 0}
                  </h3>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <p className="text-xs font-bold uppercase text-emerald-600">Total Paid</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-emerald-700">
                    ${feeData.summary?.paidAmount || 0}
                  </h3>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
                  <p className="text-xs font-bold uppercase text-amber-600">Pending Dues</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-amber-700">
                    ${feeData.summary?.pendingAmount || 0}
                  </h3>
                </div>
              </div>

              {/* Fees Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feeData.fees?.length > 0 ? (
                      feeData.fees.map((f, i) => (
                        <tr key={f._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-900">INV-00{i + 1}</td>
                          <td className="px-6 py-4 font-extrabold text-slate-900">${f.amount}</td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(f.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                                f.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {f.status === 'Paid' ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No fee invoices issued yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
