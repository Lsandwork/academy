import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      mustChangePassword: true,
      supabaseId: true,
      accessLevel: true,
      createdAt: true
    }
  });
  console.log("Prisma users:", JSON.stringify(users, null, 2));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
    if (error) throw error;
    console.log(
      "Supabase auth users:",
      JSON.stringify(
        data.users.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at })),
        null,
        2
      )
    );
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
