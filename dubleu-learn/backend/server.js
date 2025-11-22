// Load environment variables FIRST with debugging
const path = require('path');
console.log('🔍 Current directory:', __dirname);
console.log('🔍 Looking for .env file at:', path.join(__dirname, '.env'));

require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug environment variables immediately
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'UNDEFINED');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
console.log('PORT:', process.env.PORT || 'UNDEFINED');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'UNDEFINED');

// If MONGODB_URI is not set, use hardcoded Atlas URI for now
if (!process.env.MONGODB_URI) {
  console.log('⚠️ MONGODB_URI not found in environment, using hardcoded Atlas URI');
  process.env.MONGODB_URI = 'mongodb+srv://clvesta321_db_user:Admi8135@clusterdubleu.1cz6wfn.mongodb.net/dubleulearn?retryWrites=true&w=majority';
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./config/socket'); // Import socket configuration

console.log('🚀 Starting DubleuLearn Backend Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const assignmentRoutes = require('./routes/assignments');

const app = express();
const server = http.createServer(app);


// Flexible CORS configuration for all Vercel deployments
const allowedOrigins = [
  'http://localhost:3000',
  'https://dubleulearn.vercel.app',
  'https://mern-final-project-dubleu-x-awhi.vercel.app',
  'https://mern-final-project-dubl-git-8c0ffb-sylvesters-projects-7aa7f8dd.vercel.app',
  'https://mern-final-project-dubleu-x-awhi-ll4icwlk8.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);
console.log('🌐 CORS will also allow any origin containing:', [
  'mern-final-project-dubleu',
  'mern-final-project-dubl', 
  'sylvesters-projects',
  '.vercel.app'
]);

// Enhanced CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Check if origin matches any of your project patterns
    const isYourVercelProject = 
      origin.includes('mern-final-project-dubleu') ||
      origin.includes('mern-final-project-dubl') ||
      origin.includes('sylvesters-projects') ||
      origin.endsWith('.vercel.app'); // Allow ALL Vercel domains
    
    if (allowedOrigins.includes(origin) || isYourVercelProject) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Connect to database
connectDB();

// Initialize Socket.io
const io = initSocket(server);
console.log('✅ Socket.io initialized');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/assignments', assignmentRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DubleuLearn API is running!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      clientUrl: process.env.CLIENT_URL
    },
    services: {
      database: 'MongoDB Atlas',
      realtime: 'Socket.io',
      authentication: 'JWT'
    }
  });
});

// API status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - MUST be after all routes
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/health',
      '/api/status',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/courses',
      '/api/users'
    ]
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for origins:`, allowedOrigins);
  console.log(`🔌 Socket.io real-time features enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});