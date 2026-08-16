import { sanityClient } from "@/shared/lib/sanity/client";

import {
  ADMIN_AUTH_DOCUMENT_ID,
  ADMIN_EMAIL,
  RESET_TOKEN_MAX_AGE_MS,
} from "./constants";
import { hashPassword, hashResetToken } from "./password";

export type AdminAuthRecord = {
  _id: string;
  passwordHash: string;
  resetTokenHash?: string | null;
  resetTokenExpires?: string | null;
  updatedAt?: string;
};

const ADMIN_AUTH_QUERY = `*[_type == "adminAuth" && _id == $id][0]{
  _id,
  passwordHash,
  resetTokenHash,
  resetTokenExpires,
  updatedAt
}`;

export async function getAdminAuthRecord(): Promise<AdminAuthRecord | null> {
  const record = await sanityClient.fetch<AdminAuthRecord | null>(
    ADMIN_AUTH_QUERY,
    { id: ADMIN_AUTH_DOCUMENT_ID }
  );
  return record ?? null;
}

export async function ensureAdminAuthSeeded(): Promise<AdminAuthRecord> {
  const existing = await getAdminAuthRecord();
  if (existing?.passwordHash) return existing;

  const passwordHash = await hashPassword("admin@oryxspa2026");
  const doc = {
    _id: ADMIN_AUTH_DOCUMENT_ID,
    _type: "adminAuth",
    email: ADMIN_EMAIL,
    passwordHash,
    resetTokenHash: null,
    resetTokenExpires: null,
    updatedAt: new Date().toISOString(),
  };

  await sanityClient.createOrReplace(doc);
  return {
    _id: ADMIN_AUTH_DOCUMENT_ID,
    passwordHash,
    resetTokenHash: null,
    resetTokenExpires: null,
    updatedAt: doc.updatedAt,
  };
}

export async function updateAdminPassword(passwordHash: string) {
  await sanityClient
    .patch(ADMIN_AUTH_DOCUMENT_ID)
    .set({
      passwordHash,
      resetTokenHash: null,
      resetTokenExpires: null,
      updatedAt: new Date().toISOString(),
    })
    .commit();
}

export async function setPasswordResetToken(token: string) {
  const resetTokenHash = hashResetToken(token);
  const resetTokenExpires = new Date(
    Date.now() + RESET_TOKEN_MAX_AGE_MS
  ).toISOString();

  await sanityClient
    .patch(ADMIN_AUTH_DOCUMENT_ID)
    .set({
      resetTokenHash,
      resetTokenExpires,
      updatedAt: new Date().toISOString(),
    })
    .commit();
}

export async function clearPasswordResetToken() {
  await sanityClient
    .patch(ADMIN_AUTH_DOCUMENT_ID)
    .set({
      resetTokenHash: null,
      resetTokenExpires: null,
      updatedAt: new Date().toISOString(),
    })
    .commit();
}

export function isResetTokenValid(
  record: AdminAuthRecord,
  token: string
): boolean {
  if (!record.resetTokenHash || !record.resetTokenExpires) return false;
  if (new Date(record.resetTokenExpires).getTime() < Date.now()) return false;
  return record.resetTokenHash === hashResetToken(token);
}
