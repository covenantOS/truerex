import type { ChatMessage } from "../openrouter";

interface VoiceProfile {
  voice_tone: string;
  voice_samples: string[];
  brand_keywords: string[];
  avoid_keywords: string[];
  business_name: string;
  service_type: string;
  city?: string;
  state?: string;
}

interface JobData {
  service_type: string;
  address: string;
  city?: string;
  state?: string;
  raw_notes: string;
  customer_name?: string;
  photo_count: number;
  photo_types: string[];
}

export function buildBlogPostPrompt(
  voice: VoiceProfile,
  job: JobData,
  gbpPostText: string | null
): ChatMessage[] {
  const voiceSamplesBlock =
    voice.voice_samples.length > 0
      ? `
OWNER'S WRITING STYLE:
${voice.voice_samples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join("\n\n")}`
      : "";

  const brandBlock =
    voice.brand_keywords.length > 0
      ? `\nBRAND PHRASES: ${voice.brand_keywords.join(", ")}`
      : "";

  const avoidBlock =
    voice.avoid_keywords.length > 0
      ? `\nNEVER USE: ${voice.avoid_keywords.join(", ")}`
      : "";

  const dupBlock = gbpPostText
    ? `
IMPORTANT — THIS GBP POST WAS ALREADY PUBLISHED FOR THIS JOB:
"${gbpPostText}"

Your blog post MUST be COMPLETELY DIFFERENT from the above. Different angle, different structure, different opening, different details emphasized. The blog should be an in-depth case study, NOT a rewrite of the GBP post.`
    : "";

  const location = [job.city, job.state].filter(Boolean).join(", ");
  const serviceArea = [voice.city, voice.state].filter(Boolean).join(", ");

  const system: ChatMessage = {
    role: "system",
    content: `You are writing a blog post / case study for ${voice.business_name}, a ${voice.service_type} company${serviceArea ? ` in ${serviceArea}` : ""}. This goes on their WordPress site and must be SEO-optimized for local search.

VOICE TONE: ${voice.voice_tone}
${voiceSamplesBlock}
${brandBlock}
${avoidBlock}
${dupBlock}

BLOG POST REQUIREMENTS:
1. Title: Include the service type AND city/neighborhood (SEO). Make it specific, not generic.
   GOOD: "Fixing a Burst Pipe in Oak Hill Before It Flooded the Kitchen"
   BAD: "Professional Plumbing Services in Austin"

2. Structure:
   - Hook paragraph (what was the problem/situation)
   - What we found when we got there
   - What we did and why (educate the reader)
   - The result
   - Brief pro tip for homeowners (establishes expertise)

3. Length: 300-500 words. Enough for SEO, not so long nobody reads it.

4. SEO naturally woven in:
   - Service type + location in title and first paragraph
   - Use the neighborhood/city name 2-3 times naturally
   - Include a variation of "[service] in [city]" once
   - Don't keyword stuff — Google's smarter than that

5. Write like the owner talks, but slightly more polished for a blog format

6. End with a natural CTA — not "Contact us today for a free estimate!" but something real

BANNED: Same list as always — no corporate speak, no "we're proud to", no "don't hesitate to contact us"`,
  };

  const user: ChatMessage = {
    role: "user",
    content: `Write a blog post for this completed job:

SERVICE: ${job.service_type}
LOCATION: ${job.address}${location ? `, ${location}` : ""}
${job.customer_name ? `CUSTOMER: ${job.customer_name} (first name only)` : ""}
PHOTOS: ${job.photo_count} (${job.photo_types.join(", ")})

TECHNICIAN'S NOTES:
${job.raw_notes}

Return ONLY a JSON object with this structure (no markdown fences):
{"title": "...", "body": "...", "seo_keywords": ["keyword1", "keyword2", "keyword3"]}`,
  };

  return [system, user];
}
