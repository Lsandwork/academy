import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const prisma = new PrismaClient();

  try {
    const enumSql = readFileSync(join(__dirname, "ensure-trainer-role-enum.sql"), "utf8");
    await prisma.$executeRawUnsafe(enumSql);
    console.log("Ensured TRAINER enum value exists.");
  } catch (error) {
    console.warn("Enum ensure step:", error);
  }

  execSync("npx prisma db push", { stdio: "inherit", env: process.env });

  await prisma.$executeRaw`
    UPDATE academy."TrainerContract"
    SET status = 'pending_admin'
    WHERE status = 'pending'
  `;
  console.log("Migrated legacy pending contracts to pending_admin.");

  await prisma.$disconnect();

  execSync("npm run users:repair", { stdio: "inherit", env: process.env });
  console.log("Production sync complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
