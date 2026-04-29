"use client";

import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useAccessContext } from "@/hooks/useAccessContext";
import { SectionSkeleton } from "@/components/ui/skeleton";
import { GoogleMapsUrlForm } from "@/components/reviews/GoogleMapsUrlForm";
import { BusinessProfileCard } from "@/components/reviews/BusinessProfileCard";
import { ReviewMetrics } from "@/components/reviews/ReviewMetrics";
import { ReviewCharts } from "@/components/reviews/ReviewCharts";
import { BusinessSummary } from "@/components/reviews/BusinessSummary";
import { ReviewList } from "@/components/reviews/ReviewList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function ReviewsPage() {
  const { capabilities, loading: contextLoading } = useAccessContext();
  const {
    profile,
    profileLoading,
    profileError,
    submitUrl,
    submitting,
    submitError,
    syncReviews,
    syncing,
    syncError,
    reviewsData,
    reviewsLoading,
    ratingFilter,
    setRatingFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    generateResponse,
    generatingResponse,
    generateSummary,
    generatingSummary,
  } = useGoogleReviews();

  /* ── Loading state ── */
  if (contextLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <SkeletonLoader rows={6} />
      </div>
    );
  }

  /* ── Access denied ── */
  if (!capabilities.canManageFinances) {
    return (
      <div className="min-h-screen w-full pt-14 md:pt-0">
        <div className="flex justify-center items-center min-h-[60vh] px-4">
          <Card variant="elevated" className="max-w-xl border-warning/40">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <ShieldAlert className="h-10 w-10 text-warning" />
              <h2 className="font-heading text-h3 font-bold text-warning">
                Acceso restringido
              </h2>
              <p className="text-body-sm text-foreground-muted">
                No tienes permisos para ver las reseñas del negocio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background pt-14 md:pt-0">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-h2 font-heading font-bold text-foreground">
            Reseñas de Google
          </h1>
          <p className="text-body-sm text-foreground-muted mt-1">
            Estadísticas y gestión de reseñas de tu negocio en Google Maps
          </p>
        </div>

        {/* Loading state */}
        {profileLoading && (
          <div className="space-y-8">
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        )}

        {/* Error state (not 404 - 404 means no profile yet) */}
        {profileError && profileError.message && !profileError.message.includes("404") && (
          <div className="bg-surface-raised rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <p className="text-body-sm text-danger">Error al cargar datos</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        )}

        {/* No profile - show URL form */}
        {!profileLoading && !profile && (
          <GoogleMapsUrlForm
            onSubmit={submitUrl}
            submitting={submitting}
            error={submitError}
          />
        )}

        {/* Profile exists - show dashboard */}
        {profile && (
          <div className="space-y-8">
            {/* Business header - full width */}
            <BusinessProfileCard
              profile={profile}
              onSync={syncReviews}
              syncing={syncing}
              syncError={syncError}
            />

            {/* Metrics + Charts row */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-5">
                <ReviewMetrics profile={profile} />
              </div>
              <div className="col-span-12 lg:col-span-7">
                <ReviewCharts reviews={reviewsData?.items || []} />
              </div>
            </div>

            {/* AI Summary banner - full width */}
            <BusinessSummary
              profile={profile}
              onGenerateSummary={generateSummary}
              generating={generatingSummary}
            />

            {/* Reviews list - full width */}
            <ReviewList
              reviewsData={reviewsData}
              reviewsLoading={reviewsLoading}
              ratingFilter={ratingFilter}
              setRatingFilter={setRatingFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              page={page}
              setPage={setPage}
              onGenerateResponse={generateResponse}
              generatingResponse={generatingResponse}
            />
          </div>
        )}
      </div>
    </div>
  );
}
