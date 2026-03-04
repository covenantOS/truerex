import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/ai/openrouter";
import { buildReviewResponsePrompt } from "@/lib/ai/prompts/review-response";
import { buildBlogPostPrompt } from "@/lib/ai/prompts/blog-post";
import { buildSocialPostPrompt } from "@/lib/ai/prompts/social-post";
import { buildNeighborhoodPrompt } from "@/lib/ai/prompts/neighborhood";

type ContentType = "review_response" | "blog_post" | "social_post" | "neighborhood";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { type, ...data } = body as { type: ContentType; [key: string]: unknown };

  if (!type) {
    return NextResponse.json({ error: "Missing 'type' field" }, { status: 400 });
  }

  try {
    switch (type) {
      case "review_response":
        return handleReviewResponse(supabase, data);
      case "blog_post":
        return handleBlogPost(supabase, data);
      case "social_post":
        return handleSocialPost(supabase, data);
      case "neighborhood":
        return handleNeighborhood(supabase, data);
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    console.error(`AI generation (${type}) failed:`, err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBusinessVoice(supabase: any, businessId: string) {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (!data) throw new Error("Business not found");

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
async function handleReviewResponse(supabase: any, data: Record<string, unknown>) {
  const { business_id, review_id } = data as {
    business_id: string;
    review_id: string;
  };

  const voice = await getBusinessVoice(supabase, business_id);

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", review_id)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
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

  const response = await generateCompletion(messages, {
    temperature: 0.75,
    maxTokens: 256,
  });

  // Save draft
  await supabase
    .from("reviews")
    .update({
      ai_draft_response: response,
      response_status: "drafted",
    })
    .eq("id", review_id);

  return NextResponse.json({ response });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBlogPost(supabase: any, data: Record<string, unknown>) {
  const { business_id, job_id } = data as {
    business_id: string;
    job_id: string;
  };

  const voice = await getBusinessVoice(supabase, business_id);

  const { data: job } = await supabase
    .from("jobs")
    .select("*, job_photos(photo_type)")
    .eq("id", job_id)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
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

  const raw = await generateCompletion(messages, {
    temperature: 0.7,
    maxTokens: 1024,
  });

  // Try parsing JSON response
  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    result = { title: "", body: raw, seo_keywords: [] };
  }

  return NextResponse.json(result);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSocialPost(supabase: any, data: Record<string, unknown>) {
  const { business_id, job_id, platform } = data as {
    business_id: string;
    job_id: string;
    platform: "facebook" | "instagram" | "nextdoor";
  };

  const voice = await getBusinessVoice(supabase, business_id);

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", job_id)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
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
    platform
  );

  const post = await generateCompletion(messages, {
    temperature: 0.8,
    maxTokens: 512,
  });

  return NextResponse.json({ post, platform });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleNeighborhood(supabase: any, data: Record<string, unknown>) {
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

  const message = await generateCompletion(messages, {
    temperature: 0.75,
    maxTokens: channel === "sms" ? 128 : 512,
  });

  return NextResponse.json({ message, channel, campaign_type });
}
