export type GoogleBusinessProfile = {
  id: number;
  googleId: string;
  sourceUrl: string;
  name: string | null;
  address: string | null;
  category: string | null;
  phone: string | null;
  rating: number | null;
  totalReviews: number;
  reviewsPerScore: Record<string, number> | null;
  locationLink: string | null;
  validationStatus: "pending" | "locked";
  validatedBy: string | null;
  validatedAt: string | null;
  lastSyncAt: string | null;
  lastReviewTimestamp: number;
  aiSummary: BusinessSummary | null;
  aiSummaryGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoogleReview = {
  id: number;
  reviewId: string;
  profileId: number;
  authorTitle: string | null;
  authorImage: string | null;
  reviewText: string | null;
  reviewRating: number;
  reviewTimestamp: number;
  reviewDatetimeUtc: string | null;
  reviewLink: string | null;
  ownerAnswer: string | null;
  ownerAnswerTimestamp: number | null;
  aiGeneratedResponse: string | null;
  aiResponseGeneratedAt: string | null;
  createdAt: string;
};

export type ReviewsPage = {
  items: GoogleReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SyncResult = {
  newReviewsCount: number;
  totalReviews: number;
  lastSyncAt: string;
};

export type BusinessSummary = {
  overallSentiment: string;
  positiveThemes: string[];
  negativeThemes: string[];
  recommendations: string[];
  reviewCountAnalyzed: number;
  generatedAt: string;
};

// ── Mappers ────────────────────────────────────────────────────────────

export function mapProfile(data: Record<string, unknown>): GoogleBusinessProfile {
  const rawSummary = data.ai_summary as string | null;
  let parsedSummary: BusinessSummary | null = null;
  if (rawSummary) {
    try {
      const obj = JSON.parse(rawSummary);
      parsedSummary = {
        overallSentiment: obj.overall_sentiment ?? "",
        positiveThemes: obj.positive_themes ?? [],
        negativeThemes: obj.negative_themes ?? [],
        recommendations: obj.recommendations ?? [],
        reviewCountAnalyzed: obj.review_count_analyzed ?? 0,
        generatedAt: obj.generated_at ?? "",
      };
    } catch {
      parsedSummary = null;
    }
  }

  const rawPerScore = data.reviews_per_score as string | Record<string, number> | null;
  let reviewsPerScore: Record<string, number> | null = null;
  if (typeof rawPerScore === "string") {
    try {
      reviewsPerScore = JSON.parse(rawPerScore);
    } catch {
      reviewsPerScore = null;
    }
  } else if (rawPerScore && typeof rawPerScore === "object") {
    reviewsPerScore = rawPerScore;
  }

  return {
    id: data.id as number,
    googleId: data.google_id as string,
    sourceUrl: data.source_url as string,
    name: data.name as string | null,
    address: data.address as string | null,
    category: data.category as string | null,
    phone: data.phone as string | null,
    rating: data.rating as number | null,
    totalReviews: (data.total_reviews as number) ?? 0,
    reviewsPerScore,
    locationLink: data.location_link as string | null,
    validationStatus: data.validation_status as "pending" | "locked",
    validatedBy: data.validated_by as string | null,
    validatedAt: data.validated_at as string | null,
    lastSyncAt: data.last_sync_at as string | null,
    lastReviewTimestamp: (data.last_review_timestamp as number) ?? 0,
    aiSummary: parsedSummary,
    aiSummaryGeneratedAt: data.ai_summary_generated_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export function mapReview(data: Record<string, unknown>): GoogleReview {
  return {
    id: data.id as number,
    reviewId: data.review_id as string,
    profileId: data.profile_id as number,
    authorTitle: data.author_title as string | null,
    authorImage: data.author_image as string | null,
    reviewText: data.review_text as string | null,
    reviewRating: data.review_rating as number,
    reviewTimestamp: data.review_timestamp as number,
    reviewDatetimeUtc: data.review_datetime_utc as string | null,
    reviewLink: data.review_link as string | null,
    ownerAnswer: data.owner_answer as string | null,
    ownerAnswerTimestamp: data.owner_answer_timestamp as number | null,
    aiGeneratedResponse: data.ai_generated_response as string | null,
    aiResponseGeneratedAt: data.ai_response_generated_at as string | null,
    createdAt: data.created_at as string,
  };
}

export function mapSyncResult(data: Record<string, unknown>): SyncResult {
  return {
    newReviewsCount: data.new_reviews_count as number,
    totalReviews: data.total_reviews as number,
    lastSyncAt: data.last_sync_at as string,
  };
}

export function mapBusinessSummary(data: Record<string, unknown>): BusinessSummary {
  return {
    overallSentiment: data.overall_sentiment as string,
    positiveThemes: data.positive_themes as string[],
    negativeThemes: data.negative_themes as string[],
    recommendations: data.recommendations as string[],
    reviewCountAnalyzed: data.review_count_analyzed as number,
    generatedAt: data.generated_at as string,
  };
}
