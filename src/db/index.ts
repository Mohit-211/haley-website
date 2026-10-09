import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");

// Reuse one pool across dev hot reloads instead of opening a new one per module reload.
const globalForDb = globalThis as unknown as { mysqlPool?: mysql.Pool };
function createPool() {
  // Keep every connection in UTC so TIMESTAMP/DATETIME values round-trip as the same instant.
  const p = mysql.createPool({ uri: url, connectionLimit: 10, timezone: "Z" });
  p.pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));
  return p;
}
const pool = globalForDb.mysqlPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.mysqlPool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
export * from "./schema";
