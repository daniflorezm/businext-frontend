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

/** Never throws — returns null on auth errors so the app degrades gracefully */
const accessFetcher = (url: string): Promise<AccessContext | null> =>
  fetch(url)
    .then((res) => (res.ok ? (res.json() as Promise<AccessContext>) : null))
    .catch(() => null);

/**
 * Returns the current user's access context.
 *
 * Uses SWR so every component calling this hook shares ONE cached network
 * request. Requests are deduplicated within a 60-second window, so
 * AppShell + Sidebar + any page component → still only 1 call to /api/auth/me.
 */
export function useAccessContext() {
  const { data: context = null, isLoading: loading } =
    useSWR<AccessContext | null>(ACCESS_CONTEXT_SWR_KEY, accessFetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 3_000,
      shouldRetryOnError: false,
    });

  const capabilities = context?.capabilities ?? DEFAULT_CAPABILITIES;

  return { context, capabilities, loading };
}
