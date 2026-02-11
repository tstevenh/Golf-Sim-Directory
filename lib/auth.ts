import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabase as supabaseService } from "@/lib/supabase";
import type { UserRole } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

/**
 * Get the current authenticated user from the Supabase session.
 * Reads role from public.users (source of truth) rather than JWT app_metadata
 * to ensure role changes take effect immediately.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Read role from public.users (source of truth)
  const { data: dbUser } = await supabaseService
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    name: dbUser?.name ?? user.user_metadata?.name ?? null,
    role: (dbUser?.role as UserRole) ?? (user.app_metadata?.role as UserRole) ?? "golfer",
  };
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 */
export async function requireAuth(callbackUrl?: string): Promise<AuthUser> {
  const user = await getUser();
  if (!user) {
    const loginUrl = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(loginUrl);
  }
  return user;
}

/**
 * Require admin role. Redirects to / if not admin.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    redirect("/");
  }
  return user;
}
