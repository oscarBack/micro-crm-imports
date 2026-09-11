export type UserRole = "admin" | "client";

export interface RequestAuthContext {
  isAuthenticated: boolean;
  userId: string | null;
  sessionId: string | null;
  role: UserRole | null;
  clerkRole: UserRole | null;
  email: string | null;
}
