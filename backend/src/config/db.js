// backend/src/config/db.js
// PostgreSQL helper utilities for the MoodBeats backend.
//
// Exported functions:
//   - query(text, params = [])
//   - getClient()
//   - testConnection()
//   - checkHealth()
//   - closePool()

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables if available
dotenv.config();

// ---------------------------------------------------------------------------
// 1. Explicitly validate DATABASE_URL
// ---------------------------------------------------------------------------
const rawUrl = process.env.DATABASE_URL;
const connectionString = (typeof rawUrl === 'string' ? rawUrl.trim() : '');

/** @type {import('pg').Pool | null} */
const pool = connectionString
  ? new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : null;

if (!pool) {
  // Warn once at load time without leaking any credentials
  console.error('[db] DATABASE_URL environment variable is missing or empty. Database operations will fail until configured.');
}

// ---------------------------------------------------------------------------
// 2. Configuration guard
// ---------------------------------------------------------------------------
const assertPool = () => {
  if (!pool) {
    const error = new Error('Database is not configured: DATABASE_URL is missing or empty.');
    error.code = 'DB_NOT_CONFIGURED';
    throw error;
  }
  return pool;
};

// ---------------------------------------------------------------------------
// 3. Exported functions
// ---------------------------------------------------------------------------

/**
 * Executes a parameterized query using the pool.
 * Throws a configuration error if the pool is unconfigured.
 * @param {string} text - SQL query text
 * @param {Array<any>} [params] - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = (text, params = []) => assertPool().query(text, params);

/**
 * Acquires a client from the pool for transactions.
 * Caller is responsible for releasing the client.
 * Throws a configuration error if the pool is unconfigured.
 * @returns {Promise<import('pg').PoolClient>}
 */
export const getClient = async () => {
  const client = await assertPool().connect();
  return client;
};

/**
 * Tests the database connection with SELECT 1.
 * Gracefully returns false if unconfigured or unreachable.
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  if (!pool) return false;
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

/**
 * Health-check object for /api/health endpoint.
 * Gracefully returns disconnected status if unconfigured.
 * @returns {Promise<{connected: boolean, message?: string}>}
 */
export const checkHealth = async () => {
  const connected = await testConnection();
  return connected
    ? { connected: true }
    : { connected: false, message: 'Unable to reach PostgreSQL database' };
};

/**
 * Closes the connection pool gracefully.
 * Safe no-op if pool was never initialized.
 * @returns {Promise<void>}
 */
export const closePool = async () => {
  if (!pool) return;
  try {
    await pool.end();
    console.log('[db] PostgreSQL pool closed.');
  } catch (err) {
    console.error('[db] Error closing PostgreSQL pool:', err.message);
    throw err;
  }
};
