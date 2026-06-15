import { PrismaClient, Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { seedTrainerAccounts } from "./seedTrainerAccounts";

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
      slug: "ivonne-c",
      name: "Ivonne C.",
      email: "ivonneeBICE@gmail.com",
      title: "Fitdog Certified Trainer · CPDT-KA · ABCDT · AKC CGC Evaluator",
      bio: "Ivonne is a Certified Professional Canine Fitness Trainer, ABCD Certified Dog Trainer, and AKC CGC Evaluator with over 7 years of experience working with dogs.",
      about:
        "Ivonne specializes in obedience, fitness, agility, and reactivity throughout the Los Angeles area. Her journey began with her own reactive dog, which sparked a passion for helping dogs and owners build confidence through humane, force-free training. She focuses on practical skills owners can use at home and in real-world settings.",
      philosophy:
        "Ivonne is motivated by seeing dogs improve and grow — not only in training ability, but in confidence and happiness. She uses force-free, positive reinforcement methods and believes every dog deserves to feel safe while learning.",
      quote: "Dogs aren't your whole life, but they make your life whole.",
      quoteAuthor: "Roger Caras",
      specialties: JSON.stringify(["Obedience", "Fitness", "Agility", "Reactivity"]),
      classes: JSON.stringify(["Fun-ever Fitness", "Scent Works", "Reliable Recall Series"]),
      qualifications: JSON.stringify([
        "ABCDT (Animal Behavior College Dog Trainer)",
        "AKC CGC Evaluator (Canine Good Citizen)",
        "AKC ACT Evaluator (Agility Course Test)"
      ])
    },
    {
      slug: "amanda-n",
      name: "Amanda N.",
      email: "loveandcarepawbabys@gmail.com",
      title: "Fitdog Certified Trainer · IACP-CDTA · ABCDT · 5+ Years Experience",
      bio: "Certified dog trainer with over 5 years of experience. Specializes in obedience, agility, puppy development, and reactivity.",
      about:
        "Amanda's training journey began with her dog, Lola. Over more than five years she has helped owners with obedience, puppy development, agility foundations, and reactivity — always with patience, clarity, and force-free methods. She is known for helping families understand why behavior happens and what to practice between sessions.",
      philosophy:
        "Amanda is dedicated to making sure every animal is heard and understood. She uses reward-based, force-free training to strengthen the relationship between pets and their people — not just to fix one behavior in isolation.",
      quote:
        "Amanda is a kind, thoughtful and effective trainer. She helped us understand the situations that trigger our reactive dog and gave us the knowledge to correct his behavior in the future, even when she is not there.",
      quoteAuthor: "Madison, Leo & Ollie",
      specialties: JSON.stringify(["Puppy Development", "Obedience", "Reactivity", "Agility"]),
      classes: JSON.stringify([
        "Advanced Trail Foundations",
        "Cool Tricks",
        "Foundations & Focus",
        "Fun & Fit Agility"
      ]),
      qualifications: JSON.stringify([
        "IACP-CDTA (International Association of Canine Professionals Certified Dog Trainer)",
        "ABCDT (Animal Behavior College Dog Trainer)"
      ])
    },
    {
      slug: "brian-guzman",
      name: "Brian Guzman",
      email: "brian.guzman@fitdog.com",
      title: "Fitdog Certified Trainer · Excursion Leader · Recall & Adventure Skills",
      bio: "Brian is a Fitdog Certified Trainer and Excursion Leader with years of experience leading adventure hikes, beach outings, and group enrichment programs across Los Angeles.",
      about:
        "Brian has been part of the Fitdog team since 2018 and has served as an Excursion Leader since 2020, working with dogs in real-world environments where recall, leash skills, and calm social behavior matter most. He supports owners who want confident dogs on trails, at the beach, and in busy group settings — always using humane, force-free methods that prioritize safety and enjoyment.",
      philosophy:
        "Brian believes dogs learn best when training is embedded in real life — hikes, outings, and social experiences that build confidence without forcing compliance. His approach focuses on clear communication, positive reinforcement, and setting dogs up to succeed in the environments they actually live in.",
      quote: "Every outing is a training opportunity. When dogs feel safe and understood, they show us how capable they really are.",
      quoteAuthor: "Brian Guzman",
      specialties: JSON.stringify([
        "Adventure & Enrichment",
        "Recall",
        "Group Socialization",
        "Leash Skills",
        "Trail & Beach Outings"
      ]),
      classes: JSON.stringify([
        "Adventure Hikes",
        "Beach Excursions",
        "Level II Group Outings",
        "Real-World Recall Practice"
      ]),
      qualifications: JSON.stringify([
        "Fitdog Certified Trainer",
        "Fitdog Excursion Leader (since 2020)",
        "Fitdog team member since 2018",
        "Force-free, positive reinforcement methods"
      ])
    }
  ];

  await prisma.certifiedTrainer.updateMany({
    where: { slug: { notIn: trainers.map((t) => t.slug) } },
    data: { active: false }
  });

  for (const trainer of trainers) {
    await prisma.certifiedTrainer.upsert({
      where: { slug: trainer.slug },
      update: { ...trainer, active: true },
      create: { ...trainer, active: true }
    });
  }

  await seedTrainerAccounts(prisma, { resetPassword: process.env.RESET_TRAINER_PASSWORDS === "true" });

  console.log(`Seeded admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}${supabaseId ? ` (linked supabaseId)` : ""}`);
  console.log(`Seeded ${trainers.length} certified trainers`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
