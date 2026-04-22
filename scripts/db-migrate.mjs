import { readFile } from "node:fs/promises";

import nextEnv from "@next/env";
import { createPool } from "@vercel/postgres";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const migrationPath = process.argv[2] ?? "migrations/001_initial.sql";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const sql = await readFile(migrationPath, "utf8");
const pool = createPool({ connectionString });

try {
  await pool.query(sql);
  console.log(`Applied migration: ${migrationPath}`);
} finally {
  await pool.end();
}
