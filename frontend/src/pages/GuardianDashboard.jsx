import { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Award,
} from 'lucide-react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const GuardianDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');

  const [attendanceData, setAttendanceData] = useState({ summary: {}, records: [] });
  const [examData, setExamData] = useState({ summary: {}, exams: {} });
  const [feeData, setFeeData] = useState({ summary: {}, fees: [] });

  const fetchGuardianWards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me');
      const wardsList = res.data.students || [];
      setWards(wardsList);

      if (wardsList.length > 0) {
        setSelectedWardId(wardsList[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load children records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardianWards();
  }, []);

  const fetchSelectedWardData = async (wardId) => {
    if (!wardId) return;
    try {
      const [attRes, examRes, feeRes] = await Promise.all([
        api.get(`/attendance/student/${wardId}`),
        api.get(`/exams/student/${wardId}`),
        api.get(`/fees/student/${wardId}`),
      ]);

      setAttendanceData(attRes.data);
      setExamData(examRes.data);
      setFeeData(feeRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedWardId) {
      fetchSelectedWardData(selectedWardId);
    }
  }, [selectedWardId]);

  const selectedWard = wards.find((w) => w._id === selectedWardId);

  const navItems = [
    { id: 'overview', label: "Child's Overview", icon: Users },
    { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
    { id: 'exams', label: 'Academic Grades', icon: GraduationCap },
    {
      id: 'fees',
      label: 'Fee Payments',
      icon: CreditCard,
      badge: feeData.summary?.pendingAmount > 0 ? `$${feeData.summary.pendingAmount}` : undefined,
    },
  ];

  return (
    <DashboardLayout
      title="Parent & Guardian Portal"
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
      ) : wards.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500">
          <p className="text-lg font-bold text-slate-700">No student profiles linked to this account</p>
          <p className="mt-2 text-sm text-slate-400">
            Please ask the school administration to link your student to your email address.
          </p>
        </div>
      ) : (
        <>
          {/* Child Selector (if multiple children) */}
          {wards.length > 1 && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-400">Select Child:</span>
              <div className="flex gap-2">
                {wards.map((w) => (
                  <button
                    key={w._id}
                    onClick={() => setSelectedWardId(w._id)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      selectedWardId === w._id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {w.user?.name} ({w.class?.className}-{w.class?.section})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Profile Card */}
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-white shadow-md">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-100">
                  Student Ward
                </span>
                <h2 className="mt-4 text-3xl font-extrabold">{selectedWard?.user?.name}</h2>
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-amber-100">
                  <div>
                    <span className="text-amber-200">Admission No: </span>
                    <span className="font-bold text-white">{selectedWard?.admissionNumber}</span>
                  </div>
                  <div>
                    <span className="text-amber-200">Class: </span>
                    <span className="font-bold text-white">
                      {selectedWard?.class?.className} - {selectedWard?.class?.section}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-200">Student Email: </span>
                    <span className="font-bold text-white">{selectedWard?.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-6 sm:grid-cols-3">
                {/* Attendance */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Attendance</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                    {attendanceData.summary?.percentage ?? 100}%
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {attendanceData.summary?.presentCount || 0} days present
                  </p>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View Attendance Logs →
                  </button>
                </div>

                {/* Academic */}
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
                    {examData.summary?.overallPercentage || 0}% overall marks
                  </p>
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View Academic Results →
                  </button>
                </div>

                {/* Fees */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Fee Balance</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                    ${feeData.summary?.pendingAmount || 0}
                  </h3>
                  <p className="mt-1 text-xs text-amber-600 font-semibold">
                    {feeData.summary?.pendingAmount > 0 ? 'Pending payment' : 'No balance due'}
                  </p>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View Billing Statements →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: ATTENDANCE ================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Attendance History</h2>
                <p className="text-sm text-slate-500">Detailed record of your child's presence in school</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
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
                        <td colSpan={2} className="py-8 text-center text-slate-400">
                          No attendance records found.
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
              <div>
                <h2 className="text-xl font-bold text-slate-900">Academic Marks & Report Card</h2>
                <p className="text-sm text-slate-500">Track subject performances and exam evaluations</p>
              </div>

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
                          <th className="px-6 py-3">Score</th>
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
                  No exam results published yet.
                </div>
              )}
            </div>
          )}

          {/* ================= TAB: FEES ================= */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Tuition Invoices</h2>
                <p className="text-sm text-slate-500">School fee invoices and payment receipts</p>
              </div>

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
                          No invoices found.
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

export default GuardianDashboard;
