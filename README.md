# 🎓 SchoolMS - School Management System

A modern, full-stack **School Management System (SchoolMS)** built with the **MERN stack** (MongoDB, Express, React 19, Node.js) and styled with **Tailwind CSS**. It provides comprehensive, role-based academic administration for school leaders, teachers, students, and guardians.

---

## 🔑 Demo Login Credentials

The system includes pre-seeded demo accounts for each role. You can use these immediately to log in and explore:

| Role | Email Address | Password | Portal Features & Access |
|---|---|---|---|
| 👑 **Administrator** | `admin@school.com` | `admin1234` | Full administration, class & section creation, teacher & student management, fee generation, system analytics |
| 🧑‍🏫 **Teacher / Faculty** | `teacher@school.com` | `teacher1234` | Assigned classes overview, daily student attendance marking, examination mark entry |
| 🎓 **Student** | `student@school.com` | `student1234` | Personal attendance tracking & logs, exam report cards & letter grades, tuition invoice status |
| 👨‍👩‍👧 **Parent / Guardian** | `guardian@school.com` | `guardian1234` | Linked child overview, attendance logs, academic performance reports, pending fee alerts |

---

## 🌟 Key Features

- **🛡️ Secure Dual Authentication**:
  - HTTP-only Cookies with `SameSite: "lax"`.
  - Backup `Authorization: Bearer <token>` automatically handled via Axios request interceptors.
  - Password encryption using `bcrypt` (10 rounds).
- **🏫 Class & Section Management**:
  - Class grade and section combinations with unique constraints.
  - Class Teacher assignment and enrolled student counters.
- **🧑‍🏫 Faculty Management**:
  - Teacher records with employee IDs, primary subjects, phone numbers, and multiple assigned classes.
- **👨‍🎓 Student Admissions**:
  - Unique student admission numbers, gender, date of birth, residential address, class assignment, and linked guardians.
- **📅 Daily Attendance Tracking**:
  - Mark class-wide attendance (`Present`, `Late`, `Absent`) with 1-click batch fill.
  - Historical attendance records and automated attendance percentage calculation.
- **📊 Examination & Grading**:
  - Record scores by exam name and subject.
  - Automated percentage and letter grade calculation (`A+`, `A`, `B`, `C`, `D`, `F`).
- **💳 Tuition Fee Invoicing**:
  - Issue fee invoices to individual students or batch-issue to entire classes.
  - Track payments with toggleable `Paid` and `Pending` statuses.
- **📱 Role-Specific Responsive Dashboards**:
  - Clean sidebar navigation, active page indicators, role badges, and mobile drawer menu.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with interceptors and cookie credentials support

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose 9 ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcrypt`
- **Security & Utilities**: `cors`, `cookie-parser`, `dotenv`

---

## 📁 Project Directory Structure

```text
sms/
├── .env                       # Root environment configuration
├── README.md                  # Project documentation & credentials
├── backend/
│   ├── .env                   # Backend environment configuration
│   ├── package.json
│   └── src/
│       ├── index.js           # Server entry point & route registration
│       ├── seed.js            # Database seeding script for demo data
│       ├── config/
│       │   └── db.js          # MongoDB connection handler
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── class.controller.js
│       │   ├── teacher.controller.js
│       │   ├── student.controller.js
│       │   ├── attendance.controller.js
│       │   ├── exam.controller.js
│       │   ├── fee.controller.js
│       │   ├── dashboard.controller.js
│       │   └── user.controller.js
│       ├── middlewares/
│       │   └── auth.middleware.js # JWT validation & role authorization
│       ├── models/
│       │   ├── user.model.js
│       │   ├── class.model.js
│       │   ├── teacher.model.js
│       │   ├── student.model.js
│       │   ├── attendance.model.js
│       │   ├── examResult.model.js
│       │   └── fee.model.js
│       └── routes/
│           ├── auth.routes.js
│           ├── class.routes.js
│           ├── teacher.routes.js
│           ├── student.routes.js
│           ├── attendance.routes.js
│           ├── exam.routes.js
│           ├── fee.routes.js
│           ├── dashboard.routes.js
│           └── user.routes.js
└── frontend/
    ├── package.json
    ├── vite.config.js         # Vite configuration with proxy and WASI setup
    └── src/
        ├── App.jsx            # Router and Protected Routes
        ├── main.jsx           # Root React mount with BrowserRouter & AuthProvider
        ├── components/
        │   ├── ProtectedRoute.jsx   # Role-based route guard
        │   └── DashboardLayout.jsx  # Shared responsive dashboard layout
        ├── context/
        │   └── AuthContext.jsx      # Global authentication provider
        ├── hooks/
        │   └── useAuth.js           # Custom hook for consuming AuthContext
        ├── pages/
        │   ├── Homepage.jsx         # Landing page with dynamic auth header
        │   ├── Login.jsx            # Sign in page
        │   ├── Signup.jsx           # Sign up page (Student / Guardian)
        │   ├── AdminDashboard.jsx   # Administrator portal
        │   ├── TeacherDashboard.jsx # Teacher portal
        │   ├── StudentDashboard.jsx # Student portal
        │   └── GuardianDashboard.jsx# Parent / Guardian portal
        └── services/
            └── api.js               # Axios instance with Bearer interceptor
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas connection string)

### 2. Environment Variables

Create or verify the `.env` file in `backend/.env` (and at the project root):

```env
PORT=5000
DB_URL=mongodb://127.0.0.1:27017/school_db
JWT_SECRET=SECRET_KEY_SCHOOL_MS_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

### 3. Database Seeding (Demo Data)

To reset and seed the database with all test accounts, sample class, student records, attendance, exam grades, and fee invoices, run:

```bash
cd backend
npm run seed
```

---

### 4. Running the Application

Open two terminal windows:

#### Terminal 1: Start Backend Server
```bash
cd backend
npm run dev
```
*Backend runs on:* `http://localhost:5000`

#### Terminal 2: Start Frontend Client
```bash
cd frontend
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new student/guardian | Public |
| `POST` | `/api/auth/login` | Sign in with email and password | Public |
| `POST` | `/api/auth/logout` | Clear token cookies and log out | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Protected |

### Classes (`/api/classes`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/classes` | Get all classes with student counts | Protected |
| `GET` | `/api/classes/:id` | Get single class with enrolled students | Protected |
| `POST` | `/api/classes` | Create new class & section | Admin |
| `PUT` | `/api/classes/:id` | Update class details or assigned teacher | Admin |
| `DELETE` | `/api/classes/:id` | Delete class (only if empty) | Admin |

### Teachers (`/api/teachers`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/teachers` | Get all teachers | Admin, Teacher |
| `GET` | `/api/teachers/me` | Get active teacher's assigned classes | Teacher |
| `GET` | `/api/teachers/:id` | Get teacher by ID | Admin, Teacher |
| `POST` | `/api/teachers` | Create teacher account & profile | Admin |
| `PUT` | `/api/teachers/:id` | Update teacher details | Admin |
| `DELETE` | `/api/teachers/:id` | Delete teacher account | Admin |

### Students (`/api/students`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/students` | Get students (supports `?classId=` & `?search=`) | Admin, Teacher |
| `GET` | `/api/students/me` | Get student profile or guardian's wards | Student, Guardian |
| `GET` | `/api/students/:id` | Get student by ID | Admin, Teacher, Guardian |
| `POST` | `/api/students` | Admit new student | Admin |
| `PUT` | `/api/students/:id` | Update student profile | Admin |
| `DELETE` | `/api/students/:id` | Delete student and cascading records | Admin |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/attendance/mark` | Batch mark attendance for a class | Admin, Teacher |
| `GET` | `/api/attendance/class/:classId` | Get class attendance sheet by date | Admin, Teacher |
| `GET` | `/api/attendance/student/:studentId` | Get student attendance history & summary | All Roles |

### Examinations (`/api/exams`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/exams/record` | Batch record exam marks for students | Admin, Teacher |
| `GET` | `/api/exams/class/:classId` | Get exam results for a class | Admin, Teacher |
| `GET` | `/api/exams/student/:studentId` | Get student report card grouped by exam | All Roles |
| `DELETE` | `/api/exams/:id` | Delete exam result | Admin |

### Fees & Invoices (`/api/fees`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/fees` | Get all fees with summary calculations | Admin |
| `POST` | `/api/fees` | Issue fee invoice (single student or entire class) | Admin |
| `PATCH` | `/api/fees/:id/status` | Toggle status (`Paid` / `Pending`) | Admin |
| `GET` | `/api/fees/student/:studentId` | Get fees for specific student | All Roles |
| `DELETE` | `/api/fees/:id` | Delete fee record | Admin |

### Analytics & Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Dynamic analytics tailored to user role | Protected |

---

## 📄 License
This project is licensed under the ISC License.
