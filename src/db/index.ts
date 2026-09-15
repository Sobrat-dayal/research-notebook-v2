import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// In Cloud Run, the Cloud SQL socket is mounted under /cloudsql/...
// In local/AI Studio containers, it is often mounted under /app/cloudsql/...
function getSqlHost(): string | undefined {
  let host = process.env.SQL_HOST;
  if (!host) return undefined;
  if (host.startsWith('/app/cloudsql/') && !fs.existsSync(host)) {
    const cloudRunSocketPath = host.replace('/app/cloudsql/', '/cloudsql/');
    if (fs.existsSync(cloudRunSocketPath) || fs.existsSync('/cloudsql')) {
      return cloudRunSocketPath;
    }
  }
  return host;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    const host = getSqlHost();
    global._postgresPool = new Pool({
      host,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

