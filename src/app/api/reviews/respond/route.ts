import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { replyToGBPReview, refreshGBPToken } from "@/lib/integrations/gbp";

/**
 * POST: Approve and post an AI-drafted review response
 * Body: { review_id, response_text?, auto_post? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { review_id, response_text, auto_post } = body as {
    review_id: string;
    response_text?: string;
    auto_post?: boolean;
  };

  if (!review_id) {
    return NextResponse.json({ error: "review_id required" }, { status: 400 });
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", review_id)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Use provided text or the AI draft
  const finalResponse = response_text || review.ai_draft_response;
  if (!finalResponse) {
    return NextResponse.json({ error: "No response text" }, { status: 400 });
  }

  // Update review with approved response
  await supabase
    .from("reviews")
    .update({
      response_text: finalResponse,
      response_status: auto_post ? "posted" : "approved",
      responded_at: new Date().toISOString(),
    })
    .eq("id", review_id);

  // Post to GBP if requested and review is from Google
  if (auto_post && review.source === "google" && review.external_id) {
    try {
      const { data: business } = await supabase
        .from("businesses")
        .select("gbp_access_token, gbp_refresh_token, gbp_location_id")
        .eq("id", review.business_id)
        .single();

      if (business?.gbp_access_token && business?.gbp_location_id) {
        let token = business.gbp_access_token;

        // Try posting, refresh token if expired
        try {
          await replyToGBPReview(token, review.external_id, finalResponse);
        } catch {
          // Token might be expired — refresh and retry
          const refreshed = await refreshGBPToken(business.gbp_refresh_token);
          token = refreshed.access_token;

          await supabase
            .from("businesses")
            .update({ gbp_access_token: token })
            .eq("id", review.business_id);

          await replyToGBPReview(token, review.external_id, finalResponse);
        }

        return NextResponse.json({ success: true, posted_to_gbp: true });
      }
    } catch (err) {
      console.error("GBP reply failed:", err);
      // Still mark as approved even if GBP posting fails
      return NextResponse.json({
        success: true,
        posted_to_gbp: false,
        gbp_error: String(err),
      });
    }
  }

  return NextResponse.json({ success: true, posted_to_gbp: false });
}
