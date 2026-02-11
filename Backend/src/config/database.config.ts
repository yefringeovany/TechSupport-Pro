import dotenv from 'dotenv';
import { Pool } from 'pg';
import mongoose from 'mongoose';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const MONGODB_URI = process.env.MONGODB_URI;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en el .env');
}

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI no está definida en el .env');
}

export const postgresPool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

export const connectPostgres = async () => {
  try {
    const client = await postgresPool.connect();
    console.log('PostgreSQL conectado');
    client.release();
  } catch (error) {
    console.error('Error PostgreSQL:', error);
    process.exit(1);
  }
};

export const connectMongo = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error MongoDB:', error);
    process.exit(1);
  }
};

export const connectDatabases = async () => {
  await connectPostgres();
  await connectMongo();
};
