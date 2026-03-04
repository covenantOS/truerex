import type { ChatMessage } from "../openrouter";

interface VoiceProfile {
  voice_tone: string;
  voice_samples: string[];
  brand_keywords: string[];
  avoid_keywords: string[];
  business_name: string;
  service_type: string;
}

interface JobData {
  service_type: string;
  address: string;
  city?: string;
  state?: string;
  raw_notes: string;
  customer_name?: string;
  photo_count: number;
  photo_types: string[]; // ["before", "during", "after"]
}

export function buildJobStoryPrompt(
  voice: VoiceProfile,
  job: JobData
): ChatMessage[] {
  const voiceSamplesBlock =
    voice.voice_samples.length > 0
      ? `
HERE ARE REAL EXAMPLES OF HOW THIS BUSINESS OWNER WRITES AND TALKS:
${voice.voice_samples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join("\n\n")}

You MUST match their exact communication style: their sentence structure, their energy level, their vocabulary, their humor (or lack of it), their punctuation habits, and their personality. If they use slang, you use slang. If they're formal, you're formal. If they use emojis, you use emojis. MIRROR THEM.`
      : "";

  const brandBlock =
    voice.brand_keywords.length > 0
      ? `\nWORDS/PHRASES THIS BUSINESS LIKES TO USE (work these in naturally): ${voice.brand_keywords.join(", ")}`
      : "";

  const avoidBlock =
    voice.avoid_keywords.length > 0
      ? `\nWORDS/PHRASES TO NEVER USE: ${voice.avoid_keywords.join(", ")}`
      : "";

  const photoContext =
    job.photo_count > 0
      ? `Photos included: ${job.photo_count} photos (${job.photo_types.join(", ")}). Reference the visual transformation if before/after photos exist.`
      : "No photos attached.";

  const system: ChatMessage = {
    role: "system",
    content: `You are a ghostwriter for ${voice.business_name}, a ${voice.service_type} company. Your job is to write a short, compelling job story (GBP post) that sounds EXACTLY like the business owner wrote it themselves.

VOICE TONE: ${voice.voice_tone}
${voiceSamplesBlock}
${brandBlock}
${avoidBlock}

ABSOLUTE RULES:
1. Write in FIRST PERSON as the business ("we" or "I" — match whatever the samples use)
2. Keep it 80-150 words. Punchy. Not an essay.
3. Mention the NEIGHBORHOOD or CITY naturally (geo-signals matter for local SEO)
4. Reference what was actually done — be specific, not vague
5. Sound like a REAL PERSON posted this, not a marketing agency
6. End with a soft call-to-action that feels natural, not salesy

BANNED PHRASES — if you use ANY of these, you have FAILED:
- "We're proud to"
- "Our team of dedicated professionals"
- "We strive to"
- "Look no further"
- "Your trusted [service] experts"
- "We take pride in"
- "Don't hesitate to"
- "State-of-the-art"
- "Second to none"
- "Customer satisfaction is our top priority"
- "We go above and beyond"
- "For all your [service] needs"
- "Quality you can trust"
- "Excellence in every"
- "Your satisfaction guaranteed"
- Any variation of these corporate-speak phrases

INSTEAD: Write like you're texting a friend about a job you just crushed. Professional but real.`,
  };

  const user: ChatMessage = {
    role: "user",
    content: `Write a GBP post for this job:

SERVICE: ${job.service_type}
LOCATION: ${job.address}${job.city ? `, ${job.city}` : ""}${job.state ? `, ${job.state}` : ""}
${job.customer_name ? `CUSTOMER: ${job.customer_name} (use first name only if you reference them)` : ""}
${photoContext}

TECHNICIAN'S NOTES:
${job.raw_notes}

Write the post now. No preamble, no "Here's the post:" — just the post itself.`,
  };

  return [system, user];
}

export function buildJobStoryRegeneratePrompt(
  voice: VoiceProfile,
  job: JobData,
  previousStory: string
): ChatMessage[] {
  const base = buildJobStoryPrompt(voice, job);

  // Add the previous story so AI writes something different
  base.push({
    role: "assistant",
    content: previousStory,
  });

  base.push({
    role: "user",
    content: `That was good but I need a COMPLETELY DIFFERENT version. Different opening, different angle, different structure. Don't just rephrase — reimagine the story from scratch. Maybe focus on a different aspect of the job, use a different hook, or tell it from a different perspective. Keep the same voice and facts but make it feel like a totally new post.`,
  });

  return base;
}
