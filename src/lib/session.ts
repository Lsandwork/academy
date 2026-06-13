import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  email?: string;
  role?: "USER" | "STAFF" | "ADMIN";
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "fitdog-academy-dev-session-secret-min-32-chars!!",
  cookieName: "fitdog_academy_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14
  }
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
