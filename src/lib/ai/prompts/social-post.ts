import type { ChatMessage } from "../openrouter";

type Platform = "facebook" | "instagram" | "nextdoor";

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
  city?: string;
  state?: string;
  raw_notes: string;
  ai_story?: string; // GBP story already generated
}

const PLATFORM_GUIDANCE: Record<Platform, string> = {
  facebook: `FACEBOOK POST:
- Casual, conversational tone
- 50-120 words
- Can use emojis sparingly if it matches the voice
- End with engagement hook ("Anyone else dealt with this?" or "Drop a comment if...")
- NO hashtags on Facebook — they look desperate`,

  instagram: `INSTAGRAM CAPTION:
- Visual-first — describe what's in the photos
- 40-100 words for the caption
- Add 5-10 relevant hashtags at the END (after a line break)
- Hashtags: mix of broad (#plumbing) and local (#AustinPlumber #OakHillTX)
- More personality than Facebook — slightly more fun`,

  nextdoor: `NEXTDOOR POST:
- Hyper-local, neighbor-to-neighbor tone
- 40-80 words
- Mention the SPECIFIC neighborhood
- Frame it as community update, not advertisement
- "Just wrapped up a job on [street/area]" vibe
- NO hashtags, NO emojis (Nextdoor crowd skews older/professional)`,
};

export function buildSocialPostPrompt(
  voice: VoiceProfile,
  job: JobData,
  platform: Platform
): ChatMessage[] {
  const voiceBlock =
    voice.voice_samples.length > 0
      ? `\nOWNER'S STYLE:\n${voice.voice_samples[0]}`
      : "";

  const existingContent = job.ai_story
    ? `\nALREADY POSTED TO GBP:\n"${job.ai_story}"\n\nYour ${platform} post must be DIFFERENT — different opening, different angle, different feel.`
    : "";

  const system: ChatMessage = {
    role: "system",
    content: `You ghostwrite social media posts for ${voice.business_name} (${voice.service_type}). Sound like the owner, not a marketer.

VOICE: ${voice.voice_tone}
${voiceBlock}
${voice.brand_keywords.length > 0 ? `BRAND PHRASES: ${voice.brand_keywords.join(", ")}` : ""}
${voice.avoid_keywords.length > 0 ? `NEVER USE: ${voice.avoid_keywords.join(", ")}` : ""}

${PLATFORM_GUIDANCE[platform]}
${existingContent}

NO corporate speak. NO "we're proud to". Write like a real person.`,
  };

  const user: ChatMessage = {
    role: "user",
    content: `Write a ${platform} post about this job:

SERVICE: ${job.service_type}
AREA: ${[job.city, job.state].filter(Boolean).join(", ")}
NOTES: ${job.raw_notes}

Just the post. No preamble.`,
  };

  return [system, user];
}
