import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';

// Import all routes
import userRoutes from './routes/userRoutes';
import organizationRoutes from './routes/organizationRoutes';
import membershipRoutes from './routes/membershipRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Register all routes
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api', membershipRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Test Prisma
app.get('/api/test', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ userCount: users.length, users });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
