import { createClient } from "@supabase/supabase-js";
import { AccessLevel, PrismaClient, Role } from "@prisma/client";

const TRAINER_TEMP_PASSWORD = "password1!!!";

export type TrainerAccountSeed = {
  email: string;
  name: string;
  trainerSlug: string;
};

export const TRAINER_ACCOUNTS: TrainerAccountSeed[] = [
  { email: "ivonneeBICE@gmail.com", name: "Ivonne C.", trainerSlug: "ivonne-c" },
  { email: "loveandcarepawbabys@gmail.com", name: "Amanda N.", trainerSlug: "amanda-n" }
];

export async function ensureTrainerAuthUser(
  supabase: ReturnType<typeof createClient>,
  account: TrainerAccountSeed
) {
  const normalizedEmail = account.email.toLowerCase().trim();
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = list.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
  if (existing) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: TRAINER_TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: { name: account.name }
    });
    if (updateError) throw updateError;
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: TRAINER_TEMP_PASSWORD,
    email_confirm: true,
    user_metadata: { name: account.name }
  });
  if (error) throw error;
  if (!data.user) throw new Error(`Could not create auth user for ${normalizedEmail}`);
  return data.user.id;
}

export async function seedTrainerAccounts(prisma: PrismaClient) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn("[trainers] Skipping trainer auth accounts — Supabase admin not configured.");
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  for (const account of TRAINER_ACCOUNTS) {
    const normalizedEmail = account.email.toLowerCase().trim();
    const supabaseId = await ensureTrainerAuthUser(supabase, account);

    const profile = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        role: Role.TRAINER,
        name: account.name,
        supabaseId,
        mustChangePassword: true,
        accessLevel: AccessLevel.MONTHLY
      },
      create: {
        email: normalizedEmail,
        role: Role.TRAINER,
        name: account.name,
        supabaseId,
        mustChangePassword: true,
        accessLevel: AccessLevel.MONTHLY
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

    console.log(`Trainer account ready: ${normalizedEmail} / ${TRAINER_TEMP_PASSWORD} (must change on login)`);
  }
}
