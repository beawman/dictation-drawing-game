import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use the connection URL from environment variables
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
const sql = postgres(connectionString, { 
  max: 1, // Use connection pooling
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });