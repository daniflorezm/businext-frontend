"use client";

import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { SectionSkeleton } from "@/components/ui/skeleton";
import { GoogleMapsUrlForm } from "@/components/reviews/GoogleMapsUrlForm";
import { BusinessProfileCard } from "@/components/reviews/BusinessProfileCard";
import { ReviewMetrics } from "@/components/reviews/ReviewMetrics";
import { ReviewCharts } from "@/components/reviews/ReviewCharts";
import { BusinessSummary } from "@/components/reviews/BusinessSummary";
import { ReviewList } from "@/components/reviews/ReviewList";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  const {
    profile,
    profileLoading,
    profileError,
    submitUrl,
    submitting,
    submitError,
    syncReviews,
    syncing,
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
