"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GoogleReview } from "@/lib/google-reviews/types";
import { AiResponseEditor } from "./AiResponseEditor";

type ReviewCardProps = {
  review: GoogleReview;
  onGenerateResponse: (reviewId: number) => Promise<string | null>;
  generatingResponse: number | null;
};

const RATING_AVATAR_COLORS: Record<number, string> = {
  5: "bg-success/20 text-success",
  4: "bg-blue-500/20 text-blue-300",
  3: "bg-warning/20 text-warning",
  2: "bg-orange-500/20 text-orange-300",
  1: "bg-danger/20 text-danger",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-[18px] h-[18px] ${
            s <= rating
              ? "text-[#F59E0B] fill-[#F59E0B]"
              : "text-foreground-muted/20"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string | null, timestamp: number): string {
  const d = dateStr ? new Date(dateStr) : new Date(timestamp * 1000);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitial(name: string | null): string {
  return (name || "A").charAt(0).toUpperCase();
}

export function ReviewCard({
  review,
  onGenerateResponse,
  generatingResponse,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const text = review.reviewText || "";
  const isLong = text.length > 200;
  const avatarColor = RATING_AVATAR_COLORS[review.reviewRating] || RATING_AVATAR_COLORS[3];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Author row */}
        <div className="flex items-center gap-4">
          {review.authorImage ? (
            <img
              src={review.authorImage}
              alt={review.authorTitle || ""}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-border-subtle"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-h4 ${avatarColor}`}>
              {getInitial(review.authorTitle)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-body-sm font-semibold text-foreground truncate">
                {review.authorTitle || "Anónimo"}
              </p>
              <span className="text-foreground-subtle">·</span>
              <span className="text-caption text-foreground-muted">
                {formatDate(review.reviewDatetimeUtc, review.reviewTimestamp)}
              </span>
            </div>
            <StarRating rating={review.reviewRating} />
          </div>
        </div>

        {/* Review text with line-clamp */}
        {text && (
          <div>
            <p className={`text-body-sm text-foreground-muted leading-relaxed ${
              !expanded && isLong ? "line-clamp-3" : ""
            }`}>
              {text}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-caption font-medium text-primary hover:text-primary-hover mt-1.5 transition-colors"
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}

        {/* Owner answer */}
        {review.ownerAnswer && (
          <div className="ml-2 pl-4 border-l-[3px] border-primary bg-surface-raised/60 rounded-r-xl p-4">
            <p className="text-caption font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              Respuesta del propietario
            </p>
            <p className="text-body-sm text-foreground-muted leading-relaxed">
              {review.ownerAnswer}
            </p>
          </div>
        )}

        {/* AI Response Editor */}
        <AiResponseEditor
          review={review}
          onGenerate={onGenerateResponse}
          generating={generatingResponse === review.id}
        />
      </CardContent>
    </Card>
  );
}
