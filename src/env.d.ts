/// <reference types="astro/client" />

interface CloudflareRuntimeEnv {
  DB: D1Database;
  PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
}

type UserRole = "admin" | "client";

declare namespace App {
  interface Locals {
    runtime: import("@astrojs/cloudflare").Runtime<CloudflareRuntimeEnv>;
    authContext: {
      isAuthenticated: boolean;
      userId: string | null;
      sessionId: string | null;
      role: UserRole | null;
      clerkRole: UserRole | null;
      email: string | null;
    };
  }
}
