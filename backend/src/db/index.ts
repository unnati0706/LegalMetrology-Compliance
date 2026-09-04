import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isConnected = false;

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    isConnected = true;
    client.release();
    console.log('[DB] PostgreSQL pool initialized successfully.');
    return true;
  } catch (error: any) {
    console.warn('[DB] PostgreSQL connection not established (using in-memory data layer fallback for testing/dev):', error.message);
    isConnected = false;
    return false;
  }
};

export const getDbStatus = () => {
  return {
    connected: isConnected,
    databaseUrl: config.databaseUrl.replace(/:[^:@]+@/, ':***@'),
  };
};
