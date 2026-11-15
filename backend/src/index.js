import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env relative to this file
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import express from 'express';
import dbConnect from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import classRouter from './routes/class.routes.js';
import teacherRouter from './routes/teacher.routes.js';
import studentRouter from './routes/student.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import examRouter from './routes/exam.routes.js';
import feeRouter from './routes/fee.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import userRouter from './routes/user.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://school-management-system-black-rho.vercel.app',
  'https://school-management-system-black-rho.vercel.app/',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      try {
        const hostname = new URL(origin).hostname;
        if (
          allowedOrigins.some((o) => o.replace(/\/$/, '') === cleanOrigin) ||
          hostname.endsWith('.vercel.app') ||
          hostname === 'localhost' ||
          hostname === '127.0.0.1'
        ) {
          return callback(null, true);
        }
      } catch {
        // Fallback for non-standard origins
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/classes', classRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/students', studentRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/exams', examRouter);
app.use('/api/fees', feeRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.json({ message: 'School Management System API is running' });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const startServer = async () => {
  try {
    await dbConnect();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
