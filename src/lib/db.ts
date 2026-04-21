import { createPool, type VercelPool, type VercelPoolClient } from "@vercel/postgres";

import { getEnv } from "@/lib/env";

let pool: VercelPool | null = null;

export function getDb() {
  if (!pool) {
    pool = createPool({
      connectionString: getEnv().DATABASE_URL,
    });
  }

  return pool;
}

export async function withDbClient<T>(callback: (client: VercelPoolClient) => Promise<T>) {
  const client = await getDb().connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}
