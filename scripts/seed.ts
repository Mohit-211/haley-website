// Seeds the starting data: the New Brunswick province and the first super admin.
// Safe to re-run: it never overwrites existing rows or passwords.
//   npm run db:seed
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { hashPassword } from "../src/lib/auth/password";
import { provinces, users } from "../src/db/schema";

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (see .env.example).");
  const conn = await mysql.createConnection({ uri: url, timezone: "Z" });
  const db = drizzle(conn);

  const [anyProvince] = await db.select().from(provinces).limit(1);
  if (anyProvince) console.log("• Provinces already set up, skipping.");
  else {
    await db.insert(provinces).values({ code: "NB", name: "New Brunswick" });
    console.log("✓ Added New Brunswick as the active province.");
  }

  const name = process.env.SEED_ADMIN_NAME?.trim() || "Admin";
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  if (!email) console.log("• SEED_ADMIN_EMAIL not set, skipping super admin.");
  else {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) console.log(`• ${email} already exists, leaving it unchanged.`);
    else if (password.length < 10) throw new Error("SEED_ADMIN_PASSWORD must be at least 10 characters.");
    else {
      await db.insert(users).values({ name, email, passwordHash: await hashPassword(password), role: "super_admin" });
      console.log(`✓ Created super admin ${email}.`);
    }
  }
  await conn.end();
}

main().catch((e) => {
  console.error("✗ Seed failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
