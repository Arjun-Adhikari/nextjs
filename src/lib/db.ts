import { Pool, QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as { pool: Pool | undefined };

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

// Prevent background idle client drops from crashing Node process
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
) {
  const start = Date.now();
  const res = await pool.query<T>(text, params);

  if (process.env.NODE_ENV === "development") {
    const duration = Date.now() - start;
    console.log("Executed Query:", { text, duration, rows: res.rowCount });
  }

  return res;
}
