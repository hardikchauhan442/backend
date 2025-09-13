import { Pool } from 'pg';
import { env } from '@app/config/config';
import { logger } from '@app/logger';

const { database, username, password, port, host }: any = env;

if (!database || !username || !password || !port || !host) {
  throw new Error('Database configuration is incomplete. Please check environment variables.');
}

// Create a new pool instance
export const pool = new Pool({
  user: username,
  host: host,
  database: database,
  password: password,
  port: port,
  max: 10,
  idleTimeoutMillis: 30000,
});

const origQuery = pool.query.bind(pool);
pool.query = (async (text: any, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await origQuery(text, params);
    const duration = Date.now() - start;
    logger.info(`SQL (${duration} ms): `);
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error(`SQL ERROR (${duration} ms): ${text}`, err);
    throw err;
  }
}) as any;
// Test the connection
export async function initDb() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    logger.info('👍 Connection has been established successfully at', res.rows[0].now);
    client.release();
  } catch (err) {
    logger.error('✗ Unable to connect to the database:', err);
    process.exit(1);
  }
}
initDb();

// only close on shutdown
process.on('SIGTERM', () => pool.end());
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});
