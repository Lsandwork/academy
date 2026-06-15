import { AccessLevel, Role } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "./db";
import { createAdminClient } from "./supabase/admin";

export type CreateAdminUserInput = {
  email: string;
  name?: string | null;
  password?: string | null;
  role: Role;
  accessLevel: AccessLevel;
  mustChangePassword?: boolean;
};

export function generateTemporaryPassword() {
  return `Fitdog${randomBytes(4).toString("hex")}!`;
}

function defaultAccessForRole(role: Role): AccessLevel {
  if (role === Role.USER) return AccessLevel.FREE;
  return AccessLevel.LIFETIME;
}

export async function createAdminUser(input: CreateAdminUserInput) {
  const normalizedEmail = input.email.toLowerCase().trim();
  const displayName = input.name?.trim() || null;

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("A valid email address is required.");
  }

  if (!Object.values(Role).includes(input.role)) {
    throw new Error("Invalid role.");
  }

  if (!Object.values(AccessLevel).includes(input.accessLevel)) {
    throw new Error("Invalid access level.");
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  let password = input.password?.trim() || "";
  let temporaryPassword: string | undefined;
  let mustChangePassword = input.mustChangePassword ?? false;

  if (!password) {
    temporaryPassword = generateTemporaryPassword();
    password = temporaryPassword;
    mustChangePassword = true;
  } else if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  } else if (input.mustChangePassword === undefined) {
    mustChangePassword = false;
  }

  const accessLevel =
    input.accessLevel === AccessLevel.FREE && input.role !== Role.USER
      ? defaultAccessForRole(input.role)
      : input.accessLevel;

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { name: displayName || "" }
  });

  if (createError) {
    throw new Error(createError.message);
  }

  const authUser = created.user;
  if (!authUser) {
    throw new Error("Could not create login account.");
  }

  const profile = await prisma.user.create({
    data: {
      supabaseId: authUser.id,
      email: normalizedEmail,
      name: displayName,
      role: input.role,
      accessLevel,
      mustChangePassword
    }
  });

  if (input.role === Role.TRAINER) {
    await prisma.certifiedTrainer.updateMany({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      data: { userId: profile.id, active: true }
    });
  }

  return { user: profile, temporaryPassword };
}
