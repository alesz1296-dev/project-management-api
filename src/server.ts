import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

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
