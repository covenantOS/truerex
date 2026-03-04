import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/ai/openrouter";
import { buildJobStoryPrompt, buildJobStoryRegeneratePrompt } from "@/lib/ai/prompts/job-story";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json().catch(() => ({}));
  const regenerate = body.regenerate === true;

  // Get job with photos
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*, job_photos(photo_type)")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Get business with voice profile
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", job.business_id)
    .single();

  if (bizError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (!job.raw_notes && !regenerate) {
    return NextResponse.json(
      { error: "Job has no notes to generate from" },
      { status: 400 }
    );
  }

  const voice = {
    voice_tone: business.voice_tone || "friendly-professional",
    voice_samples: Array.isArray(business.voice_samples)
      ? (business.voice_samples as string[])
      : [],
    brand_keywords: business.brand_keywords || [],
    avoid_keywords: business.avoid_keywords || [],
    business_name: business.name,
    service_type: business.service_type,
  };

  const photoTypes = (job.job_photos || []).map(
    (p: { photo_type: string }) => p.photo_type
  );

  const jobData = {
    service_type: job.service_type || business.service_type,
    address: job.address,
    city: job.city || undefined,
    state: job.state || undefined,
    raw_notes: job.raw_notes || "",
    customer_name: job.customer_name || undefined,
    photo_count: photoTypes.length,
    photo_types: [...new Set(photoTypes)] as string[],
  };

  try {
    const messages =
      regenerate && job.ai_story
        ? buildJobStoryRegeneratePrompt(voice, jobData, job.ai_story)
        : buildJobStoryPrompt(voice, jobData);

    const story = await generateCompletion(messages, {
      temperature: 0.8,
      maxTokens: 512,
    });

    // Save to job
    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        ai_story: story,
        ai_story_approved: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ story });
  } catch (err) {
    console.error("AI generation failed:", err);
    return NextResponse.json(
      { error: "AI generation failed. Check your OpenRouter API key." },
      { status: 500 }
    );
  }
}
