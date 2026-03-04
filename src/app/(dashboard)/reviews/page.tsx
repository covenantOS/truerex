"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, Star, Send, Check } from "lucide-react";

interface Review {
  id: string;
  source: string;
  reviewer_name: string | null;
  rating: number | null;
  review_text: string | null;
  response_text: string | null;
  ai_draft_response: string | null;
  response_status: string;
  review_date: string | null;
  created_at: string;
}

export default function ReviewsPage() {
  const { business } = useBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        setReviews(await res.json());
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleGenerateResponse(reviewId: string) {
    if (!business) return;
    setGeneratingId(reviewId);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "review_response",
          business_id: business.id,
          review_id: reviewId,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to generate response");
        return;
      }

      const { response } = await res.json();
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, ai_draft_response: response, response_status: "drafted" }
            : r
        )
      );
      toast.success("AI response drafted!");
    } catch {
      toast.error("Generation failed");
    } finally {
      setGeneratingId(null);
    }
  }

  async function handlePostResponse(reviewId: string, responseText?: string) {
    setPostingId(reviewId);

    try {
      const res = await fetch("/api/reviews/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: reviewId,
          response_text: responseText,
          auto_post: true,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to post response");
        return;
      }

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                response_text: responseText || r.ai_draft_response,
                response_status: "posted",
              }
            : r
        )
      );
      setEditingId(null);
      toast.success("Response approved!");
    } catch {
      toast.error("Failed to post");
    } finally {
      setPostingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Manage reviews and AI-generated responses
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No reviews yet. Connect your Google Business Profile to sync reviews, or they&apos;ll appear here as customers leave them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {review.reviewer_name || "Anonymous"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (review.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {review.source}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      review.response_status === "posted"
                        ? "default"
                        : review.response_status === "drafted"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {review.response_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {review.review_text && (
                  <p className="text-sm">&ldquo;{review.review_text}&rdquo;</p>
                )}

                {/* AI Draft Response */}
                {review.ai_draft_response &&
                  review.response_status !== "posted" && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        AI Draft Response
                      </p>
                      {editingId === review.id ? (
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{review.ai_draft_response}</p>
                      )}
                      <div className="flex gap-2">
                        {editingId === review.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handlePostResponse(review.id, editText)
                              }
                              disabled={postingId === review.id}
                              className="gap-1"
                            >
                              {postingId === review.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handlePostResponse(review.id)
                              }
                              disabled={postingId === review.id}
                              className="gap-1"
                            >
                              {postingId === review.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              Approve & Post
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(review.id);
                                setEditText(review.ai_draft_response || "");
                              }}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                {/* Posted Response */}
                {review.response_status === "posted" && review.response_text && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                      Posted Response
                    </p>
                    <p className="text-sm">{review.response_text}</p>
                  </div>
                )}

                {/* Generate button */}
                {!review.ai_draft_response &&
                  review.response_status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateResponse(review.id)}
                      disabled={generatingId === review.id}
                      className="gap-1"
                    >
                      {generatingId === review.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Generate AI Response
                    </Button>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
