import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import goalRoutes from './routes/goal.routes.js';
import sessionRoutes from './routes/session.routes.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Import database utilities
import { checkHealth } from './config/db.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  const health = {
    success: true,
    message: 'MoodBeats API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: await checkHealth(),
  };

  if (!health.database.connected) {
    health.success = false;
    health.message = 'API running but database unavailable';
  }

  const statusCode = health.database.connected ? 200 : 503;
  res.status(statusCode).json(health);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/sessions', sessionRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

export default app;
