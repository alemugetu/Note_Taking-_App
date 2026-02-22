import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import notebookRoutes from './routes/notebookRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import startReminderWorker from './utils/reminderWorker.js';
import pushRoutes from './routes/pushRoutes.js';
import configureCloudinary from './config/cloudinary.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();
// Configure Cloudinary if env present
configureCloudinary();


// Debug Middleware to log origin
app.use((req, res, next) => {
  console.log(`[REQUEST] Method: ${req.method} | URL: ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));
// Increase payload limits a bit to avoid intermittent "request entity too large"
// when notes include attachment metadata.
app.use(express.json({ limit: process.env.JSON_LIMIT || '5mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_LIMIT || '5mb' }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Note Taking App API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notebooks', notebookRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/push', pushRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Map common body/upload errors to correct HTTP status codes
  let statusCode = err.statusCode || err.status || 500;
  if (err && err.name === 'MulterError') {
    // e.g. LIMIT_FILE_SIZE
    statusCode = 413;
  }
  if (err && (err.type === 'entity.too.large' || err.name === 'PayloadTooLargeError')) {
    statusCode = 413;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  try {
    startReminderWorker();
  } catch (err) {
    console.error('Failed to start reminder worker', err && err.message ? err.message : err);
  }
});
