import { AccessLevel, PrismaClient, Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { TRAINER_ACCOUNTS, TRAINER_TEMP_PASSWORD } from "../prisma/seedTrainerAccounts";

async function listAllAuthUsers(supabase: ReturnType<typeof createClient>) {
  const users: { id: string; email?: string; user_metadata?: { name?: string } }[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < perPage) break;
    page++;
  }

  return users;
}

async function main() {
  const prisma = new PrismaClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin credentials.");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const authUsers = await listAllAuthUsers(supabase);
  let restored = 0;
  let relinked = 0;

  for (const authUser of authUsers) {
    const email = authUser.email?.toLowerCase().trim();
    if (!email) continue;

    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          supabaseId: authUser.id,
          name: typeof authUser.user_metadata?.name === "string" ? authUser.user_metadata.name : null,
          role: Role.USER
        }
      });
      restored++;
      console.log(`Restored missing profile: ${email}`);
      continue;
    }

    if (existing.supabaseId !== authUser.id) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { supabaseId: authUser.id }
      });
      relinked++;
      console.log(`Relinked Supabase ID: ${email}`);
    }
  }

  for (const account of TRAINER_ACCOUNTS) {
    const normalizedEmail = account.email.toLowerCase().trim();
    const authUser = authUsers.find((u) => u.email?.toLowerCase() === normalizedEmail);

    if (!authUser) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: TRAINER_TEMP_PASSWORD,
        email_confirm: true,
        user_metadata: { name: account.name }
      });
      if (error) throw error;
      if (!data.user) throw new Error(`Could not create auth user for ${normalizedEmail}`);
      authUsers.push(data.user);
    } else {
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: TRAINER_TEMP_PASSWORD,
        email_confirm: true,
        user_metadata: { name: account.name }
      });
    }

    const authId = authUsers.find((u) => u.email?.toLowerCase() === normalizedEmail)?.id;
    if (!authId) throw new Error(`Missing auth user for ${normalizedEmail}`);

    const profile = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        role: Role.TRAINER,
        name: account.name,
        supabaseId: authId,
        mustChangePassword: true,
        accessLevel: AccessLevel.LIFETIME
      },
      create: {
        email: normalizedEmail,
        role: Role.TRAINER,
        name: account.name,
        supabaseId: authId,
        mustChangePassword: true,
        accessLevel: AccessLevel.LIFETIME
      }
    });

    await prisma.certifiedTrainer.update({
      where: { slug: account.trainerSlug },
      data: {
        userId: profile.id,
        email: normalizedEmail,
        active: true
      }
    });

    console.log(`Trainer ready: ${normalizedEmail} / ${TRAINER_TEMP_PASSWORD}`);
  }

  const lonnie = await prisma.user.findUnique({ where: { email: "lonniesandoval7@gmail.com" } });
  if (lonnie) {
    console.log(`Owner account OK: lonniesandoval7@gmail.com (${lonnie.purchasedLessonIds.length} chars of purchases)`);
  } else {
    console.warn("WARNING: lonniesandoval7@gmail.com profile missing.");
  }

  console.log(`Repair complete. Restored ${restored} profile(s), relinked ${relinked}.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
