import { clerkClient } from "@clerk/astro/server";
import type { APIRoute } from "astro";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { accounts, clients } from "@/db/schema";
import { getDb } from "@/lib/server/db/client";

const invitationPayloadSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(120).optional(),
});

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const POST: APIRoute = async (context) => {
  const authContext = context.locals.authContext;

  if (!authContext?.isAuthenticated) {
    return Response.json(
      {
        message: "Authentication required.",
      },
      { status: 401 },
    );
  }

  if (authContext.role !== "admin") {
    return Response.json(
      {
        message: "Admin role required.",
      },
      { status: 403 },
    );
  }

  let payload: unknown;

  try {
    payload = await context.request.json();
  } catch {
    return Response.json(
      {
        message: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  const parsedPayload = invitationPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return Response.json(
      {
        message: "Invalid invitation payload.",
        issues: parsedPayload.error.issues,
      },
      { status: 400 },
    );
  }

  const normalizedEmail = normalizeEmail(parsedPayload.data.email);
  const db = getDb(context.locals);

  const [existingAccount] = await db
    .select({
      id: accounts.id,
      role: accounts.role,
    })
    .from(accounts)
    .where(eq(accounts.email, normalizedEmail))
    .limit(1);

  if (existingAccount) {
    return Response.json(
      {
        message: "An account with this email already exists.",
      },
      { status: 409 },
    );
  }

  const [existingClient] = await db
    .select({
      id: clients.id,
    })
    .from(clients)
    .where(eq(clients.email, normalizedEmail))
    .limit(1);

  const now = new Date().toISOString();
  const clientId = existingClient?.id ?? createId("client");

  if (!existingClient) {
    await db.insert(clients).values({
      id: clientId,
      clerkUserId: null,
      email: normalizedEmail,
      name: parsedPayload.data.name ?? normalizedEmail,
      phone: null,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
  }

  let invitationId: string;

  try {
    const invitation = await clerkClient(context).invitations.createInvitation({
      emailAddress: normalizedEmail,
      redirectUrl: `${new URL(context.request.url).origin}/sign-up`,
      publicMetadata: {
        role: "client",
      },
    });

    invitationId = invitation.id;
  } catch {
    return Response.json(
      {
        message: "Unable to create invitation with Clerk.",
      },
      { status: 502 },
    );
  }

  await db
    .insert(accounts)
    .values({
      id: createId("account"),
      clerkUserId: null,
      clientId,
      email: normalizedEmail,
      role: "client",
      createdAt: now,
      updatedAt: now,
      version: 1,
    })
    .onConflictDoUpdate({
      target: accounts.email,
      set: {
        clientId,
        role: "client",
        updatedAt: sql`CURRENT_TIMESTAMP`,
        version: sql`${accounts.version} + 1`,
      },
    });

  return Response.json(
    {
      invitationId,
      email: normalizedEmail,
      role: "client",
    },
    { status: 201 },
  );
};
