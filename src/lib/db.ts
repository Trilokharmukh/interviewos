import { Pool } from "pg";
let pool: Pool | undefined;
export function databaseConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET.length >= 32,
  );
}
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured.");
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });
  return pool;
}
