"use client";
import { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  GoogleBusinessProfile,
  ReviewsPage,
  SyncResult,
  BusinessSummary,
  mapProfile,
  mapReview,
  mapSyncResult,
  mapBusinessSummary,
} from "@/lib/google-reviews/types";

const PROFILE_KEY = "/api/google-reviews/profile";

export function useGoogleReviews() {
  // ── Profile ─────────────────────────────────────────────────────────
  const {
    data: rawProfile,
    isLoading: profileLoading,
    error: profileError,
    mutate: mutateProfile,
  } = useSWR<Record<string, unknown>>(PROFILE_KEY, fetcher, {
    shouldRetryOnError: false,
  });

  const profile: GoogleBusinessProfile | null =
    rawProfile && !("error" in rawProfile) ? mapProfile(rawProfile) : null;

  // ── Reviews (paginated) ─────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const reviewsParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort: sortOrder,
  });
  if (ratingFilter) reviewsParams.set("rating", String(ratingFilter));
  if (searchQuery) reviewsParams.set("search", searchQuery);

  const reviewsKey = profile
    ? `/api/google-reviews/reviews?${reviewsParams.toString()}`
    : null;

  const {
    data: rawReviews,
    isLoading: reviewsLoading,
    error: reviewsError,
    mutate: mutateReviews,
  } = useSWR<Record<string, unknown>>(reviewsKey, fetcher);

  const reviewsData: ReviewsPage | null = rawReviews
    ? {
        items: ((rawReviews.items as Record<string, unknown>[]) || []).map(
          mapReview
        ),
        total: rawReviews.total as number,
        page: rawReviews.page as number,
        pageSize: rawReviews.page_size as number,
        totalPages: rawReviews.total_pages as number,
      }
    : null;

  // ── Submit URL ──────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitUrl = useCallback(
    async (url: string) => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const response = await fetch("/api/google-reviews/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source_url: url }),
        });
        const data = await response.json();
        if (!response.ok) {
          setSubmitError(data.error || "Error al vincular el negocio");
          return null;
        }
        await mutateProfile(data, { revalidate: false });
        return mapProfile(data);
      } catch {
        setSubmitError("Error de conexión. Intenta de nuevo.");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [mutateProfile]
  );

  // ── Sync Reviews ────────────────────────────────────────────────────
  const [syncing, setSyncing] = useState(false);

  const syncReviews = useCallback(async (): Promise<SyncResult | null> => {
    setSyncing(true);
    try {
      const response = await fetch("/api/google-reviews/sync", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) return null;
      await mutateProfile();
      await mutateReviews();
      return mapSyncResult(data);
    } catch {
      return null;
    } finally {
      setSyncing(false);
    }
  }, [mutateProfile, mutateReviews]);

  // ── Generate AI Response ────────────────────────────────────────────
  const [generatingResponse, setGeneratingResponse] = useState<number | null>(
    null
  );

  const generateResponse = useCallback(
    async (reviewId: number): Promise<string | null> => {
      setGeneratingResponse(reviewId);
      try {
        const response = await fetch(
          `/api/google-reviews/reviews/generate-response?id=${reviewId}`,
          { method: "POST" }
        );
        const data = await response.json();
        if (!response.ok) return null;
        await mutateReviews();
        return data.ai_generated_response as string;
      } catch {
        return null;
      } finally {
        setGeneratingResponse(null);
      }
    },
    [mutateReviews]
  );

  // ── Generate AI Summary ─────────────────────────────────────────────
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const generateSummary =
    useCallback(async (): Promise<BusinessSummary | null> => {
      setGeneratingSummary(true);
      try {
        const response = await fetch("/api/google-reviews/summary", {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) return null;
        await mutateProfile();
        return mapBusinessSummary(data);
      } catch {
        return null;
      } finally {
        setGeneratingSummary(false);
      }
    }, [mutateProfile]);

  return {
    // Profile
    profile,
    profileLoading,
    profileError,
    // Reviews
    reviewsData,
    reviewsLoading,
    reviewsError,
    // Filter state
    page,
    setPage,
    ratingFilter,
    setRatingFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    // Actions
    submitUrl,
    submitting,
    submitError,
    syncReviews,
    syncing,
    generateResponse,
    generatingResponse,
    generateSummary,
    generatingSummary,
  };
}
