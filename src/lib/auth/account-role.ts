import type { APIContext } from "astro";
import { eq } from "drizzle-orm";

import { accounts } from "@/db/schema";
import { getDb } from "@/lib/server/db/client";

import type { UserRole } from "./types";

const roleSet = new Set<UserRole>(["admin", "client"]);

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
};

const getNested = (record: Record<string, unknown>, key: string): unknown => {
  if (!(key in record)) {
    return null;
  }

  return record[key];
};

const normalizeRole = (value: unknown): UserRole | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return roleSet.has(normalized as UserRole) ? (normalized as UserRole) : null;
};

const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

export const roleFromSessionClaims = (claims: unknown): UserRole | null => {
  const claimsRecord = toRecord(claims);
  if (!claimsRecord) {
    return null;
  }

  const metadata = toRecord(getNested(claimsRecord, "public_metadata"));
  if (!metadata) {
    return null;
  }

  return normalizeRole(getNested(metadata, "role"));
};

export const emailFromSessionClaims = (claims: unknown): string | null => {
  const claimsRecord = toRecord(claims);
  if (!claimsRecord) {
    return null;
  }

  return normalizeEmail(getNested(claimsRecord, "email"));
};

export const accountRoleForUser = async (
  context: APIContext,
  clerkUserId: string,
): Promise<{ role: UserRole | null; email: string | null }> => {
  const db = getDb(context.locals);

  const [account] = await db
    .select({
      role: accounts.role,
      email: accounts.email,
    })
    .from(accounts)
    .where(eq(accounts.clerkUserId, clerkUserId))
    .limit(1);

  return {
    role: account?.role ?? null,
    email: account?.email ?? null,
  };
};
