import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  BookOpen,
} from 'lucide-react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [teacherProfile, setTeacherProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);

  // Attendance states
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Exam marks state
  const [examClassId, setExamClassId] = useState('');
  const [examName, setExamName] = useState('Final Exam');
  const [examSubject, setExamSubject] = useState('');
  const [examTotalMarks, setExamTotalMarks] = useState(100);
  const [examStudentsList, setExamStudentsList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);

  const fetchProfileAndStats = async () => {
    try {
      setLoading(true);
      const [statsRes, teacherRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/teachers/me'),
      ]);

      setStats(statsRes.data.stats);
      setTeacherProfile(teacherRes.data.teacher);
      setAssignedClasses(teacherRes.data.teacher.assignedClasses || []);

      if (teacherRes.data.teacher.assignedClasses?.length > 0) {
        const firstClassId = teacherRes.data.teacher.assignedClasses[0]._id;
        setSelectedClassId(firstClassId);
        setExamClassId(firstClassId);
      }
      if (teacherRes.data.teacher.subject) {
        setExamSubject(teacherRes.data.teacher.subject);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teacher workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  // Fetch Attendance Sheet
  const fetchAttendanceSheet = async () => {
    if (!selectedClassId) return;
    try {
      setAttendanceLoading(true);
      setError('');
      const res = await api.get(`/attendance/class/${selectedClassId}`, {
        params: { date: attendanceDate },
      });
      setAttendanceList(res.data.attendance || []);
    } catch (err) {
      setError('Failed to load class attendance sheet');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchAttendanceSheet();
    }
  }, [selectedClassId, attendanceDate]);

  // Fetch Exam Students
  const fetchExamStudents = async () => {
    if (!examClassId) return;
    try {
      setExamLoading(true);
      setError('');
      const res = await api.get(`/classes/${examClassId}`);
      const students = res.data.students || [];
      setExamStudentsList(
        students.map((s) => ({
          studentId: s._id,
          name: s.user?.name,
          admissionNumber: s.admissionNumber,
          obtainedMarks: '',
        }))
      );
    } catch (err) {
      setError('Failed to load students for exam entry');
    } finally {
      setExamLoading(false);
    }
  };

  useEffect(() => {
    if (examClassId) {
      fetchExamStudents();
    }
  }, [examClassId]);

  // Update single student attendance status in local state
  const handleStatusChange = (studentId, status) => {
    setAttendanceList((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  // Mark all present shortcut
  const markAll = (status) => {
    setAttendanceList((prev) => prev.map((item) => ({ ...item, status })));
  };

  // Save attendance to backend
  const handleSaveAttendance = async () => {
    try {
      setError('');
      setSuccess('');
      const records = attendanceList.map((item) => ({
        studentId: item.studentId,
        status: item.status,
      }));

      await api.post('/attendance/mark', {
        classId: selectedClassId,
        date: attendanceDate,
        records,
      });

      setSuccess('Attendance successfully saved and recorded!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  // Save exam results to backend
  const handleSaveExamResults = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      const results = examStudentsList
        .filter((s) => s.obtainedMarks !== '' && !isNaN(s.obtainedMarks))
        .map((s) => ({
          studentId: s.studentId,
          obtainedMarks: Number(s.obtainedMarks),
        }));

      if (results.length === 0) {
        return setError('Please enter marks for at least one student');
      }

      await api.post('/exams/record', {
        examName,
        subject: examSubject,
        totalMarks: Number(examTotalMarks),
        results,
      });

      setSuccess(`Exam marks recorded for ${results.length} students!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record exam marks');
    }
  };

  const navItems = [
    { id: 'overview', label: 'My Overview', icon: BookOpen },
    { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { id: 'exams', label: 'Record Exam Marks', icon: GraduationCap },
  ];

  return (
    <DashboardLayout
      title="Teacher Portal"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setError('');
        setSuccess('');
      }}
    >
      {/* Alerts */}
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
              {/* Profile Card */}
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-md">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Faculty Profile
                </span>
                <h2 className="mt-4 text-3xl font-extrabold">{teacherProfile?.user?.name}</h2>
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-emerald-100">
                  <div>
                    <span className="text-emerald-200">Employee ID: </span>
                    <span className="font-bold text-white">{teacherProfile?.employeeId}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200">Subject: </span>
                    <span className="font-bold text-white">{teacherProfile?.subject}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200">Email: </span>
                    <span className="font-bold text-white">{teacherProfile?.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200">Phone: </span>
                    <span className="font-bold text-white">{teacherProfile?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Assigned Classes</p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
                    {assignedClasses.length}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">Class sections taught</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Total Students</p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
                    {stats?.totalStudents || 0}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">Under your teaching</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Today's Attendance</p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CalendarCheck className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                    {stats?.todayAttendanceMarked ? (
                      <span className="text-emerald-600">Marked for Today</span>
                    ) : (
                      <span className="text-amber-600">Pending Today</span>
                    )}
                  </h3>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Open Attendance Sheet →
                  </button>
                </div>
              </div>

              {/* Assigned Classes List */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900">My Teaching Classes</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {assignedClasses.map((cls) => (
                    <div
                      key={cls._id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-5"
                    >
                      <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-extrabold text-blue-700">
                        Section {cls.section}
                      </span>
                      <h4 className="mt-2 text-xl font-extrabold text-slate-900">{cls.className}</h4>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedClassId(cls._id);
                            setActiveTab('attendance');
                          }}
                          className="flex-1 rounded-lg bg-blue-600 py-1.5 text-center text-xs font-bold text-white hover:bg-blue-700"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => {
                            setExamClassId(cls._id);
                            setActiveTab('exams');
                          }}
                          className="flex-1 rounded-lg border border-slate-300 bg-white py-1.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Exam Marks
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: ATTENDANCE ================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Daily Attendance Sheet</h2>
                  <p className="text-sm text-slate-500">Record and update daily student presence</p>
                </div>
                <button
                  onClick={handleSaveAttendance}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" /> Save Attendance
                </button>
              </div>

              {/* Class & Date Selector */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Class</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      {assignedClasses.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.className} - Section {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Bulk status shortcuts */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Quick Fill:</span>
                  <button
                    onClick={() => markAll('Present')}
                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => markAll('Absent')}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    All Absent
                  </button>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                {attendanceLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : (
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Admission #</th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4 text-center">Status Selection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceList.length > 0 ? (
                        attendanceList.map((stu) => (
                          <tr key={stu.studentId} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-semibold text-slate-900">{stu.admissionNumber}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{stu.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(stu.studentId, 'Present')}
                                  className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                    stu.status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  <CheckCircle className="h-3.5 w-3.5" /> Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(stu.studentId, 'Late')}
                                  className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                    stu.status === 'Late'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                >
                                  <Clock className="h-3.5 w-3.5" /> Late
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(stu.studentId, 'Absent')}
                                  className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                    stu.status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-xs'
                                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                                  }`}
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-400">
                            No students found in this class.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB: EXAMS ================= */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveExamResults} className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Record Examination Results</h2>
                    <p className="text-sm text-slate-500">Enter marks for exams and subjects</p>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-200 hover:bg-purple-700"
                  >
                    <Save className="h-4 w-4" /> Save Exam Marks
                  </button>
                </div>

                {/* Exam Settings Card */}
                <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:grid-cols-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Target Class</label>
                    <select
                      value={examClassId}
                      onChange={(e) => setExamClassId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold outline-none focus:border-purple-500"
                    >
                      {assignedClasses.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.className} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Exam Title</label>
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      required
                      placeholder="e.g. Midterm Examination"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Subject</label>
                    <input
                      type="text"
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      required
                      placeholder="e.g. Mathematics"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Total Marks</label>
                    <input
                      type="number"
                      min="1"
                      value={examTotalMarks}
                      onChange={(e) => setExamTotalMarks(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Students Marks Input Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                  {examLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Admission #</th>
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Obtained Marks (out of {examTotalMarks})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {examStudentsList.length > 0 ? (
                          examStudentsList.map((stu, idx) => (
                            <tr key={stu.studentId} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-semibold text-slate-900">{stu.admissionNumber}</td>
                              <td className="px-6 py-4 font-bold text-slate-800">{stu.name}</td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  min="0"
                                  max={examTotalMarks}
                                  placeholder="0"
                                  value={stu.obtainedMarks}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setExamStudentsList((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, obtainedMarks: val } : item
                                      )
                                    );
                                  }}
                                  className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-900 outline-none focus:border-purple-500"
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-400">
                              No students in this class.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
