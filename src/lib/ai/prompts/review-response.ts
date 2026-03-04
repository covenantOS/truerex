import type { ChatMessage } from "../openrouter";

interface VoiceProfile {
  voice_tone: string;
  voice_samples: string[];
  brand_keywords: string[];
  avoid_keywords: string[];
  business_name: string;
  service_type: string;
}

interface ReviewData {
  reviewer_name: string;
  rating: number;
  review_text: string;
  source: string; // google, yelp, facebook
  // Job context if we can match it
  job_service_type?: string;
  job_address?: string;
  job_city?: string;
}

interface PastResponse {
  rating: number;
  response_text: string;
}

export function buildReviewResponsePrompt(
  voice: VoiceProfile,
  review: ReviewData,
  pastResponses: PastResponse[] = []
): ChatMessage[] {
  const voiceSamplesBlock =
    voice.voice_samples.length > 0
      ? `
REAL EXAMPLES OF HOW THIS OWNER WRITES:
${voice.voice_samples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join("\n\n")}

MATCH THIS EXACT STYLE. Their energy, their vocabulary, their personality.`
      : "";

  const brandBlock =
    voice.brand_keywords.length > 0
      ? `\nPHRASES THEY LIKE: ${voice.brand_keywords.join(", ")}`
      : "";

  const avoidBlock =
    voice.avoid_keywords.length > 0
      ? `\nNEVER USE: ${voice.avoid_keywords.join(", ")}`
      : "";

  const pastBlock =
    pastResponses.length > 0
      ? `
RECENT RESPONSES ALREADY POSTED (do NOT repeat similar openings or structures):
${pastResponses.slice(0, 5).map((r, i) => `[${r.rating}-star] ${r.response_text}`).join("\n\n")}

Your response MUST have a different opening and structure than all of the above.`
      : "";

  const jobContext =
    review.job_service_type || review.job_city
      ? `\nKNOWN JOB DETAILS: ${[review.job_service_type, review.job_address, review.job_city].filter(Boolean).join(", ")}`
      : "";

  const ratingGuidance = getRatingGuidance(review.rating);

  const system: ChatMessage = {
    role: "system",
    content: `You are ghostwriting a review response for ${voice.business_name} (${voice.service_type}). The response must sound EXACTLY like the owner typed it themselves — not like an AI, not like a marketing intern, not like a template.

VOICE TONE: ${voice.voice_tone}
${voiceSamplesBlock}
${brandBlock}
${avoidBlock}
${pastBlock}

${ratingGuidance}

ABSOLUTE RULES:
1. Keep it 30-80 words. Short and genuine. Nobody writes 200-word review responses.
2. Reference SPECIFIC things the reviewer mentioned — don't be generic
3. Sound like a real person who actually did the work and remembers this job
4. First person ("we" or "I" — match the voice samples)
5. Vary your openings — not every response starts with "Thank you" or "Hey"

BANNED PHRASES — instant failure if used:
- "Thank you for your kind words"
- "We truly appreciate your feedback"
- "It was a pleasure serving you"
- "We strive to provide the best"
- "Your satisfaction means the world to us"
- "Thank you for taking the time to"
- "We value your business"
- "We look forward to serving you again"
- "Our team is dedicated to"
- "We pride ourselves on"
- Any variation of these hollow corporate responses

INSTEAD: Respond like you're replying to a friend's comment about a job you did. Real. Specific. Brief.`,
  };

  const user: ChatMessage = {
    role: "user",
    content: `Write a response to this ${review.source} review:

REVIEWER: ${review.reviewer_name}
RATING: ${review.rating}/5 stars
REVIEW: "${review.review_text}"
${jobContext}

Write the response now. No preamble — just the response itself.`,
  };

  return [system, user];
}

function getRatingGuidance(rating: number): string {
  if (rating >= 4) {
    return `STRATEGY (${rating}-star positive review):
- Be warm and genuine, not over-the-top grateful
- Reference what they specifically liked
- Maybe add a small detail they didn't mention to show you remember
- Natural CTA: "hit us up anytime" or similar, NOT "we look forward to serving you"`;
  }

  if (rating === 3) {
    return `STRATEGY (3-star mixed review):
- Acknowledge what went well AND what could've been better
- Don't be defensive — own it if something wasn't perfect
- Show you actually care by being specific about what you'd do differently
- Invite them to reach out directly (phone/text, not "please contact our office")`;
  }

  return `STRATEGY (${rating}-star negative review):
- DO NOT be defensive or dismissive
- Acknowledge their frustration specifically (not generic "sorry for the inconvenience")
- Be direct about what happened if you know the job
- Offer a real fix: "Call me directly at [number]" or "Let me come take another look"
- Keep it SHORT. Long defensive responses look worse.
- Show accountability — "That's on us" goes further than excuses`;
}
