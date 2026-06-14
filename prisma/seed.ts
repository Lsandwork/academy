import { PrismaClient, Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "lsand.work@gmail.com";
const ADMIN_PASSWORD = "password123";
const ADMIN_NAME = "Admin User";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabaseId: string | null = null;
  if (url && serviceKey) {
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data, error } = await supabase.auth.admin.listUsers();
    if (!error) {
      supabaseId = data.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL)?.id ?? null;
    }
  }

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: Role.ADMIN,
      name: ADMIN_NAME,
      ...(supabaseId ? { supabaseId } : {})
    },
    create: {
      email: ADMIN_EMAIL,
      role: Role.ADMIN,
      name: ADMIN_NAME,
      supabaseId
    }
  });

  console.log(`Seeded admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}${supabaseId ? ` (linked supabaseId)` : ""}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
