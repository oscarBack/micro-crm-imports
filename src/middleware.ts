import { clerkMiddleware } from "@clerk/astro/server";

import {
  accountRoleForUser,
  emailFromSessionClaims,
  roleFromSessionClaims,
} from "@/lib/auth/account-role";
import { isAdminApiRoute, isAdminPageRoute } from "@/lib/auth/guards";
import type { RequestAuthContext } from "@/lib/auth/types";

const unauthorizedResponse = () =>
  Response.json(
    {
      message: "Authentication required.",
    },
    { status: 401 },
  );

const forbiddenResponse = () =>
  Response.json(
    {
      message: "Admin role required.",
    },
    { status: 403 },
  );

const defaultAuthContext: RequestAuthContext = {
  isAuthenticated: false,
  userId: null,
  sessionId: null,
  role: null,
  clerkRole: null,
  email: null,
};

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const authState = auth();
  const userId = authState.userId ?? null;

  let resolvedRole: RequestAuthContext["role"] = null;
  let resolvedEmail: string | null = emailFromSessionClaims(authState.sessionClaims);

  if (userId) {
    const accountRole = await accountRoleForUser(context, userId);
    resolvedRole = accountRole.role;
    resolvedEmail ??= accountRole.email;
  }

  context.locals.authContext = {
    ...defaultAuthContext,
    isAuthenticated: Boolean(userId),
    userId,
    sessionId: authState.sessionId ?? null,
    role: resolvedRole,
    clerkRole: roleFromSessionClaims(authState.sessionClaims),
    email: resolvedEmail,
  };

  const pathname = new URL(context.request.url).pathname;
  const adminPageRoute = isAdminPageRoute(pathname);
  const adminApiRoute = isAdminApiRoute(pathname);

  if (!adminPageRoute && !adminApiRoute) {
    return next();
  }

  if (!context.locals.authContext.isAuthenticated) {
    if (adminApiRoute) {
      return unauthorizedResponse();
    }

    const signInUrl = new URL("/sign-in", context.url);
    signInUrl.searchParams.set("redirect_url", context.request.url);
    return Response.redirect(signInUrl, 307);
  }

  if (context.locals.authContext.role !== "admin") {
    if (adminApiRoute) {
      return forbiddenResponse();
    }

    return new Response("Forbidden", { status: 403 });
  }

  return next();
});
