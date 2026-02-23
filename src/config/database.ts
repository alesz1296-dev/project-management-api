import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a new database client
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'api_db',
});

// Connect to database
export const connectDatabase = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

export default client;
