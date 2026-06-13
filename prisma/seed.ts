import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "lsand.work@gmail.com" },
    update: {
      passwordHash,
      role: Role.ADMIN,
      name: "Admin User"
    },
    create: {
      email: "lsand.work@gmail.com",
      passwordHash,
      role: Role.ADMIN,
      name: "Admin User"
    }
  });

  console.log("Seeded admin: lsand.work@gmail.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
