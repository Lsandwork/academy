import { createClient } from "@supabase/supabase-js";
import { AccessLevel, PrismaClient, Role } from "@prisma/client";

export const TRAINER_TEMP_PASSWORD = "password1!!!";

export type TrainerAccountSeed = {
  email: string;
  name: string;
  trainerSlug: string;
};

export const TRAINER_ACCOUNTS: TrainerAccountSeed[] = [
  { email: "ivonneeBICE@gmail.com", name: "Ivonne C.", trainerSlug: "ivonne-c" },
  { email: "loveandcarepawbabys@gmail.com", name: "Amanda N.", trainerSlug: "amanda-n" }
];

function hasOwnerData(profile: {
  role: Role;
  purchasedLessonIds: string;
  creditBalance: number;
  completedLessonIds: string;
}) {
  if (profile.role !== Role.USER) return false;
  try {
    const purchased = JSON.parse(profile.purchasedLessonIds);
    const completed = JSON.parse(profile.completedLessonIds);
    if (Array.isArray(purchased) && purchased.length > 0) return true;
    if (Array.isArray(completed) && completed.length > 0) return true;
  } catch {
    /* ignore */
  }
  return profile.creditBalance > 0;
}

async function findAuthUserByEmail(
  supabase: ReturnType<typeof createClient<any, "public", "public">>,
  email: string
) {
  const normalizedEmail = email.toLowerCase().trim();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
    if (match) return match;

    if (data.users.length < perPage) return null;
    page++;
  }
}

export async function ensureTrainerAuthUser(
  supabase: ReturnType<typeof createClient<any, "public", "public">>,
  account: TrainerAccountSeed,
  options?: { resetPassword?: boolean }
) {
  const normalizedEmail = account.email.toLowerCase().trim();
  const resetPassword = options?.resetPassword ?? false;

  const existing = await findAuthUserByEmail(supabase, normalizedEmail);
  if (existing) {
    if (resetPassword) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: TRAINER_TEMP_PASSWORD,
        email_confirm: true,
        user_metadata: { name: account.name }
      });
      if (updateError) throw updateError;
    }
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

export async function seedTrainerAccounts(prisma: PrismaClient, options?: { resetPassword?: boolean }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resetPassword = options?.resetPassword ?? false;

  if (!url || !serviceKey) {
    console.warn("[trainers] Skipping trainer auth accounts — Supabase admin not configured.");
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  for (const account of TRAINER_ACCOUNTS) {
    const normalizedEmail = account.email.toLowerCase().trim();
    const existingProfile = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingProfile && hasOwnerData(existingProfile)) {
      console.warn(
        `[trainers] Skipping ${normalizedEmail}: existing owner account with purchases/credits. Use a dedicated trainer login email.`
      );
      continue;
    }

    const supabaseId = await ensureTrainerAuthUser(supabase, account, { resetPassword });

    const profile = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        role: Role.TRAINER,
        name: account.name,
        supabaseId,
        ...(resetPassword || existingProfile?.mustChangePassword ? { mustChangePassword: true } : {}),
        accessLevel: AccessLevel.LIFETIME
      },
      create: {
        email: normalizedEmail,
        role: Role.TRAINER,
        name: account.name,
        supabaseId,
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

    console.log(`Trainer account linked: ${normalizedEmail}${resetPassword ? ` (temp password ${TRAINER_TEMP_PASSWORD})` : ""}`);
  }
}
