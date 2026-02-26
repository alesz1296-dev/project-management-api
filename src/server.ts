declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  AppError,
} from './middlewares/errorHandler';

// Import all routes
import userRoutes from './routes/userRoutes';
import organizationRoutes from './routes/organizationRoutes';
import membershipRoutes from './routes/membershipRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE SETUP (Sequential)
// ============================================

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  console.log(`[${timestamp}] ${method} ${path}`);
  next();
});

// ============================================
// ROUTES (Request handlers)
// ============================================

app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api', membershipRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Database test endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test', async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json({
        success: true,
        message: 'Database connection successful',
        data: {
          userCount: users.length,
          users,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: String(error),
      });
    }
  });
}

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
// Catches requests to routes that don't exist
app.use(notFoundHandler);

// Error handler
// Catches all errors thrown by routes or middlewares, must be last in middlewares
app.use(errorHandler);

// ============================================
// SERVER INIT
// ============================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`
  ✅ Server running on http://localhost:${PORT}
  📍 Environment: ${NODE_ENV}
  🔐 Auth: ${NODE_ENV === 'production' ? 'REQUIRED' : 'Bypassed (development mode)'}
  `);
});
