#!/usr/bin/env node
/**
 * One-time production setup:
 * 1. Creates admin user in Supabase Auth (if missing)
 * 2. Runs prisma db push + seed (requires DATABASE_URL)
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... DATABASE_URL=... node scripts/provision-production.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";

const ADMIN_EMAIL = "lsand.work@gmail.com";
const ADMIN_PASSWORD = "password123";
const ADMIN_NAME = "Admin User";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function ensureAdminAuthUser() {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
  if (existing) {
    console.log(`Supabase auth user already exists: ${ADMIN_EMAIL}`);
    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: ADMIN_NAME }
  });

  if (error) throw error;
  console.log(`Created Supabase auth user: ${ADMIN_EMAIL}`);
  return data.user;
}

async function main() {
  await ensureAdminAuthUser();

  if (!databaseUrl || databaseUrl.startsWith("file:")) {
    console.warn("DATABASE_URL not set or still SQLite — skipping prisma db push/seed.");
    console.warn("Add a Postgres DATABASE_URL on Vercel, then run: npm run db:push && npm run db:seed");
    return;
  }

  execSync("npx prisma db push", { stdio: "inherit", env: process.env });
  execSync("npm run db:seed", { stdio: "inherit", env: process.env });
  console.log("Database schema pushed and admin profile seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
