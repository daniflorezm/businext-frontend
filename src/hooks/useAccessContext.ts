"use client";
import useSWR from "swr";

export type Capabilities = {
  canAccessApp: boolean;
  canManageConfiguration: boolean;
  canManageTeam: boolean;
  canManageProducts: boolean;
  canManageFinances: boolean;
  canManageReservations: boolean;
};

export type UserProfile = {
  displayName: string | null;
  email: string | null;
  phone: string | null;
};

export type AccessContext = {
  userId: string;
  businessId: string;
  role: string;
  accountType: string;
  memberStatus: string | null;
  subscriptionActive: boolean;
  profile: UserProfile | null;
  capabilities: Capabilities;
};

const DEFAULT_CAPABILITIES: Capabilities = {
  canAccessApp: false,
  canManageConfiguration: false,
  canManageTeam: false,
  canManageProducts: false,
  canManageFinances: false,
  canManageReservations: false,
};

export const ACCESS_CONTEXT_SWR_KEY = "/api/auth/me";

/** Throws on network/server errors so SWR can retry */
const accessFetcher = async (url: string): Promise<AccessContext | null> => {
  const res = await fetch(url);
  if (res.status === 401) return null; // genuinely unauthenticated
  if (!res.ok) throw new Error(`Auth fetch failed: ${res.status}`);
  return res.json() as Promise<AccessContext>;
};

/**
 * Returns the current user's access context.
 *
 * Uses SWR so every component calling this hook shares ONE cached network
 * request. Requests are deduplicated within a 60-second window, so
 * AppShell + Sidebar + any page component → still only 1 call to /api/auth/me.
 */
export function useAccessContext() {
  const { data, isLoading, isValidating } =
    useSWR<AccessContext | null>(ACCESS_CONTEXT_SWR_KEY, accessFetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    });

  const context = data ?? null;
  const capabilities = context?.capabilities ?? DEFAULT_CAPABILITIES;

  // Loading = true until we have a valid context.
  // Covers: first fetch, stale null cache being revalidated after login, retries.
  const loading = isLoading || (!context && isValidating);

  return { context, capabilities, loading };
}
