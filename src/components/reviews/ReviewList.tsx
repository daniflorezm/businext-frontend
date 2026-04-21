"use client";

import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionSkeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "./ReviewCard";
import { ReviewFilters } from "./ReviewFilters";
import type { GoogleReview, ReviewsPage } from "@/lib/google-reviews/types";

type ReviewListProps = {
  reviewsData: ReviewsPage | null;
  reviewsLoading: boolean;
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
  sortOrder: string;
  setSortOrder: (sort: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  page: number;
  setPage: (page: number) => void;
  onGenerateResponse: (reviewId: number) => Promise<string | null>;
  generatingResponse: number | null;
};

export function ReviewList({
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
  onGenerateResponse,
  generatingResponse,
}: ReviewListProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-heading font-semibold text-foreground">
          Reseñas
        </h3>
        {reviewsData && (
          <span className="text-body-sm text-foreground-muted font-medium">
            {reviewsData.total} reseña{reviewsData.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <ReviewFilters
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />

      {reviewsLoading && <SectionSkeleton />}

      {!reviewsLoading && reviewsData && reviewsData.items.length === 0 && (
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-12 text-center">
          <MessageCircle className="w-8 h-8 text-foreground-subtle mx-auto mb-3" />
          <p className="text-body-sm text-foreground-muted">
            {searchQuery || ratingFilter
              ? "No se encontraron reseñas con los filtros aplicados"
              : "Sin reseñas aún. Sincroniza para obtener las últimas reseñas."}
          </p>
        </div>
      )}

      {!reviewsLoading && reviewsData && reviewsData.items.length > 0 && (
        <div className="space-y-4">
          {reviewsData.items.map((review: GoogleReview) => (
            <ReviewCard
              key={review.id}
              review={review}
              onGenerateResponse={onGenerateResponse}
              generatingResponse={generatingResponse}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {reviewsData && reviewsData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <span className="text-body-sm text-foreground-muted font-medium">
            {page} de {reviewsData.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= reviewsData.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
