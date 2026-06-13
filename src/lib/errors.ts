import { prisma } from "./db";

export async function logError(input: {
  severity: "critical" | "warning" | "info";
  area: string;
  message: string;
  userEmail?: string;
  url?: string;
  device?: string;
}) {
  try {
    await prisma.errorLog.create({ data: input });
  } catch {
    // Avoid breaking primary flows if logging fails
  }
}
