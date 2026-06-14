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

  const trainers = [
    {
      slug: "alex-morgan",
      name: "Alex Morgan",
      email: process.env.TRAINER_EMAIL_ALEX || "trainers@fitdog.com",
      title: "CPDT-KA® Certified Trainer",
      bio: "Alex specializes in puppy foundations, everyday obedience, and building calm home routines with LIMA-aligned methods.",
      specialties: JSON.stringify(["Puppy training", "Obedience", "Calm home skills"])
    },
    {
      slug: "jordan-lee",
      name: "Jordan Lee",
      email: process.env.TRAINER_EMAIL_JORDAN || "trainers@fitdog.com",
      title: "CPDT-KA® Certified Trainer",
      bio: "Jordan supports owners dealing with separation distress, leash reactivity, and high-energy enrichment plans.",
      specialties: JSON.stringify(["Separation support", "Leash reactivity", "Enrichment"])
    },
    {
      slug: "fitdog-training-team",
      name: "Fitdog Training Team",
      email: process.env.TRAINER_EMAIL_TEAM || "trainers@fitdog.com",
      title: "Fitdog Certified Trainer Network",
      bio: "Our certified trainer network matches owners with the right Fitdog professional for personalized hand-in-hand support.",
      specialties: JSON.stringify(["Assessment follow-up", "Behavior plans", "Owner coaching"])
    }
  ];

  for (const trainer of trainers) {
    await prisma.certifiedTrainer.upsert({
      where: { slug: trainer.slug },
      update: trainer,
      create: trainer
    });
  }

  console.log(`Seeded admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}${supabaseId ? ` (linked supabaseId)` : ""}`);
  console.log(`Seeded ${trainers.length} certified trainers`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
