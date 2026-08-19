import { Pool, QueryResultRow } from "pg";

const globalForUsersPg = globalThis as unknown as {
  usersPool: Pool | undefined;
};

export const usersPool =
  globalForUsersPg.usersPool ??
  new Pool({
    connectionString: process.env.USERS_DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

usersPool.on("error", (err) => {
  console.error("Unexpected error on idle users Postgres client", err);
});

if (process.env.NODE_ENV !== "production") {
  globalForUsersPg.usersPool = usersPool;
}

export async function usersQuery<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
) {
  const res = await usersPool.query<T>(text, params);
  return res;
}