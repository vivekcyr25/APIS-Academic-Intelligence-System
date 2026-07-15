// app.js — Unified Express.js Routing Layer for APIS Backend
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import serverless API handlers
import aiHandler from './api/ai.ts';
import chatStreamHandler from './api/chat-stream.ts';
import chatHandler from './api/chat.js';
import healthHandler from './api/health.ts';
import umsHandler from './api/ums.js';
import umsSyncHandler from './api/ums-sync.js';
import verifyHandler from './api/verify.ts';

// Import nested UMS sub-handlers
import fetchAssignmentsHandler from './api/ums/fetch-assignments.js';
import fetchAttendanceHandler from './api/ums/fetch-attendance.js';
import fetchMarksHandler from './api/ums/fetch-marks.js';
import fetchTimetableHandler from './api/ums/fetch-timetable.js';

dotenv.config();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing Table mapping identical endpoint contracts
app.post('/api/ai', aiHandler);
app.post('/api/chat-stream', chatStreamHandler);
app.post('/api/chat', chatHandler);
app.get('/api/health', healthHandler);
app.all('/api/ums', umsHandler);
app.post('/api/ums-sync', umsSyncHandler);
app.post('/api/verify', verifyHandler);

// Nested UMS endpoints
app.post('/api/ums/fetch-assignments', fetchAssignmentsHandler);
app.post('/api/ums/fetch-attendance', fetchAttendanceHandler);
app.post('/api/ums/fetch-marks', fetchMarksHandler);
app.post('/api/ums/fetch-timetable', fetchTimetableHandler);

export default app;
