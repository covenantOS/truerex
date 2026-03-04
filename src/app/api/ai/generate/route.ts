import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/ai/openrouter";
import { buildReviewResponsePrompt } from "@/lib/ai/prompts/review-response";
import { buildBlogPostPrompt } from "@/lib/ai/prompts/blog-post";
import { buildSocialPostPrompt } from "@/lib/ai/prompts/social-post";
import { buildNeighborhoodPrompt } from "@/lib/ai/prompts/neighborhood";
import {
  ApiError,
  HttpStatus,
  tryCatch,
  validateRequired,
} from "@/lib/error-handler";

type ContentType = "review_response" | "blog_post" | "social_post" | "neighborhood";

const VALID_CONTENT_TYPES: ContentType[] = [
  "review_response",
  "blog_post",
  "social_post",
  "neighborhood",
];

/**
 * POST /api/ai/generate
 * Generate AI content for various content types
 */
export async function POST(request: NextRequest) {
  return tryCatch(request, async (req) => {
    // Parse and validate request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON in request body");
    }

    // Validate required 'type' field
    const { type, ...data } = body as { type: ContentType; [key: string]: unknown };
    
    if (!type) {
      throw ApiError.badRequest("Missing required field: 'type'");
    }

    // Validate content type
    if (!VALID_CONTENT_TYPES.includes(type)) {
      throw ApiError.badRequest(
        `Invalid 'type'. Must be one of: ${VALID_CONTENT_TYPES.join(", ")}`
      );
    }

    // Route to appropriate handler
    switch (type) {
      case "review_response":
        return handleReviewResponse(req, data);
      case "blog_post":
        return handleBlogPost(req, data);
      case "social_post":
        return handleSocialPost(req, data);
      case "neighborhood":
        return handleNeighborhood(req, data);
      default:
        // This should never happen due to validation above
        throw ApiError.badRequest(`Unknown type: ${type}`);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBusinessVoice(supabase: any, businessId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 = "Could not find a row"
      throw ApiError.notFound("Business", businessId);
    }
    console.error("Error fetching business:", error);
    throw ApiError.internal("Failed to fetch business data");
  }

  if (!data) {
    throw ApiError.notFound("Business", businessId);
  }

  return {
    voice_tone: data.voice_tone || "friendly-professional",
    voice_samples: Array.isArray(data.voice_samples) ? data.voice_samples as string[] : [],
    brand_keywords: data.brand_keywords || [],
    avoid_keywords: data.avoid_keywords || [],
    business_name: data.name,
    service_type: data.service_type,
    city: data.city,
    state: data.state,
    phone: data.phone,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleReviewResponse(request: NextRequest, data: Record<string, unknown>) {
  const supabase = await createClient();
  
  // Validate required fields
  validateRequired(data, ["business_id", "review_id"]);

  const { business_id, review_id } = data as {
    business_id: string;
    review_id: string;
  };

  const voice = await getBusinessVoice(supabase, business_id);

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", review_id)
    .single();

  if (reviewError) {
    if (reviewError.code === "PGRST116") {
      throw ApiError.notFound("Review", review_id);
    }
    console.error("Error fetching review:", reviewError);
    throw ApiError.internal("Failed to fetch review");
  }

  if (!review) {
    throw ApiError.notFound("Review", review_id);
  }

  // Get past responses to avoid repetition
  const { data: pastResponses } = await supabase
    .from("reviews")
    .select("rating, response_text")
    .eq("business_id", business_id)
    .not("response_text", "is", null)
    .order("responded_at", { ascending: false })
    .limit(5);

  const messages = buildReviewResponsePrompt(
    voice,
    {
      reviewer_name: review.reviewer_name || "Customer",
      rating: review.rating || 5,
      review_text: review.review_text || "",
      source: review.source,
    },
    pastResponses || []
  );

  let response: string;
  try {
    response = await generateCompletion(messages, {
      temperature: 0.75,
      maxTokens: 256,
    });
  } catch (err) {
    console.error("AI generation failed:", err);
    throw ApiError.serviceUnavailable("AI service temporarily unavailable");
  }

  // Save draft
  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      ai_draft_response: response,
      response_status: "drafted",
    })
    .eq("id", review_id);

  if (updateError) {
    console.error("Error saving draft response:", updateError);
    // Don't fail the request, just log the error
  }

  return NextResponse.json({ response });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBlogPost(request: NextRequest, data: Record<string, unknown>) {
  const supabase = await createClient();
  
  validateRequired(data, ["business_id", "job_id"]);

  const { business_id, job_id } = data as {
    business_id: string;
    job_id: string;
  };

  const voice = await getBusinessVoice(supabase, business_id);

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*, job_photos(photo_type)")
    .eq("id", job_id)
    .single();

  if (jobError) {
    if (jobError.code === "PGRST116") {
      throw ApiError.notFound("Job", job_id);
    }
    console.error("Error fetching job:", jobError);
    throw ApiError.internal("Failed to fetch job data");
  }

  if (!job) {
    throw ApiError.notFound("Job", job_id);
  }

  const photoTypes = (job.job_photos || []).map(
    (p: { photo_type: string }) => p.photo_type
  );

  const messages = buildBlogPostPrompt(
    { ...voice },
    {
      service_type: job.service_type || voice.service_type,
      address: job.address,
      city: job.city,
      state: job.state,
      raw_notes: job.raw_notes || "",
      customer_name: job.customer_name,
      photo_count: photoTypes.length,
      photo_types: [...new Set(photoTypes)] as string[],
    },
    job.ai_story || null
  );

  let raw: string;
  try {
    raw = await generateCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1024,
    });
  } catch (err) {
    console.error("AI blog generation failed:", err);
    throw ApiError.serviceUnavailable("AI service temporarily unavailable");
  }

  // Try parsing JSON response
  let result: { title: string; body: string; seo_keywords: string[] };
  try {
    result = JSON.parse(raw);
  } catch {
    // If parsing fails, treat entire response as body
    result = { title: "", body: raw, seo_keywords: [] };
  }

  return NextResponse.json(result);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSocialPost(request: NextRequest, data: Record<string, unknown>) {
  const supabase = await createClient();
  
  validateRequired(data, ["business_id", "job_id"]);

  const { business_id, job_id, platform } = data as {
    business_id: string;
    job_id: string;
    platform?: "facebook" | "instagram" | "nextdoor";
  };

  // Validate platform if provided
  const validPlatforms = ["facebook", "instagram", "nextdoor"] as const;
  if (platform && !validPlatforms.includes(platform)) {
    throw ApiError.badRequest(
      `Invalid platform. Must be one of: ${validPlatforms.join(", ")}`
    );
  }

  const voice = await getBusinessVoice(supabase, business_id);

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", job_id)
    .single();

  if (jobError) {
    if (jobError.code === "PGRST116") {
      throw ApiError.notFound("Job", job_id);
    }
    console.error("Error fetching job:", jobError);
    throw ApiError.internal("Failed to fetch job data");
  }

  if (!job) {
    throw ApiError.notFound("Job", job_id);
  }

  const messages = buildSocialPostPrompt(
    voice,
    {
      service_type: job.service_type || voice.service_type,
      city: job.city,
      state: job.state,
      raw_notes: job.raw_notes || "",
      ai_story: job.ai_story,
    },
    platform || "facebook"
  );

  let post: string;
  try {
    post = await generateCompletion(messages, {
      temperature: 0.8,
      maxTokens: 512,
    });
  } catch (err) {
    console.error("AI social post generation failed:", err);
    throw ApiError.serviceUnavailable("AI service temporarily unavailable");
  }

  return NextResponse.json({ post, platform: platform || "facebook" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleNeighborhood(request: NextRequest, data: Record<string, unknown>) {
  const supabase = await createClient();
  
  // Validate required fields
  validateRequired(data, [
    "business_id",
    "campaign_type",
    "channel",
    "service_type",
    "job_address",
    "job_city",
  ]);

  const {
    business_id,
    campaign_type,
    channel,
    service_type,
    job_address,
    job_city,
    neighborhood,
    discount_code,
    discount_value,
    owner_name,
  } = data as {
    business_id: string;
    campaign_type: "pre_job" | "post_job";
    channel: "sms" | "email" | "mailer";
    service_type: string;
    job_address: string;
    job_city: string;
    neighborhood?: string;
    discount_code?: string;
    discount_value?: string;
    owner_name?: string;
  };

  // Validate enum values
  const validCampaignTypes = ["pre_job", "post_job"];
  const validChannels = ["sms", "email", "mailer"] as const;

  if (!validCampaignTypes.includes(campaign_type)) {
    throw ApiError.badRequest(
      `Invalid campaign_type. Must be one of: ${validCampaignTypes.join(", ")}`
    );
  }

  if (!validChannels.includes(channel)) {
    throw ApiError.badRequest(
      `Invalid channel. Must be one of: ${validChannels.join(", ")}`
    );
  }

  const voice = await getBusinessVoice(supabase, business_id);

  const messages = buildNeighborhoodPrompt(
    {
      business_name: voice.business_name,
      service_type: voice.service_type,
      phone: voice.phone,
      voice_tone: voice.voice_tone,
    },
    {
      campaign_type,
      channel,
      service_type,
      job_address,
      job_city,
      neighborhood,
      discount_code,
      discount_value,
      owner_name,
    }
  );

  let message: string;
  try {
    message = await generateCompletion(messages, {
      temperature: 0.75,
      maxTokens: channel === "sms" ? 128 : 512,
    });
  } catch (err) {
    console.error("AI neighborhood message generation failed:", err);
    throw ApiError.serviceUnavailable("AI service temporarily unavailable");
  }

  return NextResponse.json({ message, channel, campaign_type });
}
