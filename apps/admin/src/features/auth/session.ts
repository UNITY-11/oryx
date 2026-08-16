import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import {
  ADMIN_EMAIL,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "./constants";

export type AdminSession = {
  email: string;
};

function getSessionSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "oryx-admin-dev-session-secret");

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is required in production");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const email = payload.email;
    if (typeof email !== "string" || email !== ADMIN_EMAIL) return null;
    return { email };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
